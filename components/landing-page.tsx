'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Download,
  Lock,
  PieChart,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Wallet,
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
    q: 'Apakah Dompetku memiliki versi gratis?',
    a: 'Ya! Dompetku menyediakan Paket Starter (Free) 100% gratis selamanya untuk pencatatan transaksi harian. Bagi Anda yang ingin fitur tingkat lanjut seperti Target Impian, Budgeting Bulanan, dan Ekspor Excel, Anda dapat upgrade ke Paket PRO yang sangat terjangkau (mulai Rp19.000/bulan).',
  },
  {
    q: 'Apakah saya bisa login langsung dengan akun Google?',
    a: 'Tentu! Anda bisa masuk atau mendaftar hanya dengan satu kali klik menggunakan akun Google tanpa perlu menghafal kata sandi tambahan.',
  },
  {
    q: 'Apakah saya bisa mencatat lebih dari satu rekening bank atau e-wallet?',
    a: 'Sangat bisa. Anda dapat menambahkan dompet Tunai, rekening Bank (BCA, Mandiri, BRI, dll.), serta E-Wallet (GoPay, OVO, ShopeePay) dan melakukan transfer antar-dompet secara otomatis.',
  },
  {
    q: 'Bagaimana keamanan data finansial saya?',
    a: 'Setiap data keuangan pengguna disimpan dalam database cloud terenkripsi dan terisolasi privat. Hanya Anda yang memiliki akses ke dashboard finansial Anda.',
  },
  {
    q: 'Apakah ada fitur pengingat tagihan bulanan dan target tabungan?',
    a: 'Ya! Dompetku dilengkapi fitur Target Impian (Goals) untuk memantau tabungan dan fitur Tagihan Rutin (Subscriptions) dengan pengingat jatuh tempo.',
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
              Dompet<span className="text-teal-400">ku</span>
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
              href="/sign-up"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition hover:from-teal-400 hover:to-emerald-500 active:scale-95"
            >
              <span>Mulai Gratis</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300 shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span>Manajemen Finansial Modern & 100% Gratis</span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Kendalikan Keuanganmu,{' '}
            <span className="bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Wujudkan Impian Finansial
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-400">
            Catat pengeluaran & pemasukan harian, pantau saldo multi-dompet & rekening bank, atur
            budget per kategori, dan capai target tabungan impian dengan mudah dalam satu dashboard
            elegan.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-in"
              className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-slate-700 bg-slate-900/90 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 hover:border-slate-600 active:scale-95"
            >
              <GoogleIcon className="h-5 w-5" />
              <span>Lanjutkan dengan Google</span>
            </Link>

            <Link
              href="/sign-up"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-teal-500/25 transition hover:from-teal-400 hover:to-emerald-500 active:scale-95"
            >
              <span>Daftar Akun Baru</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Gratis Selamanya</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              <span>Data Terisolasi & Privat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span>Responsif Desktop & Mobile</span>
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
                  dompetku.qwarts.my.id/dashboard
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
                <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                <span>Live Dashboard Sync</span>
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
                  <span>3 Rekening Aktif</span>
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
                <p className="mt-3 text-[11px] text-slate-400">32% dari batas budget bulanan</p>
              </div>

              {/* Card 3: Target Impian (Goals) */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Target Impian Terdekat
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
                <span className="text-teal-400 font-semibold cursor-pointer">Live Preview</span>
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
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="fitur" className="relative z-10 border-t border-slate-800/80 bg-slate-900/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Fitur Lengkap Untuk Finansialmu
            </h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Segala yang Anda Butuhkan untuk Hidup Bebas Khawatir Finansial
            </p>
            <p className="mt-4 text-slate-400">
              Dirancang untuk kemudahan dan kejelasan, Dompetku menggabungkan semua aspek pencatatan
              keuangan ke dalam satu alur kerja yang intuitif.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-7 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 transition">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">Multi-Dompet & Rekening</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Kelola uang tunai di dompet, rekening bank BCA, Mandiri, BRI, hingga dompet digital
                GoPay & OVO dengan saldo terpisah dan fitur transfer antar-dompet.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-7 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition">
                <PieChart className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">Budgeting & Pengeluaran</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Tetapkan pagu anggaran bulanan per kategori (makanan, transportasi, hiburan) dan
                dapatkan indikator warna real-time untuk mencegah belanja berlebihan.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-7 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">Target Impian (Savings Goals)</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Punya mimpi beli gadget baru, liburan, atau dana darurat? Tetapkan target nominal dan
                tanggal capaian, lalu setorkan tabungan dengan progress bar motivatif.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-7 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">Langganan & Tagihan Rutin</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Catat biaya langganan bulanan seperti Netflix, Spotify, WiFi, atau listrik. Dilengkapi
                pengingat sebelum tanggal jatuh tempo agar tidak terkena denda.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-7 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition">
                <Download className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">Ekspor Laporan Excel & PDF</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Unduh rekapitulasi data keuangan bulanan dalam format Excel atau PDF kapan saja untuk
                keperluan arsip pribadi atau pelaporan pajak dengan satu klik.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-7 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 transition">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">Login Cepat dengan Google</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Tidak perlu pusing mengingat password baru. Masuk seketika dengan akun Google
                terverifikasi dengan standar keamanan OAuth2 terpercaya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="cara-kerja" className="relative z-10 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Sangat Praktis & Cepat
            </h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Mulai Dalam 3 Langkah Mudah
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center backdrop-blur-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-2xl font-black text-teal-400 border border-teal-500/20">
                1
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Masuk dengan Akun Google</h3>
              <p className="mt-2 text-sm text-slate-400">
                Cukup klik &quot;Lanjutkan dengan Google&quot; dan akun dashboard Anda langsung siap digunakan
                dalam hitungan detik.
              </p>
            </div>

            <div className="relative rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center backdrop-blur-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl font-black text-emerald-400 border border-emerald-500/20">
                2
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Atur Dompet & Budget</h3>
              <p className="mt-2 text-sm text-slate-400">
                Masukkan saldo awal dompet dan atur alokasi dana kebutuhan pokok Anda per bulan.
              </p>
            </div>

            <div className="relative rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center backdrop-blur-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-2xl font-black text-cyan-400 border border-cyan-500/20">
                3
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Pantau & Wujudkan Impian</h3>
              <p className="mt-2 text-sm text-slate-400">
                Catat setiap transaksi secara rutin dan saksikan tabungan target impian Anda tumbuh
                secara nyata.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="relative z-10 border-t border-slate-800/80 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300 shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              <span>Transparan & Sangat Terjangkau</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Pilihan Paket Sesuai Kebutuhan Finansialmu
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-400">
              Mulai gratis selamanya untuk pencatatan harian, atau upgrade ke PRO untuk membuka otomatisasi budget, target tabungan, dan ekspor data.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-8 max-w-5xl mx-auto items-stretch">
            {/* 1. Paket Free */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/50 p-8 sm:p-10 backdrop-blur-xl transition hover:border-slate-700">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">Paket Starter (Free)</span>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                    Gratis Selamanya
                  </span>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Sangat cocok untuk siapa saja yang ingin mulai membiasakan diri mencatat arus kas harian tanpa ribet.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-white">Rp 0</span>
                  <span className="text-xs font-medium text-slate-400">/ selamanya</span>
                </div>

                <div className="mt-8 space-y-3.5 border-t border-slate-800/80 pt-8 text-xs sm:text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>Pencatatan Pemasukan & Pengeluaran Unlimited</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>Maksimal 2 Dompet / Rekening Bank</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>Kategori Transaksi Lengkap</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>Grafik Arus Kas & Statistik Bulanan</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <Lock className="h-4 w-4 shrink-0 text-slate-600" />
                    <span>Budget Bulanan & Limit Kategori</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <Lock className="h-4 w-4 shrink-0 text-slate-600" />
                    <span>Target Impian & Tabungan Masa Depan</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <Lock className="h-4 w-4 shrink-0 text-slate-600" />
                    <span>Pelacak Tagihan Rutin & Pengingat</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <Lock className="h-4 w-4 shrink-0 text-slate-600" />
                    <span>Ekspor Laporan ke Excel (.xlsx) & CSV</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href="/sign-up"
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
                  Paling Populer
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Paket Dompetku PRO</span>
                    <span className="rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 border border-amber-500/30">PRO</span>
                  </span>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Buka kendali penuh atas finansialmu dengan fitur otomatisasi anggaran, tabungan impian, dan ekspor.
                </p>

                <div className="mt-6 flex flex-col gap-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-white">Rp 19.000</span>
                    <span className="text-xs font-medium text-slate-400">/ bulan</span>
                  </div>
                  <p className="text-xs text-teal-400 font-semibold">
                    Atau Rp 149.000 / tahun (Hanya Rp 12.400/bln — Hemat 35%)
                  </p>
                </div>

                <div className="mt-8 space-y-3.5 border-t border-teal-500/20 pt-8 text-xs sm:text-sm text-slate-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span className="font-semibold text-white">Semua Fitur Paket Starter (Free)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span><strong className="text-white">Unlimited Dompet & Rekening</strong> (BCA, Mandiri, GoPay, OVO, Dana)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span><strong className="text-white">Batas Budget Bulanan</strong> per Kategori & Peringatan Overbudget</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span><strong className="text-white">Target Impian & Tabungan</strong> dengan Progress Bar Visual</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span><strong className="text-white">Pelacak Tagihan Rutin</strong> & Pengingat Jatuh Tempo</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span><strong className="text-white">Ekspor Laporan Lengkap</strong> ke Excel (.xlsx) & CSV Otomatis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span><strong className="text-white">Lencana Eksklusif PRO Member ⭐</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href="/sign-up"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/25 transition hover:brightness-110 active:scale-95"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Dapatkan Akses PRO Sekarang</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
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
                    <div className="border-t border-slate-800/70 px-5 pb-5 pt-3 text-sm text-slate-400 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative z-10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-r from-teal-950/80 via-slate-900/90 to-emerald-950/80 p-8 text-center sm:p-14 shadow-2xl backdrop-blur-xl">
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Mulai Kelola Finansialmu dengan Tenang Sekarang
              </h2>
              <p className="mt-4 text-slate-300">
                Bergabunglah dan rasakan ketenangan saat arus kas dan impian keuanganmu tercatat rapi
                setiap hari.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/sign-in"
                  className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 shadow-md transition hover:bg-slate-100 active:scale-95"
                >
                  <GoogleIcon className="h-5 w-5" />
                  <span>Lanjutkan dengan Google</span>
                </Link>
                <Link
                  href="/sign-up"
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-400 active:scale-95"
                >
                  <span>Daftar Gratis</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-10 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500 text-white font-black text-xs">
              D
            </div>
            <span className="font-bold text-slate-300">Dompetku</span>
            <span>— Dashboard Keuangan Pribadi</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/sign-in" className="hover:text-slate-300 transition">
              Masuk
            </Link>
            <Link href="/sign-up" className="hover:text-slate-300 transition">
              Daftar
            </Link>
            <a href="https://qwarts.my.id" className="hover:text-slate-300 transition">
              qwarts.my.id
            </a>
          </div>

          <p>© {new Date().getFullYear()} Dompetku. Seluruh hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  )
}
