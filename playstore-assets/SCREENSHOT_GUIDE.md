# 📱 PANDUAN SCREENSHOT APLIKASI - LAZ Al Azhar 5

## Langkah-langkah Mengambil Screenshot di Emulator Android

### 1. Jalankan Aplikasi
```bash
cd /Users/apriansyahrs/Documents/Code/LAZ/baitulmaal
npx expo start
```
Lalu tekan `a` untuk menjalankan di Android Emulator.

### 2. Screenshot yang Perlu Diambil (8 Screenshots)

#### Screenshot 1: Beranda / Dashboard
- Buka tab "Beranda"
- Pastikan jadwal sholat terlihat
- Pastikan menu Zakat, Infak, Sedekah terlihat
- **Cara screenshot**: Klik tombol kamera di emulator atau `Cmd+S` (Mac)

#### Screenshot 2: Menu Donasi
- Klik tab "Donasi" di bawah
- Pilih salah satu kategori (misal: Zakat)
- Tampilkan form pemilihan jenis zakat

#### Screenshot 3: Form Donasi dengan QRIS
- Lanjutkan sampai step pemilihan metode pembayaran
- Pilih metode QRIS
- Tampilkan QR Code yang muncul

#### Screenshot 4: Riwayat Donasi
- Buka tab "Riwayat" di bawah
- Tampilkan daftar riwayat donasi (boleh kosong atau ada data)

#### Screenshot 5: Al-Quran Progress
- Buka tab "Quran" di bawah
- Tampilkan progress tilawah dan daftar surah

#### Screenshot 6: Doa Harian
- Dari beranda, scroll ke bawah ke bagian Doa
- Atau buka halaman Doa lengkap
- Tampilkan grid doa harian

#### Screenshot 7: Artikel / Konten
- Buka tab "Beranda"
- Scroll ke bagian Video Kajian atau Artikel
- Tampilkan list konten islami

#### Screenshot 8: Profil / Login
- Klik "Masuk / Daftar" di header
- Tampilkan halaman login atau profil user

---

## Spesifikasi Teknis

| Parameter | Nilai |
|-----------|-------|
| Format | PNG atau JPEG |
| Rasio | 16:9 atau 9:16 |
| Resolusi | 320px - 3840px per sisi |
| Ukuran Max | 8 MB per gambar |
| Jumlah | 2-8 gambar |

---

## Cara Ambil Screenshot di Emulator Android Studio

1. **Metode 1: Tombol Kamera**
   - Klik ikon kamera di toolbar emulator
   - Pilih lokasi penyimpanan
   - Simpan

2. **Metode 2: Keyboard Shortcut**
   - Mac: `Cmd + Shift + 4` lalu pilih area
   - Atau gunakan `adb shell screencap -p /sdcard/screenshot.png`

3. **Metode 3: Android Studio**
   - Buka Android Studio
   - Klik "Logcat" di bawah
   - Di panel kiri ada opsi "Screen Capture"

---

## Lokasi Simpan Screenshot
```
/Users/apriansyahrs/Documents/Code/LAZ/baitulmaal/playstore-assets/screenshots/
```

Rename file sesuai urutan:
- 01-beranda.png
- 02-donasi.png
- 03-qris.png
- 04-riwayat.png
- 05-quran.png
- 06-doa.png
- 07-artikel.png
- 08-login.png

---

## Tips
- Gunakan device dengan layar bersih (no notifications)
- Pastikan waktu di emulator tepat (untuk jadwal sholat)
- Gunakan akun demo jika perlu menampilkan riwayat
- Crop jika ada status bar yang tidak perlu
