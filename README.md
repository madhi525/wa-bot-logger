# 📦 WhatsApp Group Message Logger to Google Sheets

Bot WhatsApp ini memantau pesan masuk di grup WhatsApp, mendeteksi pesan tertentu, lalu mencatat informasi tersebut ke file teks harian dan mengirimkannya ke Google Spreadsheet menggunakan Web API (Google Apps Script).

---

## ✨ Fitur

- 🔍 Deteksi otomatis pesan dengan pola tertentu dari grup WhatsApp
- 📂 Simpan ke dalam file teks `logs/YYYY-MM-DD.txt`
- 📤 Kirim ke Google Spreadsheet menggunakan Google Apps Script
- ♻️ Otomatis hapus sesi login lama sebelum inisialisasi ulang
- ⚡ Tidak butuh akses WhatsApp Business API

---

## 🚀 Cara Instalasi

### 1. Clone repositori

```
git clone https://github.com/username/wa-group-logger.git
cd wa-group-logger
```

### 2. Install Dependensi

```
npm install
```

### 3. Buat file `.env`

```
GOOGLE_API=https://script.google.com/macros/s/AKfycbxxx/exec
```

---

## ▶️ Menjalankan Bot

```
node index.js
```

- Scan QR yang muncul di terminal dengan aplikasi WhatsApp di HP kamu.
- Setelah login, bot akan otomatis memantau grup untuk pesan yang cocok.

---

## 📝 Struktur Log

Contoh isi `logs/2025-07-02.txt:`

```
2025-07-02 | Nama Grup | 628123456789@c.us | WO berhasil di buat dengan nomor : WP212025070130
```

---

## 🔗 Format Data yang Dikirim ke Spreadsheet

```
{
  "tanggal": "2025-07-02",
  "namaGrup": "Nama Grup",
  "message": "WO berhasil di buat dengan nomor : WP212025070130"
}
```

---

## 📁 Struktur Proyek

```
.
├── index.js
├── sendToGoogleSheet.js
├── .env
├── logs/
├── auth_data/
├── .wwebjs_cache/
└── README.md
```

---

## .gitignore

```
node_modules/
auth_data/
.wwebjs_cache/
logs/
.env
```

---

## 📝 Lisensi

MIT License © 2025 [Muhammad Nurul Adhi]
