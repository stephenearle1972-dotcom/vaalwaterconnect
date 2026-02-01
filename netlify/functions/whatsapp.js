// netlify/functions/whatsapp.js

// ======================================================
// Multi-Town Configuration
// ======================================================

/**
 * Multi-Town WhatsApp Bot Configuration
 *
 * Environment variables for phone mapping:
 * - PHONE_MAP_{phone_number_id} = town_id (e.g., PHONE_MAP_983678158158631=menlyn)
 *
 * Environment variables for town-specific WhatsApp tokens (for multi-portfolio setup):
 * - WHATSAPP_TOKEN_{TOWN_ID} (e.g., WHATSAPP_TOKEN_MENLYN) - falls back to WHATSAPP_TOKEN
 *
 * Environment variables for town-specific data:
 * - BUSINESS_CSV_URL_{TOWN_ID} (e.g., BUSINESS_CSV_URL_MENLYN)
 * - WHATSAPP_DISPLAY_{TOWN_ID} (e.g., WHATSAPP_DISPLAY_MENLYN) - for display in messages
 * - SITE_URL_{TOWN_ID} (e.g., SITE_URL_MENLYN) - for "add business" links
 *
 * Falls back to TOWN_NAME/TOWN_ID env var if no phone mapping found.
 */
/**
 * Get the WhatsApp API token for a specific town.
 * Looks for WHATSAPP_TOKEN_{TOWNID} first, falls back to WHATSAPP_TOKEN.
 * This allows different towns to use different Meta portfolios/apps.
 */
function getWhatsAppToken(townId) {
  if (!townId) {
    return process.env.WHATSAPP_TOKEN;
  }

  const townIdUpper = townId.toUpperCase();
  const townSpecificToken = process.env[`WHATSAPP_TOKEN_${townIdUpper}`];

  if (townSpecificToken) {
    console.log(`TOKEN_ROUTING: Using WHATSAPP_TOKEN_${townIdUpper}`);
    return townSpecificToken;
  }

  console.log(`TOKEN_ROUTING: Using default WHATSAPP_TOKEN`);
  return process.env.WHATSAPP_TOKEN;
}

function getTownConfig(incomingPhoneNumberId) {
  // Try to find town from phone number mapping
  let townId = null;

  if (incomingPhoneNumberId) {
    // Check for PHONE_MAP_{phone_id} environment variable
    const phoneMapKey = `PHONE_MAP_${incomingPhoneNumberId}`;
    townId = process.env[phoneMapKey];

    if (townId) {
      console.log(`TOWN_ROUTING: Phone ${incomingPhoneNumberId} → ${townId}`);
    }
  }

  // Fall back to TOWN_ID or TOWN_NAME env var
  if (!townId) {
    townId = process.env.TOWN_ID || process.env.TOWN_NAME || "vaalwater";
    console.log(`TOWN_ROUTING: Using default town: ${townId}`);
  }

  townId = townId.toLowerCase();
  const townIdUpper = townId.toUpperCase();
  const townDisplay = townId.charAt(0).toUpperCase() + townId.slice(1);

  // Get town-specific CSV URL (fall back to default Vaalwater URL)
  const defaultBusinessCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vThi_KiXMZnzjFDN4dbCz8xPTlB8dJnal9NRMd-_8p2hg6000li5r1bhl5cRugFQyTopHCzHVtGc9VN/pub?gid=246270252&single=true&output=csv";
  const businessCsvUrl = process.env[`BUSINESS_CSV_URL_${townIdUpper}`] || process.env.BUSINESS_CSV_URL || defaultBusinessCsvUrl;

  // Emergency services CSV is shared across all towns (filtered by town column)
  const emergencyCsvUrl = process.env.EMERGENCY_CSV_URL || "https://docs.google.com/spreadsheets/d/e/2PACX-1vSaY65eKywzkOD7O_-3RYXbe3lWShkASeR7EuK2lcv8E0ktarGhFsfYuv7tfvf6aSpbY8BHvM54Yy-t/pub?gid=1137836387&single=true&output=csv";

  // Get town-specific site URL for "add business" links
  const defaultSiteUrl = "vaalwaterconnect.co.za";
  const siteUrl = process.env[`SITE_URL_${townIdUpper}`] || process.env.SITE_URL || `${townId}connect.co.za`;

  // Get town-specific WhatsApp number for display
  const defaultWhatsApp = "0688986081";
  const whatsappDisplay = process.env[`WHATSAPP_DISPLAY_${townIdUpper}`] || process.env.WHATSAPP_DISPLAY || defaultWhatsApp;

  return {
    townId,
    townDisplay,
    businessCsvUrl,
    emergencyCsvUrl,
    siteUrl,
    whatsappDisplay,
  };
}

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
async function logAnalytics({ searchTerm, resultsCount, businessesShown, town, source, sessionId, isTest, responseTimeMs, languageDetected }) {
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

    // Prepare row data (columns A-J)
    const timestamp = new Date().toISOString();
    const row = [
      timestamp,                          // A: timestamp
      searchTerm || "",                   // B: search_term
      String(resultsCount),               // C: results_count
      businessesShown || "",              // D: businesses_shown
      town || "",                         // E: town
      source || "whatsapp",               // F: source
      sessionId || "",                    // G: session_id
      isTest ? "TRUE" : "FALSE",          // H: is_test
      responseTimeMs ? String(responseTimeMs) : "",  // I: response_time_ms
      languageDetected || "",             // J: language_detected
    ];

    // Append row to sheet
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(sheetName)}'!A:J:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

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
      console.log("ANALYTICS_LOGGED:", searchTerm, resultsCount, "results", responseTimeMs ? `(${responseTimeMs}ms)` : "");
    }
  } catch (err) {
    // Fail silently - never break the bot
    console.log("ANALYTICS_ERROR:", err.message);
  }
}

/**
 * Generate a simple session ID from phone number and date.
 * Groups all searches from same user on same day.
 */
function generateSessionId(phoneNumber) {
  if (!phoneNumber) return "";
  const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const input = `${phoneNumber}-${dateStr}`;
  // Simple hash - not cryptographic, just for grouping
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
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

      // If this is a verification request
      if (mode && token && challenge) {
        // Accept multiple verify tokens for multi-portfolio setup:
        // 1. The configured WHATSAPP_VERIFY_TOKEN env var
        // 2. Any token starting with "townconnect_verify_" (for different Meta portfolios)
        const configuredToken = process.env.WHATSAPP_VERIFY_TOKEN;
        const isValidToken = token === configuredToken || token.startsWith("townconnect_verify_");

        if (isValidToken) {
          console.log("WEBHOOK_VERIFIED:", token.substring(0, 20) + "...");
          return { statusCode: 200, body: challenge };
        }
        console.log("WEBHOOK_REJECTED: Invalid token", token.substring(0, 20) + "...");
        return { statusCode: 403, body: "Forbidden" };
      }

      // Simple browser test:
      // /.netlify/functions/whatsapp?q=my geyser is leaking&town=blouberg
      const q = qp.q || "";
      const testTown = qp.town || null;

      // Get town config (use query param for testing, otherwise default)
      const townConfig = testTown
        ? getTownConfig(null) // Will use TOWN_ID/TOWN_NAME fallback
        : getTownConfig(null);

      // Override town if specified in query
      if (testTown) {
        townConfig.townId = testTown.toLowerCase();
        townConfig.townDisplay = testTown.charAt(0).toUpperCase() + testTown.slice(1).toLowerCase();
      }

      const result = await handleQuery({
        text: q,
        from: null,
        source: "web",
        townConfig,
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
    const body = JSON.parse(event.body || "{}");

    // Extract incoming phone_number_id from webhook metadata
    const incomingPhoneNumberId = body?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
    console.log("INCOMING_PHONE_NUMBER_ID:", incomingPhoneNumberId);

    // Get town configuration based on incoming phone number
    const townConfig = getTownConfig(incomingPhoneNumberId);

    // Get the appropriate WhatsApp token for this town
    // (allows different towns to use different Meta portfolios/apps)
    const token = getWhatsAppToken(townConfig.townId);

    if (!token) return textResponse(`Missing WHATSAPP_TOKEN for ${townConfig.townId}.`);

    // Use the incoming phone number ID for sending replies (or fall back to env var)
    const phoneNumberId = incomingPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!phoneNumberId) return textResponse("Missing phone_number_id.");

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
      townConfig,
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
// Core logic: Two-step AI (extract keyword → search listings)
// ======================================================

async function handleQuery({ text, from, source, townConfig }) {
  const startTime = Date.now(); // Track response time
  const raw = (text || "").trim();
  if (!raw) return { reply: "OK", analytics: null };

  const geminiKey = process.env.GEMINI_API_KEY || "";
  const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  // Generate session ID for this user (groups searches by user per day)
  const sessionId = generateSessionId(from);
  const isTest = source === "web" || !from;

  // Use town config from routing
  const { townId, townDisplay, businessCsvUrl, emergencyCsvUrl, siteUrl, whatsappDisplay } = townConfig;

  // If no Gemini key, fall back to error message
  if (!geminiKey) {
    return {
      reply: `Sorry, the assistant is not configured. WhatsApp us directly: ${whatsappDisplay}`,
      analytics: {
        searchTerm: raw,
        resultsCount: 0,
        businessesShown: "",
        town: townDisplay,
        source,
        sessionId,
        isTest,
        responseTimeMs: Date.now() - startTime,
        languageDetected: "",
      },
    };
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(geminiKey)}`;

  // =====================================================
  // STEP 1: Extract keyword from user message
  // =====================================================
  let keyword = raw; // Default to raw message
  let userLang = "en"; // Default language

  try {
    const extractPrompt = `What service or business type does this person need?
Reply with ONLY 1-2 words in English (the service type), nothing else.
Also detect language: start your reply with "AF:" for Afrikaans, "SE:" for Sepedi, or "EN:" for English.

Examples:
- "my geyser is broken" → EN:plumber
- "ek soek n loodgieter" → AF:plumber
- "waar kan ek eet" → AF:restaurant
- "garage" → EN:garage
- "Ke nyaka ngaka" → SE:doctor
- "I need a haircut" → EN:hairdresser

Message: "${raw}"`;

    const extractRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: extractPrompt }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 20 },
      }),
    });

    const extractData = await extractRes.json();
    const extractedText = (extractData?.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();

    console.log("STEP1_EXTRACT:", raw, "→", extractedText);

    // Parse language and keyword
    if (extractedText.startsWith("AF:")) {
      userLang = "af";
      keyword = extractedText.slice(3).trim().toLowerCase();
    } else if (extractedText.startsWith("SE:")) {
      userLang = "se";
      keyword = extractedText.slice(3).trim().toLowerCase();
    } else if (extractedText.startsWith("EN:")) {
      userLang = "en";
      keyword = extractedText.slice(3).trim().toLowerCase();
    } else {
      keyword = extractedText.toLowerCase().replace(/[^a-z\s]/g, "").trim();
    }
  } catch (err) {
    console.log("STEP1_ERROR:", err.message);
  }

  // =====================================================
  // STEP 2: Load listings and search with keyword
  // =====================================================
  let listings = [];

  try {
    console.log(`LOADING_DATA: Town=${townId}, BusinessCSV=${businessCsvUrl.substring(0, 50)}...`);

    const [businessRes, emergencyRes] = await Promise.all([
      fetch(businessCsvUrl),
      fetch(emergencyCsvUrl),
    ]);

    const businessCsv = await businessRes.text();
    const emergencyCsv = await emergencyRes.text();

    listings = [
      ...parseListingsFromCSV(businessCsv, townId, "business"),
      ...parseListingsFromCSV(emergencyCsv, townId, "emergency"),
    ];

    console.log(`LISTINGS_LOADED: ${listings.length} total for ${townId}`);
  } catch (err) {
    console.log("CSV_FETCH_ERROR:", err.message);
  }

  // =====================================================
  // STEP 3: Generate response with keyword + listings
  // =====================================================
  const langInstruction = userLang === "af"
    ? "Respond in Afrikaans only."
    : userLang === "se"
    ? "Respond in Sepedi only."
    : "Respond in English only.";

  // Use original user message for not-found display (preserves their language)
  const userSearchTerm = raw.toLowerCase().replace(/[^a-zA-Z\s]/g, "").trim().split(" ").slice(0, 3).join(" ");

  const responsePrompt = `You are a directory bot for ${townDisplay}. Search these listings for "${keyword}" and show matching results.

${langInstruction}

LISTINGS:
${JSON.stringify(listings, null, 0)}

CATEGORY MATCHING (important):
- "elektrisien" / "electrician" = someone who FIXES electrical problems (wiring, plugs, lights) - NOT Eskom or electricity utilities
- "loodgieter" / "plumber" = someone who FIXES plumbing (pipes, taps, geysers) - NOT water utilities
- Only show emergency services (Eskom, MMLM, ambulance, police) if user specifically asks for "emergency", "noodgeval", "power outage", or "kragonderbreking"
- Match the SERVICE TYPE, not just any word in the business name

RULES:
- Show 1-3 matching listings MAX
- NO greetings, NO follow-up questions
- Emergency services get 🚨 prefix before the name
- Phone numbers must have NO SPACES (for auto-linking)
- ONLY show fields that have data (skip WhatsApp if none, skip Directions if no address)

FORMAT (blank line after name, each field on own line):
Business Name

📞 Call: 0828552627
💬 WhatsApp: wa.me/27828552627
🗺️ Directions: maps.google.com/?q=Address+Encoded

For emergency services without WhatsApp (like 10177), just show:
🚨 Service Name

📞 Call: 10177

If NO match for "${keyword}", respond EXACTLY (use the user's original words "${userSearchTerm}"):
${userLang === "af"
  ? `Geen "${userSearchTerm}" in ${townDisplay} gelys nie.\n\nKen jy een? Help die gemeenskap:\n📝 Lys hulle: ${siteUrl}/#add-business\n💬 Of WhatsApp ons: ${whatsappDisplay}`
  : userLang === "se"
  ? `Ga go na "${userSearchTerm}" go ${townDisplay}.\n\nO tseba yo mongwe? Thuša setšhaba:\n📝 ${siteUrl}/#add-business\n💬 WhatsApp: ${whatsappDisplay}`
  : `No "${userSearchTerm}" listed in ${townDisplay} yet.\n\nKnow one? Help the community:\n📝 Add them: ${siteUrl}/#add-business\n💬 Or WhatsApp us: ${whatsappDisplay}`
}`;

  try {
    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: responsePrompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 500 },
      }),
    });

    const data = await res.json();
    const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("STEP3_RESPONSE:", keyword, "→", aiReply.substring(0, 100) + "...");

    if (aiReply) {
      // Extract business names mentioned for analytics
      const mentionedBusinesses = listings
        .filter(l => aiReply.includes(l.name))
        .map(l => l.name)
        .join(", ");

      return {
        reply: aiReply,
        analytics: {
          searchTerm: keyword, // Use extracted keyword for analytics
          resultsCount: mentionedBusinesses ? mentionedBusinesses.split(",").length : 0,
          businessesShown: mentionedBusinesses,
          town: townDisplay,
          source,
          sessionId,
          isTest,
          responseTimeMs: Date.now() - startTime,
          languageDetected: userLang,
        },
      };
    }
  } catch (err) {
    console.log("STEP3_ERROR:", err.message);
  }

  // Fallback if Gemini fails
  return {
    reply: `Sorry, something went wrong. WhatsApp us directly: ${whatsappDisplay}`,
    analytics: {
      searchTerm: raw,
      resultsCount: 0,
      businessesShown: "",
      town: townDisplay,
      source,
      sessionId,
      isTest,
      responseTimeMs: Date.now() - startTime,
      languageDetected: userLang || "",
    },
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
