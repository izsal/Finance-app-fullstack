# Panduan Desain UI/UX Mobile: Minimalis & Modern (Qwarts Finance)

Dokumen ini adalah acuan resmi desain dan pengembangan antarmuka (UI/UX) untuk aplikasi mobile Qwarts Finance. Semua komponen, modal, dan layar baru wajib mengacu pada prinsip-prinsip berikut.

---

## 1. Tata Letak & Struktur (Layout & Grid)

### Sistem Spacing 4pt / 8pt
Terapkan kelipatan 8 (dengan pembagian presisi 4pt jika diperlukan) untuk semua `margin`, `padding`, dan `gap` antar-komponen agar ritme visual konsisten di berbagai ukuran layar:
- `4px` (xs): Jarak mikro (antar ikon dengan badge mini, padding kapsul kecil).
- `8px` (sm): Jarak dalam elemen rapat (gap teks judul & subjudul, padding chip, jarak ikon & label).
- `16px` (md): Padding standar kartu, margin horizontal halaman mobile, jarak antar-seksi kecil.
- `24px` (lg): Padding bottom sheet, jarak antar kartu utama, sudut membulat modal sheet.
- `32px` (xl): Jarak antar-seksi besar, ruang hembus vertikal.

### Bottom Sheets & Cards
- **Sudut Membulat (Border Radius)**: Gunakan rentang `16px`–`24px` (`borderTopLeftRadius: 24`, `borderTopRightRadius: 24` untuk bottom sheet) agar terasa luwes, ramah, dan ergonomis saat dipegang.
- **Soft Elevation**: Hindari bayangan gelap yang kasar; gunakan bayangan sangat halus (`shadowOpacity: 0.04 - 0.08`, `elevation: 2 - 3`) untuk memisahkan fokus media dengan konten teks secara natural.
- **Handle Bar**: Bottom sheet wajib memiliki pill handle berukuran `40x4px` dengan sudut `2px` di bagian tengah atas sebagai *affordance* visual bahwa sheet dapat digulir atau ditutup.

### Sticky CTA (Thumb Zone Ergonomics)
- Tombol aksi utama (CTA) harus selalu terlihat dan berada di **area jempul (thumb zone)** bagian bawah layar.
- Menggunakan container sticky footer dengan padding aman (`paddingBottom: Platform.OS === 'ios' ? 28 : 16`) sehingga pengguna tidak perlu menggulir formulir panjang untuk menemukan tombol aksi.

---

## 2. Tipografi & Konten

### Satu Font Family
- Gunakan tipografi modern (Inter, SF Pro, atau system default yang bersih) dengan rendering tajam.

### Hierarki Visual
- **Title / Heading**: Tebal (`Semi-bold: 600` atau `Bold: 700 - 800`), kontras tinggi terhadap background, ukuran proporsional (`16px`–`22px` untuk mobile).
- **Body Text**: Reguler (`400`), `line-height: 1.4`–`1.6`, warna abu-abu netral gelap (`#475569` pada mode terang atau `#94A3B8` pada mode gelap) untuk mengurangi ketegangan mata (eye strain).
- **Labels / Badges**: Ringkas, padat, dan gunakan `letterSpacing: 0.5px`–`1px` jika menggunakan huruf kapital/uppercase untuk keterbacaan tinggi.

---

## 3. Warna & Visual

### Aturan Palet 60-30-10
1. **60% Background Netral**:
   - Light: `#F8FAFC` (off-white lembut) / `#FFFFFF`.
   - Dark: `#090D16` / `#09090B` (deep dark).
2. **30% Elemen Sekunder**:
   - Kartu (`#FFFFFF` / `#131A2A`), permukaan bertingkat (`#F1F5F9` / `#1E293B`), teks deskripsi netral, dan border pemisah halus (`#E2E8F0` / `rgba(255,255,255,0.08)`).
3. **10% Warna Aksen Interaktif**:
   - Tombol aksi utama (CTA), indikator tab aktif, progress bar aktif (Teal `#0D9488` / `#14B8A6`).

### Hilangkan Elemen Berisik
- **No Heavy Dividers**: Hindari garis pembatas tebal. Manfaatkan whitespace atau kontras warna latar belakang kartu yang lembut sebagai pemisah alami.
- **Ikon Seragam**: Gaya ikon garis konsisten (`Ionicons` dengan stroke terukur) di semua tombol, chip, dan menu.

---

## 4. Pengalaman Interaksi (Micro-UX)

### Kurangi Langkah Pengguna (Reduce Friction)
- **Quick Chip Presets**: Sediakan tombol pilihan cepat untuk nilai yang sering dimasukkan (misal: preset nominal `+25rb`, `+50rb`, `+100rb`, `+250rb`, `+500rb`, `+1jt`). Pengguna dapat mengisi nominal dalam sekali sentuh tanpa mengetik angka secara manual.
- **Opsi Cepat**: Gunakan chip selektor horizontal untuk pilihan kategori, dompet, dan tipe transaksi.

### Feedback Harga & Aksi Transparan
- Kalkulasi total langsung dicantumkan pada label tombol aksi sebelum ditekan (misal: `"Simpan Pengeluaran • Rp 50.000"`, `"Transfer Rp 150.000 ke GoPay"`).
- Berikan subteks kepastian di bawah CTA (misal: *"Pencatatan instan • Saldo langsung ter-update"*).

---

## 5. Pola Layar Khusus

### A. Paywall & Halaman Langganan PRO (Pola "Layar B")
| Masalah Layar Konvensional (Layar A) | Solusi Layar B (Qwarts Finance) |
| :--- | :--- |
| Judul evaluasi harga: *"Upgrade ke PRO Rp 149rb/thn"* (memicu keraguan seketika) | **Ubah Pertanyaan**: *"Cara Uji Coba Gratis Bekerja"* (pertanyaan berubah menjadi "Bisakah saya mencobanya gratis?" -> Ya!) |
| Fitur abstrak dengan ikon generik | **Visual Nyata**: Tampilkan mini-preview aset nyata fitur (Target Impian, AI Struk Scanner, Ekspor Excel) |
| Menimbulkan rasa takut terjebak langganan | **Timeline Transparan**: Lini masa 3 langkah (Hari 1: Akses penuh, Hari 5: Pengingat notifikasi ramah, Hari 7: Mulai paket atau batalkan kapan saja) |
| Tombol menekan & kaku (*"Subscribe"*, *"Beli"*) | **Micro-copy Kepemilikan**: *"Mulai Uji Coba Gratis Saya"* (*"Start my free trial"*) |
| Takut formulir rumit | **Kurangi Ketidakpastian**: Subteks *"Mulai dalam 2 ketukan • Batalkan kapan saja"* |
| Harga berbelit / rentang | **Satu Angka Pasti & Badge Cerdas**: Rp 149.000/thn (*"HEMAT 35% • BEST VALUE"* & *"Hanya Rp 12.400 / bln"*) |

### B. Transparansi & Input (Checklist Mobile)
- [x] **Penyajian Nilai**: Angka tunggal transparan (predictable pricing & amounts).
- [x] **Tombol CTA**: Berorientasi awal aksi & kepemilikan.
- [x] **Total Biaya/Aksi**: Dicantumkan langsung di dalam label tombol utama.
- [x] **Kuantitas/Input**: Quick chip presets (pilihan instan sekali sentuh).
- [x] **Penanganan Keraguan**: Ditampilkan proaktif (lini masa penagihan, reminder transparan).
- [x] **Struktur Layar**: Scrollable bottom sheet dengan sticky action bar di thumb zone.
