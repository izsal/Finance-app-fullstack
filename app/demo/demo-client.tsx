'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from '@yusufceng1z/ding-react'
import {
  AlertCircle,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  Languages,
  LayoutDashboard,
  PiggyBank,
  Plus,
  Receipt,
  RefreshCw,
  Settings2,
  Sparkles,
  Tag,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'

type Tab = 'Overview' | 'Transaksi' | 'Budget' | 'Target Impian' | 'Tagihan Rutin'
type Lang = 'id' | 'en'

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatRp(v: number, hidden = false) {
  if (hidden) return '••••••••'
  return `Rp ${new Intl.NumberFormat('id-ID').format(v)}`
}

function ProgressBar({ value, color = 'teal' }: { value: number; color?: string }) {
  const colorMap: Record<string, string> = {
    teal: 'bg-teal-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-500',
    cyan: 'bg-cyan-400',
  }
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorMap[color] ?? 'bg-teal-400'}`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  )
}

// ─── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_TRANSACTIONS = [
  { id: 1, desc: 'Gaji Bulanan', cat: 'Pemasukan', wallet: 'BCA', type: 'income', amount: 10000000, date: '25 Okt' },
  { id: 2, desc: 'Belanja Supermarket', cat: 'Makanan', wallet: 'Mandiri', type: 'expense', amount: 850000, date: '24 Okt' },
  { id: 3, desc: 'WiFi & Listrik PLN', cat: 'Tagihan', wallet: 'GoPay', type: 'expense', amount: 375000, date: '22 Okt' },
  { id: 4, desc: 'Side Project Freelance', cat: 'Pemasukan', wallet: 'BCA', type: 'income', amount: 2500000, date: '20 Okt' },
  { id: 5, desc: 'Netflix + Spotify', cat: 'Hiburan', wallet: 'GoPay', type: 'expense', amount: 98000, date: '15 Okt' },
  { id: 6, desc: 'Bensin Motor', cat: 'Transportasi', wallet: 'Tunai', type: 'expense', amount: 120000, date: '14 Okt' },
]

const DEMO_BUDGETS = [
  { id: 1, cat: '🍔 Makanan & Minuman', spent: 2100000, limit: 2500000, color: 'emerald' },
  { id: 2, cat: '🚗 Transportasi & Bensin', spent: 950000, limit: 1000000, color: 'amber' },
  { id: 3, cat: '☕ Gaya Hidup & Hiburan', spent: 750000, limit: 600000, color: 'rose' },
  { id: 4, cat: '💡 Tagihan Rutin & Listrik', spent: 550000, limit: 900000, color: 'cyan' },
]

const DEMO_GOALS = [
  { id: 1, name: 'Dana Darurat 6 Bulan', saved: 25500000, target: 30000000, color: 'teal', icon: '🛡️', deadline: 'Des 2026' },
  { id: 2, name: 'Laptop Kerja Baru', saved: 8000000, target: 15000000, color: 'cyan', icon: '💻', deadline: 'Mar 2027' },
  { id: 3, name: 'Liburan ke Jepang', saved: 4500000, target: 20000000, color: 'emerald', icon: '✈️', deadline: 'Jun 2027' },
]

const DEMO_BILLS = [
  { id: 1, name: 'Netflix', amount: 65000, due: 5, cycle: 'Bulanan', paid: false },
  { id: 2, name: 'Spotify', amount: 39000, due: 10, cycle: 'Bulanan', paid: true },
  { id: 3, name: 'WiFi IndiHome', amount: 355000, due: 15, cycle: 'Bulanan', paid: false },
  { id: 4, name: 'BPJS Kesehatan', amount: 150000, due: 25, cycle: 'Bulanan', paid: true },
]

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DemoClient() {
  const [tab, setTab] = useState<Tab>('Overview')
  const [lang, setLang] = useState<Lang>('id')
  const [hideBalance, setHideBalance] = useState(false)
  const [depositAdded, setDepositAdded] = useState(0)
  const [paidBills, setPaidBills] = useState<number[]>([2, 4])
  const [addedTx, setAddedTx] = useState<typeof DEMO_TRANSACTIONS[0] | null>(null)
  const [showAddTxHint, setShowAddTxHint] = useState(false)

  // Show "try adding transaction" hint after 3s on Overview
  useEffect(() => {
    if (tab === 'Overview') {
      const t = setTimeout(() => setShowAddTxHint(true), 3000)
      return () => clearTimeout(t)
    }
    setShowAddTxHint(false)
  }, [tab])

  const navItems: { key: Tab; label: string; labelEn: string; icon: React.ReactNode; proBadge?: boolean }[] = [
    { key: 'Overview', label: 'Overview', labelEn: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: 'Transaksi', label: 'Transaksi', labelEn: 'Transactions', icon: <Receipt className="h-4 w-4" /> },
    { key: 'Budget', label: 'Budget Bulanan', labelEn: 'Monthly Budget', icon: <PiggyBank className="h-4 w-4" />, proBadge: true },
    { key: 'Target Impian', label: 'Target Impian', labelEn: 'Savings Goals', icon: <Target className="h-4 w-4" />, proBadge: true },
    { key: 'Tagihan Rutin', label: 'Tagihan Rutin', labelEn: 'Recurring Bills', icon: <CalendarDays className="h-4 w-4" />, proBadge: true },
  ]

  const allTx = addedTx ? [addedTx, ...DEMO_TRANSACTIONS] : DEMO_TRANSACTIONS
  const totalIncome = allTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = allTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const netSavings = totalIncome - totalExpense

  const handleDeposit = () => {
    setDepositAdded(p => p + 500000)
    toast.success(
      lang === 'id'
        ? 'Setoran Rp 500.000 berhasil ditambahkan ke Dana Darurat!'
        : 'Rp 500,000 deposited to Emergency Fund!',
      { duration: 3500 }
    )
  }

  const handleSimulateAddTx = () => {
    const newTx = {
      id: 99,
      desc: lang === 'id' ? 'Demo: Kopi Pagi ☕' : 'Demo: Morning Coffee ☕',
      cat: lang === 'id' ? 'Makanan' : 'Food',
      wallet: 'GoPay',
      type: 'expense' as const,
      amount: 45000,
      date: lang === 'id' ? 'Hari ini' : 'Today',
    }
    setAddedTx(newTx)
    setShowAddTxHint(false)
    toast.success(
      lang === 'id'
        ? `Transaksi "${newTx.desc}" berhasil ditambahkan!`
        : `Transaction "${newTx.desc}" added!`,
      { duration: 3500 }
    )
  }

  const toggleBillPaid = (id: number) => {
    setPaidBills(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Top Banner ─────────────────────────────────────── */}
      <div className="sticky top-0 z-50 border-b border-amber-500/30 bg-amber-950/80 backdrop-blur-md px-4 py-2.5">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-200">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              {lang === 'id'
                ? '🎯 Mode Demo — Data simulasi, tidak tersimpan. Daftar untuk mulai mencatat data nyata.'
                : '🎯 Demo Mode — Simulated data only. Sign up to track your real finances.'}
            </span>
          </div>
          <Link
            href="/sign-in"
            className="shrink-0 flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition"
          >
            <span>{lang === 'id' ? 'Daftar Gratis' : 'Sign Up Free'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 py-3">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-md shadow-teal-500/20">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="text-base font-black tracking-tight text-white">
                Qwarts <span className="text-teal-400">Finance</span>
              </span>
            </Link>
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
              DEMO
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(l => l === 'id' ? 'en' : 'id')}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              <Languages className="h-3.5 w-3.5 text-teal-400" />
              <span>{lang === 'id' ? 'ID' : 'EN'}</span>
            </button>
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{lang === 'id' ? 'Beranda' : 'Home'}</span>
            </Link>
            <Link
              href="/sign-in"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-teal-500/20 hover:brightness-110 transition"
            >
              <span>{lang === 'id' ? 'Mulai Gratis' : 'Start Free'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Layout ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl flex min-h-[calc(100vh-110px)]">

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-slate-800/80 bg-slate-900/50 p-4 gap-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 mb-2">
            {lang === 'id' ? 'Menu' : 'Navigation'}
          </p>
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-left transition ${
                tab === item.key
                  ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className={tab === item.key ? 'text-teal-400' : 'text-slate-500'}>{item.icon}</span>
              <span className="flex-1">{lang === 'id' ? item.label : item.labelEn}</span>
              {item.proBadge && (
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">PRO</span>
              )}
            </button>
          ))}

          <div className="mt-auto pt-4 border-t border-slate-800">
            <Link
              href="/sign-in"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-3 py-2.5 text-xs font-bold text-white hover:brightness-110 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{lang === 'id' ? 'Daftar & Mulai' : 'Sign Up & Start'}</span>
            </Link>
            <p className="text-[10px] text-slate-600 text-center mt-2">
              {lang === 'id' ? 'Gratis selamanya' : 'Free forever'}
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">

          {/* Mobile tab row */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-5 lg:hidden scrollbar-none">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  tab === item.key
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {item.icon}
                <span>{lang === 'id' ? item.label : item.labelEn}</span>
                {item.proBadge && <span className="text-[9px] text-amber-400">PRO</span>}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ─────────────────────────────────────── */}
          {tab === 'Overview' && (
            <div className="space-y-5">
              {/* Greeting */}
              <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/50 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-lg shadow-md">
                      D
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-extrabold text-white text-sm sm:text-base">
                          {lang === 'id' ? 'Halo, Dimas Pratama 👋' : 'Hello, Dimas Pratama 👋'}
                        </h2>
                        <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black text-amber-400">
                          PRO ⭐
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {lang === 'id' ? '30 Oktober 2026 • Akun Demo' : 'October 30, 2026 • Demo Account'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setHideBalance(h => !h)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                    >
                      {hideBalance ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>{hideBalance ? (lang === 'id' ? 'Tampilkan' : 'Show') : (lang === 'id' ? 'Sembunyikan' : 'Hide')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="col-span-2 lg:col-span-1 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 p-4 sm:p-5 text-white shadow-lg">
                  <span className="text-xs text-slate-400 font-semibold">{lang === 'id' ? 'Total Kekayaan' : 'Total Net Worth'}</span>
                  <p className="mt-2 text-2xl font-black tabular-nums">{formatRp(28750000, hideBalance)}</p>
                  <p className="mt-2 text-[11px] text-emerald-400 font-semibold">4 {lang === 'id' ? 'dompet aktif' : 'active wallets'}</p>
                </div>
                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5">
                  <span className="text-xs text-slate-400 font-semibold">{lang === 'id' ? 'Pemasukan' : 'Income'}</span>
                  <p className="mt-2 text-xl font-black text-emerald-400 tabular-nums">+{formatRp(totalIncome, hideBalance)}</p>
                  <p className="mt-2 text-[11px] text-slate-400">{lang === 'id' ? 'Bulan ini' : 'This month'}</p>
                </div>
                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5">
                  <span className="text-xs text-slate-400 font-semibold">{lang === 'id' ? 'Pengeluaran' : 'Expense'}</span>
                  <p className="mt-2 text-xl font-black text-rose-400 tabular-nums">-{formatRp(totalExpense, hideBalance)}</p>
                  <p className="mt-2 text-[11px] text-slate-400">{lang === 'id' ? 'Bulan ini' : 'This month'}</p>
                </div>
                <div className="col-span-2 lg:col-span-1 rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5">
                  <span className="text-xs text-slate-400 font-semibold">{lang === 'id' ? 'Net Tabungan' : 'Net Savings'}</span>
                  <p className="mt-2 text-xl font-black text-teal-400 tabular-nums">+{formatRp(netSavings, hideBalance)}</p>
                  <p className="mt-2 text-[11px] text-emerald-400 font-semibold">📈 {lang === 'id' ? 'Surplus sehat' : 'Healthy surplus'}</p>
                </div>
              </div>

              {/* Interactive add-tx hint */}
              {showAddTxHint && !addedTx && (
                <div className="rounded-2xl border border-teal-500/40 bg-teal-950/30 p-4 flex items-center justify-between gap-3 animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {lang === 'id' ? '👆 Coba tambah transaksi baru!' : '👆 Try adding a transaction!'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {lang === 'id' ? 'Klik tombol di bawah untuk simulasi mencatat pengeluaran.' : 'Click the button below to simulate logging an expense.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSimulateAddTx}
                    className="shrink-0 flex items-center gap-1.5 rounded-xl bg-teal-500/20 border border-teal-500/40 hover:bg-teal-500/30 px-3 py-2 text-xs font-bold text-teal-300 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{lang === 'id' ? 'Catat Transaksi' : 'Add Transaction'}</span>
                  </button>
                </div>
              )}

              {addedTx && (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <p className="text-xs font-semibold text-emerald-300">
                    {lang === 'id'
                      ? `✅ Transaksi "${addedTx.desc}" berhasil ditambahkan! Di akun nyata, data ini akan tersimpan permanen.`
                      : `✅ Transaction "${addedTx.desc}" added! In your real account, this data saves permanently.`}
                  </p>
                  <button onClick={() => setAddedTx(null)} className="ml-auto text-slate-500 hover:text-slate-300">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Recent transactions */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {lang === 'id' ? 'Transaksi Terakhir' : 'Recent Transactions'}
                  </span>
                  <button onClick={() => setTab('Transaksi')} className="text-[11px] text-teal-400 hover:underline flex items-center gap-1">
                    {lang === 'id' ? 'Lihat semua' : 'See all'} <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {allTx.slice(0, 4).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between rounded-xl bg-slate-950/60 border border-slate-800/60 p-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {tx.type === 'income' ? <TrendingUp className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{tx.desc}</p>
                          <p className="text-[10px] text-slate-500">{tx.wallet} • {tx.cat} • {tx.date}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold tabular-nums ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatRp(tx.amount, hideBalance)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-950/60 to-slate-900 p-5 text-center">
                <p className="text-sm font-bold text-white mb-1">
                  {lang === 'id' ? '🚀 Siap mulai catat keuangan nyatamu?' : '🚀 Ready to track your real finances?'}
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  {lang === 'id' ? 'Data demo ini tidak tersimpan. Daftar gratis untuk mulai dari nol.' : 'Demo data is not saved. Sign up free to start fresh.'}
                </p>
                <Link href="/sign-in" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:brightness-110 shadow-lg shadow-teal-500/20 transition">
                  <span>{lang === 'id' ? 'Mulai Gratis Sekarang' : 'Start Free Now'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* ── TRANSAKSI ─────────────────────────────────────── */}
          {tab === 'Transaksi' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-white">{lang === 'id' ? 'Riwayat Transaksi' : 'Transaction History'}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{lang === 'id' ? 'Data simulasi — log transaksi real akan tersimpan di akun Anda' : 'Demo data — real transactions will persist in your account'}</p>
                </div>
                <button
                  onClick={handleSimulateAddTx}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white hover:brightness-110 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{lang === 'id' ? 'Catat' : 'Add'}</span>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] gap-0 text-[10px] font-bold uppercase tracking-wider text-slate-500 px-4 py-2.5 border-b border-slate-800">
                  <span className="hidden sm:block">{lang === 'id' ? 'Tanggal' : 'Date'}</span>
                  <span>{lang === 'id' ? 'Deskripsi' : 'Description'}</span>
                  <span className="hidden sm:block">{lang === 'id' ? 'Kategori' : 'Category'}</span>
                  <span className="hidden sm:block">{lang === 'id' ? 'Dompet' : 'Wallet'}</span>
                  <span className="text-right">{lang === 'id' ? 'Nominal' : 'Amount'}</span>
                </div>
                {allTx.map(tx => (
                  <div key={tx.id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] gap-0 items-center px-4 py-3 border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40 transition">
                    <span className="hidden sm:block text-xs text-slate-500">{tx.date}</span>
                    <div>
                      <p className="text-xs font-semibold text-white">{tx.desc}</p>
                      <p className="text-[10px] text-slate-500 sm:hidden">{tx.cat} • {tx.wallet} • {tx.date}</p>
                    </div>
                    <span className="hidden sm:block text-xs text-slate-400">{tx.cat}</span>
                    <span className="hidden sm:block text-xs text-slate-400">{tx.wallet}</span>
                    <span className={`text-xs font-bold tabular-nums text-right ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatRp(tx.amount, hideBalance)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-teal-500/20 bg-teal-950/20 p-4 flex items-center gap-3 text-xs">
                <Sparkles className="h-4 w-4 text-teal-400 shrink-0" />
                <p className="text-slate-300">
                  {lang === 'id'
                    ? 'Di akun nyata: filter berdasarkan kategori, dompet, periode waktu, dan ekspor ke CSV / Excel (.xlsx).'
                    : 'In your real account: filter by category, wallet, time period, and export to CSV / Excel (.xlsx).'}
                </p>
                <Link href="/sign-in" className="shrink-0 text-teal-400 font-bold hover:underline">{lang === 'id' ? 'Daftar →' : 'Sign Up →'}</Link>
              </div>
            </div>
          )}

          {/* ── BUDGET ───────────────────────────────────────── */}
          {tab === 'Budget' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-extrabold text-white">{lang === 'id' ? 'Budget Bulanan' : 'Monthly Budget'}</h2>
                  <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black text-amber-400">PRO</span>
                </div>
                <p className="text-xs text-slate-400">{lang === 'id' ? 'Atur pagu belanja per kategori agar tidak overbudget.' : 'Set spending caps per category to stay on budget.'}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs text-slate-400">{lang === 'id' ? 'Total Pagu' : 'Total Cap'}</p>
                  <p className="text-xl font-black text-white mt-1">{formatRp(5000000, hideBalance)}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs text-slate-400">{lang === 'id' ? 'Total Terpakai' : 'Total Spent'}</p>
                  <p className="text-xl font-black text-amber-400 mt-1">{formatRp(4350000, hideBalance)}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs text-slate-400">{lang === 'id' ? 'Sisa Anggaran' : 'Remaining'}</p>
                  <p className="text-xl font-black text-emerald-400 mt-1">{formatRp(650000, hideBalance)}</p>
                </div>
              </div>

              {DEMO_BUDGETS.some(b => b.spent > b.limit) && (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-3.5 flex items-start gap-3 text-xs">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-slate-300">
                    <span className="font-bold text-rose-300">{lang === 'id' ? 'Overbudget Alert: ' : 'Overbudget Alert: '}</span>
                    {lang === 'id' ? 'Pengeluaran Gaya Hidup & Hiburan melebihi pagu sebesar Rp 150.000.' : 'Lifestyle & Leisure spending exceeded the cap by Rp 150,000.'}
                  </p>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {DEMO_BUDGETS.map(b => {
                  const pct = Math.round((b.spent / b.limit) * 100)
                  const isOver = b.spent > b.limit
                  const isWarn = !isOver && pct >= 90
                  return (
                    <div key={b.id} className={`rounded-2xl border p-4 ${isOver ? 'border-rose-500/40 bg-rose-950/20' : isWarn ? 'border-amber-500/30' : 'border-slate-800'} bg-slate-950/80`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-white">{b.cat}</span>
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                          isOver ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : isWarn ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {isOver ? `⚠️ Overbudget (${pct}%)` : isWarn ? `Menipis (${pct}%)` : `Aman (${pct}%)`}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-400">{lang === 'id' ? 'Terpakai: ' : 'Spent: '}<strong className={isOver ? 'text-rose-400' : 'text-white'}>{formatRp(b.spent, hideBalance)}</strong></span>
                        <span className="text-slate-400">{lang === 'id' ? 'Pagu: ' : 'Cap: '}{formatRp(b.limit, hideBalance)}</span>
                      </div>
                      <ProgressBar value={pct} color={isOver ? 'rose' : isWarn ? 'amber' : b.color} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── TARGET IMPIAN ─────────────────────────────────── */}
          {tab === 'Target Impian' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-extrabold text-white">{lang === 'id' ? 'Target Impian' : 'Savings Goals'}</h2>
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black text-amber-400">PRO</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {DEMO_GOALS.map((goal, i) => {
                  const saved = goal.saved + (i === 0 ? depositAdded : 0)
                  const pct = Math.min(100, Math.round((saved / goal.target) * 100))
                  return (
                    <div key={goal.id} className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">{goal.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-white">{goal.name}</p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" /> Target: {goal.deadline}
                            </p>
                          </div>
                          <span className="ml-auto rounded-md bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 text-[10px] font-bold text-teal-300">{pct}%</span>
                        </div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-bold text-white">{formatRp(saved, hideBalance)}</span>
                          <span className="text-slate-500">{formatRp(goal.target, hideBalance)}</span>
                        </div>
                        <ProgressBar value={pct} color="teal" />
                        <p className="mt-2 text-[11px] text-emerald-400 font-medium">
                          {lang === 'id' ? 'Sisa: ' : 'Remaining: '}{formatRp(Math.max(0, goal.target - saved), hideBalance)}
                        </p>
                      </div>
                      {i === 0 && (
                        <button
                          onClick={handleDeposit}
                          className="mt-4 w-full rounded-xl bg-teal-500/15 border border-teal-500/30 hover:bg-teal-500/25 py-2 text-xs font-bold text-teal-300 transition"
                        >
                          + {lang === 'id' ? 'Setor Rp 500.000' : 'Deposit Rp 500,000'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── TAGIHAN RUTIN ─────────────────────────────────── */}
          {tab === 'Tagihan Rutin' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-extrabold text-white">{lang === 'id' ? 'Tagihan Rutin' : 'Recurring Bills'}</h2>
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black text-amber-400">PRO</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs text-slate-400">{lang === 'id' ? 'Total Tagihan Bulanan' : 'Total Monthly Bills'}</p>
                  <p className="text-xl font-black text-white mt-1">{formatRp(DEMO_BILLS.reduce((s, b) => s + b.amount, 0), hideBalance)}</p>
                </div>
                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
                  <p className="text-xs text-amber-400 font-semibold">{lang === 'id' ? 'Jatuh Tempo Bulan Ini' : 'Due This Month'}</p>
                  <p className="text-xl font-black text-amber-400 mt-1">{DEMO_BILLS.filter(b => !paidBills.includes(b.id)).length} {lang === 'id' ? 'tagihan' : 'bills'}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                {DEMO_BILLS.map(bill => {
                  const paid = paidBills.includes(bill.id)
                  return (
                    <div key={bill.id} className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${paid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                          <Zap className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{bill.name}</p>
                          <p className="text-[10px] text-slate-500">{bill.cycle} • {lang === 'id' ? 'Tgl' : 'Due'} {bill.due}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-white tabular-nums">{formatRp(bill.amount, hideBalance)}</span>
                        <button
                          onClick={() => toggleBillPaid(bill.id)}
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                            paid
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                              : 'bg-teal-500/15 border border-teal-500/30 text-teal-300 hover:bg-teal-500/25'
                          }`}
                        >
                          {paid ? <><CheckCircle2 className="h-3 w-3" /> {lang === 'id' ? 'Lunas' : 'Paid'}</> : <>{lang === 'id' ? 'Bayar' : 'Pay'}</>}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-2xl border border-teal-500/20 bg-teal-950/20 p-4 flex items-center gap-3 text-xs">
                <Bell className="h-4 w-4 text-teal-400 shrink-0" />
                <p className="text-slate-300">
                  {lang === 'id'
                    ? 'Di akun nyata: terima notifikasi H-3 sebelum jatuh tempo & sinkronisasi push notif Android.'
                    : 'In your real account: get 3-day due reminders & Android push notification sync.'}
                </p>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md flex items-center justify-around px-2 py-2 z-40">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${tab === item.key ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {item.icon}
            <span className="text-[9px] font-semibold">{lang === 'id' ? item.label.split(' ')[0] : item.labelEn.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
