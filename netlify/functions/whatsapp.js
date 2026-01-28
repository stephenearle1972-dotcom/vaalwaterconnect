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
    const credsJson = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
    const spreadsheetId = process.env.ANALYTICS_SPREADSHEET_ID;
    const sheetName = process.env.ANALYTICS_SHEET_NAME || "Analytics";

    if (!credsJson || !spreadsheetId) {
      // Analytics not configured - skip silently
      return;
    }

    const credentials = JSON.parse(credsJson);
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
// Core logic: sentence -> intent keyword -> directory search
// ======================================================

async function handleQuery({ text, from, source }) {
  const raw = (text || "").trim();
  if (!raw) return { reply: "OK", analytics: null };

  // 1) Detect language (fast heuristic)
  let lang = detectLanguage(raw); // "af" | "en"

  // 2) Optional Gemini intent extraction (only if enabled)
  const aiEnabled = (process.env.AI_INTENT_ENABLED || "").toLowerCase() === "true";
  const geminiKey = process.env.GEMINI_API_KEY || "";
  const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  let searchTerm = "";

  if (aiEnabled && geminiKey) {
    const ai = await geminiExtract({ text: raw, model: geminiModel, key: geminiKey });
    if (ai?.language === "af" || ai?.language === "en") lang = ai.language;
    if (ai?.searchTerm) searchTerm = ai.searchTerm;
  }

  // 3) Fallback extraction (no AI, or AI failed)
  if (!searchTerm) {
    searchTerm = extractSearchTerm(raw, lang);
  }

  // 4) If we still have nothing usable
  if (!searchTerm) {
    const noTermReply = lang === "af"
      ? "Stuur asseblief net 'n sleutelwoord, bv: loodgieter, haarkapper, dokter, apteek."
      : "Please send a single keyword, e.g. plumber, hairdresser, doctor, pharmacy.";
    return { reply: noTermReply, analytics: null };
  }

  // 5) Load BOTH CSV sheets and search
  const BUSINESS_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vThi_KiXMZnzjFDN4dbCz8xPTlB8dJnal9NRMd-_8p2hg6000li5r1bhl5cRugFQyTopHCzHVtGc9VN/pub?gid=246270252&single=true&output=csv";
  const EMERGENCY_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSaY65eKywzkOD7O_-3RYXbe3lWShkASeR7EuK2lcv8E0ktarGhFsfYuv7tfvf6aSpbY8BHvM54Yy-t/pub?gid=1137836387&single=true&output=csv";

  // Town filtering - defaults to Vaalwater, can be overridden via env var
  const CURRENT_TOWN = (process.env.TOWN_NAME || "Vaalwater").toLowerCase();
  const townDisplay = CURRENT_TOWN.charAt(0).toUpperCase() + CURRENT_TOWN.slice(1);

  // Fetch both sheets in parallel
  const [businessRes, emergencyRes] = await Promise.all([
    fetch(BUSINESS_CSV_URL),
    fetch(EMERGENCY_CSV_URL),
  ]);

  const businessCsv = await businessRes.text();
  const emergencyCsv = await emergencyRes.text();

  // Parse both CSVs
  const businessData = parseCSV(businessCsv);
  const emergencyData = parseCSV(emergencyCsv);

  // Check if we have any data
  if (!businessData.rows.length && !emergencyData.rows.length) {
    const unavailableReply = lang === "af"
      ? "Jammer — die lys is tydelik onbeskikbaar. Probeer weer later."
      : "Sorry — the directory is temporarily unavailable. Please try again later.";
    return {
      reply: unavailableReply,
      analytics: { searchTerm, resultsCount: 0, businessesShown: "", town: townDisplay, source },
    };
  }

  // Search tokens
  const tokens = normalize(searchTerm).split(" ").filter(Boolean);

  // Helper to find column index
  const idxAny = (headers, ...names) => {
    for (const n of names) {
      const i = headers.indexOf(n);
      if (i !== -1) return i;
    }
    return -1;
  };

  // =====================
  // Search Business Sheet
  // =====================
  let businessResults = [];
  if (businessData.headers.length && businessData.rows.length) {
    const bh = businessData.headers;
    const subIdx = idxAny(bh, "subcategory", "category", "type");
    const nameIdx = idxAny(bh, "name", "business_name");
    const phoneIdx = idxAny(bh, "phone", "telephone");
    const waIdx = idxAny(bh, "whatsapp", "wa");
    const emailIdx = idxAny(bh, "email");
    const descIdx = idxAny(bh, "description", "desc");
    const areaIdx = idxAny(bh, "address", "location", "area");
    const townIdx = idxAny(bh, "town", "city", "region");
    const tagsIdx = idxAny(bh, "tags", "keywords");
    const latIdx = idxAny(bh, "lat", "latitude");
    const lngIdx = idxAny(bh, "lng", "longitude", "lon");
    const featuredIdx = idxAny(bh, "isFeatured", "featured");
    const tierIdx = idxAny(bh, "tier");

    // Filter by town
    const townFiltered = townIdx !== -1
      ? businessData.rows.filter((row) => {
          const rowTown = (row[townIdx] || "").toLowerCase().trim();
          return !rowTown || rowTown === CURRENT_TOWN;
        })
      : businessData.rows;

    // Helper function to check if a token matches a whole word in text
    const matchesWholeWord = (text, token) => {
      if (!text || !token) return false;
      const words = text.toLowerCase().split(/\s+/);
      return words.some(word => {
        // Exact match or word starts with token (for plurals like "gas" matching "gas-related")
        return word === token || word.startsWith(token + '-') || word.startsWith(token + 's');
      });
    };

    businessResults = townFiltered
      .map((row) => {
        const name = (row[nameIdx] || "").toLowerCase();
        const tags = (row[tagsIdx] || "").toLowerCase();
        const sector = (row[subIdx] || "").toLowerCase();
        const desc = (row[descIdx] || "").toLowerCase();
        const area = (row[areaIdx] || "").toLowerCase();

        // Calculate weighted keyword match score
        // Prioritize name and tags, weight description lower
        let keywordScore = 0;
        for (const t of tokens) {
          // Name match - highest priority (10 points)
          if (matchesWholeWord(name, t)) keywordScore += 10;
          // Tags match - high priority (8 points)
          if (matchesWholeWord(tags, t)) keywordScore += 8;
          // Sector/subcategory match - high priority (8 points)
          if (matchesWholeWord(sector, t)) keywordScore += 8;
          // Area match - medium priority (5 points)
          if (matchesWholeWord(area, t)) keywordScore += 5;
          // Description match - lower priority (3 points)
          if (matchesWholeWord(desc, t)) keywordScore += 3;
        }

        // Only apply boosts if there's a keyword match
        let score = keywordScore;
        if (keywordScore > 0) {
          // Boost for featured businesses
          const isFeatured = featuredIdx !== -1 &&
            (row[featuredIdx] || "").toLowerCase() === "true";
          if (isFeatured) score += 10;

          // Boost for premium/hospitality tier
          const tier = tierIdx !== -1 ? (row[tierIdx] || "").toLowerCase() : "";
          if (tier === "premium" || tier === "hospitality") score += 5;
        }

        return {
          score,
          source: "business",
          name: row[nameIdx] || "Unnamed",
          desc: row[descIdx] || "",
          phone: row[phoneIdx] || "",
          wa: row[waIdx] || "",
          email: row[emailIdx] || "",
          area: row[areaIdx] || "",
          lat: latIdx !== -1 && row[latIdx] ? parseFloat(row[latIdx]) : null,
          lng: lngIdx !== -1 && row[lngIdx] ? parseFloat(row[lngIdx]) : null,
        };
      })
      .filter((x) => x.score > 0);
  }

  // ======================
  // Search Emergency Sheet
  // ======================
  let emergencyResults = [];
  if (emergencyData.headers.length && emergencyData.rows.length) {
    const eh = emergencyData.headers;
    const nameIdx = idxAny(eh, "service_name", "name");
    const catIdx = idxAny(eh, "category", "subcategory");
    const phoneIdx = idxAny(eh, "primary_phone", "phone");
    const phone2Idx = idxAny(eh, "secondary_phone");
    const waIdx = idxAny(eh, "whatsapp", "wa");
    const emailIdx = idxAny(eh, "email");
    const hoursIdx = idxAny(eh, "hours");
    const areaIdx = idxAny(eh, "coverage_area", "address", "area");
    const townIdx = idxAny(eh, "town", "city");
    const keywordsIdx = idxAny(eh, "keywords", "tags");
    const notesIdx = idxAny(eh, "notes", "description");
    const statusIdx = idxAny(eh, "status");

    // Filter by town and active status
    const townFiltered = emergencyData.rows.filter((row) => {
      const rowTown = (row[townIdx] || "").toLowerCase().trim();
      const status = (row[statusIdx] || "").toLowerCase().trim();
      const townMatch = !rowTown || rowTown === CURRENT_TOWN;
      const isActive = !status || status === "active";
      return townMatch && isActive;
    });

    // Helper function to check if a token matches a whole word in text
    const matchesWholeWordEmergency = (text, token) => {
      if (!text || !token) return false;
      const words = text.toLowerCase().split(/\s+/);
      return words.some(word => {
        return word === token || word.startsWith(token + '-') || word.startsWith(token + 's');
      });
    };

    emergencyResults = townFiltered
      .map((row) => {
        const name = (row[nameIdx] || "").toLowerCase();
        const cat = (row[catIdx] || "").toLowerCase();
        const keywords = (row[keywordsIdx] || "").toLowerCase();
        const notes = (row[notesIdx] || "").toLowerCase();
        const area = (row[areaIdx] || "").toLowerCase();

        // Calculate weighted keyword match score using whole-word matching
        let score = 0;
        for (const t of tokens) {
          // Name match - highest priority
          if (matchesWholeWordEmergency(name, t)) score += 10;
          // Category match - high priority
          if (matchesWholeWordEmergency(cat, t)) score += 8;
          // Keywords match - high priority
          if (matchesWholeWordEmergency(keywords, t)) score += 8;
          // Area match - medium priority
          if (matchesWholeWordEmergency(area, t)) score += 5;
          // Notes/description match - lower priority
          if (matchesWholeWordEmergency(notes, t)) score += 3;
        }

        // Build phone string (primary + secondary)
        let phone = row[phoneIdx] || "";
        if (row[phone2Idx]) phone += ` / ${row[phone2Idx]}`;

        // Build description from notes + hours
        let desc = row[notesIdx] || "";
        if (row[hoursIdx]) desc = desc ? `${desc} (${row[hoursIdx]})` : `Hours: ${row[hoursIdx]}`;

        return {
          score,
          source: "emergency",
          name: row[nameIdx] || "Unnamed",
          desc,
          phone,
          wa: row[waIdx] || "",
          email: row[emailIdx] || "",
          area: row[areaIdx] || "",
          category: row[catIdx] || "",
        };
      })
      .filter((x) => x.score > 0);
  }

  // =====================
  // Merge & Rank Results
  // =====================
  const allSorted = [...emergencyResults, ...businessResults]
    .sort((a, b) => b.score - a.score);

  const totalCount = allSorted.length;
  const allResults = allSorted.slice(0, 3); // Top 3 results only

  if (allResults.length === 0) {
    const noResultsReply = lang === "af"
      ? `Jammer — geen lysinskrywing gevind vir "${searchTerm}" in ${townDisplay}.\nAntwoord ADD om 'n besigheid by te voeg.`
      : `Sorry — no listing found for "${searchTerm}" in ${townDisplay}.\nReply ADD to submit a business.`;
    return {
      reply: noResultsReply,
      analytics: { searchTerm, resultsCount: 0, businessesShown: "", town: townDisplay, source },
    };
  }

  // Build reply (language-aware header)
  const title =
    lang === "af"
      ? `🔎 ${capitalizeAf(searchTerm)} in ${townDisplay}:`
      : `🔎 ${capitalize(searchTerm)} in ${townDisplay}:`;

  const cards = allResults.map((r) => {
    const lines = [];
    // Add emoji prefix for emergency services
    const prefix = r.source === "emergency" ? "🚨 " : "• ";
    lines.push(`${prefix}*${r.name}*`);
    if (r.desc) lines.push(r.desc);

    // Format phone number(s) - clean format for easy copy/dial
    if (r.phone) {
      const formatted = formatPhone(r.phone);
      lines.push(`📞 ${formatted}`);
    }

    if (r.wa) lines.push(`💬 wa.me/${formatPhone(r.wa).replace(/\D/g, "")}`);
    if (r.email) lines.push(`✉️ ${r.email}`);
    if (r.area) {
      lines.push(`📍 ${r.area}`);
    }
    return lines.join("\n");
  });

  // Add dialing hint
  const hint = lang === "af"
    ? "\n\n_Kopieer nommer → plak in Dialer om te bel_"
    : "\n\n_Copy number → paste in Dialer to call_";

  // Add footer if more results exist
  const footer = totalCount > 3
    ? (lang === "af"
        ? `\n\n_Wys top 3 van ${totalCount} resultate. Besoek vaalwaterconnect.co.za vir volledige gids_`
        : `\n\n_Showing top 3 of ${totalCount} results. Visit vaalwaterconnect.co.za for full directory_`)
    : "";

  const textReply = `${title}\n\n${cards.join("\n\n")}${hint}${footer}`;

  // Build list of business names shown for analytics
  const businessesShown = allResults.map((r) => r.name).join(", ");

  // Analytics data to log
  const analytics = {
    searchTerm,
    resultsCount: totalCount,
    businessesShown,
    town: townDisplay,
    source,
  };

  // Check if the top result has location data for tappable map pin
  const topResult = allResults[0];
  if (topResult && topResult.lat && topResult.lng && !isNaN(topResult.lat) && !isNaN(topResult.lng)) {
    return {
      reply: {
        text: textReply,
        location: {
          latitude: topResult.lat,
          longitude: topResult.lng,
          name: topResult.name,
          address: topResult.area || "",
        },
      },
      analytics,
    };
  }

  return { reply: textReply, analytics };
}

// ======================================================
// Gemini intent (optional)
// Returns { language: "af"|"en", searchTerm: string } or null
// ======================================================

async function geminiExtract({ text, model, key }) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(key)}`;

    const prompt = `
You are a tiny intent parser for a local directory bot in South Africa.
Task:
- Determine language: "af" for Afrikaans, "en" for English.
- Extract the user's directory search term as a short keyword or 2-3 word phrase.
- If the user asks a question like "wat is die haarkapper se nommer", return searchTerm: "haarkapper" (or "hairdresser").
- If the user says "my geyser is leaking and i need someone today", return searchTerm: "plumber" (or "loodgieter").
Return ONLY valid JSON with keys: language, searchTerm.

User text: ${JSON.stringify(text)}
`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 60,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    const out = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = safeJson(out);

    if (!parsed) return null;
    if (!parsed.searchTerm || typeof parsed.searchTerm !== "string") return null;

    return {
      language: parsed.language === "af" ? "af" : "en",
      searchTerm: String(parsed.searchTerm).trim(),
    };
  } catch (e) {
    console.log("GEMINI_EXTRACT_FAILED", e);
    return null;
  }
}

function safeJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    // try to salvage if model adds stray text
    const m = s.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]);
    } catch {
      return null;
    }
  }
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
// Language + intent extraction (fallback, no AI)
// ======================================================

function detectLanguage(text) {
  const t = normalize(text);
  const afHints = [
    "wat",
    "waar",
    "wie",
    "hoe",
    "wanneer",
    "watter",
    "asseblief",
    "nommer",
    "se",
    "vir",
    "ek",
    "my",
    "nodig",
    "vandag",
    "loodgieter",
    "haarkapper",
    "dokter",
    "apteek",
  ];
  let hits = 0;
  for (const w of afHints) if (t.includes(` ${w} `) || t.startsWith(w + " ")) hits++;
  return hits >= 2 ? "af" : "en";
}

function extractSearchTerm(text, lang) {
  // normalize
  let t = normalize(text);

  // common phrase -> category mapping (expand anytime)
  const phraseMap = [
    { match: ["geyser", "geiser", "geysers"], term: "plumber" },
    { match: ["loodgieter"], term: "plumber" },
    { match: ["haarkapper", "hairdresser", "hair dresser"], term: "hairdresser" },
    { match: ["barber", "barbershop", "barber shop"], term: "barber" },
    { match: ["dokter", "doctor", "gp", "general practitioner"], term: "doctor" },
    { match: ["tandarts", "dentist"], term: "dentist" },
    { match: ["apteek", "pharmacy"], term: "pharmacy" },
  ];

  for (const item of phraseMap) {
    for (const m of item.match) {
      if (t.includes(m)) return item.term;
    }
  }

  // remove question fluff
  const stopwordsAf = new Set([
    "wat",
    "waar",
    "wie",
    "hoe",
    "wanneer",
    "watter",
    "is",
    "die",
    "n",
    "’n",
    "se",
    "vir",
    "asb",
    "asseblief",
    "nommer",
    "nommers",
    "kontak",
    "contact",
    "ek",
    "my",
    "nodig",
    "vandag",
    "nou",
    "in",
    "by",
    "van",
  ]);

  const stopwordsEn = new Set([
    "what",
    "where",
    "who",
    "how",
    "when",
    "which",
    "is",
    "the",
    "a",
    "an",
    "please",
    "number",
    "contact",
    "need",
    "someone",
    "today",
    "now",
    "in",
    "at",
    "for",
    "of",
    "to",
    "me",
    "my",
  ]);

  const stop = lang === "af" ? stopwordsAf : stopwordsEn;

  const words = t.split(" ").filter(Boolean).filter((w) => !stop.has(w));

  // If user typed a clean keyword already, it survives here
  // If it was a sentence, the “real” keyword usually survives too
  if (words.length === 0) return "";

  // choose last meaningful word if it looks like a noun
  // (because Afrikaans questions often end with the noun)
  const chosen = words[words.length - 1];

  // but if there are 2-3 words, keep them (e.g. "chimney sweep", "car wash")
  if (words.length >= 2) {
    const last2 = words.slice(-2).join(" ");
    // allow short phrases
    if (last2.length <= 24) return last2;
  }

  return chosen;
}

// ======================================================
// Helpers
// ======================================================

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .padStart(1, " ");
}

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

function capitalize(str) {
  str = String(str || "").trim();
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function capitalizeAf(str) {
  // Same as capitalize, but kept separate if you later want Afrikaans-specific tweaks
  return capitalize(str);
}

function textResponse(message) {
  return { statusCode: 200, body: String(message || "") };
}
