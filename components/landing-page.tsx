'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from '@yusufceng1z/ding-react'
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Languages,
  Mail,
  Menu,
  Phone,
  PieChart,
  Plus,
  Quote,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from '@/components/animated-icons'
import { landingTranslations, type LandingLanguage } from '@/lib/landing-translations'
import { TextAnimation } from '@/components/motion/text-animation'
import { Tabs, TabsList, TabsTrigger } from '@/components/motion/tabs'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/motion/accordion'
import { Progress } from '@/components/motion/progress'
import { Badge } from '@/components/motion/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/motion/dropdown-menu'

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

export default function LandingPage() {
  const [lang, setLang] = useState<LandingLanguage>('id')
  const [previewTab, setPreviewTab] = useState<'overview' | 'budget' | 'goals' | 'mobile'>('overview')
  const [hideBalance, setHideBalance] = useState(false)
  const [simulatedDeposit, setSimulatedDeposit] = useState(0)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('qwarts-lang')
      if (saved === 'en' || saved === 'id') {
        setLang(saved)
      }
    } catch {
      // ignore localStorage restrictions
    }
  }, [])

  const handleLanguageChange = (newLang: LandingLanguage) => {
    setLang(newLang)
    try {
      localStorage.setItem('qwarts-lang', newLang)
    } catch {
      // ignore
    }
  }

  const handleSimulateDeposit = () => {
    setSimulatedDeposit((prev) => prev + 500000)
    toast.success(
      lang === 'en'
        ? 'Simulated deposit added! Savings balance increased by Rp 500,000.'
        : 'Setoran simulasi berhasil ditambahkan! Saldo tabungan bertambah Rp 500.000.',
      { duration: 3500 }
    )
  }

  const formatRupiah = (val: number) => {
    if (hideBalance) return '••••••••'
    return `Rp ${new Intl.NumberFormat('id-ID').format(val)}`
  }

  const t = landingTranslations[lang]

  // Rich JSON-LD Structured Data for Search Engines (FAQPage & WebApplication)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': 'https://www.qwarts.my.id/#app',
        name: 'Qwarts Finance',
        url: 'https://www.qwarts.my.id',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All',
        description:
          'Aplikasi budgeting bulanan dan cara mencatat pengeluaran harian gratis. Atur pos anggaran, catat arus kas multi-dompet, dan capai target tabungan impian dengan mudah.',
        offers: [
          {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'IDR',
            name: 'Starter (Free)',
          },
          {
            '@type': 'Offer',
            price: '19000',
            priceCurrency: 'IDR',
            name: 'PRO Monthly',
          },
          {
            '@type': 'Offer',
            price: '149000',
            priceCurrency: 'IDR',
            name: 'PRO Yearly',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.qwarts.my.id/#faq',
        mainEntity: t.faq.items.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
    ],
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-lg shadow-teal-500/25 transition group-hover:scale-105">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tight text-white">
              Qwarts <span className="text-teal-400">Finance</span>
            </span>
          </Link>

          {/* Minimalist Desktop Navigation (Fitur, Dashboard, Harga, FAQ) */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8 text-sm font-medium text-slate-300">
            <a href="#fitur" className="transition hover:text-white">
              {t.nav.features}
            </a>
            <a href="#preview" className="transition hover:text-white">
              {t.nav.dashboard}
            </a>
            <a href="#harga" className="transition hover:text-white">
              {t.nav.pricing}
            </a>
            <a href="#faq" className="transition hover:text-white">
              {t.nav.faq}
            </a>
            <Link href="/demo" className="flex items-center gap-1 rounded-lg border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-xs font-bold text-teal-300 hover:bg-teal-500/20 transition">
              <Zap className="h-3.5 w-3.5 text-teal-400" />
              <span>{lang === 'id' ? 'Demo' : 'Demo'}</span>
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => handleLanguageChange(lang === 'id' ? 'en' : 'id')}
              title={lang === 'id' ? 'Switch to English' : 'Beralih ke Bahasa Indonesia'}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/80 px-2.5 py-1.5 text-xs font-semibold text-slate-200 shadow-sm backdrop-blur-md transition hover:border-teal-500/50 hover:bg-slate-800 hover:text-white cursor-pointer"
              aria-label={lang === 'id' ? 'Switch to English' : 'Beralih ke Bahasa Indonesia'}
            >
              <Languages className="h-3.5 w-3.5 text-teal-400" />
              <span>{lang === 'id' ? 'ID' : 'EN'}</span>
            </button>

            <Link
              href="/sign-in"
              className="hidden sm:inline-flex rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              {t.nav.signIn}
            </Link>
            <Link
              href="/sign-in"
              className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition hover:from-teal-400 hover:to-emerald-500 active:scale-95"
            >
              <span>{t.nav.getStarted}</span>
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>

            {/* Mobile Navigation Dropdown Menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white">
                  <Menu className="h-5 w-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <DropdownMenuItem href="#fitur">
                    <Sparkles className="h-4 w-4 text-teal-400" />
                    <span>{t.nav.features}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem href="#preview">
                    <BarChart3 className="h-4 w-4 text-cyan-400" />
                    <span>{t.nav.dashboard}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem href="#harga">
                    <CreditCard className="h-4 w-4 text-emerald-400" />
                    <span>{t.nav.pricing}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem href="#faq">
                    <Quote className="h-4 w-4 text-slate-400" />
                    <span>{t.nav.faq}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem href="/demo" className="text-teal-300 font-bold">
                    <Zap className="h-4 w-4 text-teal-400" />
                    <span>{lang === 'id' ? 'Demo Interaktif' : 'Interactive Demo'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem href="/sign-in" className="text-teal-400 font-bold">
                    <Wallet className="h-4 w-4 text-teal-400" />
                    <span>{t.nav.signIn}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          {/* Single Clean Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300 shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span>{t.hero.eyebrow}</span>
          </div>

          {/* Natural Headline */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            {t.hero.headlinePrefix}
            <TextAnimation
              key={t.hero.headlineGradient}
              variant="shimmer"
              text={t.hero.headlineGradient}
              duration={10}
              loop
            />
          </h1>

          {/* Natural Subtitle */}
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-300">
            {t.hero.subtitle}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link
                href="/sign-in"
                className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-white/10 transition hover:bg-slate-100 active:scale-95"
              >
                <GoogleIcon className="h-5 w-5" />
                <span>{t.hero.ctaGoogle}</span>
              </Link>

              <a
                href="#preview"
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:border-slate-600 active:scale-95"
              >
                <span>{t.hero.ctaPreview}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </a>
              <Link
                href="/demo"
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-teal-500/40 bg-teal-500/10 px-6 py-3.5 text-sm font-semibold text-teal-300 transition hover:bg-teal-500/20 hover:border-teal-500/60 active:scale-95"
              >
                <Zap className="h-4 w-4 text-teal-400" />
                <span>{lang === 'id' ? 'Coba Demo Interaktif' : 'Try Interactive Demo'}</span>
              </Link>
            </div>
            {t.hero.ctaSubtext && (
              <p className="text-xs text-slate-400/90 font-medium text-center">
                {t.hero.ctaSubtext}
              </p>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-teal-400" />
              {t.hero.trust1}
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-teal-400" />
              {t.hero.trust2}
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-teal-400" />
              {t.hero.trust3}
            </span>
          </div>
        </div>

        {/* 2. Real Project Showcase (Dashboard Utama, Budget Planner, Target Impian) */}
        <div id="preview" className="mt-16 sm:mt-20 scroll-mt-24">
          <div className="flex justify-center mb-6">
            <Tabs
              value={previewTab}
              onValueChange={(val) => setPreviewTab(val as any)}
              variant="pill"
            >
              <TabsList className="flex-wrap justify-center gap-1 sm:gap-1.5 p-1.5">
                <TabsTrigger value="overview">
                  <span>📊</span>
                  <span>{lang === 'id' ? 'Dashboard Utama' : 'Dashboard Overview'}</span>
                </TabsTrigger>
                <TabsTrigger value="budget">
                  <span>🎯</span>
                  <span>{lang === 'id' ? 'Budget Planner' : 'Budget Planner'}</span>
                  <Badge variant="accent" className="text-[10px] py-0 px-1.5 ml-1 font-semibold">
                    PRO
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="goals">
                  <span>🏆</span>
                  <span>{lang === 'id' ? 'Target Impian' : 'Savings Goals'}</span>
                  <Badge variant="accent" className="text-[10px] py-0 px-1.5 ml-1 font-semibold">
                    PRO
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="mobile">
                  <span>📱</span>
                  <span>{lang === 'id' ? 'Mobile App' : 'Mobile App'}</span>
                  <Badge variant="warning" className="text-[10px] py-0 px-1.5 ml-1">
                    {lang === 'id' ? 'Segera Hadir' : 'Coming Soon'}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="relative mx-auto max-w-5xl rounded-3xl border border-slate-800/80 bg-slate-900/60 p-3 sm:p-5 shadow-2xl shadow-teal-950/60 backdrop-blur-2xl">
            {/* Top window bar */}
            <div className="mb-4 flex items-center justify-between border-b border-slate-800/70 pb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-medium text-slate-500">
                  {t.hero.mockupWindow}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
                <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                <span>
                  {previewTab === 'overview'
                    ? lang === 'id' ? 'Tampilan Asli: Dashboard Utama' : 'Live View: Dashboard Overview'
                    : previewTab === 'budget'
                      ? lang === 'id' ? 'Tampilan Asli: Budget Planner & Pagu Bulanan' : 'Live View: Budget Planner'
                      : previewTab === 'goals'
                        ? lang === 'id' ? 'Tampilan Asli: Target Impian (Savings Goals)' : 'Live View: Savings Goals'
                        : lang === 'id' ? 'Pratinjau: Mobile Native App (iOS & Android)' : 'Showcase: Native Mobile App'}
                </span>
              </div>
            </div>

            {/* TAB 1: Real Dashboard Overview (Tampilan Asli Project) */}
            {previewTab === 'overview' && (
              <div className="space-y-4">
                {/* Greeting & Fast Pulse Bar (matching dashboard.tsx) */}
                <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-r from-teal-950/50 via-slate-900/70 to-emerald-950/40 p-4 backdrop-blur-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-base shadow-md">
                        D
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-white text-sm sm:text-base">
                            {lang === 'id' ? 'Selamat Datang, Dimas Pratama' : 'Welcome back, Dimas Pratama'} 👋
                          </h3>
                          <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black text-amber-300">
                            PRO Member ⭐
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Calendar className="h-3 w-3 text-teal-400" />
                          <span>{lang === 'id' ? '25 Oktober 2026 • Periode Aktif' : 'October 25, 2026 • Active Period'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHideBalance(!hideBalance)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/80 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                        title={hideBalance ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
                      >
                        {hideBalance ? <EyeOff className="h-3.5 w-3.5 text-slate-400" /> : <Eye className="h-3.5 w-3.5 text-slate-400" />}
                        <span>{hideBalance ? (lang === 'id' ? 'Tampilkan' : 'Show') : (lang === 'id' ? 'Sembunyikan' : 'Hide')}</span>
                      </button>
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">
                        {lang === 'id' ? 'Sisa Budget: ' : 'Budget Left: '}{formatRupiah(2450000)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4 Financial Metric Cards (exact layout as dashboard.tsx) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Card 1: Total Saldo Bersih */}
                  <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5 shadow-lg">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {lang === 'id' ? 'Total Kekayaan Bersih' : 'Total Net Worth'}
                    </span>
                    <p className="mt-2 text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
                      {formatRupiah(28750000)}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>+18.4% {lang === 'id' ? 'bulan ini' : 'this month'}</span>
                    </div>
                  </div>

                  {/* Card 2: Pemasukan Bulan Ini */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5 shadow-lg">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {lang === 'id' ? 'Pemasukan' : 'Income'}
                    </span>
                    <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums">
                      +{formatRupiah(12500000)}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-2 block">
                      {lang === 'id' ? 'Gaji & Pendapatan Sampingan' : 'Salary & Side Projects'}
                    </span>
                  </div>

                  {/* Card 3: Pengeluaran Bulan Ini */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5 shadow-lg">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {lang === 'id' ? 'Pengeluaran' : 'Expense'}
                    </span>
                    <p className="mt-2 text-xl sm:text-2xl font-bold text-rose-400 tabular-nums">
                      -{formatRupiah(4050000)}
                    </p>
                    <div className="mt-2">
                      <Progress value={32.4} barClassName="bg-teal-400" />
                      <span className="text-[10px] text-slate-400 mt-1 block">Rasio 32.4% dari Pemasukan</span>
                    </div>
                  </div>

                  {/* Card 4: Arus Kas Bersih */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5 shadow-lg">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {lang === 'id' ? 'Arus Kas Bersih' : 'Net Cash Flow'}
                    </span>
                    <p className="mt-2 text-xl sm:text-2xl font-bold text-teal-300 tabular-nums">
                      +{formatRupiah(8450000)}
                    </p>
                    <span className="text-[11px] text-emerald-400 font-semibold mt-2 block">
                      📈 {lang === 'id' ? 'Surplus Keuangan Sehat' : 'Healthy Cash Surplus'}
                    </span>
                  </div>
                </div>

                {/* Multi-Wallet Grid (Real accounts) */}
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4">
                  <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-teal-400" />
                      <span>{lang === 'id' ? 'Multi-Dompet Terhubung' : 'Connected Multi-Wallets'}</span>
                    </div>
                    <span className="text-teal-400 font-medium text-[11px]">4 Dompet Aktif</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Bank BCA</span>
                        <span className="text-[10px] rounded bg-blue-500/10 text-blue-400 px-1 font-semibold">Bank</span>
                      </div>
                      <p className="mt-2 text-sm font-black text-white tabular-nums">{formatRupiah(18250000)}</p>
                      <span className="text-[10px] text-slate-400">Rekening Utama</span>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Bank Mandiri</span>
                        <span className="text-[10px] rounded bg-amber-500/10 text-amber-400 px-1 font-semibold">Bank</span>
                      </div>
                      <p className="mt-2 text-sm font-black text-white tabular-nums">{formatRupiah(7500000)}</p>
                      <span className="text-[10px] text-slate-400">Dana Cadangan</span>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">GoPay</span>
                        <span className="text-[10px] rounded bg-cyan-500/10 text-cyan-400 px-1 font-semibold">E-Wallet</span>
                      </div>
                      <p className="mt-2 text-sm font-black text-white tabular-nums">{formatRupiah(1850000)}</p>
                      <span className="text-[10px] text-slate-400">Belanja & Transport</span>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Uang Tunai</span>
                        <span className="text-[10px] rounded bg-emerald-500/10 text-emerald-400 px-1 font-semibold">Cash</span>
                      </div>
                      <p className="mt-2 text-sm font-black text-white tabular-nums">{formatRupiah(1150000)}</p>
                      <span className="text-[10px] text-slate-400">Dompet Fisik</span>
                    </div>
                  </div>
                </div>

                {/* Transaksi Terakhir (matching dashboard.tsx) */}
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4">
                  <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>{lang === 'id' ? 'Catatan Transaksi Terakhir' : 'Recent Transactions'}</span>
                    <span className="text-slate-500 text-[11px]">{lang === 'id' ? 'Sinkronisasi Otomatis' : 'Auto Synced'}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-xl bg-slate-900/80 p-3 border border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{lang === 'id' ? 'Gaji Bulanan Perusahaan' : 'Monthly Salary'}</p>
                          <p className="text-[10px] text-slate-400">BCA • Pemasukan Rutin • 25 Okt 2026</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 tabular-nums">+{formatRupiah(10000000)}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-900/80 p-3 border border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{lang === 'id' ? 'Belanja Supermarket Bulanan' : 'Monthly Grocery Shopping'}</p>
                          <p className="text-[10px] text-slate-400">Mandiri • Makanan & Pokok • 24 Okt 2026</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-rose-400 tabular-nums">-{formatRupiah(850000)}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-900/80 p-3 border border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                          <Zap className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{lang === 'id' ? 'Langganan WiFi & Listrik PLN' : 'Internet WiFi & Utilities'}</p>
                          <p className="text-[10px] text-slate-400">GoPay • Tagihan Bulanan • 22 Okt 2026</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-rose-400 tabular-nums">-{formatRupiah(375000)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Real Budget Planner (Tampilan Asli Project) */}
            {previewTab === 'budget' && (
              <div className="space-y-4">
                {/* Budget Header Stats */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 font-semibold">{lang === 'id' ? 'Total Pagu Anggaran' : 'Total Budget Cap'}</p>
                    <p className="text-xl sm:text-2xl font-black text-white mt-1 tabular-nums">{formatRupiah(6000000)}</p>
                    <p className="text-[11px] text-teal-400 mt-1.5">5 {lang === 'id' ? 'Kategori Pos Belanja' : 'Budget Categories'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 font-semibold">{lang === 'id' ? 'Total Terpakai' : 'Total Spent'}</p>
                    <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1 tabular-nums">{formatRupiah(4350000)}</p>
                    <p className="text-[11px] text-slate-400 mt-1.5">72.5% {lang === 'id' ? 'dari total pagu' : 'of total cap'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 font-semibold">{lang === 'id' ? 'Sisa Anggaran Aman' : 'Remaining Budget'}</p>
                    <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 tabular-nums">{formatRupiah(1650000)}</p>
                    <p className="text-[11px] text-emerald-400 mt-1.5">✓ {lang === 'id' ? 'Terkendali hingga akhir bulan' : 'On track until month-end'}</p>
                  </div>
                </div>

                {/* Overbudget Warning Alert Banner (real project component) */}
                <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-3.5 flex items-start gap-3 text-xs">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-300">
                      {lang === 'id' ? 'Peringatan Batas Anggaran (Overbudget Alert):' : 'Overbudget Warning:'}
                    </span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">
                      {lang === 'id'
                        ? 'Pengeluaran pada kategori Gaya Hidup & Hiburan telah melebihi batas anggaran sebesar Rp 150.000 (125%). Sistem Qwarts Finance PRO otomatis memperingatkan Anda agar tidak mengorbankan pos tabungan.'
                        : 'Spending on Lifestyle & Leisure has exceeded the monthly cap by Rp 150,000 (125%). Qwarts Finance PRO automatically flags this alert.'}
                    </p>
                  </div>
                </div>

                {/* Category Budgets Grid (matching dashboard.tsx) */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Category 1 */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white">🍔 {lang === 'id' ? 'Makanan & Minuman' : 'Food & Dining'}</span>
                      <span className="rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
                        {lang === 'id' ? 'Aman (84%)' : 'Safe (84%)'}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs mt-3">
                      <span className="text-slate-400">{lang === 'id' ? 'Terpakai: ' : 'Spent: '}<strong className="text-white">{formatRupiah(2100000)}</strong></span>
                      <span className="text-slate-400">{lang === 'id' ? 'Pagu: ' : 'Cap: '}{formatRupiah(2500000)}</span>
                    </div>
                    <Progress value={84} barClassName="bg-emerald-400" className="mt-2" />
                    <p className="mt-2 text-[11px] text-emerald-400 font-medium">{lang === 'id' ? 'Sisa anggaran: ' : 'Remaining: '}{formatRupiah(400000)}</p>
                  </div>

                  {/* Category 2 */}
                  <div className="rounded-2xl border border-amber-500/30 bg-slate-950/80 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white">🚗 {lang === 'id' ? 'Transportasi & Bensin' : 'Transport & Gas'}</span>
                      <span className="rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold">
                        {lang === 'id' ? 'Menipis (95%)' : 'Near Cap (95%)'}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs mt-3">
                      <span className="text-slate-400">{lang === 'id' ? 'Terpakai: ' : 'Spent: '}<strong className="text-white">{formatRupiah(950000)}</strong></span>
                      <span className="text-slate-400">{lang === 'id' ? 'Pagu: ' : 'Cap: '}{formatRupiah(1000000)}</span>
                    </div>
                    <Progress value={95} barClassName="bg-amber-400" className="mt-2" />
                    <p className="mt-2 text-[11px] text-amber-300 font-medium">{lang === 'id' ? 'Sisa anggaran: ' : 'Remaining: '}{formatRupiah(50000)}</p>
                  </div>

                  {/* Category 3 (Overbudget) */}
                  <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white">☕ {lang === 'id' ? 'Gaya Hidup & Hiburan' : 'Lifestyle & Leisure'}</span>
                      <span className="rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold">
                        ⚠️ Overbudget (125%)
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs mt-3">
                      <span className="text-slate-400">{lang === 'id' ? 'Terpakai: ' : 'Spent: '}<strong className="text-rose-400">{formatRupiah(750000)}</strong></span>
                      <span className="text-slate-400">{lang === 'id' ? 'Pagu: ' : 'Cap: '}{formatRupiah(600000)}</span>
                    </div>
                    <Progress value={100} barClassName="bg-rose-500" className="mt-2" />
                    <p className="mt-2 text-[11px] text-rose-400 font-bold">{lang === 'id' ? 'Melebihi batas pagu sebesar ' : 'Exceeded cap by '}{formatRupiah(150000)}</p>
                  </div>

                  {/* Category 4 */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white">💡 {lang === 'id' ? 'Tagihan Rutin & Listrik' : 'Utilities & Bills'}</span>
                      <span className="rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-bold">
                        {lang === 'id' ? 'Aman (61%)' : 'Safe (61%)'}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs mt-3">
                      <span className="text-slate-400">{lang === 'id' ? 'Terpakai: ' : 'Spent: '}<strong className="text-white">{formatRupiah(550000)}</strong></span>
                      <span className="text-slate-400">{lang === 'id' ? 'Pagu: ' : 'Cap: '}{formatRupiah(900000)}</span>
                    </div>
                    <Progress value={61} barClassName="bg-cyan-400" className="mt-2" />
                    <p className="mt-2 text-[11px] text-cyan-300 font-medium">{lang === 'id' ? 'Sisa anggaran: ' : 'Remaining: '}{formatRupiah(350000)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Real Target Impian (Savings Goals - Tampilan Asli Project) */}
            {previewTab === 'goals' && (
              <div className="space-y-4">
                {/* Goals Summary Stats */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 font-semibold">{lang === 'id' ? 'Total Target Tabungan' : 'Total Goal Targets'}</p>
                    <p className="text-xl sm:text-2xl font-black text-white mt-1 tabular-nums">{formatRupiah(62000000)}</p>
                    <p className="text-[11px] text-teal-400 mt-1.5">3 {lang === 'id' ? 'Target Impian Aktif' : 'Active Savings Goals'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 font-semibold">{lang === 'id' ? 'Total Dana Terkumpul' : 'Total Saved So Far'}</p>
                    <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 tabular-nums">{formatRupiah(44000000 + simulatedDeposit)}</p>
                    <p className="text-[11px] text-slate-400 mt-1.5">{lang === 'id' ? 'Sisa: ' : 'Remaining: '}{formatRupiah(Math.max(0, 18000000 - simulatedDeposit))}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 font-semibold">{lang === 'id' ? 'Rata-rata Progres' : 'Overall Progress'}</p>
                    <p className="text-xl sm:text-2xl font-black text-teal-300 mt-1">71.0%</p>
                    <Progress value={71} barClassName="bg-gradient-to-r from-teal-400 to-emerald-400" className="mt-2" />
                  </div>
                </div>

                {/* Goals Cards Grid (exact layout as dashboard.tsx) */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Goal 1: Dana Darurat */}
                  <div className="rounded-2xl border border-teal-500/30 bg-slate-950/80 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                            <Target className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white">Dana Darurat 6 Bulan</h4>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3 text-slate-500" />
                              Target: Des 2026
                            </span>
                          </div>
                        </div>
                        <span className="rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30 px-2 py-0.5 text-[10px] font-bold">
                          85%
                        </span>
                      </div>

                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="font-bold text-white tabular-nums">{formatRupiah(25500000 + simulatedDeposit)}</span>
                          <span className="text-slate-400">{formatRupiah(30000000)}</span>
                        </div>
                        <Progress value={Math.min(100, Math.round(((25500000 + simulatedDeposit) / 30000000) * 100))} barClassName="bg-gradient-to-r from-teal-400 to-emerald-400" />
                        <p className="text-[11px] text-emerald-400 font-medium pt-1">
                          Sisa {formatRupiah(Math.max(0, 4500000 - simulatedDeposit))} lagi
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-medium">BCA Prioritas</span>
                      <button
                        type="button"
                        onClick={handleSimulateDeposit}
                        className="rounded-lg bg-teal-500/15 border border-teal-500/30 hover:bg-teal-500/25 px-2.5 py-1 text-[11px] font-bold text-teal-300 transition cursor-pointer"
                      >
                        + Setor Rp 500rb
                      </button>
                    </div>
                  </div>

                  {/* Goal 2: Laptop Kerja */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <Zap className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white">MacBook Pro M3</h4>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3 text-slate-500" />
                              Target: Jun 2027
                            </span>
                          </div>
                        </div>
                        <span className="rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold">
                          65%
                        </span>
                      </div>

                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="font-bold text-white tabular-nums">{formatRupiah(14300000)}</span>
                          <span className="text-slate-400">{formatRupiah(22000000)}</span>
                        </div>
                        <Progress value={65} barClassName="bg-gradient-to-r from-cyan-400 to-blue-500" />
                        <p className="text-[11px] text-cyan-400 font-medium pt-1">
                          Sisa {formatRupiah(7700000)} lagi
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-medium">Bank Mandiri</span>
                      <span className="text-[10px] text-slate-400">Rutin Rp 1.5jt/bln</span>
                    </div>
                  </div>

                  {/* Goal 3: Liburan Akhir Tahun */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Sparkles className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white">Liburan ke Jepang</h4>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3 text-slate-500" />
                              Target: Nov 2027
                            </span>
                          </div>
                        </div>
                        <span className="rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold">
                          42%
                        </span>
                      </div>

                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="font-bold text-white tabular-nums">{formatRupiah(4200000)}</span>
                          <span className="text-slate-400">{formatRupiah(10000000)}</span>
                        </div>
                        <Progress value={42} barClassName="bg-gradient-to-r from-amber-400 to-emerald-400" />
                        <p className="text-[11px] text-amber-300 font-medium pt-1">
                          Sisa {formatRupiah(5800000)} lagi
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-medium">BCA Prioritas</span>
                      <span className="text-[10px] text-slate-400">Rutin Rp 500rb/bln</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Mobile App Showcase */}
            {previewTab === 'mobile' && (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2 rounded-full border border-amber-500/40 bg-slate-950/80 px-3 py-1.5 backdrop-blur-md shadow-lg">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-bold text-amber-300">
                      {lang === 'id' ? 'Dalam Pengembangan (Segera Hadir)' : 'In Active Development (Coming Soon)'}
                    </span>
                  </div>
                  <img
                    src="/product-hunt/4-mobile-screens.jpg"
                    alt="Qwarts Finance - Mobile App Coming Soon"
                    className="w-full h-auto object-cover rounded-2xl"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 text-xs text-slate-400">
                  <span>
                    {lang === 'id'
                      ? '📱 Pratinjau Tampilan Mobile Native (iOS & Android) — Akan dirilis segera setelah tahap beta selesai.'
                      : '📱 Native Mobile App Preview (iOS & Android) — Releasing soon after beta optimization.'}
                  </span>
                  <a
                    href="/product-hunt/4-mobile-screens.jpg"
                    download="qwarts-finance-mobile-app.jpg"
                    className="inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 font-semibold shrink-0"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Image</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Tiga Keunggulan Utama */}
      <section id="fitur" className="relative z-10 border-t border-slate-800/80 bg-slate-900/40 py-20 sm:py-28 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300 shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              <span>{t.advantages.tag}</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t.advantages.title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {t.advantages.subtitle}
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Keunggulan 1: Catat Cepat */}
            <div className="group relative rounded-3xl border border-slate-800 bg-slate-950/60 p-7 lg:p-8 backdrop-blur-xl transition duration-300 hover:border-teal-500/40 hover:bg-slate-900/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:scale-110 transition duration-300">
                    <Zap className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-300">
                    {t.advantages.card1Badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {t.advantages.card1Title}
                </h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                  {t.advantages.card1Desc}
                </p>
              </div>
              <ul className="mt-6 pt-5 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>{t.advantages.card1Point1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>{t.advantages.card1Point2}</span>
                </li>
              </ul>
            </div>

            {/* Keunggulan 2: Multi-Dompet */}
            <div className="group relative rounded-3xl border border-slate-800 bg-slate-950/60 p-7 lg:p-8 backdrop-blur-xl transition duration-300 hover:border-cyan-500/40 hover:bg-slate-900/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition duration-300">
                    <PieChart className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300">
                    {t.advantages.card2Badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {t.advantages.card2Title}
                </h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                  {t.advantages.card2Desc}
                </p>
              </div>
              <ul className="mt-6 pt-5 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>{t.advantages.card2Point1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>{t.advantages.card2Point2}</span>
                </li>
              </ul>
            </div>

            {/* Keunggulan 3: Budget & Target */}
            <div className="group relative rounded-3xl border border-slate-800 bg-slate-950/60 p-7 lg:p-8 backdrop-blur-xl transition duration-300 hover:border-emerald-500/40 hover:bg-slate-900/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition duration-300">
                    <Target className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-300">
                    {t.advantages.card3Badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {t.advantages.card3Title}
                </h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                  {t.advantages.card3Desc}
                </p>
              </div>
              <ul className="mt-6 pt-5 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{t.advantages.card3Point1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{t.advantages.card3Point2}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pricing Section */}
      <section id="harga" className="relative z-10 border-t border-slate-800/80 py-20 sm:py-28 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300 shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              <span>{t.pricing.badge}</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t.pricing.title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
              {t.pricing.subtitle}
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-8 max-w-5xl mx-auto items-stretch">
            {/* 1. Paket Starter (Free) */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/50 p-8 sm:p-10 backdrop-blur-xl transition hover:border-slate-700">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">{t.pricing.freeTitle}</span>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                    {t.pricing.freeBadge}
                  </span>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {t.pricing.freeDesc}
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-white">{t.pricing.freePrice}</span>
                  <span className="text-xs font-medium text-slate-400">{t.pricing.freePricePeriod}</span>
                </div>

                <div className="mt-8 space-y-3.5 border-t border-slate-800/80 pt-8 text-xs sm:text-sm text-slate-300">
                  <p className="font-semibold text-teal-400 text-xs uppercase tracking-wider mb-2">
                    {t.pricing.includedTitle}
                  </p>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>{t.pricing.fInc1}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>{t.pricing.fInc2}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>{t.pricing.fInc3}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>{t.pricing.fInc4}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>{t.pricing.fInc5}</span>
                  </div>

                  <p className="font-semibold text-slate-500 text-xs uppercase tracking-wider pt-3 mb-2">
                    {t.pricing.notIncludedTitle}
                  </p>
                  <div className="flex items-center gap-3 text-slate-500">
                    <X className="h-4 w-4 shrink-0 text-slate-600" />
                    <span>{t.pricing.fExc1}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <X className="h-4 w-4 shrink-0 text-slate-600" />
                    <span>{t.pricing.fExc2}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <X className="h-4 w-4 shrink-0 text-slate-600" />
                    <span>{t.pricing.fExc3}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <X className="h-4 w-4 shrink-0 text-slate-600" />
                    <span>{t.pricing.fExc4}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <X className="h-4 w-4 shrink-0 text-slate-600" />
                    <span>{t.pricing.fExc5}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href="/sign-in"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 py-3.5 text-sm font-bold text-white transition hover:bg-slate-700 hover:text-white"
                >
                  <span>{t.pricing.freeCta}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* 2. Paket PRO */}
            <div className="relative flex flex-col justify-between rounded-3xl border-2 border-teal-500/60 bg-gradient-to-b from-teal-950/40 via-slate-900/90 to-slate-950 p-8 sm:p-10 shadow-2xl shadow-teal-500/10 backdrop-blur-xl">
              <div className="absolute -top-3.5 right-8">
                <span className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1 text-xs font-black text-slate-950 uppercase tracking-wider shadow-md shadow-amber-500/30 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 fill-slate-950 text-slate-950" />
                  {t.pricing.proPopularBadge}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{t.pricing.proTitle}</span>
                    <span className="rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 border border-amber-500/30">
                      PRO
                    </span>
                  </span>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {t.pricing.proDesc}
                </p>

                {/* Harga Bulanan dan Tahunan */}
                <div className="mt-6 rounded-2xl border border-teal-500/30 bg-teal-950/30 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-teal-500/20 pb-3">
                    <div>
                      <span className="text-xs text-slate-400">{t.pricing.proMonthlyLabel}</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-3xl font-black text-white">{t.pricing.proMonthlyPrice}</span>
                        <span className="text-xs font-medium text-slate-400">{t.pricing.proMonthlyPeriod}</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-amber-300 font-semibold">{t.pricing.proYearlyLabel}</span>
                      <div className="flex items-baseline gap-1 mt-0.5 sm:justify-end">
                        <span className="text-2xl font-black text-emerald-400">{t.pricing.proYearlyPrice}</span>
                        <span className="text-xs font-medium text-slate-400">{t.pricing.proYearlyPeriod}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-teal-300 font-medium">
                    {t.pricing.proYearlyEquivalent}
                  </p>
                </div>

                <div className="mt-8 space-y-3.5 border-t border-teal-500/20 pt-8 text-xs sm:text-sm text-slate-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span className="font-semibold text-white">{t.pricing.proFeature1}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>
                      <strong className="text-white">{t.pricing.proFeature2Bold}</strong>
                      {t.pricing.proFeature2Text}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>
                      <strong className="text-white">{t.pricing.proFeature3Bold}</strong>
                      {t.pricing.proFeature3Text}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>
                      <strong className="text-white">{t.pricing.proFeature4Bold}</strong>
                      {t.pricing.proFeature4Text}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>
                      <strong className="text-white">{t.pricing.proFeature5Bold}</strong>
                      {t.pricing.proFeature5Text}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>
                      <strong className="text-white">{t.pricing.proFeature6Bold}</strong>
                      {t.pricing.proFeature6Text}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    <span>
                      <strong className="text-white">{t.pricing.proFeature7Bold}</strong>
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
                  <span>{t.pricing.proCta}</span>
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400 max-w-xl mx-auto">
            {t.pricing.bottomNote}
          </p>
        </div>
      </section>


      {/* 4.5. Testimonial Section */}
      <section className="relative z-10 border-t border-slate-800/80 py-20 sm:py-24 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-300 mb-4">
              <Quote className="h-3.5 w-3.5 text-teal-400" />
              <span>{lang === 'id' ? 'Kata Pengguna Kami' : 'What Our Users Say'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {lang === 'id' ? 'Ribuan Pengguna Sudah Merasakannya' : 'Thousands Already Love It'}
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              {lang === 'id'
                ? 'Dari karyawan swasta, freelancer, hingga mahasiswa — Qwarts Finance membantu semua orang lebih sadar keuangannya.'
                : 'From employees and freelancers to students — Qwarts Finance helps everyone become more financially aware.'}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg hover:border-teal-500/30 transition">
              <div className="flex items-start gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-4 w-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {lang === 'id'
                  ? '"Akhirnya nemu aplikasi yang beneran simpel tapi lengkap. Fitur Budget Bulanan banget ngebantu ngontrol pengeluaran biar nggak boncos sebelum tanggal gajian."'
                  : '"Finally found an app that\'s genuinely simple yet complete. The monthly budget feature really helps me control spending before payday."'}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-white font-black text-sm">
                  A
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Arief R.</p>
                  <p className="text-[11px] text-slate-500">{lang === 'id' ? 'Software Engineer, Jakarta' : 'Software Engineer, Jakarta'}</p>
                </div>
                <span className="ml-auto rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold text-amber-400">PRO</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg hover:border-teal-500/30 transition">
              <div className="flex items-start gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-4 w-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {lang === 'id'
                  ? '"Sebagai freelancer yang penghasilannya tidak tetap, fitur Target Impian di sini sangat membantu saya memisahkan uang untuk beli laptop kerja baru. Progress bar-nya bikin semangat nabung!"'
                  : '"As a freelancer with variable income, the Savings Goals feature helps me set aside money for a new work laptop. The progress bar keeps me motivated!"'}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-violet-500 to-indigo-400 text-white font-black text-sm">
                  S
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Sari N.</p>
                  <p className="text-[11px] text-slate-500">{lang === 'id' ? 'UI/UX Designer, Bandung' : 'UI/UX Designer, Bandung'}</p>
                </div>
                <span className="ml-auto rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold text-amber-400">PRO</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg hover:border-teal-500/30 transition">
              <div className="flex items-start gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`h-4 w-4 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-600 fill-slate-600'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {lang === 'id'
                  ? '"Tadinya pakai Excel manual, sekarang udah full pindah ke Qwarts. Login Google tinggal satu klik, langsung bisa catat. Versi gratisnya aja sudah lebih dari cukup buat kebutuhan harian saya."'
                  : '"Used to use manual Excel, now fully switched to Qwarts. Google login is one click, then I can immediately start logging. The free version alone is more than enough for my daily needs."'}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 text-white font-black text-sm">
                  F
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Fadhil M.</p>
                  <p className="text-[11px] text-slate-500">{lang === 'id' ? 'Mahasiswa, Surabaya' : 'Student, Surabaya'}</p>
                </div>
                <span className="ml-auto rounded-full bg-slate-700/80 border border-slate-600 px-2 py-0.5 text-[9px] font-bold text-slate-300">FREE</span>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg hover:border-teal-500/30 transition sm:col-span-2 lg:col-span-1">
              <div className="flex items-start gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-4 w-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {lang === 'id'
                  ? '"Fitur Tagihan Rutin-nya jadi lifesaver! Dulu sering lupa bayar iuran BPJS dan WiFi. Sekarang semuanya tercatat dan ada peringatannya. Harga PRO-nya juga sangat worth it."'
                  : '"The Recurring Bills feature is a lifesaver! I used to forget paying BPJS and WiFi bills. Now everything is tracked with reminders. The PRO price is very worth it."'}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white font-black text-sm">
                  R
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Rina P.</p>
                  <p className="text-[11px] text-slate-500">{lang === 'id' ? 'Ibu Rumah Tangga, Medan' : 'Homemaker, Medan'}</p>
                </div>
                <span className="ml-auto rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold text-amber-400">PRO</span>
              </div>
            </div>

            {/* Testimonial 5 */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg hover:border-teal-500/30 transition">
              <div className="flex items-start gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-4 w-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {lang === 'id'
                  ? '"Bisa akses dari HP tanpa instal aplikasi itu big plus buat saya. Tampilannya bersih, data privat, dan sync langsung. Sangat direkomendasikan untuk yang baru mau mulai atur keuangan!"'
                  : '"Being able to access from my phone without installing an app is a big plus. Clean UI, private data, instant sync. Highly recommended for anyone starting to manage their finances!"'}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 text-white font-black text-sm">
                  B
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Bagas W.</p>
                  <p className="text-[11px] text-slate-500">{lang === 'id' ? 'Marketing, Yogyakarta' : 'Marketing, Yogyakarta'}</p>
                </div>
                <span className="ml-auto rounded-full bg-slate-700/80 border border-slate-600 px-2 py-0.5 text-[9px] font-bold text-slate-300">FREE</span>
              </div>
            </div>

            {/* Testimonial 6 — wide CTA card */}
            <div className="relative rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-950/60 to-slate-900 p-6 flex flex-col items-center justify-center text-center gap-4">
              <div className="flex -space-x-2">
                {['A', 'S', 'F', 'R', 'B'].map((l, i) => (
                  <div key={i} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 text-white font-black text-xs ${['bg-teal-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500'][i]}`}>{l}</div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {lang === 'id' ? 'Bergabung dengan pengguna aktif Qwarts Finance' : 'Join active Qwarts Finance users'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'id' ? 'Gratis selamanya • Tanpa kartu kredit' : 'Free forever • No credit card'}
                </p>
              </div>
              <Link
                href="/sign-in"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:brightness-110 shadow-lg shadow-teal-500/20 transition"
              >
                <span>{lang === 'id' ? 'Mulai Gratis Sekarang' : 'Start Free Now'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Short FAQ Section */}
      <section id="faq" className="relative z-10 border-t border-slate-800/80 bg-slate-900/30 py-20 sm:py-28 scroll-mt-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-xs font-bold uppercase tracking-widest text-teal-400">
              {t.faq.tag}
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {t.faq.title}
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              {t.faq.subtitle}
            </p>
          </div>

          <div className="mt-12">
            <Accordion defaultValue={["faq-0"]} multiple className="space-y-3">
              {t.faq.items.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-5 shadow-sm transition hover:border-slate-700/80"
                >
                  <AccordionTrigger className="text-base font-semibold text-white">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-slate-300 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Closing CTA Banner */}
      <section className="relative z-10 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-r from-teal-950/80 via-slate-900/90 to-emerald-950/80 p-8 text-center sm:p-14 shadow-2xl backdrop-blur-xl">
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {t.ctaBanner.title}
              </h2>
              <p className="mt-4 text-slate-300 text-sm sm:text-base">
                {t.ctaBanner.subtitle}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/sign-in"
                  className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-white px-8 py-4 text-sm font-bold text-slate-950 shadow-xl transition hover:bg-slate-100 active:scale-95"
                >
                  <GoogleIcon className="h-5 w-5" />
                  <span>{t.ctaBanner.cta}</span>
                </Link>
              </div>
              <p className="mt-4 text-xs text-slate-400">
                {t.ctaBanner.note}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified, Professional Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 pt-16 pb-12 text-slate-400 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 lg:gap-12 pb-12 border-b border-slate-800/80">
            {/* Kolom 1: Brand & Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-white font-black text-sm shadow-md shadow-teal-500/20">
                  Q
                </div>
                <span className="text-lg font-black tracking-tight text-white">
                  Qwarts <span className="text-teal-400">Finance</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                {t.footer.brandDesc}
              </p>
              <Link
                href="/status"
                title={lang === 'id' ? 'Lihat status sistem & uptime' : 'View live system status & uptime'}
                className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-3 py-1 text-[11px] font-medium text-teal-300 hover:border-teal-500/50 hover:bg-teal-500/10 transition"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t.footer.statusActive}
              </Link>
            </div>

            {/* Kolom 2: Navigasi */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
                {t.footer.colNavTitle}
              </h4>
              <ul className="space-y-2.5">
                <li><a href="#fitur" className="hover:text-teal-400 transition">{t.footer.navFeatures}</a></li>
                <li><a href="#preview" className="hover:text-teal-400 transition">{t.footer.navDashboard}</a></li>
                <li><a href="#harga" className="hover:text-teal-400 transition">{t.footer.navPricing}</a></li>
                <li><a href="#faq" className="hover:text-teal-400 transition">{t.footer.navFaq}</a></li>
                <li><Link href="/demo" className="hover:text-teal-400 transition">{lang === 'id' ? 'Demo Interaktif' : 'Interactive Demo'}</Link></li>
                <li><Link href="/privacy" className="hover:text-teal-400 transition">{t.footer.privacyPolicy}</Link></li>
                <li><Link href="/terms" className="hover:text-teal-400 transition">{t.footer.termsOfService}</Link></li>
                <li><Link href="/status" className="hover:text-teal-400 transition">{lang === 'id' ? 'Status Sistem' : 'System Status'}</Link></li>
              </ul>
            </div>

            {/* Kolom 3: Kontak Support Resmi & Legal Notice */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {t.footer.colContactTitle}
              </h4>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-teal-400 shrink-0" />
                  <a href="mailto:mails@qwarts.my.id" className="hover:text-teal-300 transition">
                    mails@qwarts.my.id
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                  <a href="https://wa.me/6281776370728" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition">
                    +62 817-7637-0728 ({t.footer.whatsappTitle})
                  </a>
                </li>
              </ul>
              <div className="pt-2 text-xs text-slate-500 leading-relaxed">
                <span>{t.footer.legalNote} </span>
                <Link href="/privacy" className="font-semibold text-teal-400 hover:text-teal-300 underline">
                  {t.footer.privacyPolicy}
                </Link>
                {' '}
                {lang === 'id' ? 'dan' : 'and'}
                {' '}
                <Link href="/terms" className="font-semibold text-teal-400 hover:text-teal-300 underline">
                  {t.footer.termsOfService}
                </Link>.
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p>© {new Date().getFullYear()} {t.footer.copyright}</p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-slate-400">
              <button
                type="button"
                onClick={() => handleLanguageChange(lang === 'id' ? 'en' : 'id')}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-teal-500/40 hover:text-white transition cursor-pointer"
              >
                <Languages className="h-3.5 w-3.5 text-teal-400" />
                <span>{lang === 'id' ? 'English (US)' : 'Bahasa Indonesia'}</span>
              </button>
              <Link href="/status" className="hover:text-white transition">{lang === 'id' ? 'Status Sistem' : 'System Status'}</Link>
              <Link href="/demo" className="hover:text-white transition">{lang === 'id' ? 'Demo' : 'Demo'}</Link>
              <Link href="/privacy" className="hover:text-white transition">{t.footer.privacyPolicy}</Link>
              <Link href="/terms" className="hover:text-white transition">{t.footer.termsOfService}</Link>
              <Link href="/sign-in" className="hover:text-white transition">{t.footer.enterDashboard}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
