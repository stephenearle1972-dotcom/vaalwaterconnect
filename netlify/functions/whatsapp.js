// netlify/functions/whatsapp.js

export async function handler(event) {
  try {
    // Allow simple browser test: /whatsapp?q=plumber
    if (event.httpMethod !== "POST") {
      const q = event.queryStringParameters?.q || "";
      return ok(`Test OK. You sent: ${q}`);
    }

    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId =
      process.env.WHATSAPP_PHONE_NUMBER_ID ||
      process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token) return ok("Missing WHATSAPP_TOKEN env var.");
    if (!phoneNumberId) return ok("Missing WHATSAPP_PHONE_NUMBER_ID env var.");

    const body = JSON.parse(event.body || "{}");

    const msg = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const from = msg?.from; // the user's WhatsApp number (MSISDN)
    const text = msg?.text?.body || "";

    // Ignore non-text messages
    if (!from || !text) return ok("No text message to process.");

    const query = text.trim().toLowerCase();

    // === Load CSV listings ===
    const CSV_URL =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTNITdJfiUo5LgobfGBnvUwWV416BdFF56fOjjAXdvVneYCZe6mlL2dZ6ZeR9w7JA/pub?gid=864428363&single=true&output=csv";

    const res = await fetch(CSV_URL);
    const csv = await res.text();

    const lines = csv.split("\n").filter(Boolean);
    const headers = lines[0].split(",");

    const subIdx = headers.indexOf("subcategory");
    const nameIdx = headers.indexOf("name");
    const phoneIdx = headers.indexOf("phone");
    const descIdx = headers.indexOf("description");

    const matches = lines
      .slice(1)
      .map((l) => l.split(","))
      .filter((row) => ((row[subIdx] || "").toLowerCase().includes(query)));

    let reply = "";

    if (!query) {
      reply = "Send a keyword like: plumber, electrician, towing, pizza.";
    } else if (matches.length === 0) {
      reply = `Sorry — no listing found for "${query}".\nReply ADD to submit a business.`;
    } else {
      const replyLines = matches.map((row) => {
        const name = row[nameIdx] || "Unnamed";
        const phone = row[phoneIdx] || "No phone";
        const desc = row[descIdx] ? ` – ${row[descIdx]}` : "";
        return `• ${name}${desc}\n📞 ${phone}`;
      });

      reply =
        `🔎 ${capitalize(query)} in Vaalwater:\n\n` +
        replyLines.join("\n\n");
    }

    // === Send message back to WhatsApp ===
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

    const sendText = await sendRes.text();

    // Log Meta response so we can see 200/401/403 etc in Netlify logs
    console.log("META_SEND_STATUS", sendRes.status);
    console.log("META_SEND_BODY", sendText);

    return ok("OK");
  } catch (err) {
    console.error("FUNCTION_ERROR", err);
    return ok("OK");
  }
}

function ok(message) {
  return {
    statusCode: 200,
    body: message,
  };
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
