require("dotenv").config();
const fetch = require("node-fetch"); // ⬅️ Gunakan ini jika Node.js < 18

async function sendToGoogleSheet(message, namaGrup, tanggal) {
  const url = process.env.GOOGLE_API;

  const payload = {
    tanggal,
    namaGrup,
    message,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await res.json();
    console.log("📝 Dikirim ke spreadsheet:", result);
  } catch (err) {
    console.error("❌ Gagal kirim ke spreadsheet:", err.message);
  }
}

module.exports = sendToGoogleSheet; // ✅ export cara CommonJS
