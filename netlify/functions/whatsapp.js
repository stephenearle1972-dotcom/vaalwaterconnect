// netlify/functions/whatsapp.js

export async function handler(event) {
  try {
    // 1. Get incoming text (from WhatsApp webhook OR browser test)
    let text = "";

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);
      text =
        body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || "";
    } else {
      text = event.queryStringParameters?.q || "";
    }

    const query = text.trim().toLowerCase();

    if (!query) {
      return ok("OK");
    }

    // 2. Google Sheet (CSV)
    const CSV_URL =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTNITdJfiUo5LgobfGBnvUwWV416BdFF56fOjjAXdvVneYCZe6mlL2dZ6ZeR9w7JA/pub?gid=864428363&single=true&output=csv";

    const res = await fetch(CSV_URL);
    const csv = await res.text();

    const lines = csv.split("\n");
    const headers = lines[0].split(",");

    const subIdx = headers.indexOf("subcategory");
    const nameIdx = headers.indexOf("name");
    const phoneIdx = headers.indexOf("phone");
    const descIdx = headers.indexOf("description");

    const matches = lines
      .slice(1)
      .map((l) => l.split(","))
      .filter(
        (row) =>
          (row[subIdx] || "").toLowerCase().includes(query)
      );

    // 3. No results (IMPORTANT)
    if (matches.length === 0) {
      return ok(
        `Sorry — no listing found for "${query}".\nReply ADD to submit a business.`
      );
    }

    // 4. Standardised reply format
    const replyLines = matches.map((row) => {
      const name = row[nameIdx] || "Unnamed";
      const phone = row[phoneIdx] || "No phone";
      const desc = row[descIdx] ? ` – ${row[descIdx]}` : "";
      return `• ${name}${desc}\n📞 ${phone}`;
    });

    const reply =
      `🔎 ${capitalize(query)} in Vaalwater:\n\n` +
      replyLines.join("\n\n");

    return ok(reply);
  } catch (err) {
    console.error(err);
    return ok("Something went wrong. Please try again.");
  }
}

// helpers
function ok(message) {
  return {
    statusCode: 200,
    body: message,
  };
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
