// netlify/functions/whatsapp.js

export async function handler(event) {
  // 1) Meta webhook verification (GET)
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

  // Helper: CSV lookup (searches subcategory)
  async function lookup(q) {
    const CSV_URL =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTNITdJfiUo5LgobfGBnvUwWV416BdFF56fOjjAXdvVneYCZe6mlL2dZ6ZeR9w7JA/pub?gid=864428363&single=true&output=csv";

    const res = await fetch(CSV_URL);
    const text = await res.text();

    const lines = text.split("\n");
    const headers = (lines[0] || "").split(",");

    const subcategoryIndex = headers.indexOf("subcategory");
    const nameIndex = headers.indexOf("name");

    if (subcategoryIndex === -1 || nameIndex === -1) {
      return "No results";
    }

    const matches = lines
      .slice(1)
      .map((line) => line.split(","))
      .filter((row) =>
        (row[subcategoryIndex] || "").toLowerCase().includes(q)
      )
      .map((row) => `• ${row[nameIndex] || "Unnamed"}`);

    return matches.length ? matches.join("\n") : "No results";
  }

  // 2) Incoming WhatsApp webhook (POST)
  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");

      const msg =
        body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || "";
      const q = String(msg).toLowerCase().trim();

      // Always acknowledge quickly, even if there's no text
      if (!q) return { statusCode: 200, body: "OK" };

      const reply = await lookup(q);

      const phoneNumberId =
        body.entry?.[0]
