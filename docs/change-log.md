# Change Log — Landing Page Copy & Messaging Qwarts Finance

Dokumen ini mencatat ringkasan seluruh perbaikan copy, pesan, dan struktur landing page dari versi sebelumnya ke versi baru, beserta alasan strategisnya berdasarkan brief rewrite.

---

## 1. Hero Section & Value Proposition

- **Copy Lama:**
  - Badge: *"Manajemen Finansial Modern & 100% Gratis"*
  - Headline: *"Kendalikan Keuanganmu, Wujudkan Impian Finansial"*
  - Subheadline: Menyebutkan multi-dompet, atur budget, dan target tabungan impian seolah semuanya gratis.
  - Demo Status: *"Live Dashboard Sync"*
  - CTA Primer: *"Lanjutkan dengan Google"* & *"Daftar Akun Baru"*
- **Copy Baru:**
  - Badge: *"Mulai gratis · Data per akun · Desktop & mobile"*
  - Headline: *"Catat Keuangan Pribadi dengan Mudah, Mulai Gratis"*
  - Subheadline: *"Catat pemasukan dan pengeluaran harianmu tanpa biaya. Upgrade ke PRO saat kamu siap mengelola budget, banyak dompet, dan target tabungan."*
  - Demo Status: *"Ilustrasi Dashboard"* + caption eksplisit `*Contoh data — bukan saldo akunmu`.
  - CTA Primer: *"Mulai gratis dengan Google"*; CTA Sekunder: *"Lihat contoh dashboard"*.
- **Alasan Perubahan:**
  - Menghilangkan misrepresentasi di awal: tidak menjanjikan fitur PRO (budget, target impian, unlimited dompet) seolah-olah termasuk di paket gratis.
  - Memperjelas status tampilan demo mockup agar pengunjung tidak mengira itu data akun mereka yang bocor.
  - Fokus CTA tunggal yang jelas menuju Google login.

---

## 2. Fitur (6 Kartu) & Hierarki Paywall

- **Copy Lama:**
  - Judul section: *"Segala yang Anda Butuhkan untuk Hidup Bebas Khawatir Finansial"* (terlalu hiperbolis).
  - Kartu fitur tidak memiliki badge status paket. Pengunjung tidak tahu mana fitur gratis dan mana yang harus bayar.
  - Kartu ke-6 menampilkan *"Login Cepat dengan Google"* sebagai kartu fitur produk utama.
- **Copy Baru:**
  - Judul section: *"Semua yang Kamu Butuhkan untuk Mengelola Arus Kas"*.
  - Setiap kartu dilengkapi badge status tegas:
    1. Catat Pemasukan & Pengeluaran → `Free`
    2. Multi-Dompet & Rekening → `Free: maks 2 dompet · PRO: unlimited`
    3. Budget & Peringatan Overbudget → `PRO`
    4. Target Impian (Savings Goals) → `PRO`
    5. Tagihan Rutin & Pengingat Jatuh Tempo → `PRO`
    6. Ekspor Laporan ke Excel & PDF → `PRO`
  - Informasi Google login dipindahkan ke trust line & section keamanan.
- **Alasan Perubahan:**
  - Memberikan transparansi 100% sejak awal agar pengunjung paham batas Starter (Free) tanpa harus kecewa saat menemui paywall di dalam aplikasi.

---

## 3. Cara Kerja (3 Langkah)

- **Copy Lama:**
  - Langkah 2: *"Atur Dompet & Budget"*
  - Langkah 3: *"Pantau & Wujudkan Impian"* (mengimplikasikan budget & impian gratis).
- **Copy Baru:**
  - Langkah 1: *"Masuk dengan Akun Google"*
  - Langkah 2: *"Atur Dompet & Kategori Transaksi (Hingga 2 dompet di Free)"*
  - Langkah 3: *"Catat Rutin & Upgrade saat Siap (Upgrade ke PRO saat butuh budget, target impian, dan ekspor)"*
- **Alasan Perubahan:**
  - Mengedukasi alur pengguna yang realistis sesuai skema Starter vs PRO.

---

## 4. Pricing (Harga & Paket)

- **Copy Lama:**
  - Harga PRO: Hanya menampilkan Rp 19.000/bulan dengan teks kecil diskon tahunan yang kurang jelas.
  - Belum ada intro kebenaran (source of truth) 1 kalimat.
- **Copy Baru:**
  - Menambahkan intro kebenaran: *"Gratis untuk pencatatan harian; upgrade ke PRO untuk budget, multi-dompet unlimited, target tabungan, dan ekspor data."*
  - Menampilkan harga bulanan dan tahunan secara berdampingan:
    - **Rp 19.000 / bulan**
    - **Rp 149.000 / tahun** *(Hanya ~Rp 12.400/bulan — Hemat ~35%)*
  - Penegasan fitur "Tidak termasuk" di kartu Free agar kontras dengan PRO.
  - Catatan jaminan: Data tetap milik pengguna, mulai tanpa kartu kredit, upgrade/batal kapan saja.
- **Alasan Perubahan:**
  - Membantu pengunjung membandingkan keuntungan paket tahunan secara langsung dan memahami nilai tambah PRO.

---

## 5. Penambahan Section Keamanan & Privasi

- **Kondisi Lama:**
  - Tidak ada section khusus keamanan; hanya badge kecil di hero.
- **Kondisi Baru:**
  - Section mandiri dengan 4 poin konkret:
    1. Login via Google OAuth2 resmi.
    2. Data per akun terisolasi.
    3. Tanpa akses atau permintaan PIN/password rekening perbankan.
    4. Kontrol penuh pengguna atas data mereka.
  - Tautan ke Kebijakan Privasi (`/privacy`).
- **Alasan Perubahan:**
  - Menjawab kekhawatiran terbesar pengguna aplikasi finansial di Indonesia mengenai keamanan rekening bank mereka tanpa membuat klaim palsu/berlebihan.

---

## 6. FAQ (Pertanyaan yang Sering Diajukan)

- **Kondisi Lama:**
  - Hanya 5 pertanyaan, beberapa jawaban kurang spesifik mengenai batasan dompet dan perbandingan harga tahunan.
- **Kondisi Baru:**
  - 7 pertanyaan komprehensif lengkap dengan jawaban jelas:
    1. Keberadaan versi gratis & batasannya (maks 2 dompet).
    2. Kemudahan login akun Google.
    3. Perbedaan dompet di Free (2) vs PRO (unlimited).
    4. Keamanan data (tidak minta PIN m-banking).
    5. Fitur lengkap yang didapat di paket PRO.
    6. Perbedaan biaya bulanan (Rp 19.000) vs tahunan (Rp 149.000, hemat ~35%).
    7. Ekspor data Excel/PDF dan kontrol akun.
- **Alasan Perubahan:**
  - Memastikan tidak ada pertanyaan tanpa jawaban dan mengatasi keraguan calon pengguna sebelum mendaftar.

---

## 7. Tone of Voice & Istilah

- **Kondisi Lama:**
  - Frasa hiperbolis seperti *"Hidup Bebas Khawatir Finansial"*, *"Revolusioner"*, dll.
- **Kondisi Baru:**
  - Bahasa Indonesia natural, lugas, spesifik, dan berorientasi manfaat nyata (*"Tahu ke mana uangmu pergi"*, *"Catat tanpa ribet"*).
  - Istilah baku yang konsisten: **Starter (Free)**, **PRO**, **Target Impian**, **dompet**, format nominal `Rp 19.000` & `Rp 149.000`.

---

## 8. Autentikasi: Pencegahan Email Duplikat & Alur Lupa / Reset Password

- **Pencegahan Registrasi Ulang Email / Gmail yang Sudah Terdaftar:**
  - Menambahkan endpoint pengecekan `/api/v1/auth/check-email` dan validasi server-side `checkEmailRegistered`.
  - Pada form registrasi (`/sign-up`), sistem secara proaktif mengecek apakah email/Gmail sudah pernah terdaftar di database.
  - Jika sudah terdaftar, proses pendaftaran dibatalkan dan menampilkan pesan ramah berbahasa Indonesia lengkap dengan tombol aksi cepat (*"Masuk Sekarang"* atau *"Lupa Kata Sandi?"*).
- **Fitur Lupa Kata Sandi & Reset Password via Email:**
  - Menambahkan alur Lupa Kata Sandi di form masuk (`/sign-in` atau `/forgot-password`).
  - Mengintegrasikan handler `sendResetPassword` di `lib/auth.ts` menggunakan API Resend dengan template email berbahasa Indonesia yang modern dan profesional.
  - Membuat halaman baru `/reset-password` (`components/reset-password-form.tsx`) untuk menerima token pemulihan, validasi kata sandi baru (minimal 8 karakter & konfirmasi cocok), serta pengalihan otomatis kembali ke halaman login setelah berhasil diubah.

