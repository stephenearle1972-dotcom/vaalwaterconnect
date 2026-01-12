import fetch from "node-fetch";

export async function handler(event) {
  const q = (event.queryStringParameters?.q || "").toLowerCase();

  if (!q) {
    return {
      statusCode: 200,
      body: "ok",
    };
  }

  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTNITdJfiUo5LgobfGBnvUwWV416BdFF56fOjjAXdvVneYCZe6mlL2dZ6ZeR9w7JA/pub?gid=864428363&single=true&output=csv";

  const res = await fetch(CSV_URL);
  const text = await res.text();

  const lines = text.split("\n");
  const headers = lines[0].split(",");

  const subcategoryIndex = headers.indexOf("subcategory");
  const nameIndex = headers.indexOf("name");
  const phoneIndex = headers.indexOf("phone");

  const matches = lines
    .slice(1)
    .map((line) => line.split(","))
    .filter((row) =>
      (row[subcategoryIndex] || "").toLowerCase().includes(q)
    )
    .map(
      (row) =>
        `• ${row[nameIndex] || "Unnamed"} – ${row[phoneIndex] || "No phone"}`
    );

  return {
    statusCode: 200,
    body: matches.length ? matches.join("\n") : "No results",
  };
}
