# Dompetku Mobile — Liquid Glass & Gradient Cards Edition 💎

Aplikasi mobile finansial modern berbasis **Expo (React Native + TypeScript)** yang terhubung langsung dengan REST API backend Next.js Dompetku (`/api/v1/*`), didesain dengan visual futuristik bertema **Liquid Glass & Gradient Cards** (frosted glassmorphism tebal, specular light sheen, glowing neon borders, ambient aurora backdrop, dan micro-interactions).

---

## 🎨 Fitur Desain Liquid Glass

1. **Liquid Glassmorphism**:
   - Lapisan blur translusen (`expo-blur` BlurView) dikombinasikan dengan gradasi multi-stop (`expo-linear-gradient`).
   - Garis pantulan cahaya specular (*specular highlight*) di bagian tepi atas setiap kartu.
   - Border halus bercahaya pendar (*glowing borders*) yang bereaksi terhadap kategori dan status dompet.
2. **Ambient Aurora Backdrop**:
   - Deep cosmic slate & navy backdrop (`#050814`) dengan pendaran 4 orbs nebula bercahaya (cyan, violet, teal, rose).
3. **Physical-Digital Wallet Cards**:
   - Kartu bank/dompet digital liquid glass (BCA Prioritas, Mandiri Platinum, GoPay & Ovo, Dompet Tunai, Bank Jago).
   - Dilengkapi microchip emas EMV, indikator contactless wave, nomor kartu bertopeng, dan saldo dinamis.
4. **Liquid KPI Stat Cards**:
   - Kartu metrik finansial (Total Saldo, Pemasukan, Pengeluaran, Net Savings) dengan indikator tren dan persentase hemat.
5. **Floating Glass Navigation**:
   - Bottom navigation bar melayang dengan efek kaca cair dan tab aktif berpendar cyan.

---

## 🚀 Cara Menjalankan

Masuk ke folder `mobile/`:
```bash
cd mobile
```

Jalankan perintah sesuai platform yang diinginkan:

### 1. Jalankan di Web Browser
```bash
npm run web
```

### 2. Jalankan di HP Fisik (Expo Go - iOS / Android)
```bash
npx expo start
```
Scan QR code yang muncul di terminal menggunakan aplikasi **Expo Go** di perangkat iPhone atau Android Anda.

### 3. Jalankan di Android Emulator
```bash
npm run android
```

### 4. Jalankan di iOS Simulator (macOS)
```bash
npm run ios
```

---

## 🔗 Menghubungkan ke Backend REST API

Aplikasi telah dilengkapi layar **Setelan (Settings)** bawaan untuk mengatur dan menguji koneksi backend secara langsung:

1. Buka tab **Setelan** di pojok kanan bawah aplikasi.
2. Atur **REST API Base URL**:
   - **Di browser / local desktop**: `http://localhost:3000`
   - **Di Android Emulator**: `http://10.0.2.2:3000`
   - **Di HP Fisik (Expo Go)**: Masukkan IP LAN laptop Anda di jaringan Wi-Fi yang sama (contoh: `http://192.168.1.15:3000`).
   - **Production**: `https://qwarts.my.id`
3. Tekan tombol **"Test Ping Koneksi Server"** untuk mengukur latensi (ms) dan memvalidasi respon endpoint `/api/v1`.
4. Jika server backend Next.js sedang tidak dinyalakan, aplikasi secara cerdas beralih ke **Mode Demo responsif** sehingga UI dan simulasi transaksi tetap dapat dicoba tanpa crash!

---

## 📁 Struktur Kode

```
mobile/
├── App.tsx                      # Root aplikasi & Floating Liquid Glass Bottom Nav
├── app.json                     # Konfigurasi Expo & Theme
├── package.json
└── src/
    ├── theme/
    │   └── colors.ts            # Token warna, gradasi aurora, dan tema kartu dompet
    ├── services/
    │   ├── api.ts               # HTTP client REST API, Bearer token, & auto-fallback
    │   └── mockData.ts          # Model tipe data & mock data realistis Rupiah
    ├── components/
    │   ├── LiquidBackground.tsx # Backdrop aurora dengan ambient glowing orbs
    │   ├── GlassCard.tsx        # Kartu liquid glass dengan specular shine & blur
    │   ├── WalletGlassCard.tsx  # Kartu bank liquid glass (BCA, Mandiri, GoPay)
    │   ├── StatGlassCard.tsx    # Kartu metrik KPI (Pemasukan, Pengeluaran)
    │   ├── GlassButton.tsx      # Tombol aksi bergradasi dengan feedback taktil
    │   ├── GlassInput.tsx       # Input field kaca translusen dengan border glow
    │   ├── AddTransactionModal.tsx # Sheet catat pemasukan / pengeluaran
    │   ├── TransferModal.tsx    # Sheet transfer saldo antar dompet
    │   └── GoalDepositModal.tsx # Sheet setor tabungan impian
    └── screens/
        ├── DashboardScreen.tsx  # Beranda: Hero saldo, carousel kartu, alokasi biaya
        ├── TransactionsScreen.tsx # Pencarian & riwayat mutasi transaksi
        ├── WalletsScreen.tsx    # Manajemen dompet & transfer saldo
        ├── GoalsScreen.tsx      # Target tabungan & tagihan rutin 1-click bayar
        └── SettingsScreen.tsx   # Pengaturan host API, ping test, & token bearer
```
