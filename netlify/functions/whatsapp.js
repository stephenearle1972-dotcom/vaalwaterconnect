// netlify/functions/whatsapp.js
// WhatsApp directory bot + optional Gemini intent parsing (safe fallback)

export async function handler(event) {
  try {
    // --- 0) Webhook verification (Meta does a GET with hub.* params) ---
    if (event.httpMethod === "GET") {
      const qs = event.queryStringParameters || {};

      // Meta webhook verification
      if (qs["hub.mode"] && qs["hub.verify_token"] && qs["hub.challenge"]) {
        const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
        if (qs["hub.verify_token"] === verifyToken) {
          return { statusCode: 200, body: qs["hub.challenge"] };
        }
        return { statusCode: 403, body: "Verification token mismatch" };
      }

      // Simple browser test: /.netlify/functions/whatsapp?q=plumber
      const q = (qs.q || "").trim();
      if (!q) return ok("OK");
      const reply = await buildDirectoryReply({ userText: q, fromMsisdn: null });
      return ok(reply);
    }

    // --- 1) POST: incoming WhatsApp webhook event ---
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId =
      process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token) return ok("Missing WHATSAPP_TOKEN env var.");
    if (!phoneNumberId) return ok("Missing WHATSAPP_PHONE_NUMBER_ID env var.");

    const body = safeJsonParse(event.body) || {};
    const msg = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    // Ignore non-message webhooks (statuses etc.)
    if (!msg?.text?.body || !msg?.from) {
      return ok("No text message to process.");
    }

    const from = msg.from; // user MSISDN
    const userText = msg.text.body;

    const reply = await buildDirectoryReply({ userText, fromMsisdn: from });

    // --- 2) Send reply via WhatsApp Cloud API ---
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

    const sendBody = await sendRes.text();
    console.log("META_SEND_STATUS", sendRes.status);
    console.log("META_SEND_BODY", truncate(sendBody, 500));

    // Always respond 200 to Meta quickly
    return ok("OK");
  } catch (err) {
    console.error("HANDLER_ERROR", err);
    return ok("Something went wrong. Please try again.");
  }
}

/* =========================
   Directory logic
   ========================= */

async function buildDirectoryReply({ userText, fromMsisdn }) {
  const raw = (userText || "").trim();
  if (!raw) return "OK";

  // Optional AI intent parsing (safe)
  const aiEnabled = (process.env.AI_INTENT_ENABLED || "").toLowerCase() === "true";

  let normalizedQuery = raw;
  let keywords = [];
  let lang = "en";

  if (aiEnabled) {
    const intent = await getGeminiIntent(raw);
    if (intent) {
      normalizedQuery = intent.normalized_query || normalizedQuery;
      keywords = Array.isArray(intent.keywords) ? intent.keywords : [];
      lang = intent.language === "af" ? "af" : "en";
    }
  }

  // Fallback if AI off or returned nothing useful
  if (!keywords.length) {
    keywords = [normalizedQuery.toLowerCase()];
  } else {
    keywords = keywords
      .map((k) => String(k || "").trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5);
  }

  // Load listings (CSV)
  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTNITdJfiUo5LgobfGBnvUwWV416BdFF56fOjjAXdvVneYCZe6mlL2dZ6ZeR9w7JA/pub?gid=864428363&single=true&output=csv";

  const res = await fetch(CSV_URL);
  const csv = await res.text();

  const { headers, rows } = parseCsvNaive(csv);

  // Column indices (safe if missing)
  const idx = (name) => headers.indexOf(name);

  const subIdx = idx("subcategory");
  const tagsIdx = idx("tags");
  const nameIdx = idx("name");
  const descIdx = idx("description");
  const phoneIdx = idx("phone");
  const waIdx = idx("whatsapp");
  const emailIdx = idx("email");
  const webIdx = idx("website");
  const areaIdx = idx("area"); // if you have it
  const townIdx = idx("town");

  // Score each row by keyword hits across fields
  const scored = rows
    .map((row) => {
      const hay = [
        row[subIdx],
        row[tagsIdx],
        row[nameIdx],
        row[descIdx],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      let score = 0;
      for (const k of keywords) {
        if (k && hay.includes(k)) score += 1;
      }
      return { row, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  // Pick top 3
  const top = scored.slice(0, 3).map((x) => x.row);

  if (!top.length) {
    return lang === "af"
      ? `Jammer — geen lysing gevind vir "${raw}".\nAntwoord ADD om ’n besigheid by te voeg.`
      : `Sorry — no listing found for "${raw}".\nReply ADD to submit a business.`;
  }

  const heading =
    lang === "af"
      ? `🔧 ${capitalize(normalizedQuery)} in Vaalwater:`
      : `🔧 ${capitalize(normalizedQuery)} in Vaalwater:`;

  const blocks = top.map((row) => {
    const name = row[nameIdx] || "Unnamed";
    const desc = row[descIdx] ? `— ${row[descIdx]}` : "";
    const phone = cleanValue(row[phoneIdx]);
    const wa = cleanValue(row[waIdx]);
    const email = cleanValue(row[emailIdx]);
    const web = cleanValue(row[webIdx]);

    const town = cleanValue(row[townIdx]);
    const area = cleanValue(row[areaIdx]);
    const location =
      area || town ? `${[area, town].filter(Boolean).join(" & ")}` : "Vaalwater";

    const lines = [];
    lines.push(`• ${name} ${desc}`.replace(/\s+/g, " ").trim());

    // Put numbers on their own lines for clickability
    if (phone) lines.push(`📞 ${phone}`);
    if (wa && wa !== phone) lines.push(`💬 WhatsApp: ${wa}`);
    if (email) lines.push(`✉️ ${email}`);
    if (web) lines.push(`🌐 ${web}`);

    lines.push(`📍 ${location}`);

    return lines.join("\n");
  });

  return `${heading}\n\n${blocks.join("\n\n")}`;
}

/* =========================
   Gemini intent parsing
   ========================= */

async function getGeminiIntent(userText) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    if (!apiKey) return null;

    // Gemini generateContent REST endpoint (API key in query string)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const prompt = `
You are an intent parser for a small-town business directory.
Return ONLY valid JSON (no markdown, no backticks).
Task: extract directory-search keywords from the user's message.

Rules:
- Do NOT invent businesses.
- Output JSON with:
  - "normalized_query": a short phrase like "plumber" or "electrician"
  - "keywords": array of 1-5 lowercase keywords/tags
  - "language": "en" or "af" (detect from user text)

Examples:
User: "my geyser is leaking" -> {"normalized_query":"plumber","keywords":["plumber","geyser","leak"],"language":"en"}
User: "krag probleem by huis" -> {"normalized_query":"electrician","keywords":["electrician","krag"],"language":"af"}

User message: ${JSON.stringify(String(userText || ""))}
`.trim();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    clearTimeout(timeout);

    const txt = await res.text();
    if (!res.ok) {
      console.log("GEMINI_ERROR_STATUS", res.status);
      console.log("GEMINI_ERROR_BODY", truncate(txt, 500));
      return null;
    }

    // Typical response: candidates[0].content.parts[0].text
    const data = safeJsonParse(txt);
    const outText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output ||
      "";

    const cleaned = stripJsonFence(String(outText || ""));
    const parsed = safeJsonParse(cleaned);

    if (!parsed || typeof parsed !== "object") return null;

    // Minimal validation
    if (!Array.isArray(parsed.keywords)) parsed.keywords = [];
    parsed.keywords = parsed.keywords
      .map((k) => String(k || "").trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5);

    if (parsed.language !== "af") parsed.language = "en";
    if (typeof parsed.normalized_query !== "string") parsed.normalized_query = "";

    return parsed;
  } catch (e) {
    console.log("GEMINI_INTENT_FAIL", String(e?.message || e));
    return null;
  }
}

/* =========================
   Utilities
   ========================= */

function ok(message) {
  return { statusCode: 200, body: String(message || "") };
}

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

// Naive CSV parse (works if your sheet doesn't contain commas inside fields)
function parseCsvNaive(csv) {
  const lines = String(csv || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const headers = (lines[0] || "").split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((l) => l.split(",").map((v) => v.trim()));

  return { headers, rows };
}

function cleanValue(v) {
  const s = String(v || "").trim();
  if (!s) return "";
  if (s.toLowerCase() === "null") return "";
  return s;
}

function capitalize(str) {
  const s = String(str || "").trim();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function truncate(s, n) {
  const t = String(s || "");
  return t.length > n ? t.slice(0, n) + "…" : t;
}

function stripJsonFence(s) {
  // Remove ```json fences if model ignores instruction
  return s
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}
