const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs-extra");
const path = require("path");
const sendToGoogleSheet = require("./test-api-tospreadsheet");

// Fungsi hapus session
async function clearSession() {
  const foldersToDelete = ["auth_data", ".wwebjs_cache"];
  for (const folder of foldersToDelete) {
    const folderPath = path.join(__dirname, folder);
    if (await fs.pathExists(folderPath)) {
      await fs.remove(folderPath);
      console.log(`🧹 Folder ${folder} dihapus.`);
    }
  }
}

// Fungsi simpan pesan ke file dan spreadsheet
function saveToTextFile(message, sender, groupName, timestamp) {
  const dateStr = timestamp.split("T")[0]; // YYYY-MM-DD
  const fileName = `${dateStr}.txt`;
  const logsDir = path.join(__dirname, "logs");
  const filePath = path.join(logsDir, fileName);

  const logLine = `${dateStr} | ${groupName} | ${sender} | ${message}\n`;
  sendToGoogleSheet(message, groupName, dateStr);

  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  fs.appendFileSync(filePath, logLine, "utf8");
  console.log(`💾 Disimpan ke logs/${fileName}`);
}

// Jalankan
(async () => {
  await clearSession(); // Hapus session lama

  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: "./auth_data" }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("✅ WhatsApp client siap digunakan!");
  });

  client.on("message", async (msg) => {
    if (msg.from.includes("@g.us")) {
      const regex = /WO berhasil di buat dengan nomor\s*:/i;
      const regex1 = /NO WO ICON\+\/PM\/\d{3,10}/i;
      const match = msg.body.match(regex);
      const match1 = msg.body.match(regex1);

      if (match || match1) {
        const sender = msg.author || msg.from;
        const timestamp = new Date().toISOString();
        const fullMessage = msg.body;
        const chat = await msg.getChat();
        const groupName = chat.name;

        console.log(
          `📥 Pesan WO terdeteksi dari grup "${groupName}" oleh ${sender}`
        );

        saveToTextFile(fullMessage, sender, groupName, timestamp);
      }
    }
  });

  await client.initialize();
})();
