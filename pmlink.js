const fs = require("fs-extra");
const { Client, LocalAuth } = require("whatsapp-web.js");
const path = require("path");
const qrcode = require("qrcode-terminal");

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

const sesiPMLink = {};

async function handlePMLink(client, msg) {
  const chatId = msg.from;

  if (msg.body.toLowerCase().includes("#pmlink")) {
    sesiPMLink[chatId] = {
      aktif: true,
      data: {},
    };
    console.log("Sesi PM Link dimulai");
  }
}
