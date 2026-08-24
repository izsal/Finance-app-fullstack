'use client'

import React, { useEffect, useMemo, useState, useTransition } from 'react'
import {
  addBudget,
  addCategory,
  addTransaction,
  addWallet,
  deleteBudget,
  deleteCategory,
  deleteTransaction,
  deleteWallet,
  getFinanceData,
  seedDefaults,
  transferBetweenWallets,
  updateCategory,
  updateTransaction,
  updateWallet,
  upsertBudget,
} from '@/app/actions/finance'
import { signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  Edit3,
  FileSpreadsheet,
  Filter,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  PieChart as PieIcon,
  PiggyBank,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Settings2,
  Shield,
  Sparkles,
  Sun,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  Wallet,
  WalletCards,
  X,
} from 'lucide-react'
import type { Budget, Category, Transaction, Wallet as WalletType } from '@/lib/schema'
import { formatIndoDate, formatRupiah } from '@/lib/utils'
import { RupiahInput } from '@/components/rupiah-input'
import { CustomSelect, type OptionType } from '@/components/custom-select'
import { DatePickerInput } from '@/components/date-picker-input'
import { exportFinanceToExcel } from '@/lib/excel-export'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type Data = {
  wallets: WalletType[]
  categories: Category[]
  budgets: Budget[]
  transactions: Transaction[]
}

const COLOR_PALETTE = [
  '#0d9488', // teal
  '#10b981', // emerald
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#64748b', // slate
]

export default function Dashboard({
  user,
  initialData,
}: {
  user: { name: string; email: string }
  initialData: Data
}) {
  const [data, setData] = useState<Data>(initialData)
  const [tab, setTab] = useState<'Overview' | 'Transaksi' | 'Dompet' | 'Budget' | 'Kategori' | 'Analisis' | 'Pengaturan'>('Overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Initialize and persist theme & sidebar state
  useEffect(() => {
    const savedTheme = (localStorage.getItem('dompetku-theme') as 'light' | 'dark' | 'system') || 'light'
    const savedSidebar = localStorage.getItem('dompetku-sidebar') === 'true'
    setTheme(savedTheme)
    setSidebarCollapsed(savedSidebar)

    applyTheme(savedTheme)
  }, [])

  const applyTheme = (t: 'light' | 'dark' | 'system') => {
    const isDark =
      t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    localStorage.setItem('dompetku-theme', newTheme)
    applyTheme(newTheme)
    showToast(`Tema diganti ke mode ${newTheme === 'dark' ? 'Gelap' : newTheme === 'light' ? 'Terang' : 'Sistem'}`)
  }

  const toggleSidebar = () => {
    const next = !sidebarCollapsed
    setSidebarCollapsed(next)
    localStorage.setItem('dompetku-sidebar', String(next))
  }

  // Keep state synced with server components
  useEffect(() => {
    if (initialData) {
      setData(initialData)
    }
  }, [initialData])

  // Modal states
  const [showModal, setShowModal] = useState<
    | { type: 'transaction'; editData?: Transaction }
    | { type: 'transfer' }
    | { type: 'wallet'; editData?: WalletType }
    | { type: 'category'; editData?: Category }
    | { type: 'budget'; editData?: Budget }
    | null
  >(null)

  // Feedback Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Reload or refresh state reactively
  const handleSuccess = (msg: string, freshData?: Data) => {
    showToast(msg, 'success')
    if (freshData) {
      setData(freshData)
    } else {
      getFinanceData().then((fresh) => setData(fresh)).catch(() => {})
    }
    startTransition(() => {
      router.refresh()
    })
  }

  // Transactions Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [walletFilter, setWalletFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days' | 'month'>('all')

  // Selected Budget Month
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), [])
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr)

  // Derived Maps & Calculations
  const categoryMap = useMemo(() => new Map(data.categories.map((c) => [c.id, c])), [data.categories])
  const walletMap = useMemo(() => new Map(data.wallets.map((w) => [w.id, w])), [data.wallets])

  // Dynamic Wallet Balances
  const calculatedWallets = useMemo(() => {
    return data.wallets.map((w) => {
      const inc = data.transactions
        .filter((t) => t.walletId === w.id && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const exp = data.transactions
        .filter((t) => t.walletId === w.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      const currentBalance = (w.balance || 0) + inc - exp
      return { ...w, currentBalance, totalIncome: inc, totalExpense: exp }
    })
  }, [data.wallets, data.transactions])

  // Total Financial Metrics
  const totalBalance = useMemo(
    () => calculatedWallets.reduce((acc, w) => acc + w.currentBalance, 0),
    [calculatedWallets]
  )

  const totalIncome = useMemo(
    () => data.transactions.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
    [data.transactions]
  )

  const totalExpense = useMemo(
    () => data.transactions.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
    [data.transactions]
  )

  const netSavings = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return data.transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (categoryFilter !== 'all' && t.categoryId !== Number(categoryFilter)) return false
      if (walletFilter !== 'all' && t.walletId !== Number(walletFilter)) return false

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const catName = categoryMap.get(t.categoryId)?.name?.toLowerCase() || ''
        const walName = walletMap.get(t.walletId)?.name?.toLowerCase() || ''
        const descMatch = t.description.toLowerCase().includes(query)
        if (!descMatch && !catName.includes(query) && !walName.includes(query)) return false
      }

      if (dateFilter !== 'all') {
        const txDate = new Date(t.date)
        const now = new Date()
        if (dateFilter === '7days') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (txDate < sevenDaysAgo) return false
        } else if (dateFilter === '30days') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          if (txDate < thirtyDaysAgo) return false
        } else if (dateFilter === 'month') {
          const currentYm = now.toISOString().slice(0, 7)
          if (new Date(t.date).toISOString().slice(0, 7) !== currentYm) return false
        }
      }

      return true
    })
  }, [data.transactions, typeFilter, categoryFilter, walletFilter, searchQuery, dateFilter, categoryMap, walletMap])

  // Chart Data: Cashflow Trend
  const cashflowChartData = useMemo(() => {
    const map = new Map<string, { date: string; displayDate: string; income: number; expense: number }>()
    const sorted = [...data.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    sorted.forEach((t) => {
      const key = new Date(t.date).toISOString().slice(0, 10)
      if (!map.has(key)) {
        map.set(key, {
          date: key,
          displayDate: new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          income: 0,
          expense: 0,
        })
      }
      const entry = map.get(key)!
      if (t.type === 'income') entry.income += t.amount
      if (t.type === 'expense') entry.expense += t.amount
    })

    return Array.from(map.values()).slice(-10)
  }, [data.transactions])

  // Chart Data: Expense Category Donut
  const categoryExpenseChartData = useMemo(() => {
    const map = new Map<number, number>()
    data.transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount)
      })

    return Array.from(map.entries())
      .map(([catId, amount], index) => {
        const cat = categoryMap.get(catId)
        return {
          id: catId,
          name: cat?.name || `Kategori ${catId}`,
          value: amount,
          color: COLOR_PALETTE[index % COLOR_PALETTE.length],
        }
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [data.transactions, categoryMap])

  // Budgets for Selected Month
  const monthlyBudgets = useMemo(() => {
    return data.budgets
      .filter((b) => b.month === selectedMonth)
      .map((b) => {
        const cat = categoryMap.get(b.categoryId)
        const spent = data.transactions
          .filter((t) => {
            const matchCat = t.categoryId === b.categoryId
            const matchMonth = new Date(t.date).toISOString().slice(0, 7) === b.month
            return matchCat && matchMonth && t.type === 'expense'
          })
          .reduce((sum, t) => sum + t.amount, 0)
        const remaining = b.amount - spent
        const percentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0
        return {
          ...b,
          categoryName: cat?.name || `Kategori ${b.categoryId}`,
          spent,
          remaining,
          percentage,
        }
      })
  }, [data.budgets, data.transactions, selectedMonth, categoryMap])

  // Export Handlers
  const handleExportExcel = () => {
    try {
      exportFinanceToExcel({
        user,
        wallets: data.wallets,
        categories: data.categories,
        budgets: data.budgets,
        transactions: filteredTransactions.length > 0 ? filteredTransactions : data.transactions,
      })
      showToast('Berhasil mendownload Laporan Excel (.xlsx)!', 'success')
    } catch (e) {
      console.error(e)
      showToast('Gagal mengekspor Excel', 'error')
    }
  }

  const handleExportCSV = () => {
    const list = filteredTransactions.length > 0 ? filteredTransactions : data.transactions
    const header = 'Tanggal,Waktu,Deskripsi,Tipe,Kategori,Dompet,Nominal (IDR)\n'
    const rows = list
      .map((t) => {
        const d = new Date(t.date)
        const cat = categoryMap.get(t.categoryId)?.name || '-'
        const wal = walletMap.get(t.walletId)?.name || '-'
        return `"${d.toISOString().slice(0, 10)}","${d.toLocaleTimeString('id-ID')}","${t.description.replace(/"/g, '""')}","${t.type}","${cat}","${wal}",${t.amount}`
      })
      .join('\n')

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `Transaksi_Dompetku_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    showToast('Berhasil mendownload file CSV!', 'success')
  }

  // Select Options definitions for react-select
  const typeFilterOptions: OptionType<string>[] = [
    { value: 'all', label: 'Semua Tipe Transaksi' },
    { value: 'income', label: 'Pemasukan (+)' },
    { value: 'expense', label: 'Pengeluaran (-)' },
  ]

  const categoryFilterOptions: OptionType<string>[] = [
    { value: 'all', label: 'Semua Kategori' },
    ...data.categories.map((c) => ({
      value: String(c.id),
      label: `${c.name} (${c.type === 'income' ? 'Masuk' : 'Keluar'})`,
    })),
  ]

  const walletFilterOptions: OptionType<string>[] = [
    { value: 'all', label: 'Semua Dompet / Rekening' },
    ...data.wallets.map((w) => ({
      value: String(w.id),
      label: `${w.name} (${w.type})`,
    })),
  ]

  const navMenuItems = [
    { key: 'Overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'Transaksi', label: 'Transaksi', icon: Receipt },
    { key: 'Dompet', label: 'Dompet & Akun', icon: WalletCards },
    { key: 'Budget', label: 'Budget Bulanan', icon: PiggyBank },
    { key: 'Kategori', label: 'Kategori', icon: Tag },
    { key: 'Analisis', label: 'Laporan & Excel', icon: BarChart3 },
    { key: 'Pengaturan', label: 'Pengaturan', icon: Settings2 },
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col antialiased transition-colors duration-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 dark:bg-emerald-950 border border-slate-700 dark:border-emerald-800 px-5 py-3.5 text-white shadow-2xl transition-all animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Desktop Sidebar (Collapsible) */}
      <aside
        className={`fixed inset-y-0 hidden border-r border-slate-200/80 bg-white/90 dark:bg-slate-900/90 dark:border-slate-800 backdrop-blur-md p-4 lg:flex lg:flex-col lg:justify-between z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Brand Logo & Collapse Toggle */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-500 text-white shadow-md shadow-emerald-500/20">
                <Wallet className="h-5 w-5" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    Dompet<span className="text-emerald-600 dark:text-emerald-400">ku</span>
                  </span>
                  <span className="block text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                    Finance Pro
                  </span>
                </div>
              )}
            </div>

            {!sidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                title="Sembunyikan Sidebar"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </div>

          {sidebarCollapsed && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={toggleSidebar}
                title="Tampilkan Sidebar Penuh"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="mt-8">
            {!sidebarCollapsed && (
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Menu Utama</p>
            )}
            <nav className="mt-3 space-y-1.5">
              {navMenuItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key as any)}
                  title={sidebarCollapsed ? label : undefined}
                  className={`flex w-full items-center rounded-xl py-3 text-sm font-semibold transition-all ${
                    sidebarCollapsed ? 'justify-center px-0' : 'gap-3.5 px-3.5'
                  } ${
                    tab === key
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${tab === key ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  {!sidebarCollapsed && <span>{label}</span>}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* User Card in Sidebar */}
        <div className={`rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-3 ${sidebarCollapsed ? 'text-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                <p className="truncate text-[11px] text-slate-400">{user.email}</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={async () => {
                  await signOut()
                  router.push('/sign-in')
                }}
                title="Keluar"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Layout */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Top Header Navbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop Quick Toggle Sidebar Button in Header */}
            <button
              onClick={toggleSidebar}
              title={sidebarCollapsed ? 'Tampilkan Sidebar' : 'Sembunyikan Sidebar'}
              className="hidden lg:flex rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>

            <div>
              <p className="text-xs font-medium text-slate-400">Halo, selamat datang</p>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white lg:text-xl">{user.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Dark Mode Switcher in Header */}
            <button
              onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
              title={`Beralih ke mode ${theme === 'dark' ? 'Terang' : 'Gelap'}`}
              className="flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>

            {/* Quick Export Button */}
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50/70 dark:bg-emerald-950/40 px-3.5 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition shadow-sm"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            {/* Quick Add Transaction Button */}
            <button
              onClick={() => setShowModal({ type: 'transaction' })}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Transaksi</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-4/5 max-w-xs bg-white dark:bg-slate-900 p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-lg dark:text-white">Dompetku</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="mt-6 space-y-1">
                  {navMenuItems.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => {
                        setTab(key as any)
                        setMobileMenuOpen(false)
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${
                        tab === key ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="pt-4 border-t dark:border-slate-800 space-y-2">
                <button
                  onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
                  className="flex w-full items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <span className="flex items-center gap-2">
                    {theme === 'dark' ? <Moon className="h-4 w-4 text-emerald-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
                    <span>Mode {theme === 'dark' ? 'Gelap' : 'Terang'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Ubah</span>
                </button>
                <button
                  onClick={async () => {
                    await signOut()
                    router.push('/sign-in')
                  }}
                  className="flex w-full items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 px-3 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="p-5 sm:p-8 lg:p-10 flex-1 max-w-7xl w-full mx-auto space-y-8">
          {/* TAB 1: OVERVIEW */}
          {tab === 'Overview' && (
            <div className="space-y-8">
              {/* Header Title & Quick Actions */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Ringkasan Keuangan
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Pantau arus kas, performa tabungan, dan alokasi budget Anda secara real-time.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowModal({ type: 'transfer' })}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <ArrowLeftRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Transfer Antar Dompet</span>
                  </button>
                  <button
                    onClick={() => setShowModal({ type: 'wallet' })}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Dompet Baru</span>
                  </button>
                </div>
              </div>

              {/* Financial Metric Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 p-6 text-white shadow-xl shadow-slate-900/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Total Seluruh Saldo</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                      <WalletCards className="h-4 w-4 text-emerald-400" />
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-black tracking-tight">{formatRupiah(totalBalance)}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/10">
                    <span>{calculatedWallets.length} Akun / Dompet</span>
                    <span className="text-emerald-400 font-semibold">Terkonsolidasi</span>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pemasukan</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <ArrowDownRight className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {formatRupiah(totalIncome)}
                  </p>
                  <p className="mt-3 text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                    Akumulasi arus kas masuk
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pengeluaran</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                    {formatRupiah(totalExpense)}
                  </p>
                  <p className="mt-3 text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                    Akumulasi biaya tercatat
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Net Tabungan</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 font-bold text-xs">
                      {savingsRate}%
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-black text-teal-700 dark:text-teal-400 tracking-tight">
                    {formatRupiah(netSavings)}
                  </p>
                  <p className="mt-3 text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                    Rasio Tabungan: <span className="font-semibold text-teal-700 dark:text-teal-400">{savingsRate}%</span>
                  </p>
                </div>
              </div>

              {/* Wallets Quick Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Dompet & Rekening Saya</span>
                  </h3>
                  <button
                    onClick={() => setTab('Dompet')}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Kelola Semua <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {calculatedWallets.map((w) => (
                    <div
                      key={w.id}
                      className="group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:shadow-md hover:border-emerald-500/50"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-block rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                            {w.type}
                          </span>
                          <h4 className="mt-2 font-bold text-base text-slate-900 dark:text-white">{w.name}</h4>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold">
                          <Wallet className="h-4 w-4" />
                        </div>
                      </div>

                      <p className="mt-4 text-xl font-black text-slate-900 dark:text-white">{formatRupiah(w.currentBalance)}</p>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-emerald-600 dark:text-emerald-400">+{formatRupiah(w.totalIncome)}</span>
                        <span className="text-rose-500 dark:text-rose-400">-{formatRupiah(w.totalExpense)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">Tren Arus Kas Transaksi</h3>
                      <p className="text-xs text-slate-400">Pemasukan vs Pengeluaran berdasarkan tanggal</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Masuk
                      </span>
                      <span className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Keluar
                      </span>
                    </div>
                  </div>

                  <div className="h-72 w-full">
                    {cashflowChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={cashflowChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="displayDate" stroke="#64748b" fontSize={11} tickLine={false} />
                          <YAxis
                            stroke="#64748b"
                            fontSize={11}
                            tickLine={false}
                            tickFormatter={(v) => (v >= 1000000 ? `${v / 1000000}M` : `${v / 1000}k`)}
                          />
                          <Tooltip
                            formatter={(val: any) => [formatRupiah(Number(val)), '']}
                            contentStyle={{
                              backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                              color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                              borderRadius: '1rem',
                              border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="income"
                            name="Pemasukan"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#incomeGrad)"
                          />
                          <Area
                            type="monotone"
                            dataKey="expense"
                            name="Pengeluaran"
                            stroke="#f43f5e"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#expenseGrad)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400">
                        Belum ada data visualisasi arus kas.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Alokasi Pengeluaran</h3>
                    <p className="text-xs text-slate-400">Distribusi biaya per kategori</p>
                  </div>

                  <div className="h-52 w-full my-2">
                    {categoryExpenseChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryExpenseChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={3}
                          >
                            {categoryExpenseChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(val: any) => [formatRupiah(Number(val)), 'Total']}
                            contentStyle={{
                              backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                              color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                              borderRadius: '0.75rem',
                              border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                              fontSize: '12px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400">
                        Belum ada transaksi pengeluaran.
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 max-h-36 overflow-y-auto">
                    {categoryExpenseChartData.slice(0, 4).map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{c.name}</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{formatRupiah(c.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Transactions List */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Transaksi Terbaru</h3>
                    <p className="text-xs text-slate-400">Daftar arus transaksi terakhir yang tercatat</p>
                  </div>
                  <button
                    onClick={() => setTab('Transaksi')}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Lihat Semua <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {data.transactions.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.transactions.slice(0, 6).map((t) => {
                      const cat = categoryMap.get(t.categoryId)
                      const wal = walletMap.get(t.walletId)
                      const isInc = t.type === 'income'
                      return (
                        <div key={t.id} className="flex items-center justify-between py-3.5 group">
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                                isInc ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                              }`}
                            >
                              {isInc ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-sm">{t.description}</p>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                                <span>{formatIndoDate(t.date)}</span>
                                <span>•</span>
                                <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-slate-600 dark:text-slate-300 font-medium">
                                  {cat?.name || 'Kategori'}
                                </span>
                                <span>•</span>
                                <span className="text-slate-500 dark:text-slate-400">{wal?.name || 'Dompet'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-black ${isInc ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              {isInc ? '+' : '-'} {formatRupiah(t.amount)}
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              <button
                                onClick={() => setShowModal({ type: 'transaction', editData: t })}
                                title="Edit"
                                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm('Hapus transaksi ini?')) {
                                    const fresh = await deleteTransaction(t.id)
                                    handleSuccess('Transaksi dihapus', fresh)
                                  }
                                }}
                                title="Hapus"
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Receipt className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700" />
                    <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada transaksi</p>
                    <p className="text-xs text-slate-400">Mulai catat transaksi pertama Anda sekarang.</p>
                    <button
                      onClick={() => setShowModal({ type: 'transaction' })}
                      className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow"
                    >
                      + Tambah Transaksi
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TRANSAKSI */}
          {tab === 'Transaksi' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Riwayat & Daftar Transaksi</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Kelola dan telusuri seluruh transaksi Anda dengan filter lengkap.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition shadow-sm"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Download Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <Download className="h-4 w-4 text-slate-500" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => setShowModal({ type: 'transaction' })}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Transaksi</span>
                  </button>
                </div>
              </div>

              {/* Filter Controls Bar */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="relative lg:col-span-2 flex items-center">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari deskripsi, kategori, dompet..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 min-h-[42px]"
                    />
                  </div>

                  <CustomSelect
                    value={typeFilterOptions.find((o) => o.value === typeFilter)}
                    onChange={(option) => setTypeFilter((option?.value as any) || 'all')}
                    options={typeFilterOptions}
                    isSearchable={false}
                  />

                  <CustomSelect
                    value={categoryFilterOptions.find((o) => o.value === categoryFilter)}
                    onChange={(option) => setCategoryFilter(option?.value || 'all')}
                    options={categoryFilterOptions}
                    isSearchable
                    placeholder="Semua Kategori"
                  />

                  <CustomSelect
                    value={walletFilterOptions.find((o) => o.value === walletFilter)}
                    onChange={(option) => setWalletFilter(option?.value || 'all')}
                    options={walletFilterOptions}
                    isSearchable
                    placeholder="Semua Dompet"
                  />
                </div>

                {/* Date presets */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-400 mr-1">Periode:</span>
                    {[
                      { id: 'all', label: 'Semua Waktu' },
                      { id: '7days', label: '7 Hari Terakhir' },
                      { id: '30days', label: '30 Hari Terakhir' },
                      { id: 'month', label: 'Bulan Ini' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setDateFilter(p.id as any)}
                        className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                          dateFilter === p.id
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <span className="text-slate-400 font-medium">
                    Menampilkan <b className="text-slate-800 dark:text-slate-200">{filteredTransactions.length}</b> transaksi
                  </span>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm overflow-hidden">
                {filteredTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                          <th className="pb-3 pl-2">Tanggal & Waktu</th>
                          <th className="pb-3">Deskripsi</th>
                          <th className="pb-3">Kategori</th>
                          <th className="pb-3">Dompet</th>
                          <th className="pb-3 text-right">Nominal</th>
                          <th className="pb-3 pr-2 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {filteredTransactions.map((t) => {
                          const cat = categoryMap.get(t.categoryId)
                          const wal = walletMap.get(t.walletId)
                          const isInc = t.type === 'income'
                          return (
                            <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                              <td className="py-3.5 pl-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{formatIndoDate(t.date)}</p>
                                <p className="text-[10px] text-slate-400">
                                  {new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </td>
                              <td className="py-3.5 font-bold text-slate-900 dark:text-white max-w-xs">{t.description}</td>
                              <td className="py-3.5 whitespace-nowrap">
                                <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-semibold text-slate-700 dark:text-slate-300">
                                  {cat?.name || 'Kategori'}
                                </span>
                              </td>
                              <td className="py-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">{wal?.name || 'Dompet'}</td>
                              <td className="py-3.5 text-right whitespace-nowrap">
                                <span className={`font-black text-sm ${isInc ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                  {isInc ? '+' : '-'} {formatRupiah(t.amount)}
                                </span>
                              </td>
                              <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setShowModal({ type: 'transaction', editData: t })}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                                    title="Edit"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (confirm('Hapus transaksi ini?')) {
                                        const fresh = await deleteTransaction(t.id)
                                        handleSuccess('Transaksi dihapus', fresh)
                                      }
                                    }}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400"
                                    title="Hapus"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Receipt className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700" />
                    <p className="mt-3 font-bold text-slate-700 dark:text-slate-300">Tidak ada transaksi ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau filter Anda.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DOMPET & AKUN */}
          {tab === 'Dompet' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Kelola Dompet & Rekening</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Atur rekening bank, e-wallet, uang tunai, dan lakukan transfer antar saldo.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowModal({ type: 'transfer' })}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <ArrowLeftRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Transfer Antar Dompet</span>
                  </button>
                  <button
                    onClick={() => setShowModal({ type: 'wallet' })}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Dompet Baru</span>
                  </button>
                </div>
              </div>

              {/* Wallets Cards List */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {calculatedWallets.map((w) => (
                  <div
                    key={w.id}
                    className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {w.type}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setShowModal({ type: 'wallet', editData: w })}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                            title="Edit Dompet"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Hapus dompet "${w.name}"?`)) {
                                const fresh = await deleteWallet(w.id)
                                handleSuccess('Dompet dihapus', fresh)
                              }
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400"
                            title="Hapus Dompet"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{w.name}</h3>
                      <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{formatRupiah(w.currentBalance)}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>Pemasukan Masuk:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">+{formatRupiah(w.totalIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pengeluaran Keluar:</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">-{formatRupiah(w.totalExpense)}</span>
                      </div>
                      {w.balance > 0 && (
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Saldo Awal:</span>
                          <span>{formatRupiah(w.balance)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BUDGET BULANAN */}
          {tab === 'Budget' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Budgeting & Batas Belanja</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Alokasikan batas pengeluaran per kategori agar keuangan Anda selalu terkontrol.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-52">
                    <DatePickerInput
                      type="month"
                      value={selectedMonth}
                      onChange={setSelectedMonth}
                    />
                  </div>

                  <button
                    onClick={() => setShowModal({ type: 'budget' })}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Set Budget Kategori</span>
                  </button>
                </div>
              </div>

              {/* Budgets Grid */}
              {monthlyBudgets.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {monthlyBudgets.map((b) => {
                    const isOver = b.percentage > 100
                    const isWarning = b.percentage >= 80 && !isOver
                    return (
                      <div
                        key={b.id}
                        className={`rounded-3xl border p-6 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between ${
                          isOver ? 'border-rose-200 dark:border-rose-900/60' : isWarning ? 'border-amber-200 dark:border-amber-900/60' : 'border-slate-200/80 dark:border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <span
                                className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                  isOver
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                    : isWarning
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                }`}
                              >
                                {isOver ? 'Overbudget' : isWarning ? 'Waspada' : 'Aman'} ({b.percentage}%)
                              </span>
                              <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{b.categoryName}</h3>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setShowModal({ type: 'budget', editData: b })}
                                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Edit"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm('Hapus budget ini?')) {
                                    const fresh = await deleteBudget(b.id)
                                    handleSuccess('Budget dihapus', fresh)
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="Hapus"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                              <span>Terpakai: {formatRupiah(b.spent)}</span>
                              <span>Limit: {formatRupiah(b.amount)}</span>
                            </div>

                            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, b.percentage)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-400">Sisa Kuota:</span>
                          <span className={`font-black ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                            {b.remaining >= 0 ? formatRupiah(b.remaining) : `- ${formatRupiah(Math.abs(b.remaining))}`}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
                  <PiggyBank className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
                  <p className="mt-3 font-bold text-slate-800 dark:text-slate-200 text-base">Belum ada budget untuk bulan ini</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Buat budget untuk membatasi belanja makanan, tagihan, atau kebutuhan bulanan Anda.
                  </p>
                  <button
                    onClick={() => setShowModal({ type: 'budget' })}
                    className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
                  >
                    + Buat Budget Sekarang
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: KATEGORI */}
          {tab === 'Kategori' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Kelola Kategori Transaksi</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kustomisasi kategori pemasukan dan pengeluaran sesuai preferensi pribadi Anda.
                  </p>
                </div>
                <button
                  onClick={() => setShowModal({ type: 'category' })}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Kategori</span>
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-500" />
                    <span>Kategori Pengeluaran</span>
                  </h3>

                  <div className="space-y-2">
                    {data.categories
                      .filter((c) => c.type === 'expense')
                      .map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          <div className="flex items-center gap-3">
                            <Tag className="h-4 w-4 text-slate-400" />
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{c.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setShowModal({ type: 'category', editData: c })}
                              className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700"
                              title="Edit"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Hapus kategori "${c.name}"?`)) {
                                  const fresh = await deleteCategory(c.id)
                                  handleSuccess('Kategori dihapus', fresh)
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white dark:hover:bg-slate-700"
                              title="Hapus"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span>Kategori Pemasukan</span>
                  </h3>

                  <div className="space-y-2">
                    {data.categories
                      .filter((c) => c.type === 'income')
                      .map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          <div className="flex items-center gap-3">
                            <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{c.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setShowModal({ type: 'category', editData: c })}
                              className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700"
                              title="Edit"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Hapus kategori "${c.name}"?`)) {
                                  const fresh = await deleteCategory(c.id)
                                  handleSuccess('Kategori dihapus', fresh)
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white dark:hover:bg-slate-700"
                              title="Hapus"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ANALISIS & LAPORAN EXCEL */}
          {tab === 'Analisis' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Laporan & Ekspor Finansial</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Unduh file spreadsheet Excel (.xlsx) komprehensif berisi ringkasan, riwayat, dompet, dan budget.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 transition active:scale-95"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Download Excel Komprehensif (.xlsx)</span>
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30 p-8 shadow-sm">
                <div className="max-w-2xl space-y-3">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    Fitur Ekspor Excel Multi-Sheet
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Laporan Lengkap Siap Pakai untuk Pembukuan & Akuntansi
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Format Excel yang di-generate sudah otomatis terbagi ke dalam 5 Sheet terpisah dengan kolom rapi,
                    perhitungan formula saldo, dan format angka Rupiah Indonesia yang siap diprint atau dianalisis
                    lebih lanjut di Microsoft Excel, Google Sheets, atau Apple Numbers.
                  </p>

                  <div className="grid gap-3 pt-4 sm:grid-cols-2">
                    {[
                      'Sheet 1: Ringkasan Finansial & Net Savings',
                      'Sheet 2: Riwayat Lengkap Seluruh Transaksi',
                      'Sheet 3: Analisis Realisasi Budget Bulanan',
                      'Sheet 4: Saldo & Mutasi Seluruh Dompet / Akun',
                      'Sheet 5: Rekapitulasi Nominal Per Kategori',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={handleExportExcel}
                      className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                    >
                      Klik Di Sini Untuk Download (.xlsx)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PENGATURAN (SETTINGS) */}
          {tab === 'Pengaturan' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Pengaturan & Preferensi</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sesuaikan tema tampilan, tata letak sidebar, dan kelola preferensi akun Anda.
                </p>
              </div>

              {/* 1. Theme Settings Card */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sun className="h-5 w-5 text-amber-500" />
                    <span>Mode Tampilan & Tema (Dark Mode)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Pilih tampilan tema terang atau gelap sesuai kenyamanan mata Anda.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { id: 'light', title: 'Mode Terang', desc: 'Tampilan bersih & cerah', icon: Sun },
                    { id: 'dark', title: 'Mode Gelap (Dark)', desc: 'Tampilan nyaman di malam hari', icon: Moon },
                    { id: 'system', title: 'Otomatis Sistem', desc: 'Mengikuti pengaturan OS Anda', icon: Sparkles },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleThemeChange(t.id as any)}
                      className={`relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                        theme === t.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <t.icon className={`h-5 w-5 ${theme === t.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                        {theme === t.id && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <p className="mt-3 font-bold text-xs text-slate-900 dark:text-white">{t.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Sidebar Layout Settings */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <PanelLeftClose className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Tata Letak Sidebar Desktop</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Atur apakah sidebar utama ingin disembunyikan (collapsed mode) untuk ruang kerja yang lebih luas.
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
                      {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">
                        {sidebarCollapsed ? 'Sidebar Tertutup (Collapsed Icon Mode)' : 'Sidebar Terbuka Penuh (Expanded Mode)'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {sidebarCollapsed ? 'Hanya menampilkan icon menu' : 'Menampilkan teks dan logo lengkap'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={toggleSidebar}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                      sidebarCollapsed
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {sidebarCollapsed ? 'Tampilkan Penuh' : 'Sembunyikan'}
                  </button>
                </div>
              </div>

              {/* 3. User Profile Card */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Profil Pengguna & Keamanan</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Informasi akun yang sedang aktif masuk.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                      <span className="inline-block mt-1 rounded bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        Akun Terverifikasi
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await signOut()
                      router.push('/sign-in')
                    }}
                    className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Keluar dari Akun</span>
                  </button>
                </div>
              </div>

              {/* 4. Data Management */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Inisialisasi Data Default</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Jika Anda membutuhkan data awal (dompet & kategori default), klik tombol di bawah.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={async () => {
                      if (confirm('Tambahkan dompet dan kategori default jika belum ada?')) {
                        const fresh = await seedDefaults()
                        handleSuccess('Data default berhasil dicek/ditambahkan!', fresh)
                      }
                    }}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    <RefreshCw className="h-4 w-4 text-emerald-600" />
                    <span>Seed / Tambah Kategori Default</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL DIALOGS */}
      {showModal && (
        <ModalContainer close={() => setShowModal(null)}>
          {/* 1. Transaction Form Modal */}
          {showModal.type === 'transaction' && (
            <TransactionModal
              data={data}
              editData={showModal.editData}
              close={() => setShowModal(null)}
              done={handleSuccess}
            />
          )}

          {/* 2. Transfer Form Modal */}
          {showModal.type === 'transfer' && (
            <TransferModal data={data} close={() => setShowModal(null)} done={handleSuccess} />
          )}

          {/* 3. Wallet Form Modal */}
          {showModal.type === 'wallet' && (
            <WalletModal editData={showModal.editData} close={() => setShowModal(null)} done={handleSuccess} />
          )}

          {/* 4. Category Form Modal */}
          {showModal.type === 'category' && (
            <CategoryModal editData={showModal.editData} close={() => setShowModal(null)} done={handleSuccess} />
          )}

          {/* 5. Budget Form Modal */}
          {showModal.type === 'budget' && (
            <BudgetModal
              data={data}
              editData={showModal.editData}
              defaultMonth={selectedMonth}
              close={() => setShowModal(null)}
              done={handleSuccess}
            />
          )}
        </ModalContainer>
      )}
    </div>
  )
}

function ModalContainer({ children, close }: { children: React.ReactNode; close: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

// 1. Transaction Modal with React-Select & Interactive Date Picker
function TransactionModal({
  data,
  editData,
  close,
  done,
}: {
  data: Data
  editData?: Transaction
  close: () => void
  done: (msg: string, freshData?: Data) => void
}) {
  const [description, setDescription] = useState(editData?.description || '')
  const [amount, setAmount] = useState<number>(editData?.amount || 0)
  const [type, setType] = useState<'expense' | 'income'>((editData?.type as any) || 'expense')
  const [walletId, setWalletId] = useState<number>(editData?.walletId || data.wallets[0]?.id || 0)
  const [categoryId, setCategoryId] = useState<number>(editData?.categoryId || data.categories[0]?.id || 0)
  const [date, setDate] = useState<string>(
    editData ? new Date(editData.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  )
  const [submitting, setSubmitting] = useState(false)

  const filteredCategories = data.categories.filter((c) => c.type === type)

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType)
    const firstMatching = data.categories.find((c) => c.type === newType)
    if (firstMatching) setCategoryId(firstMatching.id)
  }

  const walletOptions: OptionType<number>[] = data.wallets.map((w) => ({
    value: w.id,
    label: `${w.name} (${w.type})`,
  }))

  const categoryOptions: OptionType<number>[] = filteredCategories.map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || amount <= 0) {
      alert('Mohon masukkan nominal transaksi yang valid')
      return
    }
    setSubmitting(true)
    try {
      if (editData) {
        const fresh = await updateTransaction({
          id: editData.id,
          walletId: Number(walletId),
          categoryId: Number(categoryId),
          type,
          amount,
          description,
          date,
        })
        done('Transaksi berhasil diperbarui!', fresh)
      } else {
        const fresh = await addTransaction({
          walletId: Number(walletId),
          categoryId: Number(categoryId),
          type,
          amount,
          description,
          date,
        })
        done('Transaksi baru berhasil ditambahkan!', fresh)
      }
      close()
    } catch (err: any) {
      alert(err?.message || 'Gagal menyimpan transaksi')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {editData ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
        </h3>
        <button type="button" onClick={close} className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Type Switcher */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5 text-xs font-bold">
        <button
          type="button"
          onClick={() => handleTypeChange('expense')}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition ${
            type === 'expense' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ArrowUpRight className="h-4 w-4" />
          <span>Pengeluaran</span>
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition ${
            type === 'income' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ArrowDownRight className="h-4 w-4" />
          <span>Pemasukan</span>
        </button>
      </div>

      {/* Live Auto-Converting Rupiah Input */}
      <RupiahInput
        value={amount}
        onChange={setAmount}
        label="Nominal Transaksi (Auto Rupiah)"
        placeholder="Rp 0"
        required
        showPresets
        showTerbilang
      />

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Deskripsi / Catatan *</label>
        <input
          type="text"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="cth: Makan siang, Gaji bulanan, Bensin..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
        />
      </div>

      {/* React-Select: Wallet & Category Selection */}
      <div className="grid gap-3 sm:grid-cols-2">
        <CustomSelect
          label="Pilih Dompet / Rekening"
          required
          value={walletOptions.find((o) => o.value === walletId)}
          onChange={(option) => option && setWalletId(option.value)}
          options={walletOptions}
          isSearchable
        />

        <CustomSelect
          label="Kategori Transaksi"
          required
          value={categoryOptions.find((o) => o.value === categoryId)}
          onChange={(option) => option && setCategoryId(option.value)}
          options={categoryOptions}
          isSearchable
        />
      </div>

      {/* Clickable Date Picker Popup */}
      <DatePickerInput
        label="Tanggal Transaksi (Klik untuk Memilih)"
        required
        value={date}
        onChange={setDate}
      />

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {submitting ? 'Menyimpan...' : editData ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
        </button>
      </div>
    </form>
  )
}

// 2. Transfer Modal Between Wallets with React-Select & Date Picker
function TransferModal({
  data,
  close,
  done,
}: {
  data: Data
  close: () => void
  done: (msg: string, freshData?: Data) => void
}) {
  const [fromWalletId, setFromWalletId] = useState<number>(data.wallets[0]?.id || 0)
  const [toWalletId, setToWalletId] = useState<number>(data.wallets[1]?.id || data.wallets[0]?.id || 0)
  const [amount, setAmount] = useState<number>(0)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [submitting, setSubmitting] = useState(false)

  const walletOptions: OptionType<number>[] = data.wallets.map((w) => ({
    value: w.id,
    label: `${w.name} (${w.type})`,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (fromWalletId === toWalletId) {
      alert('Dompet asal dan tujuan tidak boleh sama')
      return
    }
    if (!amount || amount <= 0) {
      alert('Mohon masukkan nominal transfer')
      return
    }
    setSubmitting(true)
    try {
      const fresh = await transferBetweenWallets({
        fromWalletId,
        toWalletId,
        amount,
        description,
        date,
      })
      done('Transfer saldo antar dompet berhasil!', fresh)
      close()
    } catch (err: any) {
      alert(err?.message || 'Gagal melakukan transfer')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transfer Antar Dompet</h3>
        <button type="button" onClick={close} className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <CustomSelect
          label="Dari Dompet (Sumber)"
          required
          value={walletOptions.find((o) => o.value === fromWalletId)}
          onChange={(opt) => opt && setFromWalletId(opt.value)}
          options={walletOptions}
        />

        <CustomSelect
          label="Ke Dompet (Tujuan)"
          required
          value={walletOptions.find((o) => o.value === toWalletId)}
          onChange={(opt) => opt && setToWalletId(opt.value)}
          options={walletOptions.filter((o) => o.value !== fromWalletId)}
        />
      </div>

      <RupiahInput
        value={amount}
        onChange={setAmount}
        label="Nominal Transfer (Auto Rupiah)"
        placeholder="Rp 0"
        required
        showPresets
        showTerbilang
      />

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Catatan Transfer (Opsional)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="cth: Top-up Gopay, Tarik Tunai..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <DatePickerInput
        label="Tanggal Transfer (Klik untuk Memilih)"
        required
        value={date}
        onChange={setDate}
      />

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {submitting ? 'Memproses Transfer...' : 'Kirim Transfer Saldo'}
        </button>
      </div>
    </form>
  )
}

// 3. Wallet Modal with React-Select
function WalletModal({
  editData,
  close,
  done,
}: {
  editData?: WalletType
  close: () => void
  done: (msg: string, freshData?: Data) => void
}) {
  const [name, setName] = useState(editData?.name || '')
  const [type, setType] = useState(editData?.type || 'Bank')
  const [balance, setBalance] = useState<number>(editData?.balance || 0)
  const [submitting, setSubmitting] = useState(false)

  const walletTypeOptions: OptionType<string>[] = [
    { value: 'Bank', label: 'Rekening Bank' },
    { value: 'E-wallet', label: 'E-Wallet (GoPay, OVO, Dana, dll)' },
    { value: 'Tunai', label: 'Uang Tunai / Cash' },
    { value: 'Kartu Kredit', label: 'Kartu Kredit' },
    { value: 'Investasi', label: 'Investasi / Saham / Reksadana' },
    { value: 'Lainnya', label: 'Lainnya' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editData) {
        const fresh = await updateWallet({
          id: editData.id,
          name,
          type,
        })
        done('Dompet berhasil diperbarui!', fresh)
      } else {
        const fresh = await addWallet({
          name,
          type,
          balance,
        })
        done('Dompet baru berhasil ditambahkan!', fresh)
      }
      close()
    } catch (err: any) {
      alert(err?.message || 'Gagal menyimpan dompet')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editData ? 'Edit Dompet' : 'Tambah Dompet / Rekening'}</h3>
        <button type="button" onClick={close} className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Nama Dompet / Rekening *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="cth: BCA Utama, Mandiri Tabungan, GoPay, Tunai..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <CustomSelect
        label="Tipe / Jenis Dompet"
        required
        value={walletTypeOptions.find((o) => o.value === type)}
        onChange={(opt) => opt && setType(opt.value)}
        options={walletTypeOptions}
        isSearchable={false}
      />

      {!editData && (
        <RupiahInput
          value={balance}
          onChange={setBalance}
          label="Saldo Awal (Opsional)"
          placeholder="Rp 0"
          showPresets
        />
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {submitting ? 'Menyimpan...' : editData ? 'Perbarui Dompet' : 'Simpan Dompet'}
        </button>
      </div>
    </form>
  )
}

// 4. Category Modal with React-Select
function CategoryModal({
  editData,
  close,
  done,
}: {
  editData?: Category
  close: () => void
  done: (msg: string, freshData?: Data) => void
}) {
  const [name, setName] = useState(editData?.name || '')
  const [type, setType] = useState(editData?.type || 'expense')
  const [submitting, setSubmitting] = useState(false)

  const categoryTypeOptions: OptionType<string>[] = [
    { value: 'expense', label: 'Pengeluaran (Expense)' },
    { value: 'income', label: 'Pemasukan (Income)' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editData) {
        const fresh = await updateCategory({
          id: editData.id,
          name,
          type,
        })
        done('Kategori berhasil diperbarui!', fresh)
      } else {
        const fresh = await addCategory({
          name,
          type,
        })
        done('Kategori baru berhasil ditambahkan!', fresh)
      }
      close()
    } catch (err: any) {
      alert(err?.message || 'Gagal menyimpan kategori')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editData ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
        <button type="button" onClick={close} className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Nama Kategori *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="cth: Belanja Bulanan, Kopi & Nongkrong, Bonus..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <CustomSelect
        label="Tipe Kategori"
        required
        value={categoryTypeOptions.find((o) => o.value === type)}
        onChange={(opt) => opt && setType(opt.value)}
        options={categoryTypeOptions}
        isSearchable={false}
      />

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {submitting ? 'Menyimpan...' : editData ? 'Perbarui Kategori' : 'Simpan Kategori'}
        </button>
      </div>
    </form>
  )
}

// 5. Budget Modal with React-Select & Clickable Month Picker
function BudgetModal({
  data,
  editData,
  defaultMonth,
  close,
  done,
}: {
  data: Data
  editData?: Budget
  defaultMonth: string
  close: () => void
  done: (msg: string, freshData?: Data) => void
}) {
  const [categoryId, setCategoryId] = useState<number>(
    editData?.categoryId || data.categories.find((c) => c.type === 'expense')?.id || data.categories[0]?.id || 0
  )
  const [amount, setAmount] = useState<number>(editData?.amount || 0)
  const [month, setMonth] = useState<string>(editData?.month || defaultMonth)
  const [submitting, setSubmitting] = useState(false)

  const expenseCategories = data.categories.filter((c) => c.type === 'expense')

  const categoryOptions: OptionType<number>[] = expenseCategories.map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || amount <= 0) {
      alert('Mohon masukkan batas budget yang valid')
      return
    }
    setSubmitting(true)
    try {
      const fresh = await upsertBudget({
        categoryId: Number(categoryId),
        amount,
        month,
      })
      done('Budget bulanan berhasil disimpan!', fresh)
      close()
    } catch (err: any) {
      alert(err?.message || 'Gagal menyimpan budget')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {editData ? 'Edit Budget Kategori' : 'Atur Budget Bulanan'}
        </h3>
        <button type="button" onClick={close} className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <X className="h-5 w-5" />
        </button>
      </div>

      <CustomSelect
        label="Pilih Kategori Pengeluaran"
        required
        value={categoryOptions.find((o) => o.value === categoryId)}
        onChange={(opt) => opt && setCategoryId(opt.value)}
        options={categoryOptions}
        isSearchable
      />

      <DatePickerInput
        label="Bulan Budget (Klik untuk Memilih)"
        type="month"
        required
        value={month}
        onChange={setMonth}
      />

      <RupiahInput
        value={amount}
        onChange={setAmount}
        label="Batas Alokasi Budget (Auto Rupiah)"
        placeholder="Rp 0"
        required
        showPresets
        showTerbilang
      />

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {submitting ? 'Menyimpan...' : 'Simpan Budget'}
        </button>
      </div>
    </form>
  )
}
