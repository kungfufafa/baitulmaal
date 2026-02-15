# 📋 CHECKLIST PLAY STORE - LAZ Al Azhar 5

## ✅ STATUS CHECKLIST

| # | Item | Status | Catatan |
|---|------|--------|---------|
| 1 | Feature Graphic (1024x500) | ⏳ Template HTML dibuat | Buka `feature-graphic.html` di browser, fullscreen, screenshot |
| 2 | Screenshots (2-8) | ⏳ Panduan dibuat | Ikuti `SCREENSHOT_GUIDE.md` |
| 3 | App Icon (512x512) | ✅ Sudah ada | `playstore_icon_1024.png` (resize ke 512x512) |
| 4 | Privacy Policy URL | ✅ Sudah online | https://laz.rizqis.com/privacy-policy |
| 5 | Deskripsi Aplikasi | ✅ Disiapkan | Lihat dokumen |
| 6 | Kategori | ✅ Keuangan | - |

---

## 📁 STRUKTUR FOLDER

```
playstore-assets/
├── feature-graphic/
│   ├── feature-graphic.html     # Template HTML untuk screenshot
│   └── feature-graphic.png      # (akan diisi setelah screenshot)
├── screenshots/
│   ├── 01-beranda.png
│   ├── 02-donasi.png
│   ├── 03-qris.png
│   ├── 04-riwayat.png
│   ├── 05-quran.png
│   ├── 06-doa.png
│   ├── 07-artikel.png
│   └── 08-login.png
├── app-icon-512.png             # Resize dari playstore_icon_1024.png
├── SCREENSHOT_GUIDE.md          # Panduan screenshot
└── PLAYSTORE_LISTING.md         # Dokumen lengkap listing
```

---

## 🔧 LANGKAH EKSEKUSI

### Step 1: Buat Feature Graphic
```bash
# Buka HTML di browser
open /Users/apriansyahrs/Documents/Code/LAZ/baitulmaal/playstore-assets/feature-graphic/feature-graphic.html

# Fullscreen browser (Cmd+Shift+F di Chrome)
# Screenshot (Cmd+Shift+4)
# Crop ke 1024x500 px jika perlu
# Simpan ke: playstore-assets/feature-graphic/feature-graphic.png
```

### Step 2: Ambil Screenshot Aplikasi
```bash
# Jalankan app di emulator
cd /Users/apriansyahrs/Documents/Code/LAZ/baitulmaal
npx expo start
# Tekan 'a' untuk Android

# Ambil 8 screenshot sesuai panduan
# Simpan ke folder: playstore-assets/screenshots/
```

### Step 3: Resize App Icon
```bash
# Gunakan ImageMagick atau tools online
# Resize playstore_icon_1024.png ke 512x512
# Simpan sebagai app-icon-512.png
```

---

## 📝 DATA SUDAH DISIAPKAN

### Nama Aplikasi
```
LAZ Al Azhar 5
```

### Deskripsi Singkat (80 char)
```
Zakat, infak, sedekah jadi lebih mudah. Scan QRIS, upload bukti, selesai!
```

### Kategori
```
Keuangan / Finance
```

### Tags
```
zakat, infak, sedekah, donasi, quran, islamic, muslim
```

### Privacy Policy
```
https://laz.rizqis.com/privacy-policy
```

### Email
```
info@rizqis.com
```

### Website
```
https://laz.rizqis.com
```

### Telepon
```
+62 812-3456-7890
```

---

## ⚠️ PENTING SEBELUM SUBMIT

1. **Test Build Release** - Pastikan build production berjalan lancar
2. **Version Code** - Increment di app.json
3. **Signing Key** - Siapkan keystore untuk signing
4. **Review Policy** - Pastikan tidak melanggar policy Google Play
