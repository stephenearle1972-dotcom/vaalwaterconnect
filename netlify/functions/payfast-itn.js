// PayFast ITN (Instant Transaction Notification) Handler
// Receives payment notifications from PayFast and logs to Google Sheet

import * as crypto from 'crypto';

// Generate PayFast signature for validation
function generateSignature(data, passPhrase) {
  const params = [];

  // Sort keys alphabetically and create query string
  const sortedKeys = Object.keys(data).sort();

  for (const key of sortedKeys) {
    if (key !== 'signature' && data[key] !== undefined && data[key] !== '') {
      params.push(`${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`);
    }
  }

  let paramString = params.join('&');

  // Add passphrase if provided
  if (passPhrase) {
    paramString += `&passphrase=${encodeURIComponent(passPhrase).replace(/%20/g, '+')}`;
  }

  return crypto.createHash('md5').update(paramString).digest('hex');
}

// Validate the PayFast signature
function validateSignature(pfData, passPhrase) {
  const signature = pfData.signature;
  if (!signature) return false;

  const generatedSig = generateSignature(pfData, passPhrase);
  return signature === generatedSig;
}

// Get Google access token using service account JWT
async function getGoogleAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600;

  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: credentials.token_uri,
    iat: now,
    exp: expiry,
  };

  const base64UrlEncode = (obj) => {
    return Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const headerEncoded = base64UrlEncode(header);
  const claimEncoded = base64UrlEncode(claim);
  const signatureInput = `${headerEncoded}.${claimEncoded}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign
    .sign(credentials.private_key, 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const jwt = `${signatureInput}.${signature}`;

  const tokenResponse = await fetch(credentials.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Token exchange error:', errorText);
    throw new Error('Failed to get access token');
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// Log payment to Google Sheets
async function logPaymentToSheet(paymentData) {
  const credentialsBase64 = process.env.GOOGLE_SHEETS_CREDENTIALS_BASE64;
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

  if (!credentialsBase64 || !spreadsheetId) {
    console.error('Missing Google Sheets credentials or spreadsheet ID');
    throw new Error('Missing Google Sheets configuration');
  }

  const credentialsJson = Buffer.from(credentialsBase64, 'base64').toString('utf-8');
  const credentials = JSON.parse(credentialsJson);
  const token = await getGoogleAccessToken(credentials);

  const sheetName = 'payments';
  const range = `'${sheetName}'!A:J`;

  const values = [[
    paymentData.payment_id,
    paymentData.timestamp,
    paymentData.town,
    paymentData.business_name,
    paymentData.contact_email,
    paymentData.contact_phone,
    paymentData.plan,
    paymentData.amount,
    paymentData.payment_status,
    paymentData.pf_payment_id,
  ]];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Sheets API error:', errorText);
    throw new Error(`Failed to log payment: ${response.status}`);
  }

  console.log('Payment logged to Google Sheets successfully');
}

// Parse URL-encoded form data
function parseFormData(body) {
  const params = new URLSearchParams(body);
  const result = {};

  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return result;
}

export async function handler(event) {
  console.log('PayFast ITN received');

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the form data from PayFast
    const body = event.body || '';
    const pfData = parseFormData(body);

    console.log('Payment data received:', {
      m_payment_id: pfData.m_payment_id,
      pf_payment_id: pfData.pf_payment_id,
      payment_status: pfData.payment_status,
      amount_gross: pfData.amount_gross,
      email_address: pfData.email_address,
    });

    // Validate signature
    const passPhrase = process.env.PAYFAST_PASSPHRASE || '';
    const isValid = validateSignature(pfData, passPhrase);

    if (!isValid) {
      console.error('Invalid PayFast signature');
      return { statusCode: 400, body: 'Invalid signature' };
    }

    console.log('Signature validated successfully');

    // Only process COMPLETE payments
    if (pfData.payment_status !== 'COMPLETE') {
      console.log(`Payment status is ${pfData.payment_status}, not logging`);
      return { statusCode: 200, body: 'OK' };
    }

    // Extract payment details
    const timestamp = new Date().toISOString();
    const paymentRecord = {
      payment_id: pfData.m_payment_id || `PF-${Date.now()}`,
      timestamp,
      town: pfData.custom_str3 || 'Vaalwater',
      business_name: pfData.custom_str1 || pfData.item_name || 'Unknown',
      contact_email: pfData.email_address || '',
      contact_phone: pfData.custom_str4 || '',
      plan: pfData.custom_str2 || pfData.item_description || 'Unknown',
      amount: pfData.amount_gross || '0',
      payment_status: pfData.payment_status,
      pf_payment_id: pfData.pf_payment_id || '',
    };

    console.log('Logging payment record:', paymentRecord);

    // Log to Google Sheets
    await logPaymentToSheet(paymentRecord);

    // Return 200 OK (PayFast expects this)
    return { statusCode: 200, body: 'OK' };

  } catch (error) {
    console.error('PayFast ITN error:', error);
    // Still return 200 to prevent PayFast from retrying
    return { statusCode: 200, body: 'OK' };
  }
}
