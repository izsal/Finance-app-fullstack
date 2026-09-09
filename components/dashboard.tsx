'use client'

import React, { useEffect, useMemo, useState, useTransition } from 'react'
import {
  addBudget,
  addCategory,
  addGoal,
  addSubscription,
  addTransaction,
  addWallet,
  deleteBudget,
  deleteCategory,
  deleteGoal,
  deleteSubscription,
  deleteTransaction,
  deleteWallet,
  depositToGoal,
  getFinanceData,
  paySubscription,
  seedDefaults,
  transferBetweenWallets,
  updateCategory,
  updateGoal,
  updateSubscription,
  updateTransaction,
  updateWallet,
  upsertBudget,
} from '@/app/actions/finance'
import { authClient, signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  CreditCard,
  Crown,
  Download,
  Edit3,
  ExternalLink,
  FileSpreadsheet,
  Filter,
  Globe,
  KeyRound,
  Languages,
  Layers,
  LayoutDashboard,
  Lock,
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
  Repeat,
  Search,
  Settings2,
  Shield,
  Smartphone,
  Sparkles,
  Sun,
  Tag,
  Target,
  Terminal,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  Wallet,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'
import type { Budget, Category, Goal, Subscription, Transaction, Wallet as WalletType } from '@/lib/schema'
import { formatIndoDate, formatRupiah } from '@/lib/utils'
import { RupiahInput } from '@/components/rupiah-input'
import { CustomSelect, CustomCreatableSelect, type OptionType } from '@/components/custom-select'
import { DatePickerInput } from '@/components/date-picker-input'
import { exportFinanceToExcel } from '@/lib/excel-export'
import { t, type Language } from '@/lib/i18n'
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
  goals?: Goal[]
  subscriptions?: Subscription[]
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
  user: { name: string; email: string; image?: string | null; emailVerified?: boolean; plan?: string }
  initialData: Data
}) {
  const [currentUser, setCurrentUser] = useState(user)
  const isPro = currentUser.plan === 'pro'
  const [showUpgradeModal, setShowUpgradeModal] = useState<{ featureName?: string; description?: string } | null>(null)
  const [data, setData] = useState<Data>({
    ...initialData,
    goals: initialData.goals || [],
    subscriptions: initialData.subscriptions || [],
  })
  const [tab, setTab] = useState<
    'Overview' | 'Transaksi' | 'Dompet' | 'Budget' | 'Target Impian' | 'Tagihan Rutin' | 'Kategori' | 'Analisis' | 'Pengaturan'
  >('Overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [lang, setLang] = useState<Language>('en')
  const [apiTestResult, setApiTestResult] = useState<string | null>(null)
  const [apiTesting, setApiTesting] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Profile update state
  const [profileName, setProfileName] = useState(user.name)
  const [isUpdatingName, setIsUpdatingName] = useState(false)
  const [nameStatus, setNameStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Resend email verification state
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Initialize and persist theme, language & sidebar state
  useEffect(() => {
    const savedTheme = (localStorage.getItem('dompetku-theme') as 'light' | 'dark' | 'system') || 'light'
    const savedSidebar = localStorage.getItem('dompetku-sidebar') === 'true'
    const savedLang = (localStorage.getItem('dompetku-lang') as Language) || 'en'
    setTheme(savedTheme)
    setSidebarCollapsed(savedSidebar)
    setLang(savedLang)

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
    showToast(lang === 'en' ? `Theme switched to ${newTheme} mode` : `Tema diganti ke mode ${newTheme === 'dark' ? 'Gelap' : newTheme === 'light' ? 'Terang' : 'Sistem'}`)
  }

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem('dompetku-lang', newLang)
    showToast(newLang === 'en' ? 'Language switched to English (US)!' : 'Bahasa dialihkan ke Bahasa Indonesia!', 'success')
  }

  const toggleSidebar = () => {
    const next = !sidebarCollapsed
    setSidebarCollapsed(next)
    localStorage.setItem('dompetku-sidebar', String(next))
  }

  // Keep state synced with server components
  useEffect(() => {
    if (initialData) {
      setData({
        ...initialData,
        goals: initialData.goals || [],
        subscriptions: initialData.subscriptions || [],
      })
    }
  }, [initialData])

  // Modal states
  const [showModal, setShowModal] = useState<
    | { type: 'transaction'; editData?: Transaction }
    | { type: 'transfer' }
    | { type: 'wallet'; editData?: WalletType }
    | { type: 'category'; editData?: Category }
    | { type: 'budget'; editData?: Budget }
    | { type: 'goal'; editData?: Goal }
    | { type: 'goalDeposit'; goal: Goal }
    | { type: 'subscription'; editData?: Subscription }
    | { type: 'paySubscription'; subscription: Subscription }
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
      setData({
        ...freshData,
        goals: freshData.goals || [],
        subscriptions: freshData.subscriptions || [],
      })
    } else {
      getFinanceData()
        .then((fresh) =>
          setData({
            ...fresh,
            goals: fresh.goals || [],
            subscriptions: fresh.subscriptions || [],
          })
        )
        .catch(() => { })
    }
    startTransition(() => {
      router.refresh()
    })
  }

  const testMobileApi = async () => {
    if (!isPro) {
      setShowUpgradeModal({
        featureName: 'Integrasi Mobile REST API Android',
        description: 'Akses API v1 untuk menghubungkan aplikasi Android, Flutter, atau automasi finansial kustom adalah fitur eksklusif Dompetku PRO.'
      })
      return
    }
    setApiTesting(true)
    setApiTestResult(null)
    try {
      const res = await fetch('/api/v1/summary')
      const json = await res.json()
      if (res.ok) {
        setApiTestResult(`HTTP 200 OK — ${json.message} (Total Saldo: ${formatRupiah(json.data?.metrics?.totalBalance)})`)
      } else {
        setApiTestResult(`HTTP ${res.status}: ${json.message || 'Error'}`)
      }
    } catch (e: any) {
      setApiTestResult(`Gagal menghubungi API: ${e.message}`)
    } finally {
      setApiTesting(false)
    }
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

  // Goals Metrics
  const goalsList = data.goals || []
  const totalGoalTarget = useMemo(() => goalsList.reduce((sum, g) => sum + g.targetAmount, 0), [goalsList])
  const totalGoalSaved = useMemo(() => goalsList.reduce((sum, g) => sum + g.currentAmount, 0), [goalsList])
  const overallGoalPercentage =
    totalGoalTarget > 0 ? Math.min(100, Math.round((totalGoalSaved / totalGoalTarget) * 100)) : 0

  // Subscriptions Metrics
  const subsList = data.subscriptions || []
  const totalMonthlyBills = useMemo(() => {
    return subsList
      .filter((s) => s.isActive)
      .reduce((sum, s) => {
        if (s.billingCycle === 'yearly') return sum + Math.round(s.amount / 12)
        if (s.billingCycle === 'weekly') return sum + s.amount * 4
        return sum + s.amount
      }, 0)
  }, [subsList])

  const todayDate = new Date().getDate()
  const dueSoonSubs = useMemo(() => {
    return subsList.filter((s) => {
      if (!s.isActive) return false
      const daysUntilDue = s.dueDate >= todayDate ? s.dueDate - todayDate : 30 - (todayDate - s.dueDate)
      return daysUntilDue <= (s.reminderDaysBefore || 3)
    })
  }, [subsList, todayDate])

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
    if (!isPro) {
      setShowUpgradeModal({
        featureName: 'Ekspor Laporan Excel (.xlsx)',
        description: 'Unduh seluruh catatan transaksi, buku kas, dan ringkasan anggaran Anda dalam format spreadsheet Excel (.xlsx) rapi dengan formula otomatis di Dompetku PRO.'
      })
      return
    }
    try {
      exportFinanceToExcel({
        user: currentUser,
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
    { value: 'all', label: t('all_types', lang) },
    { value: 'income', label: t('type_income', lang) },
    { value: 'expense', label: t('type_expense', lang) },
  ]

  const categoryFilterOptions: OptionType<string>[] = [
    { value: 'all', label: t('all_categories', lang) },
    ...data.categories.map((c) => ({
      value: String(c.id),
      label: `${c.name} (${c.type === 'income' ? (lang === 'en' ? 'Income' : 'Masuk') : (lang === 'en' ? 'Expense' : 'Keluar')})`,
    })),
  ]

  const walletFilterOptions: OptionType<string>[] = [
    { value: 'all', label: t('all_wallets', lang) },
    ...data.wallets.map((w) => ({
      value: String(w.id),
      label: `${w.name} (${w.type})`,
    })),
  ]

  const navMenuItems = [
    { key: 'Overview', label: t('nav_overview', lang), icon: LayoutDashboard },
    { key: 'Transaksi', label: t('nav_transactions', lang), icon: Receipt },
    { key: 'Dompet', label: t('nav_wallets', lang), icon: WalletCards },
    { key: 'Budget', label: t('nav_budget', lang), icon: PiggyBank, isProFeature: true, badge: !isPro ? '🔒 PRO' : undefined },
    { key: 'Target Impian', label: t('nav_goals', lang), icon: Target, isProFeature: true, badge: !isPro ? '🔒 PRO' : lang === 'en' ? 'Phase 2' : 'Tahap 2' },
    { key: 'Tagihan Rutin', label: t('nav_subscriptions', lang), icon: CalendarDays, isProFeature: true, badge: !isPro ? '🔒 PRO' : dueSoonSubs.length > 0 ? `${dueSoonSubs.length}` : undefined },
    { key: 'Kategori', label: t('nav_categories', lang), icon: Tag },
    { key: 'Analisis', label: t('nav_reports', lang), icon: BarChart3, isProFeature: true, badge: !isPro ? '🔒 PRO' : undefined },
    { key: 'Pengaturan', label: t('nav_settings', lang), icon: Settings2 },
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
        className={`fixed inset-y-0 hidden border-r border-slate-200/80 bg-white/90 dark:bg-slate-900/90 dark:border-slate-800 backdrop-blur-md p-4 lg:flex lg:flex-col lg:justify-between z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'
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
                title={t('sidebar_hide', lang)}
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
                title={t('sidebar_show', lang)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="mt-6">
            {!sidebarCollapsed && (
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('nav_main_menu', lang)}</p>
            )}
            <nav className="mt-2 space-y-1">
              {navMenuItems.map(({ key, label, icon: Icon, badge, isProFeature }) => (
                <button
                  key={key}
                  onClick={() => {
                    if (isProFeature && !isPro) {
                      setShowUpgradeModal({
                        featureName: label,
                        description: `Fitur ${label} adalah fitur eksklusif Dompetku PRO. Buka akses tanpa batas untuk mengelola keuangan Anda lebih cerdas.`
                      })
                      return
                    }
                    setTab(key as any)
                  }}
                  title={sidebarCollapsed ? label : undefined}
                  className={`flex w-full items-center rounded-xl py-2.5 text-xs font-semibold transition-all ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'
                    } ${tab === key
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 shrink-0 ${tab === key ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    {!sidebarCollapsed && <span>{label}</span>}
                  </div>
                  {!sidebarCollapsed && badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${tab === key
                        ? 'bg-white/20 text-white'
                        : badge.includes('PRO')
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : badge === 'Tahap 2'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-500 text-white'
                        }`}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* User Card in Sidebar */}
        <div className={`rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-3 ${sidebarCollapsed ? 'text-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 font-bold text-sm overflow-hidden">
              {currentUser.image ? (
                <img src={currentUser.image} alt={currentUser.name} className="h-full w-full object-cover" />
              ) : (
                currentUser.name.charAt(0).toUpperCase()
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">{currentUser.name}</p>
                  {isPro ? (
                    <span className="shrink-0 rounded bg-gradient-to-r from-amber-500 to-amber-600 px-1.5 py-0.2 text-[8px] font-black text-white shadow-xs">
                      PRO
                    </span>
                  ) : (
                    <span className="shrink-0 rounded bg-slate-200 dark:bg-slate-700 px-1 py-0.2 text-[8px] font-semibold text-slate-500 dark:text-slate-400">
                      FREE
                    </span>
                  )}
                </div>
                <p className="truncate text-[11px] text-slate-400">{currentUser.email}</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={async () => {
                  await signOut()
                  router.push('/sign-in')
                }}
                title={t('logout', lang)}
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
        className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
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

            <button
              onClick={toggleSidebar}
              title={sidebarCollapsed ? t('sidebar_show', lang) : t('sidebar_hide', lang)}
              className="hidden lg:flex rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>

            <div>
              <p className="text-xs font-medium text-slate-400">{t('welcome_back', lang)}</p>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white lg:text-xl">{currentUser.name}</h1>
                {isPro ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500" />
                    PRO
                  </span>
                ) : (
                  <button
                    onClick={() => setShowUpgradeModal({ featureName: 'Dompetku PRO', description: 'Buka semua fitur canggih tanpa batasan.' })}
                    className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-0.5 text-[10px] font-black text-white hover:brightness-110 shadow-sm shadow-amber-500/30 transition cursor-pointer"
                  >
                    <Sparkles className="h-2.5 w-2.5 fill-white" />
                    Upgrade PRO
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Language Switcher in Header */}
            <button
              onClick={() => handleLanguageChange(lang === 'en' ? 'id' : 'en')}
              title={lang === 'en' ? 'Beralih ke Bahasa Indonesia' : 'Switch to English'}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm"
            >
              <Languages className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'en' ? '🇺🇸 EN' : '🇮🇩 ID'}</span>
            </button>

            {/* Quick Dark Mode Switcher in Header */}
            <button
              onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? t('switch_theme_light', lang) : t('switch_theme_dark', lang)}
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
              <span className="hidden sm:inline">{t('export_excel', lang)}</span>
              {!isPro && <span className="rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] px-1.5 py-0.5 font-black">PRO 🔒</span>}
            </button>

            {/* Quick Add Transaction Button */}
            <button
              onClick={() => setShowModal({ type: 'transaction' })}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>{t('add_transaction', lang)}</span>
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
                <nav className="mt-4 space-y-1">
                  {navMenuItems.map(({ key, label, icon: Icon, badge, isProFeature }) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (isProFeature && !isPro) {
                          setShowUpgradeModal({
                            featureName: label,
                            description: `Fitur ${label} adalah fitur eksklusif Dompetku PRO. Buka akses tanpa batas untuk mengelola keuangan Anda lebih cerdas.`
                          })
                          setMobileMenuOpen(false)
                          return
                        }
                        setTab(key as any)
                        setMobileMenuOpen(false)
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold ${tab === key ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </div>
                      {badge && (
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${badge.includes('PRO')
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          }`}>
                          {badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="pt-4 border-t dark:border-slate-800 space-y-2">
                <button
                  onClick={() => handleLanguageChange(lang === 'en' ? 'id' : 'en')}
                  className="flex w-full items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <span className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-emerald-500" />
                    <span>Language ({lang === 'en' ? 'English 🇺🇸' : 'Indonesia 🇮🇩'})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Switch</span>
                </button>

                <button
                  onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
                  className="flex w-full items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <span className="flex items-center gap-2">
                    {theme === 'dark' ? <Moon className="h-4 w-4 text-emerald-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
                    <span>{lang === 'en' ? `Mode: ${theme === 'dark' ? 'Dark' : 'Light'}` : `Mode ${theme === 'dark' ? 'Gelap' : 'Terang'}`}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">{lang === 'en' ? 'Change' : 'Ubah'}</span>
                </button>
                <button
                  onClick={async () => {
                    await signOut()
                    router.push('/sign-in')
                  }}
                  className="flex w-full items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400"
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
                    {t('overview_title', lang)}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('overview_subtitle', lang)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowModal({ type: 'transfer' })}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <ArrowLeftRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('transfer_balance', lang)}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!isPro) {
                        setShowUpgradeModal({
                          featureName: 'Target Impian',
                          description: 'Fitur Target Impian membantu Anda menabung untuk membeli rumah, kendaraan, atau dana darurat dengan indikator visual otomatis di Dompetku PRO.'
                        })
                        return
                      }
                      setShowModal({ type: 'goal' })
                    }}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('nav_goals', lang)}</span>
                    {!isPro && <span className="text-[9px] font-bold text-amber-500">PRO</span>}
                  </button>
                </div>
              </div>

              {/* Financial Metric Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 p-6 text-white shadow-xl shadow-slate-900/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">{t('total_balance', lang)}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                      <WalletCards className="h-4 w-4 text-emerald-400" />
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-black tracking-tight">{formatRupiah(totalBalance)}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/10">
                    <span>{calculatedWallets.length} {t('accounts_consolidated', lang)}</span>
                    <span className="text-emerald-400 font-semibold">{t('consolidated', lang)}</span>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('total_income', lang)}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <ArrowDownRight className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {formatRupiah(totalIncome)}
                  </p>
                  <p className="mt-3 text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {t('accumulated_income', lang)}
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('total_expense', lang)}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                    {formatRupiah(totalExpense)}
                  </p>
                  <p className="mt-3 text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {t('accumulated_expense', lang)}
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('net_savings', lang)}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 font-bold text-xs">
                      {savingsRate}%
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-black text-teal-700 dark:text-teal-400 tracking-tight">
                    {formatRupiah(netSavings)}
                  </p>
                  <p className="mt-3 text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {t('savings_rate', lang)}: <span className="font-semibold text-teal-700 dark:text-teal-400">{savingsRate}%</span>
                  </p>
                </div>
              </div>

              {/* Tahap 2 Quick Highlights: Goals & Bill Alerts */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* 1. Target Tabungan Mini Card */}
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">{t('goals_tracker', lang)}</h3>
                          {!isPro && (
                            <span className="rounded-full bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 text-[9px] font-black text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              🔒 PRO
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{t('goals_progress', lang)}: {overallGoalPercentage}% / {formatRupiah(totalGoalTarget)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!isPro) {
                          setShowUpgradeModal({
                            featureName: 'Target Impian',
                            description: 'Fitur Target Impian membantu Anda menabung untuk membeli rumah, kendaraan, atau dana darurat dengan indikator visual otomatis di Dompetku PRO.'
                          })
                          return
                        }
                        setTab('Target Impian')
                      }}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                    >
                      <span>{t('open_goals', lang)}</span>
                      {!isPro && <span className="rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] px-1.5 py-0.5 font-black">PRO 🔒</span>}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {!isPro ? (
                    <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 p-5 text-center space-y-3 my-auto">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <Lock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('goals_locked_title', lang)}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                          {t('goals_locked_desc', lang)}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowUpgradeModal({
                          featureName: 'Target Impian',
                          description: 'Fitur Target Impian membantu Anda menabung untuk membeli rumah, kendaraan, atau dana darurat dengan indikator visual otomatis di Dompetku PRO.'
                        })}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-black text-white shadow hover:from-emerald-700 hover:to-teal-700 transition"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                        <span>{t('open_pro_goals', lang)}</span>
                      </button>
                    </div>
                  ) : goalsList.length > 0 ? (
                    <div className="space-y-3">
                      {goalsList.slice(0, 2).map((g) => {
                        const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0
                        return (
                          <div key={g.id} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-bold text-slate-900 dark:text-white">{g.name}</span>
                              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{pct}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                              <span>{t('collected', lang)}: {formatRupiah(g.currentAmount)}</span>
                              <span>{t('target', lang)}: {formatRupiah(g.targetAmount)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400">
                      {t('no_goals', lang)}
                    </div>
                  )}
                </div>

                {/* 2. Tagihan Rutin & Pengingat Mini Card */}
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">{t('bills_tracker', lang)}</h3>
                          {!isPro && (
                            <span className="rounded-full bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 text-[9px] font-black text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              🔒 PRO
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{t('monthly_est', lang)}: {formatRupiah(totalMonthlyBills)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!isPro) {
                          setShowUpgradeModal({
                            featureName: 'Tagihan Rutin',
                            description: 'Fitur Tagihan Rutin memantau pengeluaran berulang bulanan seperti langganan, listrik, WiFi, dan cicilan dengan pengingat jatuh tempo otomatis di Dompetku PRO.'
                          })
                          return
                        }
                        setTab('Tagihan Rutin')
                      }}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                    >
                      <span>{t('open_bills', lang)}</span>
                      {!isPro && <span className="rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] px-1.5 py-0.5 font-black">PRO 🔒</span>}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {!isPro ? (
                    <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 p-5 text-center space-y-3 my-auto">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <Lock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('bills_locked_title', lang)}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                          {t('bills_locked_desc', lang)}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowUpgradeModal({
                          featureName: 'Tagihan Rutin',
                          description: 'Fitur Tagihan Rutin memantau pengeluaran berulang bulanan seperti langganan, listrik, WiFi, dan cicilan dengan pengingat jatuh tempo otomatis di Dompetku PRO.'
                        })}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-black text-white shadow hover:from-emerald-700 hover:to-teal-700 transition"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                        <span>{t('open_pro_bills', lang)}</span>
                      </button>
                    </div>
                  ) : subsList.length > 0 ? (
                    <div className="space-y-2">
                      {subsList.slice(0, 3).map((s) => {
                        const daysLeft = s.dueDate >= todayDate ? s.dueDate - todayDate : 30 - (todayDate - s.dueDate)
                        const isDueSoon = s.isActive && daysLeft <= (s.reminderDaysBefore || 3)
                        return (
                          <div key={s.id} className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${isDueSoon ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                                {s.dueDate}
                              </div>
                              <div>
                                <p className="font-bold text-xs text-slate-900 dark:text-white">{s.name}</p>
                                <p className="text-[10px] text-slate-400">{t('due_date_on', lang)} {s.dueDate} ({daysLeft === 0 ? t('today', lang) : `${daysLeft} ${t('days_left', lang)}`})</p>
                              </div>
                            </div>
                            <span className="font-black text-xs text-slate-900 dark:text-white">{formatRupiah(s.amount)}</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400">
                      {t('no_bills', lang)}
                    </div>
                  )}
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">{t('cashflow_chart', lang)}</h3>
                      <p className="text-xs text-slate-400">{t('cashflow_sub', lang)}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> {t('cashflow_in', lang)}
                      </span>
                      <span className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> {t('cashflow_out', lang)}
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
                            name={t('cashflow_in', lang)}
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#incomeGrad)"
                          />
                          <Area
                            type="monotone"
                            dataKey="expense"
                            name={t('cashflow_out', lang)}
                            stroke="#f43f5e"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#expenseGrad)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400">
                        {t('cashflow_empty', lang)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{t('expense_category_chart', lang)}</h3>
                    <p className="text-xs text-slate-400">{t('expense_category_sub', lang)}</p>
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
                        {t('expense_empty', lang)}
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
            </div>
          )}

          {/* TAB 2: TRANSAKSI */}
          {tab === 'Transaksi' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {t('tx_title', lang)}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('tx_subtitle', lang)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition shadow-sm"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('download_excel', lang)}</span>
                    {!isPro && <span className="rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] px-1.5 py-0.5 font-black">PRO 🔒</span>}
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <Download className="h-4 w-4 text-slate-500" />
                    <span>{t('export_csv', lang)}</span>
                  </button>
                  <button
                    onClick={() => setShowModal({ type: 'transaction' })}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t('add_transaction', lang)}</span>
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
                      placeholder={t('tx_search_placeholder', lang)}
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
                    placeholder={t('all_categories', lang)}
                  />

                  <CustomSelect
                    value={walletFilterOptions.find((o) => o.value === walletFilter)}
                    onChange={(option) => setWalletFilter(option?.value || 'all')}
                    options={walletFilterOptions}
                    isSearchable
                    placeholder={t('all_wallets', lang)}
                  />
                </div>

                {/* Date presets */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-400 mr-1">{t('period', lang)}</span>
                    {[
                      { id: 'all', label: t('period_all', lang) },
                      { id: '7days', label: t('period_7days', lang) },
                      { id: '30days', label: t('period_30days', lang) },
                      { id: 'month', label: t('period_month', lang) },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setDateFilter(p.id as any)}
                        className={`rounded-lg px-2.5 py-1 font-semibold transition ${dateFilter === p.id
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <span className="text-slate-400 font-medium">
                    {t('showing_tx', lang)} <b className="text-slate-800 dark:text-slate-200">{filteredTransactions.length}</b> {t('transactions_count', lang)}
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
                          <th className="pb-3 pl-2">{t('col_date', lang)}</th>
                          <th className="pb-3">{t('col_desc', lang)}</th>
                          <th className="pb-3">{t('col_category', lang)}</th>
                          <th className="pb-3">{t('col_wallet', lang)}</th>
                          <th className="pb-3 text-right">{t('col_amount', lang)}</th>
                          <th className="pb-3 pr-2 text-right">{t('col_actions', lang)}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {filteredTransactions.map((tRow) => {
                          const cat = categoryMap.get(tRow.categoryId)
                          const wal = walletMap.get(tRow.walletId)
                          const isInc = tRow.type === 'income'
                          return (
                            <tr key={tRow.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                              <td className="py-3.5 pl-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{formatIndoDate(tRow.date, false, lang)}</p>
                                <p className="text-[10px] text-slate-400">
                                  {new Date(tRow.date).toLocaleTimeString(lang === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </td>
                              <td className="py-3.5 font-bold text-slate-900 dark:text-white max-w-xs">{tRow.description}</td>
                              <td className="py-3.5 whitespace-nowrap">
                                <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-semibold text-slate-700 dark:text-slate-300">
                                  {cat?.name || t('col_category', lang)}
                                </span>
                              </td>
                              <td className="py-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">{wal?.name || t('col_wallet', lang)}</td>
                              <td className="py-3.5 text-right whitespace-nowrap">
                                <span className={`font-black text-sm ${isInc ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                  {isInc ? '+' : '-'} {formatRupiah(tRow.amount)}
                                </span>
                              </td>
                              <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setShowModal({ type: 'transaction', editData: tRow })}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                                    title={t('edit', lang)}
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (confirm(t('confirm_delete_tx', lang))) {
                                        const fresh = await deleteTransaction(tRow.id)
                                        handleSuccess(lang === 'en' ? 'Transaction deleted' : 'Transaksi dihapus', fresh)
                                      }
                                    }}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400"
                                    title={t('delete', lang)}
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
                    <p className="mt-3 font-bold text-slate-700 dark:text-slate-300">{t('no_tx_found', lang)}</p>
                    <p className="text-xs text-slate-400 mt-1">{t('no_tx_found_sub', lang)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: TARGET IMPIAN (FINANCIAL GOALS - TAHAP 2) */}
          {tab === 'Target Impian' && (
            !isPro ? (
              <div className="rounded-3xl border border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30 p-8 sm:p-12 text-center shadow-sm max-w-3xl mx-auto space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <Lock className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 px-3 py-1 text-xs font-black text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    FITUR EKSKLUSIF DOMPETKU PRO
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Target Tabungan Impian (Financial Goals)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                    Wujudkan target finansial Anda seperti membeli rumah, kendaraan, liburan, atau dana darurat dengan visual tracker progres otomatis, fitur setor tabungan 1-klik, dan estimasi tanggal tercapai.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-left max-w-lg mx-auto pt-2">
                  {[
                    'Target Tabungan Tanpa Batas',
                    'Indikator Visual Progres Persentase',
                    'Setor Tabungan 1-Klik dari Saldo Dompet',
                    'Perhitungan Estimasi Sisa Hari & Target Tercapai',
                    'Integrasi Mutasi Transaksi Otomatis',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setShowUpgradeModal({
                      featureName: 'Target Impian',
                      description: 'Fitur Target Impian membantu Anda menabung untuk membeli rumah, kendaraan, atau dana darurat dengan indikator visual otomatis di Dompetku PRO.'
                    })}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-3.5 text-xs font-black text-white shadow-xl shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 transition active:scale-95"
                  >
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>Buka Akses Target Impian (Upgrade PRO)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {t('goals_tab_title', lang)}
                      </h2>
                      <span className="rounded-xl bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        Tahap 2
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t('goals_tab_subtitle', lang)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal({ type: 'goal' })}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t('create_goal', lang)}</span>
                  </button>
                </div>

              {/* Goals Summary Stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <p className="text-xs text-slate-400 font-semibold">{t('total_goal_target', lang)}</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{formatRupiah(totalGoalTarget)}</p>
                  <p className="text-[11px] text-slate-400 mt-2">{goalsList.length} {t('active_goals_count', lang)}</p>
                </div>
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <p className="text-xs text-slate-400 font-semibold">{t('total_goal_saved', lang)}</p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatRupiah(totalGoalSaved)}</p>
                  <p className="text-[11px] text-slate-400 mt-2">{t('goal_remaining', lang)} {formatRupiah(Math.max(0, totalGoalTarget - totalGoalSaved))}</p>
                </div>
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <p className="text-xs text-slate-400 font-semibold">{t('goal_average_progress', lang)}</p>
                  <p className="text-xl font-black text-teal-700 dark:text-teal-400 mt-1">{overallGoalPercentage}%</p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 mt-2">
                    <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${overallGoalPercentage}%` }} />
                  </div>
                </div>
              </div>

              {/* Goals Grid */}
              {goalsList.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {goalsList.map((g) => {
                    const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0
                    const remaining = Math.max(0, g.targetAmount - g.currentAmount)
                    const isDone = g.isAchieved || pct >= 100

                    return (
                      <div
                        key={g.id}
                        className={`rounded-3xl border bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between transition hover:shadow-md ${isDone ? 'border-emerald-300 dark:border-emerald-800 bg-gradient-to-b from-emerald-50/30 to-white dark:from-emerald-950/20 dark:to-slate-900' : 'border-slate-200/80 dark:border-slate-800'
                          }`}
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isDone ? 'bg-emerald-500 text-white' : 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400'
                                  }`}
                              >
                                {isDone ? <Award className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                              </div>
                              <div>
                                <h3 className="font-bold text-base text-slate-900 dark:text-white">{g.name}</h3>
                                {g.targetDate && (
                                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Clock className="h-3 w-3" />
                                    <span>Target: {new Date(g.targetDate).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { month: 'short', year: 'numeric' })}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setShowModal({ type: 'goal', editData: g })}
                                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                title={t('edit', lang)}
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(t('confirm_delete_goal', lang))) {
                                    const fresh = await deleteGoal(g.id)
                                    handleSuccess(lang === 'en' ? 'Financial goal deleted' : 'Target impian dihapus', fresh)
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title={t('delete', lang)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-5 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-500 dark:text-slate-400">{t('goal_progress', lang)}</span>
                              <span className={`font-black text-sm ${isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                {pct}% {isDone && `🎉 ${t('goal_achieved', lang)}`}
                              </span>
                            </div>

                            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                                  }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1">
                              <span className="font-bold text-slate-900 dark:text-white">{formatRupiah(g.currentAmount)}</span>
                              <span className="text-slate-400">Target: {formatRupiah(g.targetAmount)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400">
                            {isDone ? t('goal_all_done', lang) : `${t('goal_remaining_short', lang)} ${formatRupiah(remaining)}`}
                          </span>

                          {!isDone && (
                            <button
                              onClick={() => setShowModal({ type: 'goalDeposit', goal: g })}
                              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>+ {t('deposit_savings', lang)}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
                  <Target className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
                  <p className="mt-3 font-bold text-slate-800 dark:text-slate-200 text-base">{t('goal_empty_title', lang)}</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {t('goal_empty_desc', lang)}
                  </p>
                  <button
                    onClick={() => setShowModal({ type: 'goal' })}
                    className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
                  >
                    {t('goal_empty_btn', lang)}
                  </button>
                </div>
              )}
            </div>
            )
          )}

          {/* TAB: TAGIHAN RUTIN & LANGGANAN (SUBSCRIPTIONS - TAHAP 2) */}
          {tab === 'Tagihan Rutin' && (
            !isPro ? (
              <div className="rounded-3xl border border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30 p-8 sm:p-12 text-center shadow-sm max-w-3xl mx-auto space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <Lock className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 px-3 py-1 text-xs font-black text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    FITUR EKSKLUSIF DOMPETKU PRO
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Manajemen Tagihan & Langganan Rutin
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                    Kelola seluruh pengeluaran berulang bulanan seperti langganan digital (Netflix, Spotify), utilitas rumah tangga (PLN, WiFi), asuransi BPJS, dan cicilan berkala dengan sistem peringatan jatuh tempo otomatis.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-left max-w-lg mx-auto pt-2">
                  {[
                    'Pengingat Jatuh Tempo Tagihan H-3 Otomatis',
                    'Fitur Bayar Tagihan 1-Klik Otomatis Catat Transaksi',
                    'Kalkulasi Total Beban Tagihan Bulanan Real-Time',
                    'Daftar Langganan Aktif & Nonaktif Fleksibel',
                    'Pilihan Pembayaran Berulang Per Bulan / Per Tahun',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setShowUpgradeModal({
                      featureName: 'Tagihan Rutin',
                      description: 'Fitur Tagihan Rutin memantau pengeluaran berulang bulanan seperti langganan, listrik, WiFi, dan cicilan dengan pengingat jatuh tempo otomatis di Dompetku PRO.'
                    })}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-3.5 text-xs font-black text-white shadow-xl shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 transition active:scale-95"
                  >
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>Buka Akses Tagihan Rutin (Upgrade PRO)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {t('bills_tab_title', lang)}
                      </h2>
                      <span className="rounded-xl bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        Tahap 2
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t('bills_tab_subtitle', lang)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal({ type: 'subscription' })}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t('add_bill', lang)}</span>
                  </button>
                </div>

              {/* Subscriptions Metrics */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <p className="text-xs text-slate-400 font-semibold">{t('total_monthly_bills', lang)}</p>
                  <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{formatRupiah(totalMonthlyBills)}</p>
                  <p className="text-[11px] text-slate-400 mt-2">{subsList.filter((s) => s.isActive).length} {t('active_subs_count', lang)}</p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <p className="text-xs text-slate-400 font-semibold">{t('due_soon_alert', lang)}</p>
                  <p className="text-xl font-black text-amber-500 mt-1">{dueSoonSubs.length} {lang === 'en' ? 'Bills' : 'Tagihan'}</p>
                  <p className="text-[11px] text-slate-400 mt-2">{t('due_soon_sub', lang)}</p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <p className="text-xs text-slate-400 font-semibold">{t('api_sync_title', lang)}</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                    <Zap className="h-4 w-4" /> {t('api_sync_desc', lang)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2">Endpoint: /api/v1/subscriptions</p>
                </div>
              </div>

              {/* Subscriptions List */}
              {subsList.length > 0 ? (
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                          <th className="pb-3 pl-2">{t('sub_col_date', lang)}</th>
                          <th className="pb-3">{t('sub_col_name', lang)}</th>
                          <th className="pb-3">{t('sub_col_cycle', lang)}</th>
                          <th className="pb-3">{t('sub_col_status', lang)}</th>
                          <th className="pb-3 text-right">{t('sub_col_cost', lang)}</th>
                          <th className="pb-3 pr-2 text-right">{t('sub_col_action', lang)}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {subsList.map((s) => {
                          const daysLeft = s.dueDate >= todayDate ? s.dueDate - todayDate : 30 - (todayDate - s.dueDate)
                          const isDueSoon = s.isActive && daysLeft <= (s.reminderDaysBefore || 3)

                          return (
                            <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                              <td className="py-4 pl-2 whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-xl font-black text-xs ${isDueSoon
                                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 ring-2 ring-rose-500/20'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                                      }`}
                                  >
                                    {s.dueDate}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">{lang === 'en' ? `${s.dueDate}th each month` : `Tgl ${s.dueDate} tiap bulan`}</p>
                                    <p className={`text-[10px] ${isDueSoon ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                                      {daysLeft === 0 ? t('sub_due_today', lang) : `${daysLeft} ${t('days_left', lang)}`}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 font-bold text-slate-900 dark:text-white text-sm">{s.name}</td>
                              <td className="py-4 whitespace-nowrap">
                                <span className="inline-block rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                  {s.billingCycle === 'monthly' ? t('sub_cycle_monthly', lang) : s.billingCycle === 'yearly' ? t('sub_cycle_yearly', lang) : t('sub_cycle_weekly', lang)}
                                </span>
                              </td>
                              <td className="py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${s.isActive
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                    }`}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full ${s.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                  {s.isActive ? t('sub_status_active', lang) : t('sub_status_inactive', lang)}
                                </span>
                              </td>
                              <td className="py-4 text-right font-black text-slate-900 dark:text-white text-sm whitespace-nowrap">
                                {formatRupiah(s.amount)}
                              </td>
                              <td className="py-4 pr-2 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setShowModal({ type: 'paySubscription', subscription: s })}
                                    className="flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition"
                                    title={lang === 'en' ? 'Record Payment' : 'Catat Pembayaran Tagihan Ini'}
                                  >
                                    <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>{t('pay_bill', lang)}</span>
                                  </button>

                                  <button
                                    onClick={() => setShowModal({ type: 'subscription', editData: s })}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                                    title={t('edit', lang)}
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (confirm(t('confirm_delete_sub', lang))) {
                                        const fresh = await deleteSubscription(s.id)
                                        handleSuccess(lang === 'en' ? 'Recurring bill deleted' : 'Tagihan dihapus', fresh)
                                      }
                                    }}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400"
                                    title={t('delete', lang)}
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
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
                  <CalendarDays className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
                  <p className="mt-3 font-bold text-slate-800 dark:text-slate-200 text-base">{t('sub_empty_title', lang)}</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {t('sub_empty_desc', lang)}
                  </p>
                  <button
                    onClick={() => setShowModal({ type: 'subscription' })}
                    className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
                  >
                    {t('sub_empty_btn', lang)}
                  </button>
                </div>
              )}
            </div>
            )
          )}

          {/* TAB 3: DOMPET & AKUN */}
          {tab === 'Dompet' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {t('wallets_title', lang)}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('wallets_subtitle', lang)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowModal({ type: 'transfer' })}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <ArrowLeftRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('transfer_between_wallets', lang)}</span>
                  </button>
                  <button
                    onClick={() => setShowModal({ type: 'wallet' })}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t('add_wallet', lang)}</span>
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
                            title={lang === 'en' ? 'Edit Wallet' : 'Edit Dompet'}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(lang === 'en' ? `Delete wallet "${w.name}"?` : `Hapus dompet "${w.name}"?`)) {
                                const fresh = await deleteWallet(w.id)
                                handleSuccess(lang === 'en' ? 'Wallet deleted' : 'Dompet dihapus', fresh)
                              }
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400"
                            title={lang === 'en' ? 'Delete Wallet' : 'Hapus Dompet'}
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
                        <span>{t('wallet_income_in', lang)}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">+{formatRupiah(w.totalIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('wallet_expense_out', lang)}</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">-{formatRupiah(w.totalExpense)}</span>
                      </div>
                      {w.balance > 0 && (
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>{t('initial_balance', lang)}:</span>
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
            !isPro ? (
              <div className="rounded-3xl border border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30 p-8 sm:p-12 text-center shadow-sm max-w-3xl mx-auto space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <Lock className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 px-3 py-1 text-xs font-black text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    {t('pro_exclusive', lang)}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    {t('budget_tab_title', lang)}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                    {t('budget_tab_subtitle', lang)}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-left max-w-lg mx-auto pt-2">
                  {[
                    lang === 'en' ? 'Unlimited Category Spending Caps' : 'Batas Anggaran Per Kategori Tanpa Batas',
                    lang === 'en' ? 'Real-Time Budget Tracking Visuals' : 'Visual Tracking Realisasi Budget Real-Time',
                    lang === 'en' ? 'Automatic Warning When Approaching / Over Budget' : 'Peringatan Otomatis Saat Budget Mendekati / Melebihi Batas',
                    lang === 'en' ? 'Historical Budget Usage Across Months' : 'Histori Pemakaian Budget Antar Bulan',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setShowUpgradeModal({
                      featureName: lang === 'en' ? 'Monthly Budget' : 'Budget Bulanan',
                      description: lang === 'en'
                        ? 'Control spending with category monthly limits and automatic overbudget alerts in Dompetku PRO.'
                        : 'Kendalikan pengeluaran dengan batas anggaran bulanan per kategori dan notifikasi over-budget otomatis di Dompetku PRO.'
                    })}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-3.5 text-xs font-black text-white shadow-xl shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 transition active:scale-95"
                  >
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>{lang === 'en' ? 'Unlock Monthly Budget (Upgrade PRO)' : 'Buka Akses Budget Bulanan (Upgrade PRO)'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {t('budget_tab_title', lang)}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t('budget_tab_subtitle', lang)}
                    </p>
                  </div>
                <div className="flex items-center gap-3">
                  <div className="w-52">
                    <DatePickerInput
                      type="month"
                      value={selectedMonth}
                      onChange={setSelectedMonth}
                      lang={lang}
                    />
                  </div>

                  <button
                    onClick={() => setShowModal({ type: 'budget' })}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t('set_budget', lang)}</span>
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
                        className={`rounded-3xl border p-6 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between ${isOver ? 'border-rose-200 dark:border-rose-900/60' : isWarning ? 'border-amber-200 dark:border-amber-900/60' : 'border-slate-200/80 dark:border-slate-800'
                          }`}
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <span
                                className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${isOver
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                  : isWarning
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  }`}
                              >
                                {isOver ? t('budget_overbudget', lang) : isWarning ? t('budget_warning', lang) : t('budget_safe', lang)} ({b.percentage}%)
                              </span>
                              <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{b.categoryName}</h3>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setShowModal({ type: 'budget', editData: b })}
                                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                title={t('edit', lang)}
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(t('confirm_delete_budget', lang))) {
                                    const fresh = await deleteBudget(b.id)
                                    handleSuccess(lang === 'en' ? 'Budget deleted' : 'Budget dihapus', fresh)
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title={t('delete', lang)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                              <span>{t('budget_spent', lang)} {formatRupiah(b.spent)}</span>
                              <span>{t('budget_limit', lang)} {formatRupiah(b.amount)}</span>
                            </div>

                            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                style={{ width: `${Math.min(100, b.percentage)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-400">{t('budget_remaining', lang)}</span>
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
                  <p className="mt-3 font-bold text-slate-800 dark:text-slate-200 text-base">{t('budget_empty', lang)}</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {t('budget_empty_sub', lang)}
                  </p>
                  <button
                    onClick={() => setShowModal({ type: 'budget' })}
                    className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
                  >
                    {t('create_budget_now', lang)}
                  </button>
                </div>
              )}
            </div>
            )
          )}

          {/* TAB 5: KATEGORI */}
          {tab === 'Kategori' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {t('categories_tab_title', lang)}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('categories_tab_subtitle', lang)}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal({ type: 'category' })}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('add_category', lang)}</span>
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-500" />
                    <span>{t('cat_expense', lang)}</span>
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
                              title={t('edit', lang)}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(lang === 'en' ? `Delete category "${c.name}"?` : `Hapus kategori "${c.name}"?`)) {
                                  const fresh = await deleteCategory(c.id)
                                  handleSuccess(lang === 'en' ? 'Category deleted' : 'Kategori dihapus', fresh)
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white dark:hover:bg-slate-700"
                              title={t('delete', lang)}
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
                    <span>{t('cat_income', lang)}</span>
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
                              title={t('edit', lang)}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(lang === 'en' ? `Delete category "${c.name}"?` : `Hapus kategori "${c.name}"?`)) {
                                  const fresh = await deleteCategory(c.id)
                                  handleSuccess(lang === 'en' ? 'Category deleted' : 'Kategori dihapus', fresh)
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white dark:hover:bg-slate-700"
                              title={t('delete', lang)}
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
            !isPro ? (
              <div className="rounded-3xl border border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30 p-8 sm:p-12 text-center shadow-sm max-w-3xl mx-auto space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <Lock className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 px-3 py-1 text-xs font-black text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    {t('pro_exclusive', lang)}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    {lang === 'en' ? 'Full Reports & Multi-Sheet Excel (.xlsx) Export' : 'Laporan Lengkap & Ekspor Excel (.xlsx) Multi-Sheet'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                    {lang === 'en'
                      ? 'Download a comprehensive 5-sheet Excel workbook (Summary, Transactions, Budget, Wallets, and Categories) with clean formatting and balance formulas ready for Microsoft Excel & Google Sheets.'
                      : 'Unduh file spreadsheet Excel komprehensif 5 Sheet terpisah (Ringkasan, Transaksi, Budget, Rekening, dan Kategori) dengan format rapi dan formula saldo siap pakai untuk Microsoft Excel & Google Sheets.'}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-left max-w-lg mx-auto pt-2">
                  {[
                    lang === 'en' ? 'Sheet 1: Financial Summary & Net Savings' : 'Sheet 1: Ringkasan Finansial & Net Savings',
                    lang === 'en' ? 'Sheet 2: Complete Transaction History' : 'Sheet 2: Riwayat Lengkap Seluruh Transaksi',
                    lang === 'en' ? 'Sheet 3: Monthly Budget Realization Analysis' : 'Sheet 3: Analisis Realisasi Budget Bulanan',
                    lang === 'en' ? 'Sheet 4: Balances & Transfers Across All Wallets' : 'Sheet 4: Saldo & Mutasi Seluruh Dompet / Akun',
                    lang === 'en' ? 'Sheet 5: Expense Recapitulation by Category' : 'Sheet 5: Rekapitulasi Nominal Per Kategori',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setShowUpgradeModal({
                      featureName: lang === 'en' ? 'Reports & Excel (.xlsx) Export' : 'Laporan & Ekspor Excel (.xlsx)',
                      description: lang === 'en'
                        ? 'Download all your transactions, cashbooks, and budget summaries in formatted Excel (.xlsx) sheets with automated formulas in Dompetku PRO.'
                        : 'Unduh seluruh catatan transaksi, buku kas, dan ringkasan anggaran Anda dalam format spreadsheet Excel (.xlsx) rapi dengan formula otomatis di Dompetku PRO.'
                    })}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-3.5 text-xs font-black text-white shadow-xl shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 transition active:scale-95"
                  >
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>{lang === 'en' ? 'Unlock Reports & Excel (Upgrade PRO)' : 'Buka Akses Laporan & Excel (Upgrade PRO)'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {t('reports_tab_title', lang)}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t('reports_tab_subtitle', lang)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleExportExcel}
                      className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 transition active:scale-95"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>{t('download_comprehensive_excel', lang)}</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30 p-8 shadow-sm">
                  <div className="max-w-2xl space-y-3">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      {t('excel_feature_badge', lang)}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      {t('excel_feature_title', lang)}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t('excel_feature_desc', lang)}
                    </p>

                    <div className="grid gap-3 pt-4 sm:grid-cols-2">
                      {[
                        lang === 'en' ? 'Sheet 1: Financial Summary & Net Savings' : 'Sheet 1: Ringkasan Finansial & Net Savings',
                        lang === 'en' ? 'Sheet 2: Complete Transaction History' : 'Sheet 2: Riwayat Lengkap Seluruh Transaksi',
                        lang === 'en' ? 'Sheet 3: Monthly Budget Realization Analysis' : 'Sheet 3: Analisis Realisasi Budget Bulanan',
                        lang === 'en' ? 'Sheet 4: Balances & Transfers Across All Wallets' : 'Sheet 4: Saldo & Mutasi Seluruh Dompet / Akun',
                        lang === 'en' ? 'Sheet 5: Expense Recapitulation by Category' : 'Sheet 5: Rekapitulasi Nominal Per Kategori',
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
                        {lang === 'en' ? 'Click Here to Download (.xlsx)' : 'Klik Di Sini Untuk Download (.xlsx)'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* TAB 7: PENGATURAN (SETTINGS) */}
          {tab === 'Pengaturan' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {t('settings_title', lang)}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('settings_subtitle', lang)}
                </p>
              </div>

              {/* 1. Language Settings Card */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('language_card_title', lang)}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('language_card_desc', lang)}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { id: 'en' as const, title: 'English (US)', desc: 'Active default language with clean global UI terminology', flag: '🇺🇸' },
                    { id: 'id' as const, title: 'Bahasa Indonesia', desc: 'Tampilan antarmuka berbahasa Indonesia asli', flag: '🇮🇩' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleLanguageChange(item.id)}
                      className={`relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                        lang === item.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-2xl">{item.flag}</span>
                        {lang === item.id && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <p className="mt-3 font-bold text-xs text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Theme Settings Card */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sun className="h-5 w-5 text-amber-500" />
                    <span>{t('theme_card_title', lang)}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('theme_card_desc', lang)}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { id: 'light', title: t('theme_light', lang), desc: lang === 'en' ? 'Clean & bright appearance' : 'Tampilan bersih & cerah', icon: Sun },
                    { id: 'dark', title: t('theme_dark', lang), desc: lang === 'en' ? 'Comfortable for low light' : 'Tampilan nyaman di malam hari', icon: Moon },
                    { id: 'system', title: t('theme_system', lang), desc: lang === 'en' ? 'Follow your OS preference' : 'Mengikuti pengaturan OS Anda', icon: Sparkles },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleThemeChange(t.id as any)}
                      className={`relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${theme === t.id
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
                    <span>{t('sidebar_layout_title', lang)}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('sidebar_layout_desc', lang)}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
                      {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">
                        {sidebarCollapsed ? t('sidebar_collapsed_mode', lang) : t('sidebar_expanded_mode', lang)}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {sidebarCollapsed ? t('sidebar_collapsed_sub', lang) : t('sidebar_expanded_sub', lang)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={toggleSidebar}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${sidebarCollapsed
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                  >
                    {sidebarCollapsed ? t('btn_show_full', lang) : t('btn_collapse', lang)}
                  </button>
                </div>
              </div>

              {/* 3. Mobile REST API & Android Integration Card (Tahap 1 & Tahap 2) */}
              <div className={`rounded-3xl border ${!isPro ? 'border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/40 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20' : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900'} p-6 sm:p-8 shadow-sm space-y-6 relative`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <span>{t('rest_api_title', lang)}</span>
                      </h3>
                      {isPro ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          PRO ACTIVE ⭐
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          🔒 PRO EXCLUSIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {t('rest_api_desc', lang)}
                    </p>
                  </div>
                  {isPro ? (
                    <a
                      href="/api/v1"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition self-start"
                    >
                      <Code2 className="h-4 w-4 text-emerald-600" />
                      <span>{t('view_json_spec', lang)}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <button
                      onClick={() => setShowUpgradeModal({
                        featureName: lang === 'en' ? 'Android Mobile REST API Integration' : 'Integrasi Mobile REST API Android',
                        description: lang === 'en'
                          ? 'Access REST API v1 endpoints and specifications exclusively for Dompetku PRO members.'
                          : 'Akses spesifikasi dan endpoint REST API v1 eksklusif untuk pengguna Dompetku PRO.'
                      })}
                      className="flex items-center gap-1.5 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition self-start"
                    >
                      <Lock className="h-3.5 w-3.5 text-amber-600" />
                      <span>{lang === 'en' ? 'PRO Specs 🔒' : 'Spesifikasi PRO 🔒'}</span>
                    </button>
                  )}
                </div>

                {!isPro && (
                  <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                          {lang === 'en' ? 'Android REST API Access Locked' : 'Akses REST API Android Terkunci'}
                        </p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-400">
                          {lang === 'en'
                            ? 'Upgrade to Dompetku PRO to unlock Bearer token authentication & full REST API v1 endpoints.'
                            : 'Upgrade ke Dompetku PRO untuk membuka Bearer token autentikasi & seluruh endpoint REST API v1.'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowUpgradeModal({
                        featureName: lang === 'en' ? 'Android Mobile REST API Integration' : 'Integrasi Mobile REST API Android',
                        description: lang === 'en'
                          ? 'API v1 access to connect Android, iOS, or custom financial automation apps is an exclusive Dompetku PRO feature.'
                          : 'Akses API v1 untuk menghubungkan aplikasi Android, iOS, atau automasi finansial kustom adalah fitur eksklusif Dompetku PRO.'
                      })}
                      className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-4 py-2 text-xs font-black text-white shadow-md shadow-amber-500/20 transition shrink-0"
                    >
                      {lang === 'en' ? 'Upgrade to PRO' : 'Upgrade ke PRO'}
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {[
                      { method: 'GET', path: '/api/v1/summary', desc: lang === 'en' ? 'Core financial summary for Android home' : 'Ringkasan finansial utama untuk home Android' },
                      { method: 'GET / POST', path: '/api/v1/transactions', desc: lang === 'en' ? 'Transaction records, pagination, filters & creation' : 'Daftar transaksi, pagination, filter & catat baru' },
                      { method: 'GET / POST', path: '/api/v1/goals', desc: lang === 'en' ? 'Phase 2: Financial dream goals & deposits' : 'Tahap 2: Target tabungan impian & setor saldo' },
                      { method: 'GET / POST', path: '/api/v1/subscriptions', desc: lang === 'en' ? 'Phase 2: Recurring bills & 1-click payment' : 'Tahap 2: Manajemen tagihan rutin & bayar 1-click' },
                      { method: 'GET / POST', path: '/api/v1/wallets', desc: lang === 'en' ? 'Manage wallets & real-time balance mutation' : 'Kelola dompet & mutasi saldo real-time' },
                      { method: 'POST', path: '/api/v1/wallets/transfer', desc: lang === 'en' ? 'Transfer balance between wallets / accounts' : 'Transfer saldo antar dompet / rekening' },
                    ].map((ep, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{ep.path}</span>
                          <span className="rounded bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 text-[9px] font-black uppercase text-slate-700 dark:text-slate-300">
                            {ep.method}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{ep.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Test API Live Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <button
                      onClick={testMobileApi}
                      disabled={apiTesting}
                      className="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800 dark:hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      {isPro ? (
                        <Terminal className="h-4 w-4 text-emerald-400 dark:text-white" />
                      ) : (
                        <Lock className="h-4 w-4 text-amber-400" />
                      )}
                      <span>
                        {apiTesting
                          ? (lang === 'en' ? 'Testing API...' : 'Menguji API...')
                          : !isPro
                            ? (lang === 'en' ? 'Test API Request (Requires PRO 🔒)' : 'Test Request API (Perlu PRO 🔒)')
                            : t('test_api_button', lang)}
                      </span>
                    </button>

                    {apiTestResult && (
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900">
                        {apiTestResult}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. User Profile Card */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('profile_card_title', lang)}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('profile_card_desc', lang)}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black text-xl overflow-hidden shadow-sm shadow-emerald-600/20">
                      {currentUser.image ? (
                        <img src={currentUser.image} alt={currentUser.name} className="h-full w-full object-cover" />
                      ) : (
                        currentUser.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{currentUser.name}</p>
                      <p className="text-xs text-slate-400">{currentUser.email}</p>
                      {currentUser.emailVerified ? (
                        <span className="inline-flex items-center gap-1 mt-1 rounded-md bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          {t('account_verified', lang)}
                        </span>
                      ) : (
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-950 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                            <AlertCircle className="h-3 w-3" />
                            {t('email_unverified', lang)}
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              setIsResendingEmail(true)
                              setEmailStatus(null)
                              try {
                                const res = await authClient.sendVerificationEmail({
                                  email: currentUser.email,
                                  callbackURL: window.location.origin + '/?verified=true',
                                })
                                if (res.error) {
                                  setEmailStatus({ type: 'error', message: res.error.message || (lang === 'en' ? 'Failed to send verification email' : 'Gagal mengirim email verifikasi') })
                                } else {
                                  setEmailStatus({ type: 'success', message: lang === 'en' ? 'New verification email successfully sent! Please check your inbox.' : 'Email verifikasi baru berhasil dikirim! Silakan periksa inbox Anda.' })
                                }
                              } catch (err: any) {
                                setEmailStatus({ type: 'error', message: err.message || (lang === 'en' ? 'Failed to send email' : 'Gagal mengirim email') })
                              } finally {
                                setIsResendingEmail(false)
                              }
                            }}
                            disabled={isResendingEmail}
                            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50"
                          >
                            {isResendingEmail ? t('sending_verification', lang) : t('resend_verification', lang)}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await signOut()
                      router.push('/sign-in')
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition self-start sm:self-center"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('btn_sign_out', lang)}</span>
                  </button>
                </div>

                {emailStatus && (
                  <div className={`rounded-xl p-3 text-xs flex items-center gap-2 ${emailStatus.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}>
                    {emailStatus.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                    <span>{emailStatus.message}</span>
                  </div>
                )}
              </div>

              {/* 5. Membership Plan Card */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <span>{t('plan_status_title', lang)}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('plan_status_desc', lang)}
                  </p>
                </div>

                <div className={`rounded-2xl border p-5 transition-all ${isPro
                  ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-transparent'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40'
                  }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{t('current_plan_label', lang)}</span>
                        {isPro ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-0.5 text-xs font-black text-white shadow-sm shadow-amber-500/30">
                            <Sparkles className="h-3.5 w-3.5" />
                            {t('pro_member_badge', lang)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-200 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                            {t('plan_starter_free', lang)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {isPro ? t('pro_active_text', lang) : t('free_active_text', lang)}
                      </p>
                    </div>

                    {!isPro ? (
                      <button
                        type="button"
                        onClick={() => setShowUpgradeModal({ featureName: 'Dompetku PRO', description: lang === 'en' ? 'Unlock all exclusive financial planning features without limitations.' : 'Buka semua fitur perencanaan finansial eksklusif tanpa batasan.' })}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-white hover:brightness-110 shadow-md shadow-amber-500/25 transition shrink-0 cursor-pointer"
                      >
                        <Sparkles className="h-4 w-4 fill-white" />
                        <span>{t('btn_upgrade_now', lang)}</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{t('pro_access_active', lang)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 5. Change Profile Name Card */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('edit_profile_name_title', lang)}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('edit_profile_name_desc', lang)}
                  </p>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    if (!profileName.trim()) {
                      setNameStatus({ type: 'error', message: lang === 'en' ? 'Name cannot be empty' : 'Nama tidak boleh kosong' })
                      return
                    }
                    setIsUpdatingName(true)
                    setNameStatus(null)
                    try {
                      const res = await authClient.updateUser({
                        name: profileName.trim(),
                      })
                      if (res.error) {
                        setNameStatus({ type: 'error', message: res.error.message || (lang === 'en' ? 'Failed to update name' : 'Gagal memperbarui nama') })
                      } else {
                        setCurrentUser((prev) => ({ ...prev, name: profileName.trim() }))
                        setNameStatus({ type: 'success', message: lang === 'en' ? 'Profile name successfully updated!' : 'Nama profil berhasil diperbarui!' })
                        showToast(lang === 'en' ? 'Profile name successfully saved!' : 'Nama profil berhasil disimpan!', 'success')
                        setTimeout(() => setNameStatus(null), 4000)
                      }
                    } catch (err: any) {
                      setNameStatus({ type: 'error', message: err.message || (lang === 'en' ? 'An error occurred while updating name' : 'Terjadi kesalahan saat memperbarui nama') })
                    } finally {
                      setIsUpdatingName(false)
                    }
                  }}
                  className="space-y-4 max-w-lg"
                >
                  {nameStatus && (
                    <div className={`rounded-xl p-3 text-xs flex items-center gap-2 ${nameStatus.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}>
                      {nameStatus.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                      <span>{nameStatus.message}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                      {t('full_name_label', lang)}
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder={lang === 'en' ? 'Enter your full name' : 'Masukkan nama lengkap Anda'}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingName || profileName.trim() === currentUser.name || !profileName.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isUpdatingName ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>{t('saving_name', lang)}</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>{t('btn_save_profile_name', lang)}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* 6. Change Password Card */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('security_card_title', lang)}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('security_card_desc', lang)}
                  </p>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setPasswordStatus(null)

                    if (!currentPassword) {
                      setPasswordStatus({ type: 'error', message: lang === 'en' ? 'Current password is required' : 'Kata sandi saat ini wajib diisi' })
                      return
                    }
                    if (newPassword.length < 8) {
                      setPasswordStatus({ type: 'error', message: lang === 'en' ? 'New password must be at least 8 characters' : 'Kata sandi baru minimal 8 karakter' })
                      return
                    }
                    if (newPassword !== confirmPassword) {
                      setPasswordStatus({ type: 'error', message: lang === 'en' ? 'New password confirmation does not match' : 'Konfirmasi kata sandi baru tidak cocok' })
                      return
                    }

                    setIsUpdatingPassword(true)
                    try {
                      const res = await authClient.changePassword({
                        currentPassword,
                        newPassword,
                        revokeOtherSessions: false,
                      })
                      if (res.error) {
                        setPasswordStatus({ type: 'error', message: res.error.message || (lang === 'en' ? 'Failed to change password. Make sure current password is correct.' : 'Gagal mengubah kata sandi. Pastikan kata sandi saat ini benar.') })
                      } else {
                        setPasswordStatus({ type: 'success', message: lang === 'en' ? 'Password changed successfully!' : 'Kata sandi berhasil diubah!' })
                        showToast(lang === 'en' ? 'Password updated successfully!' : 'Kata sandi berhasil diperbarui!', 'success')
                        setCurrentPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                        setTimeout(() => setPasswordStatus(null), 5000)
                      }
                    } catch (err: any) {
                      setPasswordStatus({ type: 'error', message: err.message || (lang === 'en' ? 'An error occurred while changing password' : 'Terjadi kesalahan saat mengubah kata sandi') })
                    } finally {
                      setIsUpdatingPassword(false)
                    }
                  }}
                  className="space-y-4 max-w-lg"
                >
                  {passwordStatus && (
                    <div className={`rounded-xl p-3 text-xs flex items-center gap-2 ${passwordStatus.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}>
                      {passwordStatus.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                      <span>{passwordStatus.message}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                      {t('current_password_label', lang)}
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                      {t('new_password_label', lang)}
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                      {t('confirm_password_label', lang)}
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>{t('updating_password', lang)}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5" />
                        <span>{t('btn_update_password', lang)}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* 5. Data Management */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span>{lang === 'en' ? 'Initialize Default Data' : 'Inisialisasi Data Default'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === 'en'
                      ? 'If you need initial starter sample data (default wallets & categories), click the button below.'
                      : 'Jika Anda membutuhkan data awal (dompet & kategori default), klik tombol di bawah.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={async () => {
                      if (confirm(lang === 'en' ? 'Add default wallets and categories if not present?' : 'Tambahkan dompet dan kategori default jika belum ada?')) {
                        const fresh = await seedDefaults()
                        handleSuccess(lang === 'en' ? 'Default data verified/added!' : 'Data default berhasil dicek/ditambahkan!', fresh)
                      }
                    }}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    <RefreshCw className="h-4 w-4 text-emerald-600" />
                    <span>{lang === 'en' ? 'Seed / Add Default Categories' : 'Seed / Tambah Kategori Default'}</span>
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
          {/* PRO Guard for PRO-only Modals */}
          {!isPro && ['budget', 'goal', 'goalDeposit', 'subscription', 'paySubscription'].includes(showModal.type) ? (
            <div className="text-center p-6 sm:p-8 space-y-4 max-w-md mx-auto">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Lock className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black px-2.5 py-0.5">
                  ⭐ {t('pro_exclusive', lang)}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {showModal.type.includes('goal')
                    ? (lang === 'en' ? 'PRO Exclusive Financial Goals' : 'Target Impian Eksklusif PRO')
                    : showModal.type.includes('sub')
                      ? (lang === 'en' ? 'PRO Exclusive Recurring Bills' : 'Tagihan Rutin Eksklusif PRO')
                      : (lang === 'en' ? 'PRO Exclusive Monthly Budget' : 'Budget Bulanan Eksklusif PRO')}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === 'en'
                    ? 'This feature is exclusively available for active Dompetku PRO members. Enjoy limitless financial management.'
                    : 'Fitur ini hanya dapat digunakan oleh pengguna dengan paket Dompetku PRO aktif. Nikmati pengelolaan finansial tanpa batasan.'}
                </p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    const feat = showModal.type.includes('goal')
                      ? (lang === 'en' ? 'Financial Goals' : 'Target Impian')
                      : showModal.type.includes('sub')
                        ? (lang === 'en' ? 'Recurring Bills' : 'Tagihan Rutin')
                        : (lang === 'en' ? 'Monthly Budget' : 'Budget Bulanan')
                    setShowModal(null)
                    setShowUpgradeModal({
                      featureName: feat,
                      description: lang === 'en'
                        ? `Unlock full access to ${feat} and all other exclusive features in Dompetku PRO.`
                        : `Buka akses penuh fitur ${feat} dan semua fitur eksklusif lainnya di Dompetku PRO.`
                    })
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 py-3 text-xs font-black text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition"
                >
                  {lang === 'en' ? 'View Plans & Upgrade PRO' : 'Lihat Paket & Upgrade PRO'}
                </button>
                <button
                  onClick={() => setShowModal(null)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition"
                >
                  {lang === 'en' ? 'Back' : 'Kembali'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 1. Transaction Form Modal */}
          {showModal.type === 'transaction' && (
            <TransactionModal
              data={data}
              editData={showModal.editData}
              lang={lang}
              close={() => setShowModal(null)}
              done={handleSuccess}
              onWalletCreated={(fresh) => setData(fresh)}
              onDataUpdated={(fresh) => setData(fresh)}
            />
          )}

          {/* 2. Transfer Form Modal */}
          {showModal.type === 'transfer' && (
            <TransferModal data={data} lang={lang} close={() => setShowModal(null)} done={handleSuccess} />
          )}

          {/* 3. Wallet Form Modal */}
          {showModal.type === 'wallet' && (
            <WalletModal editData={showModal.editData} lang={lang} close={() => setShowModal(null)} done={handleSuccess} />
          )}

          {/* 4. Category Form Modal */}
          {showModal.type === 'category' && (
            <CategoryModal editData={showModal.editData} lang={lang} close={() => setShowModal(null)} done={handleSuccess} />
          )}

          {/* 5. Budget Form Modal */}
          {showModal.type === 'budget' && (
            <BudgetModal
              data={data}
              editData={showModal.editData}
              defaultMonth={selectedMonth}
              lang={lang}
              close={() => setShowModal(null)}
              done={handleSuccess}
            />
          )}

          {/* 6. Goal (Target Tabungan) Modal - Tahap 2 */}
          {showModal.type === 'goal' && (
            <GoalModal
              editData={showModal.editData}
              lang={lang}
              close={() => setShowModal(null)}
              done={handleSuccess}
            />
          )}

          {/* 7. Goal Deposit Modal - Tahap 2 */}
          {showModal.type === 'goalDeposit' && (
            <GoalDepositModal
              goal={showModal.goal}
              wallets={data.wallets}
              lang={lang}
              close={() => setShowModal(null)}
              done={handleSuccess}
            />
          )}

          {/* 8. Subscription Modal - Tahap 2 */}
          {showModal.type === 'subscription' && (
            <SubscriptionModal
              data={data}
              editData={showModal.editData}
              lang={lang}
              close={() => setShowModal(null)}
              done={handleSuccess}
            />
          )}

          {/* 9. Pay Subscription Modal - Tahap 2 */}
          {showModal.type === 'paySubscription' && (
            <PaySubscriptionModal
              subscription={showModal.subscription}
              wallets={data.wallets}
              lang={lang}
              close={() => setShowModal(null)}
              done={handleSuccess}
            />
          )}
            </>
          )}
        </ModalContainer>
      )}

      {/* 10. Upgrade to PRO Paywall Modal */}
      {showUpgradeModal && (
        <ModalContainer close={() => setShowUpgradeModal(null)}>
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-slate-950 p-6 sm:p-8 text-white shadow-2xl">
            {/* Background ambient glow */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-300">
                  <Sparkles className="h-3.5 w-3.5 fill-amber-300" />
                  <span>{t('pro_exclusive', lang)}</span>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <h2 className="mt-4 text-2xl font-black text-white">
                {t('paywall_title', lang)}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {showUpgradeModal.description || t('paywall_default_desc', lang)}
              </p>

              {/* Feature Benefits List */}
              <div className="mt-6 space-y-2.5 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 text-xs text-slate-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                  <span><strong>{t('benefit_1_title', lang)}</strong> — {t('benefit_1_desc', lang)}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                  <span><strong>{t('benefit_2_title', lang)}</strong> — {t('benefit_2_desc', lang)}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                  <span><strong>{t('benefit_3_title', lang)}</strong> — {t('benefit_3_desc', lang)}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                  <span><strong>{t('benefit_4_title', lang)}</strong> — {t('benefit_4_desc', lang)}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                  <span><strong>{t('benefit_5_title', lang)}</strong> — {t('benefit_5_desc', lang)}</span>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 text-center">
                  <span className="text-[11px] font-semibold text-slate-400">{t('pkg_monthly', lang)}</span>
                  <p className="mt-1 text-lg font-black text-white">{t('pkg_monthly_price', lang)}</p>
                  <span className="text-[10px] text-slate-400">{t('pkg_per_month', lang)}</span>
                </div>
                <div className="relative rounded-2xl border border-amber-500/50 bg-gradient-to-b from-amber-500/15 to-slate-900/80 p-3.5 text-center shadow-lg shadow-amber-500/10">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-2 py-0.2 text-[9px] font-black text-slate-950 uppercase">
                    {t('pkg_save_badge', lang)}
                  </span>
                  <span className="text-[11px] font-bold text-amber-300">{t('pkg_yearly', lang)}</span>
                  <p className="mt-1 text-lg font-black text-white">{t('pkg_yearly_price', lang)}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">{t('pkg_yearly_monthly_rate', lang)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2.5">
                <a
                  href={`https://wa.me/6281776370728?text=${encodeURIComponent(
                    lang === 'en'
                      ? `Hello Dompetku Admin, I would like to upgrade to Dompetku PRO!\n\nName: ${currentUser.name}\nEmail: ${currentUser.email}\nPlan: Yearly (Rp 149.000) / Monthly (Rp 19.000)\n\nPlease provide payment information (Bank Transfer / QRIS).`
                      : `Halo Admin Dompetku, saya ingin upgrade ke akun Dompetku PRO!\n\nNama: ${currentUser.name}\nEmail: ${currentUser.email}\nPaket: Tahunan (Rp 149.000) / Bulanan (Rp 19.000)\n\nMohon info nomor rekening / QRIS untuk pembayaran.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-teal-500/30 transition hover:brightness-110 active:scale-98"
                >
                  <Sparkles className="h-4 w-4 fill-slate-950 text-slate-950" />
                  <span>{t('btn_upgrade_whatsapp', lang)}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(null)}
                  className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {lang === 'en' ? 'Maybe Later' : 'Nanti Saja'}
                </button>
              </div>
            </div>
          </div>
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
  lang = 'en',
  close,
  done,
  onWalletCreated,
  onDataUpdated,
}: {
  data: Data
  editData?: Transaction
  lang?: Language
  close: () => void
  done: (msg: string, freshData?: Data) => void
  onWalletCreated?: (freshData: Data) => void
  onDataUpdated?: (freshData: Data) => void
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
  const [walletsList, setWalletsList] = useState(data.wallets)
  const [categoriesList, setCategoriesList] = useState(data.categories)
  const [isCreatingWallet, setIsCreatingWallet] = useState(false)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

  const filteredCategories = categoriesList.filter((c) => c.type === type)

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType)
    const firstMatching = categoriesList.find((c) => c.type === newType)
    if (firstMatching) setCategoryId(firstMatching.id)
  }

  const handleCreateWallet = async (inputValue: string) => {
    if (!inputValue || !inputValue.trim()) return
    const name = inputValue.trim()
    setIsCreatingWallet(true)
    try {
      let inferredType = 'Bank'
      const lower = name.toLowerCase()
      if (lower.includes('cash') || lower.includes('tunai') || lower.includes('dompet')) {
        inferredType = 'Tunai'
      } else if (
        lower.includes('gopay') ||
        lower.includes('ovo') ||
        lower.includes('dana') ||
        lower.includes('shopee') ||
        lower.includes('linkaja') ||
        lower.includes('qris') ||
        lower.includes('e-wallet') ||
        lower.includes('ewallet')
      ) {
        inferredType = 'E-Wallet'
      }

      const fresh = await addWallet({
        name,
        type: inferredType,
        balance: 0,
        color: 'teal',
      })
      if (fresh?.wallets) {
        setWalletsList(fresh.wallets)
        onWalletCreated?.(fresh)
        onDataUpdated?.(fresh)
        const newWallet = fresh.wallets.find((w) => w.name.toLowerCase() === name.toLowerCase())
        if (newWallet) {
          setWalletId(newWallet.id)
        }
      }
    } catch (err: any) {
      alert(err?.message || (lang === 'en' ? 'Failed to create new wallet' : 'Gagal membuat dompet baru'))
    } finally {
      setIsCreatingWallet(false)
    }
  }

  const handleCreateCategory = async (inputValue: string) => {
    if (!inputValue || !inputValue.trim()) return
    const name = inputValue.trim()
    setIsCreatingCategory(true)
    try {
      const fresh = await addCategory({
        name,
        type,
        color: 'slate',
      })
      if (fresh?.categories) {
        setCategoriesList(fresh.categories)
        onDataUpdated?.(fresh)
        const newCat = fresh.categories.find(
          (c) => c.name.toLowerCase() === name.toLowerCase() && c.type === type
        )
        if (newCat) {
          setCategoryId(newCat.id)
        }
      }
    } catch (err: any) {
      alert(err?.message || (lang === 'en' ? 'Failed to create new category' : 'Gagal membuat kategori baru'))
    } finally {
      setIsCreatingCategory(false)
    }
  }

  const walletOptions: OptionType<number>[] = walletsList.map((w) => ({
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
      alert(lang === 'en' ? 'Please enter a valid transaction amount' : 'Mohon masukkan nominal transaksi yang valid')
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
        done(lang === 'en' ? 'Transaction updated successfully!' : 'Transaksi berhasil diperbarui!', fresh)
      } else {
        const fresh = await addTransaction({
          walletId: Number(walletId),
          categoryId: Number(categoryId),
          type,
          amount,
          description,
          date,
        })
        done(lang === 'en' ? 'New transaction added successfully!' : 'Transaksi baru berhasil ditambahkan!', fresh)
      }
      close()
    } catch (err: any) {
      alert(err?.message || (lang === 'en' ? 'Failed to save transaction' : 'Gagal menyimpan transaksi'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {editData ? (lang === 'en' ? 'Edit Transaction' : 'Edit Transaksi') : (lang === 'en' ? 'Record New Transaction' : 'Catat Transaksi Baru')}
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
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition ${type === 'expense' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
          <ArrowUpRight className="h-4 w-4" />
          <span>{lang === 'en' ? 'Expense' : 'Pengeluaran'}</span>
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition ${type === 'income' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
          <ArrowDownRight className="h-4 w-4" />
          <span>{lang === 'en' ? 'Income' : 'Pemasukan'}</span>
        </button>
      </div>

      {/* Live Auto-Converting Rupiah Input */}
      <RupiahInput
        value={amount}
        onChange={setAmount}
        lang={lang}
        label={lang === 'en' ? 'Transaction Amount (Auto Rupiah)' : 'Nominal Transaksi (Auto Rupiah)'}
        placeholder="Rp 0"
        required
        showPresets
        showTerbilang
      />

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {lang === 'en' ? 'Description / Notes *' : 'Deskripsi / Catatan *'}
        </label>
        <input
          type="text"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={lang === 'en' ? 'e.g. Lunch, Monthly Salary, Fuel...' : 'cth: Makan siang, Gaji bulanan, Bensin...'}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
        />
      </div>

      {/* React-Select: Wallet & Category Selection */}
      <div className="grid gap-3 sm:grid-cols-2">
        <CustomCreatableSelect
          label={lang === 'en' ? 'Select Wallet / Account' : 'Pilih Dompet / Rekening'}
          required
          isLoading={isCreatingWallet}
          isDisabled={isCreatingWallet}
          value={walletOptions.find((o) => o.value === walletId)}
          onChange={(option) => option && setWalletId(option.value)}
          onCreateOption={handleCreateWallet}
          options={walletOptions}
          isSearchable
          placeholder={lang === 'en' ? 'Select or type to create new...' : 'Pilih atau ketik untuk buat baru...'}
          formatCreateLabel={(inputValue) => lang === 'en' ? `+ Create new wallet: "${inputValue}"` : `+ Buat dompet baru: "${inputValue}"`}
        />

        <CustomCreatableSelect
          label={lang === 'en' ? 'Transaction Category' : 'Kategori Transaksi'}
          required
          isLoading={isCreatingCategory}
          isDisabled={isCreatingCategory}
          value={categoryOptions.find((o) => o.value === categoryId)}
          onChange={(option) => option && setCategoryId(option.value)}
          onCreateOption={handleCreateCategory}
          options={categoryOptions}
          isSearchable
          placeholder={lang === 'en' ? 'Select or type to create new...' : 'Pilih atau ketik untuk buat baru...'}
          formatCreateLabel={(inputValue) => lang === 'en' ? `+ Create category: "${inputValue}"` : `+ Buat kategori: "${inputValue}"`}
        />
      </div>

      {/* Clickable Date Picker Popup */}
      <DatePickerInput
        label={lang === 'en' ? 'Transaction Date (Click to Select)' : 'Tanggal Transaksi (Klik untuk Memilih)'}
        required
        value={date}
        onChange={setDate}
        lang={lang}
      />

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {submitting
            ? (lang === 'en' ? 'Saving...' : 'Menyimpan...')
            : editData
              ? (lang === 'en' ? 'Update Transaction' : 'Perbarui Transaksi')
              : (lang === 'en' ? 'Save Transaction' : 'Simpan Transaksi')}
        </button>
      </div>
    </form>
  )
}

// 2. Transfer Modal Between Wallets
function TransferModal({
  data,
  lang = 'en',
  close,
  done,
}: {
  data: Data
  lang?: Language
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
      alert(lang === 'en' ? 'Source and destination wallets cannot be the same' : 'Dompet asal dan tujuan tidak boleh sama')
      return
    }
    if (!amount || amount <= 0) {
      alert(lang === 'en' ? 'Please enter a valid transfer amount' : 'Mohon masukkan nominal transfer')
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
      done(lang === 'en' ? 'Fund transfer between wallets successful!' : 'Transfer saldo antar dompet berhasil!', fresh)
      close()
    } catch (err: any) {
      alert(err?.message || (lang === 'en' ? 'Failed to process transfer' : 'Gagal melakukan transfer'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {lang === 'en' ? 'Transfer Between Wallets' : 'Transfer Antar Dompet'}
        </h3>
        <button type="button" onClick={close} className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <CustomSelect
          label={lang === 'en' ? 'From Wallet (Source)' : 'Dari Dompet (Sumber)'}
          required
          value={walletOptions.find((o) => o.value === fromWalletId)}
          onChange={(opt) => opt && setFromWalletId(opt.value)}
          options={walletOptions}
        />

        <CustomSelect
          label={lang === 'en' ? 'To Wallet (Destination)' : 'Ke Dompet (Tujuan)'}
          required
          value={walletOptions.find((o) => o.value === toWalletId)}
          onChange={(opt) => opt && setToWalletId(opt.value)}
          options={walletOptions.filter((o) => o.value !== fromWalletId)}
        />
      </div>

      <RupiahInput
        value={amount}
        onChange={setAmount}
        lang={lang}
        label={lang === 'en' ? 'Transfer Amount (Auto Rupiah)' : 'Nominal Transfer (Auto Rupiah)'}
        placeholder="Rp 0"
        required
        showPresets
        showTerbilang
      />

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {lang === 'en' ? 'Transfer Note (Optional)' : 'Catatan Transfer (Opsional)'}
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={lang === 'en' ? 'e.g. Gopay Top-up, Cash withdrawal...' : 'cth: Top-up Gopay, Tarik Tunai...'}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <DatePickerInput
        label={lang === 'en' ? 'Transfer Date (Click to Select)' : 'Tanggal Transfer (Klik untuk Memilih)'}
        required
        value={date}
        onChange={setDate}
        lang={lang}
      />

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {submitting
            ? (lang === 'en' ? 'Processing Transfer...' : 'Memproses Transfer...')
            : (lang === 'en' ? 'Send Fund Transfer' : 'Kirim Transfer Saldo')}
        </button>
      </div>
    </form>
  )
}

// 3. Wallet Modal with React-Select
function WalletModal({
  editData,
  lang = 'en',
  close,
  done,
}: {
  editData?: WalletType
  lang?: Language
  close: () => void
  done: (msg: string, freshData?: Data) => void
}) {
  const [name, setName] = useState(editData?.name || '')
  const [type, setType] = useState(editData?.type || 'Bank')
  const [balance, setBalance] = useState<number>(editData?.balance || 0)
  const [submitting, setSubmitting] = useState(false)

  const walletTypeOptions: OptionType<string>[] = [
    { value: 'Bank', label: lang === 'en' ? 'Bank Account' : 'Rekening Bank' },
    { value: 'E-wallet', label: lang === 'en' ? 'E-Wallet (GoPay, OVO, Dana, etc)' : 'E-Wallet (GoPay, OVO, Dana, dll)' },
    { value: 'Tunai', label: lang === 'en' ? 'Cash' : 'Uang Tunai / Cash' },
    { value: 'Kartu Kredit', label: lang === 'en' ? 'Credit Card' : 'Kartu Kredit' },
    { value: 'Investasi', label: lang === 'en' ? 'Investment / Stocks' : 'Investasi / Saham / Reksadana' },
    { value: 'Lainnya', label: lang === 'en' ? 'Other' : 'Lainnya' },
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
        done(lang === 'en' ? 'Wallet updated successfully!' : 'Dompet berhasil diperbarui!', fresh)
      } else {
        const fresh = await addWallet({
          name,
          type,
          balance,
        })
        done(lang === 'en' ? 'New wallet added successfully!' : 'Dompet baru berhasil ditambahkan!', fresh)
      }
      close()
    } catch (err: any) {
      alert(err?.message || (lang === 'en' ? 'Failed to save wallet' : 'Gagal menyimpan dompet'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {editData ? (lang === 'en' ? 'Edit Wallet' : 'Edit Dompet') : (lang === 'en' ? 'Add Wallet / Account' : 'Tambah Dompet / Rekening')}
        </h3>
        <button type="button" onClick={close} className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {lang === 'en' ? 'Wallet / Account Name *' : 'Nama Dompet / Rekening *'}
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={lang === 'en' ? 'e.g. Main Bank, Savings, Digital Wallet, Cash...' : 'cth: BCA Utama, Mandiri Tabungan, GoPay, Tunai...'}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <CustomSelect
        label={lang === 'en' ? 'Wallet Type' : 'Tipe / Jenis Dompet'}
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
          lang={lang}
          label={lang === 'en' ? 'Initial Balance (Optional)' : 'Saldo Awal (Opsional)'}
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
          {submitting
            ? (lang === 'en' ? 'Saving...' : 'Menyimpan...')
            : editData
              ? (lang === 'en' ? 'Update Wallet' : 'Perbarui Dompet')
              : (lang === 'en' ? 'Save Wallet' : 'Simpan Dompet')}
        </button>
      </div>
    </form>
  )
}

// 4. Category Modal with React-Select
function CategoryModal({
  editData,
  lang = 'en',
  close,
  done,
}: {
  editData?: Category
  lang?: Language
  close: () => void
  done: (msg: string, freshData?: Data) => void
}) {
  const [name, setName] = useState(editData?.name || '')
  const [type, setType] = useState(editData?.type || 'expense')
  const [submitting, setSubmitting] = useState(false)

  const categoryTypeOptions: OptionType<string>[] = [
    { value: 'expense', label: lang === 'en' ? 'Expense' : 'Pengeluaran (Expense)' },
    { value: 'income', label: lang === 'en' ? 'Income' : 'Pemasukan (Income)' },
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
        done(lang === 'en' ? 'Category updated successfully!' : 'Kategori berhasil diperbarui!', fresh)
      } else {
        const fresh = await addCategory({
          name,
          type,
        })
        done(lang === 'en' ? 'New category added successfully!' : 'Kategori baru berhasil ditambahkan!', fresh)
      }
      close()
    } catch (err: any) {
      alert(err?.message || (lang === 'en' ? 'Failed to save category' : 'Gagal menyimpan kategori'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {editData ? (lang === 'en' ? 'Edit Category' : 'Edit Kategori') : (lang === 'en' ? 'Add New Category' : 'Tambah Kategori Baru')}
        </h3>
        <button type="button" onClick={close} className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {lang === 'en' ? 'Category Name *' : 'Nama Kategori *'}
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={lang === 'en' ? 'e.g. Groceries, Dining out, Bonus...' : 'cth: Belanja Bulanan, Kopi & Nongkrong, Bonus...'}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <CustomSelect
        label={lang === 'en' ? 'Category Type' : 'Tipe Kategori'}
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
          {submitting
            ? (lang === 'en' ? 'Saving...' : 'Menyimpan...')
            : editData
              ? (lang === 'en' ? 'Update Category' : 'Perbarui Kategori')
              : (lang === 'en' ? 'Save Category' : 'Simpan Kategori')}
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
  lang = 'en',
  close,
  done,
}: {
  data: Data
  editData?: Budget
  defaultMonth: string
  lang?: Language
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
      alert(lang === 'en' ? 'Please enter a valid budget limit' : 'Mohon masukkan batas budget yang valid')
      return
    }
    setSubmitting(true)
    try {
      const fresh = await upsertBudget({
        categoryId: Number(categoryId),
        amount,
        month,
      })
      done(lang === 'en' ? 'Monthly budget saved successfully!' : 'Budget bulanan berhasil disimpan!', fresh)
      close()
    } catch (err: any) {
      alert(err?.message || (lang === 'en' ? 'Failed to save budget' : 'Gagal menyimpan budget'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {editData ? (lang === 'en' ? 'Edit Category Budget' : 'Edit Budget Kategori') : (lang === 'en' ? 'Set Monthly Budget' : 'Atur Budget Bulanan')}
        </h3>
        <button type="button" onClick={close} className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <X className="h-5 w-5" />
        </button>
      </div>

      <CustomSelect
        label={lang === 'en' ? 'Select Expense Category' : 'Pilih Kategori Pengeluaran'}
        required
        value={categoryOptions.find((o) => o.value === categoryId)}
        onChange={(opt) => opt && setCategoryId(opt.value)}
        options={categoryOptions}
        isSearchable
      />

      <DatePickerInput
        label={lang === 'en' ? 'Budget Month (Click to Select)' : 'Bulan Budget (Klik untuk Memilih)'}
        type="month"
        required
        value={month}
        onChange={setMonth}
        lang={lang}
      />

      <RupiahInput
        value={amount}
        onChange={setAmount}
        lang={lang}
        label={lang === 'en' ? 'Budget Allocation Limit (Auto Rupiah)' : 'Batas Alokasi Budget (Auto Rupiah)'}
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
          {submitting ? (lang === 'en' ? 'Saving...' : 'Menyimpan...') : (lang === 'en' ? 'Save Budget' : 'Simpan Budget')}
        </button>
      </div>
    </form>
  )
}

// 6. Goal Modal (Tahap 2: Target Tabungan)
function GoalModal({
  editData,
  lang = 'en',
  close,
  done,
}: {
  editData?: Goal
  lang?: Language
  close: () => void
  done: (msg: string, freshData?: Data) => void
}) {
  const [name, setName] = useState(editData?.name || '')
  const [targetAmount, setTargetAmount] = useState<number>(editData?.targetAmount || 0)
  const [currentAmount, setCurrentAmount] = useState<number>(editData?.currentAmount || 0)
  const [targetDate, setTargetDate] = useState<string>(
    editData?.targetDate ? new Date(editData.targetDate).toISOString().slice(0, 10) : ''
  )
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert(lang === 'en' ? 'Goal name is required' : 'Nama target tabungan wajib diisi')
      return
    }
    if (!targetAmount || targetAmount <= 0) {
      alert(lang === 'en' ? 'Target amount must be greater than 0' : 'Target nominal tabungan harus lebih dari 0')
      return
    }
    setSubmitting(true)
    try {
      if (editData) {
        const fresh = await updateGoal({
          id: editData.id,
          name,
          targetAmount,
          currentAmount,
          targetDate: targetDate || undefined,
        })
        done(lang === 'en' ? 'Goal updated successfully!' : 'Target tabungan berhasil diperbarui!', fresh)
      } else {
        const fresh = await addGoal({
          name,
          targetAmount,
          currentAmount,
          targetDate: targetDate || undefined,
        })
        done(lang === 'en' ? 'New financial goal created!' : 'Target impian baru berhasil dibuat!', fresh)
      }
      close()
    } catch (err: any) {
      alert(err?.message || (lang === 'en' ? 'Failed to save goal' : 'Gagal menyimpan target'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {editData ? (lang === 'en' ? 'Edit Financial Goal' : 'Edit Target Tabungan') : (lang === 'en' ? 'Create New Financial Goal' : 'Buat Target Impian Baru')}
          </h3>
        </div>
        <button type="button" onClick={close} className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {lang === 'en' ? 'Goal Name / Purpose *' : 'Nama Impian / Sasaran Target *'}
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={lang === 'en' ? 'e.g. Home Down Payment, Emergency Fund, Tokyo Trip...' : 'cth: DP Rumah, Dana Darurat 6 Bulan, Liburan Jepang...'}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <RupiahInput
        value={targetAmount}
        onChange={setTargetAmount}
        lang={lang}
        label={lang === 'en' ? 'Target Amount to Reach *' : 'Target Nominal yang Ingin Dicapai *'}
        placeholder="Rp 0"
        required
        showPresets
        showTerbilang
      />

      <RupiahInput
        value={currentAmount}
        onChange={setCurrentAmount}
        lang={lang}
        label={lang === 'en' ? 'Currently Saved Amount (Optional)' : 'Saldo yang Sudah Terkumpul Saat Ini (Opsional)'}
        placeholder="Rp 0"
        showPresets
      />

      <DatePickerInput
        label={lang === 'en' ? 'Target Completion Date (Optional)' : 'Target Tanggal Tercapai (Opsional)'}
        value={targetDate}
        onChange={setTargetDate}
        lang={lang}
      />

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {submitting ? (lang === 'en' ? 'Saving...' : 'Menyimpan...') : editData ? (lang === 'en' ? 'Update Goal' : 'Perbarui Target') : (lang === 'en' ? 'Save Goal' : 'Simpan Target Impian')}
        </button>
      </div>
    </form>
  )
}

// 7. Goal Deposit Modal (Tahap 2: Setor Tabungan)
function GoalDepositModal({
  goal,
  wallets,
  lang = 'en',
  close,
  done,
}: {
  goal: Goal
  wallets: WalletType[]
  lang?: Language
  close: () => void
  done: (msg: string, freshData?: Data) => void
}) {
  const [amount, setAmount] = useState<number>(0)
  const [walletId, setWalletId] = useState<number>(wallets[0]?.id || 0)
  const [submitting, setSubmitting] = useState(false)

  const walletOptions: OptionType<number>[] = wallets.map((w) => ({
    value: w.id,
    label: `${w.name} (${w.type})`,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || amount <= 0) {
      alert(lang === 'en' ? 'Please enter a valid deposit amount' : 'Mohon masukkan nominal setoran yang valid')
      return
    }
    setSubmitting(true)
    try {
      const fresh = await depositToGoal({
        goalId: goal.id,
        amount,
        walletId: walletId || undefined,
      })
      done(
        lang === 'en'
          ? `Successfully deposited ${formatRupiah(amount)} to "${goal.name}"!`
          : `Berhasil menyetor ${formatRupiah(amount)} ke target "${goal.name}"!`,
        fresh
      )
      close()
    } catch (err: any) {
      alert(err?.message || (lang === 'en' ? 'Failed to deposit savings' : 'Gagal menyetor tabungan'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {lang === 'en' ? 'Deposit Savings' : 'Setor Saldo Tabungan'}
            </h3>
            <p className="text-xs text-slate-400">{goal.name}</p>
          </div>
        </div>
        <button type="button" onClick={close} className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <X className="h-5 w-5" />
        </button>
      </div>

      <RupiahInput
        value={amount}
        onChange={setAmount}
        lang={lang}
        label={lang === 'en' ? 'Deposit Amount (Auto Rupiah) *' : 'Nominal yang Disetor (Auto Rupiah) *'}
        placeholder="Rp 0"
        required
        showPresets
        showTerbilang
      />

      <CustomSelect
        label={lang === 'en' ? 'Deduct from Wallet / Account (Optional)' : 'Potong dari Dompet / Rekening (Opsional)'}
        value={walletOptions.find((o) => o.value === walletId)}
        onChange={(opt) => opt && setWalletId(opt.value)}
        options={walletOptions}
      />

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {submitting ? (lang === 'en' ? 'Processing...' : 'Memproses...') : (lang === 'en' ? 'Deposit Now' : 'Setor Sekarang')}
        </button>
      </div>
    </form>
  )
}

// 8. Subscription Modal (Tahap 2: Tagihan Rutin)
function SubscriptionModal({
  data,
  editData,
  lang = 'en',
  close,
  done,
}: {
  data: Data
  editData?: Subscription
  lang?: Language
  close: () => void
  done: (msg: string, freshData?: Data) => void
}) {
  const [name, setName] = useState(editData?.name || '')
  const [amount, setAmount] = useState<number>(editData?.amount || 0)
  const [billingCycle, setBillingCycle] = useState(editData?.billingCycle || 'monthly')
  const [dueDate, setDueDate] = useState<number>(editData?.dueDate || 1)
  const [categoryId, setCategoryId] = useState<number | undefined>(editData?.categoryId || undefined)
  const [walletId, setWalletId] = useState<number | undefined>(editData?.walletId || undefined)
  const [isActive, setIsActive] = useState<boolean>(editData?.isActive !== false)
  const [reminderDaysBefore, setReminderDaysBefore] = useState<number>(editData?.reminderDaysBefore || 3)
  const [submitting, setSubmitting] = useState(false)

  const cycleOptions: OptionType<string>[] = [
    { value: 'monthly', label: lang === 'en' ? 'Monthly (Every Month)' : 'Bulanan (Tiap Bulan)' },
    { value: 'yearly', label: lang === 'en' ? 'Yearly (Every Year)' : 'Tahunan (Tiap Tahun)' },
    { value: 'weekly', label: lang === 'en' ? 'Weekly (Every Week)' : 'Mingguan (Tiap Minggu)' },
  ]

  const categoryOptions: OptionType<number>[] = data.categories
    .filter((c) => c.type === 'expense')
    .map((c) => ({ value: c.id, label: c.name }))

  const walletOptions: OptionType<number>[] = data.wallets.map((w) => ({
    value: w.id,
    label: `${w.name} (${w.type})`,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert(lang === 'en' ? 'Bill name is required' : 'Nama tagihan wajib diisi')
      return
    }
    if (!amount || amount <= 0) {
      alert(lang === 'en' ? 'Bill cost must be greater than 0' : 'Nominal tagihan harus lebih dari 0')
      return
    }
    setSubmitting(true)
    try {
      if (editData) {
        const fresh = await updateSubscription({
          id: editData.id,
          name,
          amount,
          billingCycle,
          dueDate,
          categoryId,
          walletId,
          isActive,
          reminderDaysBefore,
        })
        done(lang === 'en' ? 'Recurring bill updated successfully!' : 'Tagihan rutin berhasil diperbarui!', fresh)
      } else {
        const fresh = await addSubscription({
          name,
          amount,
          billingCycle,
          dueDate,
          categoryId,
          walletId,
          reminderDaysBefore,
        })
        done(lang === 'en' ? 'New recurring bill added!' : 'Tagihan baru berhasil ditambahkan!', fresh)
      }
      close()
    } catch (err: any) {
      alert(err?.message || (lang === 'en' ? 'Failed to save bill' : 'Gagal menyimpan tagihan'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {editData ? (lang === 'en' ? 'Edit Recurring Bill' : 'Edit Tagihan Rutin') : (lang === 'en' ? 'Record Recurring Bill & Subscription' : 'Catat Tagihan & Langganan Rutin')}
          </h3>
        </div>
        <button type="button" onClick={close} className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {lang === 'en' ? 'Bill / Subscription Name *' : 'Nama Tagihan / Langganan *'}
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={lang === 'en' ? 'e.g. Netflix Premium, Spotify, Internet WiFi, Insurance...' : 'cth: Netflix Premium, Spotify Family, WiFi Indihome, BPJS, PLN...'}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <RupiahInput
        value={amount}
        onChange={setAmount}
        lang={lang}
        label={lang === 'en' ? 'Billing Cost (Auto Rupiah) *' : 'Biaya Tagihan (Auto Rupiah) *'}
        placeholder="Rp 0"
        required
        showPresets
        showTerbilang
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <CustomSelect
          label={lang === 'en' ? 'Billing Cycle' : 'Siklus Tagihan'}
          value={cycleOptions.find((o) => o.value === billingCycle)}
          onChange={(opt) => opt && setBillingCycle(opt.value)}
          options={cycleOptions}
          isSearchable={false}
        />

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {lang === 'en' ? 'Due Day of Month (1 - 31) *' : 'Tanggal Jatuh Tempo (1 - 31) *'}
          </label>
          <input
            type="number"
            min={1}
            max={31}
            required
            value={dueDate}
            onChange={(e) => setDueDate(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <CustomSelect
          label={lang === 'en' ? 'Expense Category (Optional)' : 'Kategori Biaya (Opsional)'}
          value={categoryOptions.find((o) => o.value === categoryId)}
          onChange={(opt) => setCategoryId(opt?.value)}
          options={categoryOptions}
          placeholder={lang === 'en' ? 'Select Category' : 'Pilih Kategori'}
        />

        <CustomSelect
          label={lang === 'en' ? 'Default Wallet (Optional)' : 'Dompet Default (Opsional)'}
          value={walletOptions.find((o) => o.value === walletId)}
          onChange={(opt) => setWalletId(opt?.value)}
          options={walletOptions}
          placeholder={lang === 'en' ? 'Select Wallet' : 'Pilih Dompet'}
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {submitting
            ? (lang === 'en' ? 'Saving...' : 'Menyimpan...')
            : editData
              ? (lang === 'en' ? 'Update Bill' : 'Perbarui Tagihan')
              : (lang === 'en' ? 'Save Recurring Bill' : 'Simpan Tagihan Rutin')}
        </button>
      </div>
    </form>
  )
}

// 9. Pay Subscription Modal (Tahap 2: 1-Click Pay)
function PaySubscriptionModal({
  subscription,
  wallets,
  lang = 'en',
  close,
  done,
}: {
  subscription: Subscription
  wallets: WalletType[]
  lang?: Language
  close: () => void
  done: (msg: string, freshData?: Data) => void
}) {
  const [walletId, setWalletId] = useState<number>(subscription.walletId || wallets[0]?.id || 0)
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [submitting, setSubmitting] = useState(false)

  const walletOptions: OptionType<number>[] = wallets.map((w) => ({
    value: w.id,
    label: `${w.name} (${w.type})`,
  }))

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletId) {
      alert(lang === 'en' ? 'Select a wallet for payment' : 'Pilih dompet untuk pembayaran')
      return
    }
    setSubmitting(true)
    try {
      const fresh = await paySubscription({
        subscriptionId: subscription.id,
        walletId,
        date,
      })
      done(
        lang === 'en'
          ? `Payment of ${formatRupiah(subscription.amount)} for "${subscription.name}" recorded!`
          : `Pembayaran tagihan "${subscription.name}" sebesar ${formatRupiah(subscription.amount)} berhasil dicatat!`,
        fresh
      )
      close()
    } catch (err: any) {
      alert(err?.message || (lang === 'en' ? 'Failed to process payment' : 'Gagal memproses pembayaran'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {lang === 'en' ? 'Pay Bill' : 'Bayar Tagihan'}
            </h3>
            <p className="text-xs text-slate-400">{subscription.name}</p>
          </div>
        </div>
        <button type="button" onClick={close} className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 text-center">
        <p className="text-xs text-slate-400">
          {lang === 'en' ? 'Total to be recorded as expense:' : 'Total yang akan dicatat sebagai pengeluaran:'}
        </p>
        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatRupiah(subscription.amount)}</p>
      </div>

      <CustomSelect
        label={lang === 'en' ? 'Pay Using Wallet / Account *' : 'Bayar Menggunakan Dompet / Rekening *'}
        required
        value={walletOptions.find((o) => o.value === walletId)}
        onChange={(opt) => opt && setWalletId(opt.value)}
        options={walletOptions}
      />

      <DatePickerInput
        label={lang === 'en' ? 'Payment Date *' : 'Tanggal Pembayaran *'}
        required
        value={date}
        onChange={setDate}
        lang={lang}
      />

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {submitting
            ? (lang === 'en' ? 'Processing Transaction...' : 'Memproses Transaksi...')
            : (lang === 'en' ? 'Confirm & Record Payment' : 'Konfirmasi & Catat Pembayaran')}
        </button>
      </div>
    </form>
  )
}
