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

const list_boq = [
  "team",
  "leader",
  "splicer",
  "otdr",
  "opm",
  "cyber_key",
  "genset_5_kva",
  "ofi",
  "laser",
  "bertest",
  "gps",
  "laptop",
  "kabel_konsol",
  "printer",
  "print_label",
  "tali_panjat",
  "trakel_kecil",
  "ht",
  "tang_krimping",
  "lan_tester",
  "lsa",
  "k52",
  "tang_ampere",
  "tangga",
  "tropong",
  "head_lamp",
  "lampu_outdoor",
  "tool_box",
  "hp_serpo",
  "trakel_adss",
  "sepatu_20kv",
  "rompi",
  "sepatu",
  "full_body_harnes",
  "helm",
  "sarung_tangan",
  "jas_hujan",
  "chainsaw",
  "inverter",
  "kompresor",
  "basecamp",
  "mobil",
];

const serpo_config = {
  Betung: [],
  Sekayu: ["Bertest"],
  Maskarebet: ["Genset_5_KvA", "Bertest"],
  Demang: ["Bertest"],
  Jakabaring: ["Bertest"],
  PalembangKota: ["Genset_5_KvA", "Bertest", "HT/WalkieTalkie", "Trackel_Adss"],
  Indralaya: [],
  KayuAgung: ["Bertest"],
  Tugumulyo: ["Bertest"],
  Prabumulih: ["Bertest"],
  Pendopo: ["Bertest", "HT/WalkieTalkie", "Trackel_Adss"],
  Belitang: ["Genset_5_KvA", "Bertest"],
  BukitAsam: ["Genset_5_KvA"],
  Lahat: ["Bertest"],
  Tebing: ["Bertest"],
  PagarAlam: ["Genset_5_KvA", "Bertest"],
  Baturaja: ["Bertest"],
  Martapura: ["Bertest"],
};

function getBOQforSerpo(serpo) {
  const kecuali = serpo_config[serpo] || [];
  return list_boq.filter((item) => !kecuali.includes(item));
}

(async () => {
  await clearSession();

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

  const sesiBOQ = {};
  client.on("message", async (msg) => {
    const chatId = msg.from;
    const nama_serpo = [
      "Betung",
      "Sekayu",
      "Demang",
      "Maskarebet",
      "Jakabaring",
      "PalembangKota",
      "Indralaya",
      "KayuAgung",
      "Tugumulyo",
      "Prabumulih",
      "Pendopo",
      "Belitang",
      "BukitAsam",
      "Lahat",
      "Tebing",
      "PagarAlam",
      "Baturaja",
      "Martapura",
    ];

    if (msg.body.toLowerCase() === "#menu") {
      const menuText = `📋 *Menu Perintah BOQ Bot:*
  
        🔹 *#mulai_boq* – Memulai sesi pengumpulan foto BOQ
        🔹 *#serpo : nomor* – Pilih serpo berdasarkan daftar yang tersedia
        🔹 *#boq : nomor* – Kirim media dengan menuliskan nomor item BOQ
        🔹 *#keluar* – Mengakhiri sesi jika semua BOQ sudah dikirim
        🔹 *#menu* – Menampilkan menu ini

        ⚠️ *Catatan:*
        - Kirim foto/media *dengan caption* #boq : nomor
        - Pastikan memilih serpo terlebih dahulu sebelum mengirim media`;

      await client.sendMessage(chatId, menuText);
      return;
    }

    if (msg.body === "#mulai_boq") {
      sesiBOQ[chatId] = {
        aktif: true,
        data: {},
      };
      console.log("Sesi BOQ dimulai");
      const daftarSerpo = nama_serpo
        .map((name, idx) => `- ${idx + 1}. ${name}`)
        .join("\n");

      await client.sendMessage(
        chatId,
        `📍 Pilih serpo dengan format:\n#serpo : nomor\n\nDaftar Serpo:\n${daftarSerpo}`
      );
      return;
    }

    if (msg.body === "#keluar") {
      if (!sesiBOQ[chatId] || !sesiBOQ[chatId].aktif) {
        await client.sendMessage(chatId, "🚫 Sesi BOQ belum dimulai.");
        return;
      }

      const listBOQ = sesiBOQ[chatId].list_boq || [];
      const sudahKirim = Object.keys(sesiBOQ[chatId].data || {}).length;

      if (sudahKirim < listBOQ.length) {
        const sisa = listBOQ.length - sudahKirim;
        const checklist = listBOQ
          .map((item, idx) => {
            const isDone = sesiBOQ[chatId].data[item];
            return `- ${idx + 1}. ${isDone ? "✅" : "❌"} ${item}`;
          })
          .join("\n");

        await client.sendMessage(
          chatId,
          `⚠️ Masih ada *${sisa} item BOQ* yang belum dikirim. Harap selesaikan terlebih dahulu sebelum keluar.\n\n📋 Checklist BOQ saat ini:\n${checklist}`
        );
        return;
      }

      // ✅ Semua sudah lengkap, simpan JSON sesi
      const tanggalSekarang = new Date();
      const formatter = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const formattedDate = formatter
        .format(tanggalSekarang)
        .replace(/\s/g, "-");

      const dir_path = path.join(
        __dirname,
        "media",
        sesiBOQ[chatId].nama_serpo,
        formattedDate
      );
      const file_path = path.join(dir_path, "rekap_sesi.json");

      // Simpan JSON sesiBOQ
      fs.mkdirSync(dir_path, { recursive: true });
      fs.writeFileSync(file_path, JSON.stringify(sesiBOQ[chatId], null, 2));
      console.log(`📄 JSON sesi disimpan di: ${file_path}`);

      // Hapus sesi
      delete sesiBOQ[chatId];
      console.log("Sesi BOQ berakhir");
      await client.sendMessage(
        chatId,
        "✅ Semua BOQ sudah lengkap. Sesi BOQ berakhir dan data disimpan. Terima kasih!"
      );
      return;
    }

    const match_nama_serpo = msg.body.match(/#serpo\s*:\s*(\d+)/i);
    if (match_nama_serpo && sesiBOQ[chatId] && sesiBOQ[chatId].aktif) {
      const index_serpo = parseInt(match_nama_serpo[1], 10) - 1;
      const serpo_input = nama_serpo[index_serpo];

      if (serpo_input) {
        sesiBOQ[chatId].nama_serpo = serpo_input;
        const list_boq_serpo = getBOQforSerpo(serpo_input);
        sesiBOQ[chatId].list_boq = list_boq_serpo;

        const ceklist_boq = list_boq_serpo
          .map((item, idx) => `- ${idx + 1}. ${item}`)
          .join("\n");

        await client.sendMessage(
          chatId,
          `✅ Serpo terpilih: *${serpo_input}*\n\nPilih BOQ dengan format:\n#boq : nomor\nContoh: #boq : 1`
        );

        await client.sendMessage(
          chatId,
          `📋 BOQ untuk ${serpo_input}:\n${ceklist_boq}`
        );
      } else {
        await client.sendMessage(chatId, "❌ Nomor serpo tidak valid.");
      }
      return;
    }

    // Jika pesan memiliki BOQ command
    const match = msg.body.match(/#boq\s*:\s*(\d{1,2})/i);

    // Validasi awal: sesi aktif & command #boq ditemukan
    if (sesiBOQ[chatId] && sesiBOQ[chatId].aktif && match) {
      // Cek apakah serpo sudah dipilih
      if (!sesiBOQ[chatId].nama_serpo) {
        await client.sendMessage(
          chatId,
          "❌ Serpo belum dipilih, silahkan pilih terlebih dahulu."
        );
        const daftarSerpo = nama_serpo
          .map((name, idx) => `- ${idx + 1}. ${name}`)
          .join("\n");
        await client.sendMessage(
          chatId,
          `📍 Pilih serpo dengan format:\n#serpo : nomor\n\nDaftar Serpo:\n${daftarSerpo}`
        );
        return;
      }

      // Validasi pesan tanpa media
      if (!msg.hasMedia) {
        await client.sendMessage(
          chatId,
          "⚠️ Kamu harus mengirimkan *foto/media* bersamaan dengan perintah `#boq : nomor`."
        );
        return;
      }

      // BOQ nomor valid?
      const index = parseInt(match[1], 10) - 1;
      const listBOQ = sesiBOQ[chatId].list_boq;

      if (!listBOQ || !listBOQ[index]) {
        const ceklist_boq = listBOQ
          .map((item, idx) => `- ${idx + 1}. ${item}`)
          .join("\n");

        await client.sendMessage(
          chatId,
          "❌ BOQ tidak valid. Pilih salah satu dari daftar berikut:\n" +
            ceklist_boq
        );
        return;
      }

      const boq_caption = listBOQ[index];

      if (sesiBOQ[chatId].data[boq_caption]) {
        await client.sendMessage(
          chatId,
          `⚠️ BOQ "${boq_caption}" sudah dikirim sebelumnya.`
        );
        return;
      }

      const media = await msg.downloadMedia();

      if (media) {
        const file_name = `${boq_caption}.${media.mimetype.split("/")[1]}`;
        const tanggalSekarang = new Date();
        const formatter = new Intl.DateTimeFormat("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });

        const formattedDate = formatter
          .format(tanggalSekarang)
          .replace(/\s/g, "-");
        const dir_path = path.join(
          __dirname,
          "media",
          sesiBOQ[chatId].nama_serpo,
          formattedDate
        );

        fs.mkdirSync(dir_path, { recursive: true });

        const file_path = path.join(dir_path, file_name);
        fs.writeFileSync(file_path, Buffer.from(media.data, "base64"));

        console.log(`📸 Foto ${file_name} disimpan di: ${file_path}`);
      }

      sesiBOQ[chatId].data[boq_caption] = {
        media,
        waktu: new Date().toISOString(),
      };

      const checklist = listBOQ
        .map((item, idx) => {
          const isDone = sesiBOQ[chatId].data[item];
          return `- ${idx + 1}. ${isDone ? "✅" : "❌"} ${item}`;
        })
        .join("\n");

      await client.sendMessage(
        chatId,
        `📋 Progress Checklist BOQ:\n${checklist}`
      );
    }
  });
  await client.initialize();
})();
