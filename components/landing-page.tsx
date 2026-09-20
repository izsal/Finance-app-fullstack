'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Download,
  FileSpreadsheet,
  Lock,
  PieChart,
  Quote,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react'

function GoogleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
        fill="#34A853"
      />
      <path
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
        fill="#EA4335"
      />
    </svg>
  )
}

const faqs = [
  {
    q: 'Apakah ada versi gratis? Apa saja batasannya?',
    a: 'Ya! Paket Starter 100% gratis selamanya untuk pencatatan transaksi harian tanpa batasan jumlah. Batasannya adalah maksimal 2 dompet/rekening dan belum mencakup fitur PRO seperti batas budget per kategori, target impian (tabungan), pengingat tagihan rutin, serta ekspor data Excel/PDF.',
  },
  {
    q: 'Apakah saya bisa login langsung dengan akun Google?',
    a: 'Tentu saja. Anda bisa langsung mendaftar atau masuk dengan satu kali klik menggunakan akun Google (Google OAuth2). Tidak perlu repot mengisi formulir manual atau mengingat kata sandi baru.',
  },
  {
    q: 'Berapa jumlah dompet di paket Free vs PRO?',
    a: 'Di Paket Starter (Free), Anda dapat membuat hingga 2 dompet atau rekening (misalnya 1 rekening bank dan 1 dompet uang tunai). Pada Paket PRO, Anda dapat menambahkan rekening dan e-wallet tanpa batas (unlimited), seperti BCA, Mandiri, BRI, GoPay, OVO, Dana, dan lainnya.',
  },
  {
    q: 'Bagaimana keamanan data finansial saya?',
    a: 'Data keuangan Anda tersimpan per akun dan dilindungi standar keamanan modern. Kami tidak pernah meminta informasi sensitif perbankan seperti PIN kartu ATM, kata sandi m-banking, maupun token transaksi. Anda mencatat secara mandiri dan privat.',
  },
  {
    q: 'Apa saja fitur yang termasuk di dalam paket PRO?',
    a: 'Paket PRO mencakup: unlimited dompet & rekening, pengaturan batas budget bulanan per kategori dengan peringatan overbudget, fitur Target Impian (savings goals) dengan visualisasi progres, pelacak tagihan rutin & pengingat jatuh tempo, serta ekspor laporan ke Excel (.xlsx) dan PDF.',
  },
  {
    q: 'Apa perbedaan bayar bulanan vs tahunan untuk paket PRO?',
    a: 'Paket PRO bulanan berbiaya Rp 19.000/bulan dengan fleksibilitas bayar setiap bulan. Paket tahunan berbiaya Rp 149.000/tahun (setara ~Rp 12.400/bulan), yang memberikan penghematan biaya sekitar 35% dibanding bayar bulanan.',
  },
  {
    q: 'Bisakah saya mengekspor data atau menghapus akun?',
    a: 'Pengguna Paket PRO dapat mengekspor seluruh catatan transaksi ke format Excel (.xlsx) atau PDF kapan pun dibutuhkan untuk arsip pribadi. Anda juga dapat mengelola dan menghapus data catatan finansial Anda kapan saja melalui dashboard.',
  },
]

const testimonials = [
  {
    quote:
      'Dulu sering bingung gaji habis ke mana. Sekarang tinggal buka di HP dan catat setiap habis belanja, arus kas bulanan langsung kelihatan jelas.',
    author: '[PLACEHOLDER: Dimas R., Karyawan Swasta]',
  },
  {
    quote:
      'Paket Starter gratisnya sudah sangat cukup untuk pencatatan harian saya. Tampilannya bersih, ringan, dan tidak banyak tombol yang bikin pusing.',
    author: '[PLACEHOLDER: Sarah A., Freelancer]',
  },
  {
    quote:
      'Saya ambil paket PRO tahunan karena butuh fitur batas budget per kategori dan ekspor Excel. Harganya murah banget dibanding manfaat yang didapat.',
    author: '[PLACEHOLDER: Reza P., Product Designer]',
  },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white">
      {/* Background Glows & Ambience */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-500/15 to-cyan-500/10 blur-[130px]" />
        <div className="absolute top-[35%] -left-40 h-[500px] w-[500px] rounded-full bg-emerald-600/15 blur-[120px]" />
        <div className="absolute top-[65%] -right-40 h-[600px] w-[600px] rounded-full bg-teal-600/15 blur-[140px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-lg shadow-teal-500/25">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              Qwarts <span className="text-teal-400">Finance</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#fitur" className="transition hover:text-white">
              Fitur
            </a>
            <a href="#preview" className="transition hover:text-white">
              Dashboard
            </a>
            <a href="#cara-kerja" className="transition hover:text-white">
              Cara Kerja
            </a>
            <a href="#harga" className="transition hover:text-white">
              Harga
            </a>
            <a href="#privasi" className="transition hover:text-white">
              Privasi
            </a>
            <a href="#faq" className="transition hover:text-white">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Masuk
            </Link>
            <Link
              href="/sign-in"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition hover:from-teal-400 hover:to-emerald-500 active:scale-95"
            >
              <span>Mulai gratis</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge Jujur */}
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300 shadow-sm backdrop-blur-md">
            <span>Mulai gratis</span>
            <span className="text-slate-500">•</span>
            <span>Data per akun</span>
            <span className="text-slate-500">•</span>
            <span>Desktop & mobile</span>
          </div>

          {/* Heading Manfaat */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Catat Keuangan Pribadi dengan Mudah,{' '}
            <span className="bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Mulai Gratis
            </span>
          </h1>

          {/* Subtitle Jujur Free vs Nilai PRO */}
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-300">
            Catat pemasukan dan pengeluaran harianmu tanpa biaya. Upgrade ke PRO saat kamu siap
            mengelola budget, banyak dompet, dan target tabungan.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-in"
              className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-white/10 transition hover:bg-slate-100 active:scale-95"
            >
              <GoogleIcon className="h-5 w-5" />
              <span>Mulai gratis dengan Google</span>
            </Link>

            <a
              href="#preview"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:border-slate-600 active:scale-95"
            >
              <span>Lihat contoh dashboard</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Gratis untuk pencatatan harian</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              <span>Data per akun & terisolasi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span>Bisa diakses di HP & desktop</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview Mockup Showcase */}
        <div id="preview" className="mt-16 sm:mt-20">
          <div className="relative mx-auto max-w-5xl rounded-3xl border border-slate-800/80 bg-slate-900/60 p-3 sm:p-5 shadow-2xl shadow-teal-950/60 backdrop-blur-2xl">
            {/* Top window bar */}
            <div className="mb-4 flex items-center justify-between border-b border-slate-800/70 pb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-medium text-slate-500">
                  finance.qwarts.my.id/dashboard
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
                <span className="h-2 w-2 rounded-full bg-teal-400" />
                <span>Ilustrasi Dashboard</span>
              </div>
            </div>

            {/* Mockup Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Total Saldo */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Kekayaan Bersih
                </p>
                <p className="mt-2 text-3xl font-black text-white">Rp 28.750.000</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>+18.4% bulan ini</span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Dompet Aktif</span>
                  <span className="text-teal-400 font-medium">BCA, Mandiri, Cash</span>
                </div>
              </div>

              {/* Card 2: Pemasukan & Pengeluaran */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Arus Kas Bulan Ini</span>
                  <span className="rounded bg-teal-500/10 px-2 py-0.5 text-teal-400">Maret 2026</span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Pemasukan</span>
                    <span className="font-bold text-emerald-400">+Rp 12.500.000</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Pengeluaran</span>
                    <span className="font-bold text-rose-400">-Rp 4.050.000</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                    <div className="bg-teal-400 h-2 rounded-full w-[32%]" />
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-slate-400">Tercatat rapi di grafik bulanan</p>
              </div>

              {/* Card 3: Target Impian (Goals - PRO) */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Target Impian (Fitur PRO)
                  </span>
                  <Target className="h-4 w-4 text-teal-400" />
                </div>
                <p className="mt-2 text-lg font-bold text-white">Dana Darurat 6 Bulan</p>
                <div className="mt-2 flex items-center justify-between text-xs font-semibold">
                  <span className="text-teal-300">Rp 17.000.000</span>
                  <span className="text-slate-400">Target Rp 20.000.000</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-teal-400 to-emerald-400 h-2 rounded-full w-[85%]" />
                </div>
                <p className="mt-2 text-[11px] text-emerald-400 font-medium">
                  85% Tercapai • Sisa Rp 3.000.000 lagi
                </p>
              </div>
            </div>

            {/* Bottom mini showcase: Recent transactions */}
            <div className="mt-4 rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4">
              <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Catatan Transaksi Terakhir</span>
                <span className="text-slate-500 font-medium text-[11px]">Contoh simulasi catatan</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-900/80 p-3 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">Gaji Bulanan</p>
                      <p className="text-[10px] text-slate-400">BCA • Pemasukan</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">+10.000.000</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-900/80 p-3 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">Belanja Bulanan</p>
                      <p className="text-[10px] text-slate-400">Mandiri • Makanan</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-400">-750.000</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-900/80 p-3 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">Internet & WiFi</p>
                      <p className="text-[10px] text-slate-400">Tagihan Rutin</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-400">-375.000</span>
                </div>
              </div>
            </div>

            {/* Explicit Caption Under Demo Mockup */}
            <p className="mt-3 text-center text-xs font-medium text-slate-500">
              *Contoh data — bukan saldo akunmu
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Section (Section D) */}
      <section className="relative z-10 border-t border-slate-800/80 bg-slate-900/20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-3.5 py-1 text-xs font-semibold text-teal-400">
              <Users className="h-3.5 w-3.5" />
              <span>Dibuat untuk Pengelolaan Finansial yang Masuk Akal</span>
            </div>
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white">
              Cocok untuk Siapa Saja yang Ingin Finansial Lebih Rapi
            </h2>
          </div>

          {/* 3 Bullet "Cocok Untuk" */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <div className="h-2 w-10 bg-teal-400 rounded-full mb-4" />
              <h3 className="text-base font-bold text-white">Pencatat Keuangan Pemula</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Beralih dari catatan manual di buku atau spreadsheet yang membingungkan ke dashboard web yang ringan dan otomatis.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <div className="h-2 w-10 bg-emerald-400 rounded-full mb-4" />
              <h3 className="text-base font-bold text-white">Pekerja & Freelancer</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Memisahkan uang operasional harian, rekening tabungan, dan dana cadangan agar arus kas tidak saling tercampur.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <div className="h-2 w-10 bg-cyan-400 rounded-full mb-4" />
              <h3 className="text-base font-bold text-white">Pengatur Budget Bulanan</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Ingin membatasi pos pengeluaran tertentu (makanan, gaya hidup) agar tidak overbudget di tengah bulan.
              </p>
            </div>
          </div>

          {/* 3 Placeholder Testimonials */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 flex flex-col justify-between"
              >
                <div>
                  <Quote className="h-5 w-5 text-teal-400/60 mb-3" />
                  <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-800/80">
                  <p className="text-xs font-semibold text-teal-300">{item.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Section (Section E - 6 Cards with Badges) */}
      <section id="fitur" className="relative z-10 border-t border-slate-800/80 bg-slate-900/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Fitur Produk
            </h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Semua yang Kamu Butuhkan untuk Mengelola Arus Kas
            </p>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              Mulai dari pencatatan harian tanpa biaya, hingga fitur otomatisasi anggaran di paket PRO.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1: Free */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-7 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 transition">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-bold text-teal-300">
                    Free
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">Catat Pemasukan & Pengeluaran</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Catat setiap transaksi harianmu tanpa batasan jumlah. Pantau pemasukan dan pengeluaran secara visual lewat grafik arus kas bulanan yang mudah dipahami.
                </p>
              </div>
            </div>

            {/* Feature 2: Free 2 / PRO Unlimited */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-7 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-[11px] font-bold text-cyan-300">
                    Free (2) · PRO (Unlimited)
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">Multi-Dompet & Rekening Bank</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Pisahkan uang tunai di dompet, rekening bank (BCA, Mandiri, BRI), atau e-wallet (GoPay, OVO). Akun Starter mendukung hingga 2 dompet; buka tanpa batas di PRO.
                </p>
              </div>
            </div>

            {/* Feature 3: PRO */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-7 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition">
                    <PieChart className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-extrabold text-amber-300">
                    PRO
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">Budget & Peringatan Overbudget</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Tetapkan pagu anggaran per kategori (makanan, transportasi, hiburan) dan pantau persentase belanja agar tidak melebihi kemampuan finansialmu.
                </p>
              </div>
            </div>

            {/* Feature 4: PRO */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-7 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition">
                    <Target className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-extrabold text-amber-300">
                    PRO
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">Target Impian (Savings Goals)</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Rencanakan dana darurat, beli gadget baru, atau liburan. Pantau progress bar tabungan secara visual hingga nominal impian tercapai.
                </p>
              </div>
            </div>

            {/* Feature 5: PRO */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-7 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 transition">
                    <Zap className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-extrabold text-amber-300">
                    PRO
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">Tagihan Rutin & Pengingat</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Catat pengeluaran rutin bulanan seperti WiFi, listrik, atau langganan aplikasi. Lengkap dengan tanggal jatuh tempo agar tidak terkena denda keterlambatan.
                </p>
              </div>
            </div>

            {/* Feature 6: PRO */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-7 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition">
                    <Download className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-extrabold text-amber-300">
                    PRO
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">Ekspor Laporan Excel & PDF</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Unduh rekapitulasi data keuangan bulanan dalam format Excel (.xlsx) atau PDF kapan saja untuk arsip pribadi maupun evaluasi keuangan tahunan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section (Section F - 3 Steps) */}
      <section id="cara-kerja" className="relative z-10 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Alur Praktis
            </h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Mulai Rapi Finansial dalam 3 Langkah
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center backdrop-blur-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-2xl font-black text-teal-400 border border-teal-500/20">
                1
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Masuk dengan Akun Google</h3>
              <p className="mt-2 text-sm text-slate-400">
                Cukup satu klik dengan akun Google Anda tanpa perlu menghafal password baru. Dashboard siap dalam hitungan detik.
              </p>
            </div>

            <div className="relative rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center backdrop-blur-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl font-black text-emerald-400 border border-emerald-500/20">
                2
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Atur Dompet & Kategori</h3>
              <p className="mt-2 text-sm text-slate-400">
                Tambahkan hingga 2 dompet di paket Free (misal: Rekening Utama & Tunai) serta sesuaikan kategori transaksi sesuai kebutuhanmu.
              </p>
            </div>

            <div className="relative rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center backdrop-blur-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-2xl font-black text-cyan-400 border border-cyan-500/20">
                3
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Catat Rutin & Upgrade saat Siap</h3>
              <p className="mt-2 text-sm text-slate-400">
                Catat pengeluaran harian secara konsisten. Upgrade ke PRO kapan saja saat kamu butuh pagu budget, target impian, atau ekspor data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Section G) */}
      <section id="harga" className="relative z-10 border-t border-slate-800/80 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300 shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              <span>Transparan & Sangat Terjangkau</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Pilihan Paket yang Jujur dan Masuk Akal
            </h2>
            {/* Intro Kebenaran 1 Kalimat Sesuai Brief */}
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
              Gratis untuk pencatatan harian; upgrade ke PRO untuk budget, multi-dompet unlimited, target tabungan, dan ekspor data.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-8 max-w-5xl mx-auto items-stretch">
            {/* 1. Paket Starter (Free) */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/50 p-8 sm:p-10 backdrop-blur-xl transition hover:border-slate-700">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">Paket Starter (Free)</span>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                    Gratis Selamanya
                  </span>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Cocok untuk siapa saja yang ingin mulai membiasakan diri mencatat pemasukan dan pengeluaran harian tanpa ribet.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-white">Rp 0</span>
                  <span className="text-xs font-medium text-slate-400">/ selamanya</span>
                </div>

                <div className="mt-8 space-y-3.5 border-t border-slate-800/80 pt-8 text-xs sm:text-sm text-slate-300">
                  <p className="font-semibold text-teal-400 text-xs uppercase tracking-wider mb-2">
                    Fitur Termasuk:
                  </p>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>Pencatatan Pemasukan & Pengeluaran Unlimited</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>Maksimal 2 Dompet / Rekening Bank</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>Kategori Transaksi Lengkap</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>Grafik Arus Kas & Statistik Bulanan</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>Login Cepat dengan Akun Google (OAuth2)</span>
                  </div>

                  <p className="font-semibold text-slate-500 text-xs uppercase tracking-wider pt-3 mb-2">
                    Tidak Termasuk (Ada di PRO):
                  </p>
                  <div className="flex items-center gap-3 text-slate-500">
                    <X className="h-4 w-4 shrink-0 text-slate-600" />
                    <span>Lebih dari 2 dompet / rekening</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <X className="h-4 w-4 shrink-0 text-slate-600" />
                    <span>Batas budget per kategori & overbudget alert</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <X className="h-4 w-4 shrink-0 text-slate-600" />
                    <span>Target Impian (tabungan masa depan)</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <X className="h-4 w-4 shrink-0 text-slate-600" />
                    <span>Pelacak tagihan rutin & pengingat</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <X className="h-4 w-4 shrink-0 text-slate-600" />
                    <span>Ekspor laporan ke Excel (.xlsx) & PDF</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href="/sign-in"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 py-3.5 text-sm font-bold text-white transition hover:bg-slate-700 hover:text-white"
                >
                  <span>Mulai Gratis Sekarang</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* 2. Paket PRO */}
            <div className="relative flex flex-col justify-between rounded-3xl border-2 border-teal-500/60 bg-gradient-to-b from-teal-950/40 via-slate-900/90 to-slate-950 p-8 sm:p-10 shadow-2xl shadow-teal-500/10 backdrop-blur-xl">
              <div className="absolute -top-3.5 right-8">
                <span className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1 text-xs font-black text-slate-950 uppercase tracking-wider shadow-md shadow-amber-500/30 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 fill-slate-950 text-slate-950" />
                  Paling Dipilih
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Paket Qwarts Finance PRO</span>
                    <span className="rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 border border-amber-500/30">
                      PRO
                    </span>
                  </span>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Kendali penuh atas keuanganmu dengan sistem otomatisasi batas budget, target tabungan, dan ekspor data.
                </p>

                {/* Harga Bulanan dan Tahunan Berdampingan Sesuai Brief */}
                <div className="mt-6 rounded-2xl border border-teal-500/30 bg-teal-950/30 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-teal-500/20 pb-3">
                    <div>
                      <span className="text-xs text-slate-400">Opsi Bulanan:</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-3xl font-black text-white">Rp 19.000</span>
                        <span className="text-xs font-medium text-slate-400">/ bulan</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-amber-300 font-semibold">Opsi Tahunan (Hemat ~35%):</span>
                      <div className="flex items-baseline gap-1 mt-0.5 sm:justify-end">
                        <span className="text-2xl font-black text-emerald-400">Rp 149.000</span>
                        <span className="text-xs font-medium text-slate-400">/ tahun</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-teal-300 font-medium">
                    ⚡ Paket tahunan setara hanya ~Rp 12.400/bulan
                  </p>
                </div>

                <div className="mt-8 space-y-3.5 border-t border-teal-500/20 pt-8 text-xs sm:text-sm text-slate-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span className="font-semibold text-white">Semua Fitur Paket Starter (Free)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>
                      <strong className="text-white">Unlimited Dompet & Rekening</strong> (BCA, Mandiri, BRI, GoPay, OVO, Dana)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>
                      <strong className="text-white">Batas Budget Bulanan</strong> per Kategori & Peringatan Overbudget
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>
                      <strong className="text-white">Target Impian & Tabungan</strong> dengan Progress Bar Visual
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>
                      <strong className="text-white">Pelacak Tagihan Rutin</strong> & Pengingat Jatuh Tempo
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>
                      <strong className="text-white">Ekspor Laporan Lengkap</strong> ke Excel (.xlsx) & PDF Otomatis
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>
                      <strong className="text-white">Lencana Eksklusif PRO Member ⭐</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href="/sign-in"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/25 transition hover:brightness-110 active:scale-95"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Pilih Paket PRO</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Catatan di Bawah Kartu Sesuai Brief */}
          <p className="mt-8 text-center text-xs text-slate-400 max-w-xl mx-auto">
            Data keuangan tetap milikmu sepenuhnya. Mulai Starter tanpa kartu kredit. Upgrade atau batalkan langganan kapan saja langsung dari dashboard.
          </p>
        </div>
      </section>

      {/* Keamanan & Privasi Section (Section H) */}
      <section id="privasi" className="relative z-10 border-t border-slate-800/80 bg-slate-900/30 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300">
              <Shield className="h-3.5 w-3.5 text-teal-400" />
              <span>Privasi Pengguna</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Data Keuanganmu adalah Milik Pribadimu
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400">
              Kami mengutamakan privasi dan transparansi tanpa membuat klaim keamanan yang berlebihan.
            </p>
          </div>

          {/* 4 Poin Konkret Sesuai Brief */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Login via Google OAuth2</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Kami tidak menyimpan password akun Anda. Autentikasi ditangani langsung oleh sistem resmi Google yang terpercaya.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Data Privat Per Akun</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Setiap catatan transaksi tersimpan secara terisolasi per pengguna dan tidak pernah dibagikan atau dijual ke pihak mana pun.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-4">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Tanpa Akses Rekening Bank</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Kami tidak pernah meminta nomor PIN kartu, kata sandi m-banking, maupun hak debit mutasi bank Anda.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-4">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Kontrol Data di Tangan Anda</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Anda memiliki kendali penuh untuk menambah, mengedit, mengekspor laporan, atau menghapus data transaksi kapan saja.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-teal-400 hover:text-teal-300 transition"
            >
              <span>Baca kebijakan privasi lengkap</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section (Section I - Wajib Lengkap Min. 6) */}
      <section id="faq" className="relative z-10 border-t border-slate-800/80 bg-slate-900/30 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Pertanyaan Populer
            </h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Pertanyaan yang Sering Diajukan (FAQ)
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left text-base font-semibold text-white transition hover:text-teal-300"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-teal-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-800/70 px-5 pb-5 pt-3 text-sm text-slate-300 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Closing CTA Banner (Section J) */}
      <section className="relative z-10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-r from-teal-950/80 via-slate-900/90 to-emerald-950/80 p-8 text-center sm:p-14 shadow-2xl backdrop-blur-xl">
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Mulai Rapikan Keuangan Pribadimu Hari Ini
              </h2>
              <p className="mt-4 text-slate-300 text-sm sm:text-base">
                Gratis untuk pencatatan harian, upgrade ke PRO kapan pun kamu siap mengontrol budget dan tabungan impian.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/sign-in"
                  className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-white px-8 py-4 text-sm font-bold text-slate-950 shadow-xl transition hover:bg-slate-100 active:scale-95"
                >
                  <GoogleIcon className="h-5 w-5" />
                  <span>Mulai gratis dengan Google</span>
                </Link>
              </div>
              <p className="mt-4 text-xs text-slate-400">
                Tanpa kartu kredit untuk Starter • Setup instan dalam 1 menit
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (Section K) */}
      <footer className="relative z-10 border-t border-slate-800/80 py-10 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500 text-white font-black text-xs">
              Q
            </div>
            <span className="font-bold text-slate-300">Qwarts Finance</span>
            <span>— Dashboard Keuangan Pribadi</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#fitur" className="hover:text-slate-300 transition">
              Fitur
            </a>
            <a href="#harga" className="hover:text-slate-300 transition">
              Harga
            </a>
            <a href="#faq" className="hover:text-slate-300 transition">
              FAQ
            </a>
            <Link href="/privacy" className="hover:text-slate-300 transition">
              Kebijakan Privasi
            </Link>
            <Link href="/sign-in" className="hover:text-slate-300 transition">
              Masuk
            </Link>
          </div>

          <p>© {new Date().getFullYear()} Qwarts Finance. Seluruh hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  )
}
