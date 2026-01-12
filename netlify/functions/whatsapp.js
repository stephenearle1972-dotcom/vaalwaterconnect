// netlify/functions/whatsapp.js

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTNITdJfiUo5LgobfGBnvUwWV416BdFF56fOjjAXdvVneYCZe6mlL2dZ6ZeR9w7JA/pub?gid=864428363&single=true&output=csv";

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
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
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

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    console.error("META_API_ERROR:", resp.status, data);
    throw new Error("Meta API send failed");
  }

  return data;
}

export async function handler(event) {
  // Webhook verification
  if (event.httpMethod === "GET") {
    const qs = event.queryStringParameters || {};
    if (
      qs["hub.mode"] === "subscribe" &&
      qs["hub.verify_token"] === process.env.WHATSAPP_VERIFY_TOKEN
    ) {
      return { statusCode: 200, body: qs["hub.challenge"] };
    }
    return { statusCode: 403, body: "Forbidden" };
  }

  // Incoming WhatsApp messages
  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      const msg = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      const from = msg?.from;
      const text = msg?.text?.body;

      console.log("INCOMING_MESSAGE:", from, text);

      if (!from || !text) {
        return { statusCode: 200, body: "OK" };
      }

      const reply = await lookupBySubcategory(text);
      await sendWhatsAppText(from, reply);

      return { statusCode: 200, body: "OK" };
    } catch (err) {
      console.error("WHATSAPP_FUNCTION_ERROR:", err);
      return { statusCode: 200, body: "OK" };
    }
  }

  // Browser test
  const q = (event.queryStringParameters?.q || "").toLowerCase();
  if (!q) return { statusCode: 200, body: "ok" };

  const reply = await lookupBySubcategory(q);
  return { statusCode: 200, body: reply };
}
