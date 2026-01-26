// PayFast ITN (Instant Transaction Notification) Handler
// Receives payment notifications from PayFast and logs them

import * as crypto from 'crypto';

// Generate PayFast signature for validation
function generateSignature(data, passPhrase) {
  const params = [];
  const sortedKeys = Object.keys(data).sort();

  for (const key of sortedKeys) {
    if (key !== 'signature' && data[key] !== undefined && data[key] !== '') {
      params.push(`${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`);
    }
  }

  let paramString = params.join('&');

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

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = event.body || '';
    const pfData = parseFormData(body);

    // Validate signature
    const passPhrase = process.env.PAYFAST_PASSPHRASE || '';
    const isValid = validateSignature(pfData, passPhrase);

    if (!isValid) {
      console.error('Invalid PayFast signature');
      return { statusCode: 400, body: 'Invalid signature' };
    }

    console.log('Signature validated successfully');

    // Log payment details
    const paymentRecord = {
      payment_id: pfData.m_payment_id || `PF-${Date.now()}`,
      pf_payment_id: pfData.pf_payment_id || '',
      timestamp: new Date().toISOString(),
      payment_status: pfData.payment_status,
      amount: pfData.amount_gross || '0',
      business_name: pfData.custom_str1 || pfData.item_name || 'Unknown',
      plan: pfData.custom_str2 || pfData.item_description || 'Unknown',
      town: pfData.custom_str3 || 'Vaalwater',
      contact_email: pfData.email_address || '',
      contact_phone: pfData.custom_str4 || '',
      name: `${pfData.name_first || ''} ${pfData.name_last || ''}`.trim(),
    };

    console.log('=== PAYMENT RECEIVED ===');
    console.log(JSON.stringify(paymentRecord, null, 2));
    console.log('========================');

    // TODO: Add Google Sheets integration via external webhook or alternative approach
    // The service account credentials are too large for Netlify env vars (>4KB)
    // Options: 1) Use a webhook to an external service, 2) Store credentials in a file
    // 3) Use a smaller credential format, 4) Use Netlify Blobs

    return { statusCode: 200, body: 'OK' };

  } catch (error) {
    console.error('PayFast ITN error:', error);
    return { statusCode: 200, body: 'OK' };
  }
}
