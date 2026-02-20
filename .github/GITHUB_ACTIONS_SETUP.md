# GitHub Actions Setup Guide

## 🚀 Overview

GitHub Actions workflow sudah siap untuk build Android secara otomatis dan GRATIS!

## 📋 Workflows Tersedia

### 1. **Android Production Build** (`.github/workflows/android-build.yml`)
- **Trigger:** Push ke `main` branch atau tag `v*`
- **Output:** Android AAB (untuk Play Store)
- **Retention:** 30 hari

### 2. **Android Development Build** (`.github/workflows/android-development-build.yml`)
- **Trigger:** Push ke `develop`, `feature/*`, atau Pull Request ke `main`
- **Output:** Android APK (untuk testing)
- **Retention:** 7 hari

---

## 🔧 Setup Instructions

### Step 1: Buat EXPO_TOKEN

1. Login ke [Expo Dashboard](https://expo.dev)
2. Go to **Settings** → **Access Tokens**
3. Click **Create New Token**
4. Beri nama: "GitHub Actions"
5. Pilih scope: **Build (read & write)**
6. Copy token yang dihasilkan

### Step 2: Tambah EXPO_TOKEN ke GitHub Secrets

1. Buka repository GitHub Anda
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `EXPO_TOKEN`
5. Value: Paste token dari Step 1
6. Click **Add secret**

### Step 3: Trigger Build

#### **Opsi A: Production Build (AAB untuk Play Store)**
```bash
git push origin main
```
Atau buat tag release:
```bash
git tag v1.0.0
git push origin v1.0.0
```

#### **Opsi B: Development Build (APK untuk testing)**
```bash
git checkout -b feature/test-build
git push origin feature/test-build
```

#### **Opsi C: Manual Trigger via GitHub UI**
1. Buka repository di GitHub
2. Click **Actions** tab
3. Pilih workflow yang diinginkan
4. Click **Run workflow**

---

## 📥 Download Build Artifact

1. Buka repository di GitHub
2. Click **Actions** tab
3. Pilih workflow run yang selesai (✅ green check)
4. Scroll ke bawah ke **Artifacts** section
5. Download:
   - `android-aab` (production build)
   - `android-dev-apk` (development build)

---

## 🔍 Monitor Build Progress

1. Go to **Actions** tab di GitHub
2. Klik workflow yang sedang berjalan
3. Lihat logs real-time
4. Build biasanya memakan waktu 5-15 menit

---

## 📊 Build Status Badge

Tambahkan badge ke README.md untuk menampilkan build status:

```markdown
![Android Build](https://github.com/kungfufafa/baitulmaal/actions/workflows/android-build.yml/badge.svg)
```

---

## 🎯 Benefits

✅ **GRATIS & Unlimited** - Tidak terbatas free plan seperti EAS
✅ **Automated** - Build otomatis setiap push ke main
✅ **Fast** - Parallel builds dengan GitHub's infrastructure
✅ **Reliable** - Tidak tergantung EAS queue
✅ **Flexible** - Bisa trigger manual atau otomatis
✅ **Artifacts** - Build disimpan 30 hari (production) / 7 hari (dev)

---

## 🛠️ Troubleshooting

### **Problem: Build gagal dengan "EXPO_TOKEN not found"**
**Solution:** Pastikan secret sudah ditambahkan dengan nama EXACT: `EXPO_TOKEN` (case-sensitive)

### **Problem: Build gagal dengan "Authentication failed"**
**Solution:**
1. Cek apakah EXPO_TOKEN valid
2. Pastikan token memiliki scope "Build (read & write)"
3. Re-generate token jika perlu

### **Problem: Build lambat**
**Solution:** Normal, build pertama akan lebih lama (~15 min). Build berikutnya akan lebih cepat karena Gradle cache.

### **Problem: Gagal download artifact**
**Solution:**
1. Pastikan workflow sudah selesai (status ✅)
2. Cek apakah artifact ada di bagian bawah workflow run
3. Login ke GitHub jika perlu

---

## 📝 Next Steps

Setelah setup selesai:

1. **Test development build dulu:**
   ```bash
   git checkout -b feature/test-actions
   git push origin feature/test-actions
   ```

2. **Jika development build sukses, trigger production build:**
   ```bash
   git checkout main
   git push origin main
   ```

3. **Download AAB dari Actions artifacts**

4. **Upload AAB ke Play Console:**
   - Go to Play Console
   - All apps → LAZ Al Azhar 5
   - Testing & Release → Internal Testing (atau Production)
   - Create new release
   - Upload AAB dari artifacts

---

## 🔗 Useful Links

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Expo CLI Docs:** https://docs.expo.dev/eas/cli
- **EAS Build Profiles:** https://docs.expo.dev/build/introduction

---

## 💡 Tips

- Gunakan development build untuk testing cepat
- Gunakan production build hanya untuk release ke Play Store
- Monitor build time untuk optimasi
- Hapus artifacts lama untuk hemat storage
- Setup branch protection agar main branch hanya menerima PR yang sudah di-test
