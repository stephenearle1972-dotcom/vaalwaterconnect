// netlify/functions/whatsapp.js

export async function handler(event) {
  try {
    // 0) Webhook verification (Meta will call GET with hub.*)
    if (event.httpMethod === "GET") {
      const qp = event.queryStringParameters || {};

      // Meta verification handshake
      if (qp["hub.mode"] && qp["hub.challenge"]) {
        const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
        if (qp["hub.verify_token"] === verifyToken) {
          return { statusCode: 200, body: String(qp["hub.challenge"]) };
        }
        return { statusCode: 403, body: "Forbidden" };
      }

      // Browser test mode: /whatsapp?q=plumber
      const q = (qp.q || "").trim();
      if (!q) return ok("Test OK. Try: ?q=plumber");
      const reply = await buildDirectoryReply(q);
      return ok(reply);
    }

    // Only POST from Meta after verification
    if (event.httpMethod !== "POST") {
      return ok("OK");
    }

    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token) return ok("Missing WHATSAPP_TOKEN env var.");
    if (!phoneNumberId) return ok("Missing WHATSAPP_PHONE_NUMBER_ID env var.");

    const body = JSON.parse(event.body || "{}");

    // Ignore status callbacks etc.
    const msg = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!msg) return ok("OK");

    const from = msg?.from; // user's WhatsApp number (MSISDN)
    const text = (msg?.text?.body || "").trim();

    // Ignore non-text messages
    if (!from || !text) return ok("OK");

    // Commands
    const query = text.toLowerCase();
    let reply = "";

    if (query === "add") {
      reply =
        "To add a business, please submit the form on Vaalwater Connect.\n" +
        "If you want, reply with: name, category, phone, email, website.";
    } else {
      reply = await buildDirectoryReply(text);
    }

    // Send message back to WhatsApp
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: { body: reply },
    };

    const sendRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const sendBody = await sendRes.text();

    // Log Meta response so we can diagnose instantly if it breaks again
    console.log("META_SEND_STATUS", sendRes.status);
    console.log("META_SEND_BODY", sendBody);

    return ok("OK");
  } catch (err) {
    console.error("FUNCTION_ERROR", err);
    return ok("OK");
  }
}

// === Core directory logic ===
async function buildDirectoryReply(rawQuery) {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return "Send a keyword like: plumber, electrician, towing, pizza.";

  // Google Sheet (CSV)
  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTNITdJfiUo5LgobfGBnvUwWV416BdFF56fOjjAXdvVneYCZe6mlL2dZ6ZeR9w7JA/pub?gid=864428363&single=true&output=csv";

  const res = await fetch(CSV_URL);
  const csvText = await res.text();

  const rows = parseCSV(csvText);
  if (!rows.length) return `Sorry — no listing found for "${rawQuery}".`;

  const headers = rows[0].map((h) => (h || "").trim().toLowerCase());
  const idx = (name) => headers.indexOf(name);

  const subIdx = idx("subcategory");
  const nameIdx = idx("name");
  const descIdx = idx("description");
  const phoneIdx = idx("phone");
  const waIdx = idx("whatsapp");
  const emailIdx = idx("email");
  const webIdx = idx("website");
  const addrIdx = idx("address");

  const matches = rows
    .slice(1)
    .filter((r) => {
      const sub = (r[subIdx] || "").toLowerCase();
      const nm = (r[nameIdx] || "").toLowerCase();
      const tags = (r[idx("tags")] || "").toLowerCase();
      // Match against subcategory + name + tags (better UX)
      return sub.includes(q) || nm.includes(q) || tags.includes(q);
    })
    .slice(0, 6); // keep replies short and readable

  if (matches.length === 0) {
    return (
      `Sorry — no listing found for "${rawQuery}".\n` +
      `Reply ADD to submit a business.`
    );
  }

  const lines = matches.map((r) => {
    const name = (r[nameIdx] || "Unnamed").trim();
    const desc = (r[descIdx] || "").trim();
    const phone = (r[phoneIdx] || "").trim();
    const wa = (r[waIdx] || "").trim();
    const email = (r[emailIdx] || "").trim();
    const web = (r[webIdx] || "").trim();
    const addr = (r[addrIdx] || "").trim();

    const parts = [];
    parts.push(`• ${name}${desc ? ` — ${desc}` : ""}`);
    if (phone) parts.push(`📞 ${phone}`);
    if (wa) parts.push(`💬 WhatsApp: ${wa}`);
    if (email) parts.push(`✉️ ${email}`);
    if (web) parts.push(`🌐 ${stripProtocol(web)}`);
    if (addr) parts.push(`📍 ${addr}`);

    return parts.join("\n");
  });

  return `🔧 ${capitalize(rawQuery)} in Vaalwater:\n\n${lines.join("\n\n")}`;
}

// === CSV parsing (handles quoted commas) ===
function parseCSV(text) {
  const rows = [];
  const lines = (text || "").split(/\r?\n/).filter((l) => l.trim().length > 0);
  for (const line of lines) rows.push(parseCSVLine(line));
  return rows;
}

function parseCSVLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // handle escaped quotes ""
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
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

// === helpers ===
function ok(message) {
  return { statusCode: 200, body: String(message || "OK") };
}

function capitalize(str) {
  const s = String(str || "").trim();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function stripProtocol(url) {
  return String(url || "").replace(/^https?:\/\//i, "").trim();
}
