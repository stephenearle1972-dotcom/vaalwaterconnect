// netlify/functions/whatsapp.js

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
      const reply = await handleQuery({
        text: q,
        from: null,
        source: "web",
      });
      return textResponse(reply);
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

    const reply = await handleQuery({
      text: incomingText,
      from,
      source: "whatsapp",
    });

    // -----------------------------
    // 2) Send message back to WhatsApp
    // -----------------------------
    const sendUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: { body: reply },
    };

    const sendRes = await fetch(sendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const sendText = await sendRes.text();
    console.log("META_SEND_STATUS", sendRes.status);
    console.log("META_SEND_BODY", sendText);

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
  if (!raw) return "OK";

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
    return lang === "af"
      ? "Stuur asseblief net ’n sleutelwoord, bv: loodgieter, haarkapper, dokter, apteek."
      : "Please send a single keyword, e.g. plumber, hairdresser, doctor, pharmacy.";
  }

  // 5) Load BOTH CSV sheets and search
  const BUSINESS_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTNITdJfiUo5LgobfGBnvUwWV416BdFF56fOjjAXdvVneYCZe6mlL2dZ6ZeR9w7JA/pub?gid=864428363&single=true&output=csv";
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
    return lang === "af"
      ? "Jammer — die lys is tydelik onbeskikbaar. Probeer weer later."
      : "Sorry — the directory is temporarily unavailable. Please try again later.";
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

    // Filter by town
    const townFiltered = townIdx !== -1
      ? businessData.rows.filter((row) => {
          const rowTown = (row[townIdx] || "").toLowerCase().trim();
          return !rowTown || rowTown === CURRENT_TOWN;
        })
      : businessData.rows;

    businessResults = townFiltered
      .map((row) => {
        const hay = [
          row[subIdx], row[nameIdx], row[descIdx], row[areaIdx], row[tagsIdx]
        ].filter(Boolean).join(" ").toLowerCase();

        let score = 0;
        for (const t of tokens) {
          if (hay.includes(t)) score += 2;
        }
        const sub = (row[subIdx] || "").toLowerCase();
        if (sub && tokens.some((t) => sub.includes(t))) score += 2;

        return {
          score,
          source: "business",
          name: row[nameIdx] || "Unnamed",
          desc: row[descIdx] || "",
          phone: row[phoneIdx] || "",
          wa: row[waIdx] || "",
          email: row[emailIdx] || "",
          area: row[areaIdx] || "",
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

    emergencyResults = townFiltered
      .map((row) => {
        const hay = [
          row[nameIdx], row[catIdx], row[keywordsIdx], row[notesIdx], row[areaIdx]
        ].filter(Boolean).join(" ").toLowerCase();

        let score = 0;
        for (const t of tokens) {
          if (hay.includes(t)) score += 3; // Boost emergency matches
        }
        const cat = (row[catIdx] || "").toLowerCase();
        if (cat && tokens.some((t) => cat.includes(t))) score += 3;

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
  const allResults = [...emergencyResults, ...businessResults]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6); // Top 6 results

  if (allResults.length === 0) {
    return lang === "af"
      ? `Jammer — geen lysinskrywing gevind vir "${searchTerm}" in ${townDisplay}.\nAntwoord ADD om 'n besigheid by te voeg.`
      : `Sorry — no listing found for "${searchTerm}" in ${townDisplay}.\nReply ADD to submit a business.`;
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
    lines.push(`${prefix}${r.name}`);
    if (r.desc) lines.push(r.desc);
    if (r.phone) lines.push(`📞 ${formatPhone(r.phone)}`);
    if (r.wa) lines.push(`💬 WhatsApp: ${formatPhone(r.wa)}`);
    if (r.email) lines.push(`✉️ ${r.email}`);
    if (r.area) lines.push(`📍 ${r.area}`);
    return lines.join("\n");
  });

  return `${title}\n\n${cards.join("\n\n")}`;
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

function formatPhone(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
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
