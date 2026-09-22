'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  Download,
  FileSpreadsheet,
  Languages,
  Lock,
  Mail,
  MapPin,
  Phone,
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
import { landingTranslations, type LandingLanguage } from '@/lib/landing-translations'

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
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [lang, setLang] = useState<LandingLanguage>('id')
  const [previewTab, setPreviewTab] = useState<'interactive' | 'overview' | 'budget' | 'goals' | 'mobile'>('interactive')

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
              {t.nav.features}
            </a>
            <a href="#panduan" className="transition hover:text-white">
              {lang === 'id' ? 'Panduan' : 'Guide'}
            </a>
            <a href="#preview" className="transition hover:text-white">
              {t.nav.dashboard}
            </a>
            <a href="#cara-kerja" className="transition hover:text-white">
              {t.nav.howItWorks}
            </a>
            <a href="#harga" className="transition hover:text-white">
              {t.nav.pricing}
            </a>
            <a href="#privasi" className="transition hover:text-white">
              {t.nav.privacy}
            </a>
            <a href="#faq" className="transition hover:text-white">
              {t.nav.faq}
            </a>
            <a href="#kontak" className="transition hover:text-white">
              {t.nav.contact}
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => handleLanguageChange(lang === 'id' ? 'en' : 'id')}
              title={lang === 'id' ? 'Switch to English' : 'Beralih ke Bahasa Indonesia'}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/80 px-2.5 py-1.5 text-xs font-semibold text-slate-200 shadow-sm backdrop-blur-md transition hover:border-teal-500/50 hover:bg-slate-800 hover:text-white cursor-pointer"
              aria-label={lang === 'id' ? 'Switch to English' : 'Beralih ke Bahasa Indonesia'}
            >
              <Languages className="h-4 w-4 text-teal-400" />
              <span>{lang === 'id' ? '🇮🇩 ID' : '🇺🇸 EN'}</span>
            </button>

            <Link
              href="/sign-in"
              className="rounded-xl px-3 py-2 sm:px-4 sm:py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              {t.nav.signIn}
            </Link>
            <Link
              href="/sign-in"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-3.5 py-2 sm:px-4 sm:py-2 text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition hover:from-teal-400 hover:to-emerald-500 active:scale-95"
            >
              <span>{t.nav.getStarted}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          {/* Top Badges Row: Product Hunt Launch Badge + Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a
              href="https://www.producthunt.com/products/qwarts-finance"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-300 shadow-sm backdrop-blur-md transition hover:border-orange-500/60 hover:bg-orange-500/20 hover:scale-105 cursor-pointer"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6154] text-white font-black text-[10px] shadow-sm">
                P
              </span>
              <span>Featured on <strong className="text-white font-bold">Product Hunt</strong></span>
              <span className="text-orange-500/60">•</span>
              <span className="text-orange-400 font-normal">Upvote 🚀</span>
            </a>

            {/* SEO Badges */}
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1 text-xs font-semibold text-teal-300 shadow-sm backdrop-blur-md">
              <span>{t.hero.badge1}</span>
              <span className="text-slate-500">•</span>
              <span>{t.hero.badge2}</span>
              <span className="text-slate-500">•</span>
              <span>{t.hero.badge3}</span>
            </div>
          </div>

          {/* Heading Manfaat (Target Search Keywords: cara mencatat pengeluaran harian, aplikasi budgeting bulanan) */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            {t.hero.headlinePrefix}
            <span className="bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {t.hero.headlineGradient}
            </span>
          </h1>

          {/* Subtitle Solution & Value Proposition */}
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-300">
            {t.hero.subtitle}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
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
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{t.hero.trust1}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              <span>{t.hero.trust2}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span>{t.hero.trust3}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview Mockup Showcase with Product Hunt Gallery Tabs */}
        <div id="preview" className="mt-16 sm:mt-20">
          {/* Gallery Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => setPreviewTab('interactive')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                previewTab === 'interactive'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/25'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {lang === 'id' ? '⚡ Simulasi Interaktif' : '⚡ Interactive Demo'}
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('overview')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                previewTab === 'overview'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/25'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {lang === 'id' ? '📊 Dashboard Utama' : '📊 Dashboard Overview'}
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('budget')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                previewTab === 'budget'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/25'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {lang === 'id' ? '🎯 Budget Planner' : '🎯 Budget Planner'}
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('goals')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                previewTab === 'goals'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/25'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {lang === 'id' ? '🏆 Target Impian' : '🏆 Savings Goals'}
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('mobile')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                previewTab === 'mobile'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/25'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{lang === 'id' ? '📱 Mobile App' : '📱 Mobile App'}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${
                previewTab === 'mobile'
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}>
                {lang === 'id' ? 'Segera Hadir' : 'Coming Soon'}
              </span>
            </button>
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
                <span className="h-2 w-2 rounded-full bg-teal-400" />
                <span>
                  {previewTab === 'interactive'
                    ? t.hero.mockupBadge
                    : previewTab === 'overview'
                    ? 'Preview: Dashboard Overview'
                    : previewTab === 'budget'
                    ? 'Preview: Budget Planner'
                    : previewTab === 'goals'
                    ? 'Preview: Target Impian (Savings Goals)'
                    : 'Preview: Mobile App Showcase'}
                </span>
              </div>
            </div>

            {/* Tab 1: Interactive Live Mockup */}
            {previewTab === 'interactive' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Total Saldo */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {t.hero.mockupNetWorthTitle}
                    </p>
                    <p className="mt-2 text-3xl font-black text-white">Rp 28.750.000</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>{t.hero.mockupNetWorthGrowth}</span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span>{t.hero.mockupActiveWallets}</span>
                      <span className="text-teal-400 font-medium">{t.hero.mockupActiveWalletsValue}</span>
                    </div>
                  </div>

                  {/* Card 2: Pemasukan & Pengeluaran */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <span>{t.hero.mockupCashFlowTitle}</span>
                      <span className="rounded bg-teal-500/10 px-2 py-0.5 text-teal-400">{t.hero.mockupCashFlowMonth}</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{t.hero.mockupIncome}</span>
                        <span className="font-bold text-emerald-400">+Rp 12.500.000</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{t.hero.mockupExpense}</span>
                        <span className="font-bold text-rose-400">-Rp 4.050.000</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                        <div className="bg-teal-400 h-2 rounded-full w-[32%]" />
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] text-slate-400">{t.hero.mockupChartNote}</p>
                  </div>

                  {/* Card 3: Target Impian (Goals - PRO) */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {t.hero.mockupGoalsTitle}
                      </span>
                      <Target className="h-4 w-4 text-teal-400" />
                    </div>
                    <p className="mt-2 text-lg font-bold text-white">{t.hero.mockupGoalsName}</p>
                    <div className="mt-2 flex items-center justify-between text-xs font-semibold">
                      <span className="text-teal-300">Rp 17.000.000</span>
                      <span className="text-slate-400">{t.hero.mockupGoalsTarget}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                      <div className="bg-gradient-to-r from-teal-400 to-emerald-400 h-2 rounded-full w-[85%]" />
                    </div>
                    <p className="mt-2 text-[11px] text-emerald-400 font-medium">
                      {t.hero.mockupGoalsAchieved}
                    </p>
                  </div>
                </div>

                {/* Bottom mini showcase: Recent transactions */}
                <div className="mt-4 rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4">
                  <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>{t.hero.mockupTxTitle}</span>
                    <span className="text-slate-500 font-medium text-[11px]">{t.hero.mockupTxSub}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center justify-between rounded-xl bg-slate-900/80 p-3 border border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-white">{t.hero.mockupTx1Title}</p>
                          <p className="text-[10px] text-slate-400">{t.hero.mockupTx1Cat}</p>
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
                          <p className="text-xs font-bold text-white">{t.hero.mockupTx2Title}</p>
                          <p className="text-[10px] text-slate-400">{t.hero.mockupTx2Cat}</p>
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
                          <p className="text-xs font-bold text-white">{t.hero.mockupTx3Title}</p>
                          <p className="text-[10px] text-slate-400">{t.hero.mockupTx3Cat}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-rose-400">-375.000</span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-center text-xs font-medium text-slate-500">
                  {t.hero.mockupDisclaimer}
                </p>
              </>
            )}

            {/* Tab 2: Dashboard Overview Screenshot */}
            {previewTab === 'overview' && (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                  <img
                    src="/product-hunt/1-dashboard-overview.jpg"
                    alt="Qwarts Finance - Dashboard Overview"
                    className="w-full h-auto object-cover rounded-2xl"
                  />
                </div>
                <div className="flex items-center justify-between px-2 text-xs text-slate-400">
                  <span>Dashboard Overview — Net Worth, Cash Flow, Multi-Wallets</span>
                  <a
                    href="/product-hunt/1-dashboard-overview.jpg"
                    download="qwarts-finance-dashboard.jpg"
                    className="inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 font-semibold"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Image</span>
                  </a>
                </div>
              </div>
            )}

            {/* Tab 3: Budget Planner Screenshot */}
            {previewTab === 'budget' && (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                  <img
                    src="/product-hunt/2-budget-analytics.jpg"
                    alt="Qwarts Finance - Budget Planner & Analytics"
                    className="w-full h-auto object-cover rounded-2xl"
                  />
                </div>
                <div className="flex items-center justify-between px-2 text-xs text-slate-400">
                  <span>Monthly Budget Planner — Category Spending Caps & Overbudget Warning</span>
                  <a
                    href="/product-hunt/2-budget-analytics.jpg"
                    download="qwarts-finance-budget-planner.jpg"
                    className="inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 font-semibold"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Image</span>
                  </a>
                </div>
              </div>
            )}

            {/* Tab 4: Savings Goals Screenshot */}
            {previewTab === 'goals' && (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                  <img
                    src="/product-hunt/3-savings-goals.jpg"
                    alt="Qwarts Finance - Savings Goals (Target Impian)"
                    className="w-full h-auto object-cover rounded-2xl"
                  />
                </div>
                <div className="flex items-center justify-between px-2 text-xs text-slate-400">
                  <span>Savings Goals (Target Impian) — Milestone Visualizer & Emergency Fund</span>
                  <a
                    href="/product-hunt/3-savings-goals.jpg"
                    download="qwarts-finance-savings-goals.jpg"
                    className="inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 font-semibold"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Image</span>
                  </a>
                </div>
              </div>
            )}

            {/* Tab 5: Mobile App Screenshot */}
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

      {/* Educational SEO Guide Section: Mengapa Cara Mencatat Pengeluaran & Budgeting Penting */}
      <section id="panduan" className="relative z-10 border-t border-slate-800/80 bg-slate-900/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300">
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              <span>{t.seoSection.tag}</span>
            </div>
            <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              {t.seoSection.title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              {t.seoSection.subtitle}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 backdrop-blur-sm transition hover:border-teal-500/40">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 mb-4">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{t.seoSection.card1Title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t.seoSection.card1Desc}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 backdrop-blur-sm transition hover:border-teal-500/40">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4">
                <PieChart className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{t.seoSection.card2Title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t.seoSection.card2Desc}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 backdrop-blur-sm transition hover:border-teal-500/40">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-4">
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{t.seoSection.card3Title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t.seoSection.card3Desc}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 backdrop-blur-sm transition hover:border-teal-500/40">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 mb-4">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{t.seoSection.card4Title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t.seoSection.card4Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section (Section D) */}
      <section className="relative z-10 border-t border-slate-800/80 bg-slate-900/20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-3.5 py-1 text-xs font-semibold text-teal-400">
              <Users className="h-3.5 w-3.5" />
              <span>{t.socialProof.tag}</span>
            </div>
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white">
              {t.socialProof.title}
            </h2>
          </div>

          {/* 3 Bullet "Cocok Untuk" */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <div className="h-2 w-10 bg-teal-400 rounded-full mb-4" />
              <h3 className="text-base font-bold text-white">{t.socialProof.card1Title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t.socialProof.card1Desc}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <div className="h-2 w-10 bg-emerald-400 rounded-full mb-4" />
              <h3 className="text-base font-bold text-white">{t.socialProof.card2Title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t.socialProof.card2Desc}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <div className="h-2 w-10 bg-cyan-400 rounded-full mb-4" />
              <h3 className="text-base font-bold text-white">{t.socialProof.card3Title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t.socialProof.card3Desc}
              </p>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {t.socialProof.testimonials.map((item, idx) => (
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
            <div className="text-xs font-bold uppercase tracking-widest text-teal-400">
              {t.features.tag}
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {t.features.title}
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              {t.features.subtitle}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-7 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 transition">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-bold text-teal-300">
                    {t.features.f1Badge}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">{t.features.f1Title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  {t.features.f1Desc}
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-7 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-[11px] font-bold text-cyan-300">
                    {t.features.f2Badge}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">{t.features.f2Title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  {t.features.f2Desc}
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-7 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition">
                    <PieChart className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-extrabold text-amber-300">
                    {t.features.f3Badge}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">{t.features.f3Title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  {t.features.f3Desc}
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-7 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition">
                    <Target className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-extrabold text-amber-300">
                    {t.features.f4Badge}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">{t.features.f4Title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  {t.features.f4Desc}
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-7 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 transition">
                    <Zap className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-extrabold text-amber-300">
                    {t.features.f5Badge}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">{t.features.f5Title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  {t.features.f5Desc}
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-7 shadow-lg transition hover:border-teal-500/40 hover:bg-slate-900/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition">
                    <Download className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-extrabold text-amber-300">
                    {t.features.f6Badge}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">{t.features.f6Title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  {t.features.f6Desc}
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
            <div className="text-xs font-bold uppercase tracking-widest text-teal-400">
              {t.howItWorks.tag}
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {t.howItWorks.title}
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center backdrop-blur-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-2xl font-black text-teal-400 border border-teal-500/20">
                1
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">{t.howItWorks.step1Title}</h3>
              <p className="mt-2 text-sm text-slate-400">
                {t.howItWorks.step1Desc}
              </p>
            </div>

            <div className="relative rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center backdrop-blur-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl font-black text-emerald-400 border border-emerald-500/20">
                2
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">{t.howItWorks.step2Title}</h3>
              <p className="mt-2 text-sm text-slate-400">
                {t.howItWorks.step2Desc}
              </p>
            </div>

            <div className="relative rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center backdrop-blur-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                3
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">{t.howItWorks.step3Title}</h3>
              <p className="mt-2 text-sm text-slate-400">
                {t.howItWorks.step3Desc}
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
              <span>{t.pricing.badge}</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
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

                {/* Harga Bulanan dan Tahunan Berdampingan */}
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

          {/* Catatan di Bawah Kartu */}
          <p className="mt-8 text-center text-xs text-slate-400 max-w-xl mx-auto">
            {t.pricing.bottomNote}
          </p>
        </div>
      </section>

      {/* Keamanan & Privasi Section (Section H) */}
      <section id="privasi" className="relative z-10 border-t border-slate-800/80 bg-slate-900/30 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300">
              <Shield className="h-3.5 w-3.5 text-teal-400" />
              <span>{t.privacy.tag}</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {t.privacy.title}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400">
              {t.privacy.subtitle}
            </p>
          </div>

          {/* 4 Poin Konkret */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{t.privacy.card1Title}</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                {t.privacy.card1Desc}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{t.privacy.card2Title}</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                {t.privacy.card2Desc}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-4">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{t.privacy.card3Title}</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                {t.privacy.card3Desc}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-4">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{t.privacy.card4Title}</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                {t.privacy.card4Desc}
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-teal-400 hover:text-teal-300 transition"
            >
              <span>{t.privacy.readPolicy}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 border-t border-slate-800/80 bg-slate-900/30 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-xs font-bold uppercase tracking-widest text-teal-400">
              {t.faq.tag}
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {t.faq.title}
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {t.faq.items.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left text-base font-semibold text-white transition hover:text-teal-300 cursor-pointer"
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

      {/* Contact & Support Section */}
      <section id="kontak" className="relative z-10 border-t border-slate-800/80 bg-slate-900/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="text-xs font-bold uppercase tracking-widest text-teal-400">
              {t.contact.tag}
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {t.contact.title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-400">
              {t.contact.subtitle}
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Email Support */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-6 backdrop-blur-md transition hover:border-teal-500/50">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 mb-4">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white">{t.contact.emailTitle}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {t.contact.emailDesc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <a
                  href="mailto:mails@qwarts.my.id"
                  className="text-sm font-semibold text-teal-400 hover:text-teal-300 transition break-all"
                >
                  mails@qwarts.my.id
                </a>
              </div>
            </div>

            {/* Telepon / WhatsApp */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-6 backdrop-blur-md transition hover:border-teal-500/50">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4">
                  <Phone className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white">{t.contact.phoneTitle}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {t.contact.phoneDesc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <a
                  href="https://wa.me/6281776370728"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition"
                >
                  +62 817-7637-0728
                </a>
                <span className="text-[11px] text-slate-400">{t.contact.phoneBadge}</span>
              </div>
            </div>

            {/* Alamat Usaha / Kantor */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-6 backdrop-blur-md transition hover:border-teal-500/50 sm:col-span-2 lg:col-span-1">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-4">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white">{t.contact.addressTitle}</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  {t.contact.addressDesc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
                <Clock className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                <span>{t.contact.officeHours}</span>
              </div>
            </div>
          </div>

          {/* Payment Gateway Trust Badge */}
          <div className="mt-10 rounded-2xl border border-slate-800/80 bg-slate-950/50 p-5 text-center flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-400">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              {t.contact.paymentGatewayBadge}
            </span>
            <span className="text-slate-300">
              {t.contact.paymentGatewayDesc}
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 pt-16 pb-12 text-slate-400 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12 pb-12 border-b border-slate-800/80">
            {/* Kolom 1: Brand & Profil Usaha */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-white font-black text-sm shadow-md shadow-teal-500/20">
                  Q
                </div>
                <span className="text-lg font-black tracking-tight text-white">
                  Qwarts <span className="text-teal-400">Finance</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
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

            {/* Kolom 2: Navigasi Halaman */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
                {t.footer.colNavTitle}
              </h4>
              <ul className="space-y-2.5">
                <li><a href="#fitur" className="hover:text-teal-400 transition">{t.footer.navFeatures}</a></li>
                <li><a href="#panduan" className="hover:text-teal-400 transition">{lang === 'id' ? 'Panduan Budgeting' : 'Budgeting Guide'}</a></li>
                <li><a href="#preview" className="hover:text-teal-400 transition">{t.footer.navDashboard}</a></li>
                <li><a href="#harga" className="hover:text-teal-400 transition">{t.footer.navPricing}</a></li>
                <li><a href="#faq" className="hover:text-teal-400 transition">{t.footer.navFaq}</a></li>
                <li><Link href="/status" className="hover:text-teal-400 transition">{lang === 'id' ? 'Status Sistem' : 'System Status'}</Link></li>
                <li><a href="#kontak" className="hover:text-teal-400 transition">{t.footer.navContact}</a></li>
              </ul>
            </div>

            {/* Kolom 3: Kontak Support Resmi */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
                {t.footer.colContactTitle}
              </h4>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                  <a href="mailto:mails@qwarts.my.id" className="hover:text-teal-300 transition break-all">
                    mails@qwarts.my.id
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <a href="https://wa.me/6281776370728" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition">
                    +62 817-7637-0728 (WhatsApp)
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>{t.contact.officeHours}</span>
                </li>
              </ul>
            </div>

            {/* Kolom 4: Alamat Usaha & Legal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
                {t.footer.colAddressTitle}
              </h4>
              <div className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
                <p className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{t.contact.addressDesc}</span>
                </p>
                <div className="pt-2">
                  <Link href="/privacy" className="font-medium text-teal-400 hover:text-teal-300 underline">
                    {t.footer.privacyPolicy}
                  </Link>
                </div>
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
              <Link href="/privacy" className="hover:text-white transition">{t.footer.privacyPolicy}</Link>
              <a href="#kontak" className="hover:text-white transition">{t.footer.helpContact}</a>
              <Link href="/sign-in" className="hover:text-white transition">{t.footer.enterDashboard}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
