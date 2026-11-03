'use client'

import React, { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { formatRupiah } from '@/lib/utils'
import type { Budget, Category, Goal, Subscription, Transaction, Wallet } from '@/lib/schema'
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Layers,
  PieChart as PieIcon,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet as WalletIcon,
} from 'lucide-react'
import type { Language } from '@/lib/i18n'

// ─── Types ──────────────────────────────────────────────────────────────────

type AnalisisChartsProps = {
  transactions: Transaction[]
  categories: Category[]
  wallets: Wallet[]
  budgets: Budget[]
  goals?: Goal[]
  subscriptions?: Subscription[]
  lang: Language
  theme: 'light' | 'dark' | 'system'
  hideBalance: boolean
}

const COLOR_PALETTE = [
  '#0d9488', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6',
  '#f59e0b', '#f43f5e', '#06b6d4', '#ec4899', '#64748b',
]

// ─── Chart Card Shell ───────────────────────────────────────────────────────

function ChartCard({
  title,
  subtitle,
  icon: Icon,
  children,
  className = '',
}: {
  title: string
  subtitle?: string
  icon?: React.ElementType
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm ${className}`}>
      <div className="flex items-center gap-3 mb-5">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function AnalisisCharts({
  transactions,
  categories,
  wallets,
  budgets,
  goals = [],
  subscriptions = [],
  lang,
  theme,
  hideBalance,
}: AnalisisChartsProps) {
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const mask = (v: number) => (hideBalance ? '••••••' : formatRupiah(v))

  // ─── 1. Monthly Income vs Expense Bar Chart (Last 6 months) ──────────
  const monthlyComparisonData = useMemo(() => {
    const map = new Map<string, { month: string; label: string; income: number; expense: number }>()
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toISOString().slice(0, 7)
      const label = d.toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { month: 'short', year: '2-digit' })
      map.set(key, { month: key, label, income: 0, expense: 0 })
    }

    transactions.forEach((t) => {
      const key = new Date(t.date).toISOString().slice(0, 7)
      const entry = map.get(key)
      if (entry) {
        if (t.type === 'income') entry.income += t.amount
        if (t.type === 'expense') entry.expense += t.amount
      }
    })

    return Array.from(map.values())
  }, [transactions, lang])

  const barChartConfig = {
    income: { label: lang === 'en' ? 'Income' : 'Pemasukan', color: '#10b981' },
    expense: { label: lang === 'en' ? 'Expense' : 'Pengeluaran', color: '#f43f5e' },
  } satisfies ChartConfig

  // ─── 2. Daily Expense Trend Line Chart (Last 30 days) ─────────────────
  const dailyTrendData = useMemo(() => {
    const map = new Map<string, { date: string; label: string; amount: number }>()
    const now = new Date()

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000)
      const key = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short' })
      map.set(key, { date: key, label, amount: 0 })
    }

    transactions.forEach((t) => {
      if (t.type === 'expense') {
        const key = new Date(t.date).toISOString().slice(0, 10)
        const entry = map.get(key)
        if (entry) entry.amount += t.amount
      }
    })

    return Array.from(map.values())
  }, [transactions, lang])

  const trendChartConfig = {
    amount: { label: lang === 'en' ? 'Daily Expense' : 'Pengeluaran Harian', color: '#f43f5e' },
  } satisfies ChartConfig

  // ─── 3. Top Expense Categories Horizontal Bar ─────────────────────────
  const topCategoryData = useMemo(() => {
    const map = new Map<number, number>()
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount))

    return Array.from(map.entries())
      .map(([catId, amount], index) => ({
        category: categoryMap.get(catId)?.name || `Kategori ${catId}`,
        amount,
        fill: COLOR_PALETTE[index % COLOR_PALETTE.length],
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
  }, [transactions, categoryMap])

  const categoryBarConfig = topCategoryData.reduce((acc, item) => {
    acc[item.category] = { label: item.category, color: item.fill }
    return acc
  }, { amount: { label: lang === 'en' ? 'Amount' : 'Nominal' } } as ChartConfig)

  // ─── 4. Savings Rate Radial Chart ─────────────────────────────────────
  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  )
  const totalExpense = useMemo(
    () => transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  )
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0
  const endAngle = (savingsRate / 100) * 360

  const radialData = [{ name: 'savings', value: savingsRate, fill: savingsRate >= 20 ? '#10b981' : savingsRate >= 10 ? '#f59e0b' : '#f43f5e' }]
  const radialConfig = {
    value: { label: lang === 'en' ? 'Savings Rate' : 'Rasio Tabungan' },
    savings: { label: lang === 'en' ? 'Savings' : 'Tabungan', color: radialData[0].fill },
  } satisfies ChartConfig

  // ─── 5. Income by Category Donut Chart ────────────────────────────────
  const incomeCategoryData = useMemo(() => {
    const map = new Map<number, number>()
    transactions
      .filter((t) => t.type === 'income')
      .forEach((t) => map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount))

    return Array.from(map.entries())
      .map(([catId, amount], index) => ({
        id: catId,
        name: categoryMap.get(catId)?.name || `Kategori ${catId}`,
        value: amount,
        fill: COLOR_PALETTE[(index + 3) % COLOR_PALETTE.length],
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [transactions, categoryMap])

  const incomeDonutConfig = incomeCategoryData.reduce((acc, item) => {
    acc[item.name] = { label: item.name, color: item.fill }
    return acc
  }, { value: { label: lang === 'en' ? 'Amount' : 'Nominal' } } as ChartConfig)

  // ─── 6. Weekly Expense Comparison Area Chart ──────────────────────────
  const weeklyData = useMemo(() => {
    const now = new Date()
    const weeks: { week: string; label: string; thisWeek: number; lastWeek: number }[] = []

    const dayNames = lang === 'en'
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

    for (let i = 0; i < 7; i++) {
      weeks.push({ week: String(i), label: dayNames[i], thisWeek: 0, lastWeek: 0 })
    }

    transactions.forEach((t) => {
      if (t.type !== 'expense') return
      const d = new Date(t.date)
      const daysDiff = Math.floor((now.getTime() - d.getTime()) / 86400000)
      const dayOfWeek = d.getDay()

      if (daysDiff >= 0 && daysDiff < 7) {
        weeks[dayOfWeek].thisWeek += t.amount
      } else if (daysDiff >= 7 && daysDiff < 14) {
        weeks[dayOfWeek].lastWeek += t.amount
      }
    })

    return weeks
  }, [transactions, lang])

  const weeklyConfig = {
    thisWeek: { label: lang === 'en' ? 'This Week' : 'Minggu Ini', color: '#3b82f6' },
    lastWeek: { label: lang === 'en' ? 'Last Week' : 'Minggu Lalu', color: '#94a3b8' },
  } satisfies ChartConfig

  // ─── Summary Metric Cards ────────────────────────────────────────────
  const monthlyIncome = useMemo(() => {
    const ym = new Date().toISOString().slice(0, 7)
    return transactions.filter((t) => t.type === 'income' && new Date(t.date).toISOString().slice(0, 7) === ym).reduce((s, t) => s + t.amount, 0)
  }, [transactions])

  const monthlyExpense = useMemo(() => {
    const ym = new Date().toISOString().slice(0, 7)
    return transactions.filter((t) => t.type === 'expense' && new Date(t.date).toISOString().slice(0, 7) === ym).reduce((s, t) => s + t.amount, 0)
  }, [transactions])

  const avgDailyExpense = useMemo(() => {
    const daysSet = new Set<string>()
    let total = 0
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      daysSet.add(new Date(t.date).toISOString().slice(0, 10))
      total += t.amount
    })
    return daysSet.size > 0 ? Math.round(total / daysSet.size) : 0
  }, [transactions])

  const txCount = transactions.length

  return (
    <div className="space-y-6">
      {/* Summary Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Monthly Income' : 'Pemasukan Bulan Ini'}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60">
              <ArrowDownRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="mt-2 text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {mask(monthlyIncome)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Monthly Expense' : 'Pengeluaran Bulan Ini'}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/60">
              <ArrowUpRight className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <p className="mt-2 text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {mask(monthlyExpense)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Avg. Daily Spend' : 'Rata-rata Harian'}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60">
              <CalendarDays className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="mt-2 text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {mask(avgDailyExpense)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Total Transactions' : 'Total Transaksi'}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60">
              <Layers className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <p className="mt-2 text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {txCount.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Row 1: Monthly Bar Chart + Savings Rate Radial */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          title={lang === 'en' ? 'Monthly Income vs Expense' : 'Pemasukan vs Pengeluaran Bulanan'}
          subtitle={lang === 'en' ? 'Last 6 months comparison' : 'Perbandingan 6 bulan terakhir'}
          icon={BarChart3}
          className="lg:col-span-2"
        >
          {monthlyComparisonData.some((d) => d.income > 0 || d.expense > 0) ? (
            <ChartContainer config={barChartConfig} className="h-72 w-full">
              <BarChart accessibilityLayer data={monthlyComparisonData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={(v) => (v >= 1000000 ? `${v / 1000000}M` : `${v / 1000}k`)}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{barChartConfig[name as keyof typeof barChartConfig]?.label}</span>
                          <span className="font-bold">{formatRupiah(Number(value))}</span>
                        </div>
                      )}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="income" fill="var(--color-income)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="var(--color-expense)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-72 items-center justify-center text-xs text-slate-400">
              {lang === 'en' ? 'No transaction data to display' : 'Belum ada data transaksi untuk ditampilkan'}
            </div>
          )}
        </ChartCard>

        <ChartCard
          title={lang === 'en' ? 'Savings Rate' : 'Rasio Tabungan'}
          subtitle={lang === 'en' ? 'Percentage of income saved' : 'Persentase pemasukan yang ditabung'}
          icon={Target}
        >
          <ChartContainer config={radialConfig} className="mx-auto aspect-square max-h-[250px]">
            <RadialBarChart data={radialData} innerRadius={80} outerRadius={110} startAngle={90} endAngle={90 - endAngle}>
              <PolarGrid gridType="circle" radialLines={false} stroke="none" className="first:fill-muted last:fill-background" polarRadius={[86, 74]} />
              <RadialBar dataKey="value" background cornerRadius={10} />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="text-3xl font-black fill-foreground">
                            {savingsRate}%
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="text-xs fill-muted-foreground">
                            {lang === 'en' ? 'Saved' : 'Ditabung'}
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>

          <div className="mt-3 space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{lang === 'en' ? 'Total Income' : 'Total Pemasukan'}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{mask(totalIncome)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{lang === 'en' ? 'Total Expense' : 'Total Pengeluaran'}</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{mask(totalExpense)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{lang === 'en' ? 'Net Savings' : 'Net Tabungan'}</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">{mask(totalIncome - totalExpense)}</span>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Row 2: Daily Expense Trend + Weekly Comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title={lang === 'en' ? 'Daily Expense Trend' : 'Tren Pengeluaran Harian'}
          subtitle={lang === 'en' ? 'Last 30 days' : '30 hari terakhir'}
          icon={TrendingDown}
        >
          {dailyTrendData.some((d) => d.amount > 0) ? (
            <ChartContainer config={trendChartConfig} className="h-64 w-full">
              <AreaChart accessibilityLayer data={dailyTrendData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={10}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={(v) => (v >= 1000000 ? `${v / 1000000}M` : v >= 1000 ? `${v / 1000}k` : `${v}`)}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(value) => (
                        <span className="font-bold">{formatRupiah(Number(value))}</span>
                      )}
                    />
                  }
                />
                <defs>
                  <linearGradient id="fillExpenseTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--color-amount)"
                  strokeWidth={2}
                  fill="url(#fillExpenseTrend)"
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-xs text-slate-400">
              {lang === 'en' ? 'No expense data in the last 30 days' : 'Tidak ada pengeluaran dalam 30 hari terakhir'}
            </div>
          )}
        </ChartCard>

        <ChartCard
          title={lang === 'en' ? 'Weekly Expense Comparison' : 'Perbandingan Pengeluaran Mingguan'}
          subtitle={lang === 'en' ? 'This week vs last week' : 'Minggu ini vs minggu lalu'}
          icon={CalendarDays}
        >
          {weeklyData.some((d) => d.thisWeek > 0 || d.lastWeek > 0) ? (
            <ChartContainer config={weeklyConfig} className="h-64 w-full">
              <BarChart accessibilityLayer data={weeklyData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={(v) => (v >= 1000000 ? `${v / 1000000}M` : v >= 1000 ? `${v / 1000}k` : `${v}`)}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{weeklyConfig[name as keyof typeof weeklyConfig]?.label}</span>
                          <span className="font-bold">{formatRupiah(Number(value))}</span>
                        </div>
                      )}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="thisWeek" fill="var(--color-thisWeek)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="lastWeek" fill="var(--color-lastWeek)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-xs text-slate-400">
              {lang === 'en' ? 'No expense data for comparison' : 'Belum ada data pengeluaran untuk perbandingan'}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Row 3: Top Expense Categories + Income Donut */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          title={lang === 'en' ? 'Top Expense Categories' : 'Kategori Pengeluaran Terbesar'}
          subtitle={lang === 'en' ? 'Where your money goes' : 'Ke mana uang Anda mengalir'}
          icon={PieIcon}
          className="lg:col-span-2"
        >
          {topCategoryData.length > 0 ? (
            <div className="space-y-3">
              {topCategoryData.map((item, idx) => {
                const maxAmount = topCategoryData[0]?.amount || 1
                const pct = Math.round((item.amount / maxAmount) * 100)
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                        <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[180px]">{item.category}</span>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white">{mask(item.amount)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: item.fill }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-xs text-slate-400">
              {lang === 'en' ? 'No expense data available' : 'Belum ada data pengeluaran'}
            </div>
          )}
        </ChartCard>

        <ChartCard
          title={lang === 'en' ? 'Income Sources' : 'Sumber Pemasukan'}
          subtitle={lang === 'en' ? 'Breakdown by category' : 'Berdasarkan kategori'}
          icon={WalletIcon}
        >
          {incomeCategoryData.length > 0 ? (
            <>
              <ChartContainer config={incomeDonutConfig} className="mx-auto aspect-square max-h-[200px]">
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value, name) => (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{name}</span>
                            <span className="font-bold">{formatRupiah(Number(value))}</span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={incomeCategoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    strokeWidth={3}
                    paddingAngle={3}
                  >
                    {incomeCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 max-h-32 overflow-y-auto">
                {incomeCategoryData.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: c.fill }} />
                      <span className="font-medium text-slate-600 dark:text-slate-300 truncate max-w-[110px]">{c.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{mask(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-48 items-center justify-center text-xs text-slate-400">
              {lang === 'en' ? 'No income data available' : 'Belum ada data pemasukan'}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  )
}

