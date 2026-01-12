// netlify/functions/whatsapp.js

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTNITdJfiUo5LgobfGBnvUwWV416BdFF56fOjjAXdvVneYCZe6mlL2dZ6ZeR9w7JA/pub?gid=864428363&single=true&output=csv";

// Super-simple CSV split (OK for now; we can harden later)
function splitCSVLine(line) {
  return line.split(",").map((s) => (s || "").trim());
}

async function lookupBySubcategory(query) {
  const res = await fetch(CSV_URL);
  const text = await res.text();

  const lines = text.split("\n").filter(Boolean);
  if (lines.length < 2) return "No results";

  const headers = splitCSVLine(lines[0]).map((h) => h.toLowerCase());
  const subIdx = headers.indexOf("subcategory");
  const nameIdx = headers.indexOf("name");

  if (subIdx === -1 || nameIdx === -1) return "No results";

  const q = query.toLowerCase().trim();

  const matches = lines
    .slice(1)
    .map(splitCSVLine)
    .filter((row) => (row[subIdx] || "").toLowerCase().includes(q))
    .map((row) => `• ${row[nameIdx] || "Unnamed"}`);

  return matches.length ? matches.join("\n") : "No results";
}

async function sendWhatsAppText(to, bodyText) {
  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBERID;

  const token = process.env.WHATSAPP_TOKEN;

  if (!phoneNumberId) throw new Error("Missing WHATSAPP_PHONE_NUMBER_ID");
  if (!token) throw new Error("Missing WHATSAPP_TOKEN");

  const url = `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: bodyText },
    }),
  });

  // Optional: read response for debugging
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(`Meta send failed: ${resp.status} ${JSON.stringify(data)}`);
  }
  return data;
}

export async function handler(event) {
  // 1) Webhook verification (GET)
  if (event.httpMethod === "GET") {
    const qs = event.queryStringParameters || {};
    const mode = qs["hub.mode"];
    const token = qs["hub.verify_token"];
    const challenge = qs["hub.challenge"];

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return { statusCode: 200, body: String(challenge || "") };
    }
    return { statusCode: 403, body: "Forbidden" };
  }

  // 2) Incoming messages (POST)
  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");

      const msgObj = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      const from = msgObj?.from; // user's WhatsApp number (international format digits)
      const text = msgObj?.text?.body || "";

      // Always acknowledge webhook quickly
      if (!from || !text) return { statusCode: 200, body: "OK" };

      const reply = await lookupBySubcategory(text);

      // Send reply back to the user
      await sendWhatsAppText(from, reply);

      return { statusCode: 200, body: "OK" };
    } catch (err) {
      // Return 200 so Meta doesn't keep retrying forever
      return { statusCode: 200, body: "OK" };
    }
  }

  // 3) Browser test mode: /whatsapp?q=plumber
  const q = (event.queryStringParameters?.q || "").toLowerCase().trim();
  if (!q) return { statusCode: 200, body: "ok" };

  const reply = await lookupBySubcategory(q);
  return { statusCode: 200, body: reply };
}
