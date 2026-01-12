// netlify/functions/whatsapp.js

export async function handler(event) {
  // ---- 1) Meta webhook verification (GET) ----
  const qs = event.queryStringParameters || {};
  const mode = qs["hub.mode"];
  const token = qs["hub.verify_token"];
  const challenge = qs["hub.challenge"];

  if (event.httpMethod === "GET" && mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return {
      statusCode: 200,
      body: challenge,
    };
  }

  // ---- 2) Incoming webhook notifications (POST) ----
  if (event.httpMethod === "POST") {
    // For now: acknowledge receipt. We'll parse + reply in the next step.
    return {
      statusCode: 200,
      body: "EVENT_RECEIVED",
    };
  }

  return {
    statusCode: 200,
    body: "OK",
  };
}
