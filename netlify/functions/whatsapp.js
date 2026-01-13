// netlify/functions/whatsapp.js
// Vaalwater Connect – WhatsApp directory bot with optional Gemini intent parsing
// + Auto language detect (EN/AF) and Afrikaans-friendly mapping

export async function handler(event) {
  try {
    // 0) Webhook verification (Meta will GET with hub.challenge)
    if (event.httpMethod === "GET") {
      const qs = event.queryStringParameters || {};

      // A) Meta webhook verify
      if (qs["hub.mode"] && qs["hub.challenge"]) {
        const mode = qs["hub.mode"];
        const token = qs["hub.verify_token"];
        const challenge = qs["hub.challenge"];
        const expected = process.env.WHATSAPP_VERIFY_TOKEN;

        if (mode === "subscribe" && expected && token === expected) {
          return { statusCode: 200, body: challenge };
        }
        return { statusCode: 403, body: "Forbidden" };
      }

      // B) Browser test: /.netlify/functions/whatsapp?q=plumber
      const q = (qs.q || "").trim();
      if (!q) return ok("OK");

      const reply = await buildReplyForText(q);
      return ok(reply);
    }

    // 1) Only handle POST for real WhatsApp messages
    if (event.httpMethod !== "POST") return ok("OK");

    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token) return ok("Missing WHATSAPP_TOKEN env var.");
    if (!phoneNumberId) return ok("Missing WHATSAPP_PHONE_NUMBER_ID env var.");

    const body = safeJson(event.body);

    // Extract message
    const msg = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0] || null;

    // Ignore non-text messages
    const from = msg?.from;
    const text = msg?.text?.body;

    if (!from || !text) return ok("No text message to process.");

    const reply = await buildReplyForText(text);

    // 2) Send WhatsApp message
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: { body: reply, preview_url: false },
    };

    const sendRes = await fetch(url, {
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

    // Always return 200 to Meta quickly
    return ok("OK");
  } catch (err) {
    console.error("WHATSAPP_FUNCTION_ERROR", err);
    return ok("Something went wrong. Please try again.");
  }
}

/**
 * Build the directory reply for any incoming user text.
 * - Detects language (EN/AF) and replies in same language
 * - Uses Gemini intent parsing if enabled
 * - Falls back to smart heuristics + keyword matching
 */
async function buildReplyForText(userTextRaw) {
  const userText = (userTextRaw || "").trim();
  const lower = userText.toLowerCase();

  const lang = detectLang(lower); // "af" | "en"
  const T = TEXT[lang];

  // 1) Load listings from CSV
  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTNITdJfiUo5LgobfGBnvUwWV416BdFF56fOjjAXdvVneYCZe6mlL2dZ6ZeR9w7JA/pub?gid=864428363&single=true&output=csv";

  const csvRes = await fetch(CSV_URL);
  const csv = await csvRes.text();

  const rows = parseCsv(csv);
  if (rows.length < 2) {
    return lang === "af"
      ? "Jammer — die gids is tans nie beskikbaar nie. Probeer asseblief later weer."
      : "Sorry — directory is currently unavailable. Please try again soon.";
  }

  const headers = rows[0].map((h) => (h || "").trim());
  const data = rows.slice(1);

  const idx = makeIndex(headers, [
    "subcategory",
    "name",
    "description",
    "phone",
    "whatsapp",
    "email",
    "address",
    "town",
    "tags",
  ]);

  const listings = data.map((r) => ({
    subcategory: (r[idx.subcategory] || "").trim(),
    name: (r[idx.name] || "").trim(),
    description: (r[idx.description] || "").trim(),
    phone: (r[idx.phone] || "").trim(),
    whatsapp: (r[idx.whatsapp] || "").trim(),
    email: (r[idx.email] || "").trim(),
    address: (r[idx.address] || "").trim(),
    town: (r[idx.town] || "").trim(),
    tags: (r[idx.tags] || "").trim(),
  }));

  // Build known categories from sheet (English)
  const categories = uniq(
    listings
      .map((l) => l.subcategory)
      .filter(Boolean)
      .map((s) => s.toLowerCase())
  ).slice(0, 120);

  // 2) Decide the search query
  const aiEnabled = isTrue(process.env.AI_INTENT_ENABLED);
  let query = "";

  // A) AI intent (Gemini) if enabled
  if (aiEnabled && process.env.GEMINI_API_KEY) {
    try {
      const ai = await geminiPickCategory(userText, categories, lang);
      if (ai?.query) query = ai.query.toLowerCase().trim();
      console.log("AI_INTENT", { userText, lang, ai });
    } catch (e) {
      console.log("AI_INTENT_ERROR", String(e));
      // fall through to heuristics
    }
  }

  // B) Heuristic fallback if AI is off or failed
  if (!query) query = heuristicQuery(lower);

  // C) Afrikaans synonym mapping (so "loodgieter" etc. works even without AI)
  if (!query && lang === "af") {
    const mapped = afrikaansToCategory(lower);
    if (mapped) query = mapped;
  }

  // D) Final fallback: first meaningful token
  if (!query) query = firstKeyword(lower);

  // 3) Match listings (subcategory + tags + name + description)
  const matches = listings.filter((l) => {
    const hay = [l.subcategory, l.tags, l.name, l.description]
      .join(" ")
      .toLowerCase();
    return hay.includes(query);
  });

  // 4) No results
  if (matches.length === 0) {
    // Don’t echo the full messy sentence; keep it clean
    return (
      `${T.noResults}\n` +
      `${T.tryExamples}\n` +
      `${T.addPrompt}`
    ).trim();
  }

  // 5) Format response
  const heading = `${T.searchIcon} ${T.heading(capitalize(query))}`;
  const out = [];
  out.push(heading);
  out.push("");

  for (const m of matches.slice(0, 8)) {
    const parts = [];
    parts.push(`• ${m.name || "Unnamed"}`);

    if (m.description) parts.push(`  ${dashTrim(m.description, 140)}`);

    if (m.phone) parts.push(`📞 ${m.phone}`);
    if (m.whatsapp) parts.push(`💬 WhatsApp: ${m.whatsapp}`);
    if (m.email) parts.push(`✉️ ${m.email}`);

    const place = m.address || m.town;
    if (place) parts.push(`📍 ${place}`);

    out.push(parts.join("\n"));
    out.push("");
  }

  return out.join("\n").trim();
}

/**
 * Gemini: pick best directory category from a provided list.
 * Note: allowed list is English categories from the sheet.
 */
async function geminiPickCategory(userText, categories, lang) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = (process.env.GEMINI_MODEL || "gemini-2.5-flash-lite").trim();

  const languageLine =
    lang === "af"
      ? "User language: Afrikaans (respond still with an allowed English keyword)."
      : "User language: English.";

  const prompt =
    `You are a classifier for a small-town business directory.\n` +
    `${languageLine}\n` +
    `Task: choose the ONE best matching directory keyword from the allowed list.\n` +
    `Allowed keywords: ${categories.join(", ")}\n\n` +
    `User message: "${userText}"\n\n` +
    `Return ONLY valid JSON with keys: query, confidence.\n` +
    `Example: {"query":"plumber","confidence":0.82}\n`;

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 60 },
    }),
  });

  const txt = await res.text();
  if (!res.ok) {
    console.log("GEMINI_STATUS", res.status);
    console.log("GEMINI_BODY", txt);
    throw new Error(`Gemini error ${res.status}`);
  }

  const jsonText =
    safeExtractJson(
      safeJson(txt)?.candidates?.[0]?.content?.parts?.[0]?.text || txt
    ) || "{}";

  const parsed = safeJson(jsonText) || {};
  if (!parsed.query) return null;

  const q = String(parsed.query || "").toLowerCase().trim();
  if (!categories.includes(q)) return null;

  return { query: q, confidence: parsed.confidence ?? null };
}

/**
 * Language detection: lightweight heuristic.
 */
function detectLang(lower) {
  // If user types obvious Afrikaans markers, treat as Afrikaans
  const afMarkers = [
    "asb", "asseblief", "dankie", "môre", "more", "vandág", "vandag",
    "ek", "my", "jy", "julle", "ons", "hulle",
    "wat", "waar", "wanneer", "hoekom",
    "is daar", "het jy", "kan jy",
    "loodgieter", "elektrisiën", "elektrisien", "dokter", "aptek", "apteek",
    "huis te koop", "te koop", "te huur", "plaas",
  ];

  if (/[áéíóúäëïöüâêîôû]/.test(lower)) return "af"; // Afrikaans-ish diacritics
  for (const m of afMarkers) if (lower.includes(m)) return "af";
  return "en";
}

/**
 * Afrikaans synonyms → English categories (matches your sheet).
 */
function afrikaansToCategory(lower) {
  const map = [
    { re: /\b(loodgieter|pype|pyp|geiser|geyser|lek|lekkasie|verstopping|riool)\b/i, q: "plumber" },
    { re: /\b(dokter|huisdokter|kliniek|medies|apteek|aptek|verpleeg)\b/i, q: "doctor" },
    { re: /\b(elektrisi[ëe]n|krag|trip|bedrading|prop|lig(te)?|elektries)\b/i, q: "electrician" },
    { re: /\b(huis te koop|te koop|eiendom|huur|te huur|makelaar)\b/i, q: "property" },
    { re: /\b(taxi|vervoer|lift|rit)\b/i, q: "taxi" },
  ];

  for (const m of map) if (m.re.test(lower)) return m.q;
  return "";
}

/**
 * Heuristics: map common natural language to a directory keyword.
 */
function heuristicQuery(lower) {
  if (/(geyser|leak|burst|pipe|blocked|blockage|drain|toilet|tap|sewer)/i.test(lower))
    return "plumber";

  if (/(doctor|gp|clinic|medical|pharmacy|nurse)/i.test(lower))
    return "doctor";

  if (/(electric|power|trip|wiring|plug|lights? not working)/i.test(lower))
    return "electrician";

  if (/(house|home|property|rent|rental|for sale|estate agent)/i.test(lower))
    return "property";

  return "";
}

/**
 * CSV parsing that handles quoted commas.
 */
function parseCsv(csvText) {
  const lines = (csvText || "")
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);

  return lines.map(parseCsvLine);
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"' && line[i + 1] === '"') {
      cur += '"';
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }

  out.push(cur);
  return out;
}

function makeIndex(headers, wanted) {
  const idx = {};
  for (const key of wanted) idx[key] = headers.indexOf(key);
  return idx;
}

function firstKeyword(lower) {
  const stop = new Set([
    "i","need","a","an","the","someone","somebody","today","now","please","help",
    "for","in","on","at","to","my","me","is","are","with","and","of","near",
    // Afrikaans-ish fillers
    "ek","my","jy","ons","hulle","asb","asseblief","vandag","nou","help"
  ]);

  const tokens = lower
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !stop.has(t));

  return tokens[0] || "";
}

function safeJson(s) {
  try {
    return typeof s === "string" ? JSON.parse(s) : s;
  } catch {
    return null;
  }
}

function safeExtractJson(text) {
  if (!text) return null;
  const t = String(text).trim();
  if (t.startsWith("{") && t.endsWith("}")) return t;
  const m = t.match(/\{[\s\S]*\}/);
  return m ? m[0] : null;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function dashTrim(s, maxLen) {
  const t = String(s || "").trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen - 1).trim() + "…";
}

function isTrue(v) {
  const s = String(v || "").toLowerCase().trim();
  return s === "true" || s === "1" || s === "yes" || s === "y";
}

function ok(message) {
  return { statusCode: 200, body: String(message || "") };
}

function capitalize(str) {
  const s = String(str || "");
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

const TEXT = {
  en: {
    searchIcon: "🔎",
    heading: (q) => `${q} in Vaalwater:`,
    noResults: "Sorry — no listing found.",
    tryExamples: "Try: plumber, electrician, doctor, taxi",
    addPrompt: 'Reply ADD to submit a business.',
  },
  af: {
    searchIcon: "🔎",
    heading: (q) => `${q} in Vaalwater:`,
    noResults: "Jammer — geen inskrywing gevind nie.",
    tryExamples: "Probeer: loodgieter, elektrisiën, dokter, taxi",
    addPrompt: "Antwoord ADD om ’n besigheid in te dien.",
  },
};
