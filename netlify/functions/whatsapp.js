// netlify/functions/whatsapp.js

// ======================================================
// Analytics logging to Google Sheets (async, non-blocking)
// ======================================================

/**
 * Log search query to Google Sheets for analytics.
 * Runs async and fails silently - never blocks or breaks the bot.
 *
 * Env vars required:
 * - GOOGLE_SERVICE_ACCOUNT_CREDENTIALS: Full JSON credentials string
 * - ANALYTICS_SPREADSHEET_ID: The spreadsheet ID to log to
 * - ANALYTICS_SHEET_NAME: Tab name (defaults to "Analytics")
 */
async function logAnalytics({ searchTerm, resultsCount, businessesShown, town, source }) {
  try {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const spreadsheetId = process.env.ANALYTICS_SPREADSHEET_ID;
    const sheetName = process.env.ANALYTICS_SHEET_NAME || "Analytics";

    if (!clientEmail || !privateKey || !spreadsheetId) {
      // Analytics not configured - skip silently
      return;
    }

    const credentials = { client_email: clientEmail, private_key: privateKey };
    const accessToken = await getGoogleAccessToken(credentials);

    if (!accessToken) {
      console.log("ANALYTICS: Failed to get access token");
      return;
    }

    // Prepare row data
    const timestamp = new Date().toISOString();
    const row = [
      timestamp,
      searchTerm || "",
      String(resultsCount),
      businessesShown || "",
      town || "",
      source || "whatsapp",
    ];

    // Append row to sheet
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(sheetName)}'!A:F:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [row],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.log("ANALYTICS_WRITE_FAILED:", res.status, errText);
    } else {
      console.log("ANALYTICS_LOGGED:", searchTerm, resultsCount, "results");
    }
  } catch (err) {
    // Fail silently - never break the bot
    console.log("ANALYTICS_ERROR:", err.message);
  }
}

/**
 * Get Google OAuth2 access token using service account JWT
 */
async function getGoogleAccessToken(credentials) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 3600; // 1 hour

    // Create JWT header and payload
    const header = {
      alg: "RS256",
      typ: "JWT",
    };

    const payload = {
      iss: credentials.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: expiry,
    };

    // Sign the JWT
    const jwt = await signJWT(header, payload, credentials.private_key);

    // Exchange JWT for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.log("TOKEN_EXCHANGE_FAILED:", tokenRes.status, errText);
      return null;
    }

    const tokenData = await tokenRes.json();
    return tokenData.access_token;
  } catch (err) {
    console.log("GET_ACCESS_TOKEN_ERROR:", err.message);
    return null;
  }
}

/**
 * Sign a JWT using RS256 (required for Google service accounts)
 */
async function signJWT(header, payload, privateKeyPem) {
  // Base64url encode header and payload
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  // Import the private key
  const privateKey = await importPrivateKey(privateKeyPem);

  // Sign with RS256
  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    privateKey,
    new TextEncoder().encode(signingInput)
  );

  const encodedSignature = base64urlEncode(signature);
  return `${signingInput}.${encodedSignature}`;
}

/**
 * Import PEM private key for Web Crypto API
 */
async function importPrivateKey(pem) {
  // Remove PEM headers and decode
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");

  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

/**
 * Base64url encode (for JWT)
 */
function base64urlEncode(data) {
  let base64;
  if (typeof data === "string") {
    base64 = btoa(data);
  } else {
    // ArrayBuffer
    base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
  }
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function handler(event) {
  try {
    // -----------------------------
    // 0) Webhook verification (Meta)
    // -----------------------------
    if (event.httpMethod === "GET") {
      const qp = event.queryStringParameters || {};
      const mode = qp["hub.mode"];
      const token = qp["hub.verify_token"];
      const challenge = qp["hub.challenge"];
      const verify = process.env.WHATSAPP_VERIFY_TOKEN;

      // If this is a verification request
      if (mode && token && challenge) {
        if (token === verify) {
          return { statusCode: 200, body: challenge };
        }
        return { statusCode: 403, body: "Forbidden" };
      }

      // Simple browser test:
      // /.netlify/functions/whatsapp?q=my geyser is leaking and i need someone today
      const q = qp.q || "";
      const result = await handleQuery({
        text: q,
        from: null,
        source: "web",
      });

      // Log analytics async (fire-and-forget)
      if (result.analytics) {
        logAnalytics(result.analytics).catch(() => {});
      }

      // Handle structured response (text + location)
      const reply = result.reply;
      const textBody = reply && typeof reply === "object" ? reply.text : reply;
      return textResponse(textBody);
    }

    // -----------------------------
    // 1) Parse WhatsApp webhook POST
    // -----------------------------
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId =
      process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token) return textResponse("Missing WHATSAPP_TOKEN env var.");
    if (!phoneNumberId) return textResponse("Missing WHATSAPP_PHONE_NUMBER_ID env var.");

    const body = JSON.parse(event.body || "{}");
    const msg = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    // Ignore non-message events (statuses, etc.)
    if (!msg?.text?.body || !msg?.from) {
      return textResponse("OK");
    }

    const from = msg.from; // user MSISDN
    const incomingText = msg.text.body;

    const result = await handleQuery({
      text: incomingText,
      from,
      source: "whatsapp",
    });

    // Log analytics async (fire-and-forget) - don't await
    if (result.analytics) {
      logAnalytics(result.analytics).catch(() => {});
    }

    // -----------------------------
    // 2) Send message back to WhatsApp
    // -----------------------------
    const sendUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

    // Extract the actual reply
    const reply = result.reply;

    // Check if reply is an object with location data
    const hasLocation = reply && typeof reply === "object" && reply.location;
    const textBody = hasLocation ? reply.text : reply;
    const locationData = hasLocation ? reply.location : null;

    // Send text message first
    const textPayload = {
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: { body: textBody },
    };

    const sendRes = await fetch(sendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(textPayload),
    });

    const sendText = await sendRes.text();
    console.log("META_SEND_STATUS", sendRes.status);
    console.log("META_SEND_BODY", sendText);

    // If we have location data for the top result, send a location message
    if (locationData && locationData.latitude && locationData.longitude) {
      const locationPayload = {
        messaging_product: "whatsapp",
        to: from,
        type: "location",
        location: {
          latitude: String(locationData.latitude),
          longitude: String(locationData.longitude),
          name: locationData.name || "",
          address: locationData.address || "",
        },
      };

      const locRes = await fetch(sendUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationPayload),
      });

      console.log("LOCATION_SEND_STATUS", locRes.status);
    }

    return textResponse("OK");
  } catch (err) {
    console.error("WHATSAPP_FN_ERROR", err);
    return textResponse("OK");
  }
}

// ======================================================
// Core logic: Full AI assistant with listings context
// ======================================================

async function handleQuery({ text, from, source }) {
  const raw = (text || "").trim();
  if (!raw) return { reply: "OK", analytics: null };

  const geminiKey = process.env.GEMINI_API_KEY || "";
  const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  // Town config
  const CURRENT_TOWN = (process.env.TOWN_NAME || "Vaalwater").toLowerCase();
  const townDisplay = CURRENT_TOWN.charAt(0).toUpperCase() + CURRENT_TOWN.slice(1);

  // 1) Load business listings from CSV
  const BUSINESS_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vThi_KiXMZnzjFDN4dbCz8xPTlB8dJnal9NRMd-_8p2hg6000li5r1bhl5cRugFQyTopHCzHVtGc9VN/pub?gid=246270252&single=true&output=csv";
  const EMERGENCY_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSaY65eKywzkOD7O_-3RYXbe3lWShkASeR7EuK2lcv8E0ktarGhFsfYuv7tfvf6aSpbY8BHvM54Yy-t/pub?gid=1137836387&single=true&output=csv";

  let listings = [];

  try {
    const [businessRes, emergencyRes] = await Promise.all([
      fetch(BUSINESS_CSV_URL),
      fetch(EMERGENCY_CSV_URL),
    ]);

    const businessCsv = await businessRes.text();
    const emergencyCsv = await emergencyRes.text();

    // Parse and convert to simple listing objects
    listings = [
      ...parseListingsFromCSV(businessCsv, CURRENT_TOWN, "business"),
      ...parseListingsFromCSV(emergencyCsv, CURRENT_TOWN, "emergency"),
    ];
  } catch (err) {
    console.log("CSV_FETCH_ERROR:", err.message);
  }

  // 2) If no Gemini key, fall back to error message
  if (!geminiKey) {
    return {
      reply: "Sorry, the assistant is not configured. WhatsApp us directly: 068 898 6081",
      analytics: { searchTerm: raw, resultsCount: 0, businessesShown: "", town: townDisplay, source },
    };
  }

  // 3) Build system prompt with all listings
  const systemPrompt = `You are ${townDisplay}Connect's WhatsApp directory assistant. You help people find local businesses in ${townDisplay}, South Africa.

You speak English, Afrikaans, and Sepedi. Reply in the SAME language the user writes in.

AVAILABLE LISTINGS (${listings.length} total):
${JSON.stringify(listings, null, 0)}

RULES:
- Keep responses SHORT (WhatsApp style, max 500 chars)
- For EACH business you recommend, ALWAYS include:
  • Name (bold with *)
  • Phone number with 📞
  • WhatsApp link: wa.me/27[number without leading 0]
  • Address with 📍 if available
- Show 1-3 most relevant matches only
- If the query is vague, ask a clarifying question
- Be friendly but concise
- Emergency services get 🚨 prefix

RESPONSE FORMAT for found listings:
*Business Name*
📞 0XX-XXX-XXXX
💬 wa.me/27XXXXXXXXX
📍 Address

If NO relevant listing found, respond EXACTLY like this (in the user's language):
For English: "No [search term] listed in ${townDisplay} yet.

Know one? Help the community:
📝 Add them: vaalwaterconnect.co.za/#add-business
💬 Or WhatsApp us: 068 898 6081"

For Afrikaans: "Geen [soekterm] in ${townDisplay} gelys nie.

Ken jy een? Help die gemeenskap:
📝 Lys hulle: vaalwaterconnect.co.za/#add-business
💬 Of WhatsApp ons: 068 898 6081"

For Sepedi: "Ga go na [search term] yeo e ngwadilwego go ${townDisplay}.

O tseba yo mongwe? Thuša setšhaba:
📝 Ba lokele: vaalwaterconnect.co.za/#add-business
💬 Goba WhatsApp rena: 068 898 6081"`;

  // 4) Call Gemini
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(geminiKey)}`;

    const payload = {
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I'll help users find businesses in " + townDisplay + " using the listings provided. I'll respond in their language and keep it short for WhatsApp." }] },
        { role: "user", parts: [{ text: raw }] },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("GEMINI_FULL_AI:", raw, "→", aiReply.substring(0, 100) + "...");

    if (aiReply) {
      // Extract business names mentioned for analytics
      const mentionedBusinesses = listings
        .filter(l => aiReply.includes(l.name))
        .map(l => l.name)
        .join(", ");

      return {
        reply: aiReply,
        analytics: {
          searchTerm: raw,
          resultsCount: mentionedBusinesses ? mentionedBusinesses.split(",").length : 0,
          businessesShown: mentionedBusinesses,
          town: townDisplay,
          source,
        },
      };
    }
  } catch (err) {
    console.log("GEMINI_FULL_AI_ERROR:", err.message);
  }

  // 5) Fallback if Gemini fails
  return {
    reply: "Sorry, something went wrong. WhatsApp us directly: 068 898 6081",
    analytics: { searchTerm: raw, resultsCount: 0, businessesShown: "", town: townDisplay, source },
  };
}

// Parse CSV to simple listing objects for AI context
function parseListingsFromCSV(csvText, townFilter, type) {
  const data = parseCSV(csvText);
  if (!data.headers.length || !data.rows.length) return [];

  const h = data.headers;
  const idxAny = (headers, ...names) => {
    for (const n of names) {
      const i = headers.indexOf(n);
      if (i !== -1) return i;
    }
    return -1;
  };

  const nameIdx = idxAny(h, "name", "service_name", "business_name");
  const phoneIdx = idxAny(h, "phone", "primary_phone", "telephone");
  const waIdx = idxAny(h, "whatsapp", "wa");
  const descIdx = idxAny(h, "description", "desc", "notes");
  const areaIdx = idxAny(h, "address", "location", "area", "coverage_area");
  const townIdx = idxAny(h, "town", "city", "region");
  const catIdx = idxAny(h, "subcategory", "category", "type");
  const tagsIdx = idxAny(h, "tags", "keywords");
  const statusIdx = idxAny(h, "status");

  return data.rows
    .filter(row => {
      const rowTown = (row[townIdx] || "").toLowerCase().trim();
      const status = (row[statusIdx] || "").toLowerCase().trim();
      const townMatch = !rowTown || rowTown === townFilter;
      const isActive = !status || status === "active";
      return townMatch && isActive;
    })
    .map(row => ({
      type,
      name: row[nameIdx] || "",
      category: row[catIdx] || "",
      phone: row[phoneIdx] || "",
      whatsapp: row[waIdx] || row[phoneIdx] || "",
      address: row[areaIdx] || "",
      description: row[descIdx] || "",
      tags: row[tagsIdx] || "",
    }))
    .filter(l => l.name); // Only include listings with names
}



// ======================================================
// CSV parsing (robust quoted fields)
// ======================================================

function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = parseCSVLine(lines[0]).map((h) => h.trim());
  const rows = lines.slice(1).map(parseCSVLine);

  return { headers, rows };
}

function parseCSVLine(text) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// ======================================================
// Helpers
// ======================================================

/**
 * Format phone number for WhatsApp display
 * - Keep numbers clean and readable (no bold - it interferes with tap detection)
 * - Convert SA numbers to local format (easier to dial)
 * - Short codes stay as-is
 */
function formatPhone(s) {
  const raw = String(s || "").trim();
  if (!raw) return "";

  // Handle multiple numbers separated by /
  if (raw.includes("/")) {
    const parts = raw.split("/").map((p) => formatSinglePhone(p.trim()));
    return parts.filter(Boolean).join("  •  ");
  }

  return formatSinglePhone(raw);
}

function formatSinglePhone(s) {
  const raw = String(s || "").trim();
  if (!raw) return "";

  // Remove all non-digit characters except + for analysis
  const digitsOnly = raw.replace(/[^\d]/g, "");

  // Short codes (≤6 digits like 112, 10111, 10177): Keep as-is
  if (digitsOnly.length <= 6) {
    return raw;
  }

  // Toll-free / share-call (starts with 08): Keep local format, add dashes
  if (digitsOnly.startsWith("08") && digitsOnly.length === 10) {
    return digitsOnly.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
  }

  // Convert +27 to 0 format (local dialing is easier)
  if (digitsOnly.startsWith("27") && digitsOnly.length >= 11) {
    const localPart = "0" + digitsOnly.slice(2);
    return formatLocalWithDashes(localPart);
  }

  // SA number starting with 0: Format with dashes
  if (digitsOnly.startsWith("0") && digitsOnly.length >= 10) {
    return formatLocalWithDashes(digitsOnly);
  }

  // Fallback: return as-is
  return raw;
}

function formatLocalWithDashes(digits) {
  // Format SA local number with dashes for easy reading/copying
  // Landline (10 digits): 014-755-3839
  // Mobile (10 digits): 082-555-0101
  if (digits.length === 10) {
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  if (digits.length === 11) {
    return digits.replace(/(\d{4})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  return digits;
}

function textResponse(message) {
  return { statusCode: 200, body: String(message || "") };
}
