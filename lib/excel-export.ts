import * as XLSX from 'xlsx'
import { formatRupiah, formatIndoDate } from './utils'
import type { Wallet, Category, Budget, Transaction, Goal, Subscription } from './schema'

interface ExportData {
  user: { name: string; email: string }
  wallets: Wallet[]
  categories: Category[]
  budgets: Budget[]
  transactions: Transaction[]
  goals?: Goal[]
  subscriptions?: Subscription[]
}

export function exportFinanceToExcel({ user, wallets, categories, budgets, transactions, goals = [], subscriptions = [] }: ExportData) {
  const wb = XLSX.utils.book_new()

  const categoryMap = new Map(categories.map((c) => [c.id, c]))
  const walletMap = new Map(wallets.map((w) => [w.id, w]))

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
  const netSavings = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) + '%' : '0%'

  // 1. Sheet Ringkasan Keuangan
  const summaryRows = [
    ['LAPORAN KEUANGAN PRIBADI - DOMPETKU PRO'],
    ['Generated at:', new Date().toLocaleString('id-ID')],
    ['Pemilik Akun:', user.name],
    ['Email:', user.email],
    [],
    ['RINGKASAN UTAMA', 'NOMINAL (IDR)', 'KETERANGAN'],
    ['Total Pemasukan', totalIncome, formatRupiah(totalIncome)],
    ['Total Pengeluaran', totalExpense, formatRupiah(totalExpense)],
    ['Net Tabungan (Sisa)', netSavings, formatRupiah(netSavings)],
    ['Savings Rate (%)', savingsRate, 'Persentase uang yang tersimpan'],
    ['Jumlah Dompet Aktif', wallets.length, 'Akun rekening & e-wallet'],
    ['Total Transaksi Tercatat', transactions.length, 'Data transaksi'],
    ['Target Tabungan Aktif', goals.length, 'Financial Goals'],
    ['Langganan & Tagihan Rutin', subscriptions.length, 'Recurring Subscriptions'],
  ]

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows)
  wsSummary['!cols'] = [{ wch: 28 }, { wch: 20 }, { wch: 35 }]
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan')

  // 2. Sheet Transaksi
  const transactionRows = transactions.map((t, idx) => {
    const cat = categoryMap.get(t.categoryId)
    const wal = walletMap.get(t.walletId)
    const d = new Date(t.date)
    return {
      No: idx + 1,
      Tanggal: d.toISOString().slice(0, 10),
      Waktu: d.toLocaleTimeString('id-ID'),
      Deskripsi: t.description,
      Tipe: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      Kategori: cat?.name || 'Tanpa Kategori',
      Dompet: wal?.name || 'Dompet Utama',
      'Nominal (Angka)': t.type === 'income' ? t.amount : -t.amount,
      'Nominal (Format Rp)': (t.type === 'income' ? '+ ' : '- ') + formatRupiah(t.amount)
    }
  })

  const wsTransactions = XLSX.utils.json_to_sheet(transactionRows)
  wsTransactions['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 10 },
    { wch: 30 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 18 },
    { wch: 22 }
  ]
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Daftar Transaksi')

  // 3. Sheet Target Tabungan (Goals - Tahap 2)
  if (goals.length > 0) {
    const goalRows = goals.map((g, idx) => {
      const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0
      const remaining = Math.max(0, g.targetAmount - g.currentAmount)
      return {
        No: idx + 1,
        'Nama Target Impian': g.name,
        'Target Nominal (Rp)': g.targetAmount,
        'Saldo Terkumpul (Rp)': g.currentAmount,
        'Sisa Kurang (Rp)': remaining,
        'Progress (%)': `${pct}%`,
        'Target Tanggal': g.targetDate ? new Date(g.targetDate).toISOString().slice(0, 10) : '-',
        Status: g.isAchieved || pct >= 100 ? 'Tercapai 🎉' : 'Dalam Proses',
      }
    })

    const wsGoals = XLSX.utils.json_to_sheet(goalRows)
    wsGoals['!cols'] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 20 },
      { wch: 22 },
      { wch: 18 },
      { wch: 14 },
      { wch: 16 },
      { wch: 18 },
    ]
    XLSX.utils.book_append_sheet(wb, wsGoals, 'Target Impian')
  }

  // 4. Sheet Tagihan Rutin (Subscriptions - Tahap 2)
  if (subscriptions.length > 0) {
    const subRows = subscriptions.map((s, idx) => {
      return {
        No: idx + 1,
        'Nama Tagihan': s.name,
        'Biaya (Rp)': s.amount,
        'Format Biaya': formatRupiah(s.amount),
        'Siklus': s.billingCycle === 'monthly' ? 'Bulanan' : s.billingCycle === 'yearly' ? 'Tahunan' : 'Mingguan',
        'Tanggal Jatuh Tempo': `Tgl ${s.dueDate} setiap bulan`,
        'Status': s.isActive ? 'Aktif' : 'Nonaktif',
      }
    })

    const wsSubs = XLSX.utils.json_to_sheet(subRows)
    wsSubs['!cols'] = [
      { wch: 6 },
      { wch: 26 },
      { wch: 16 },
      { wch: 20 },
      { wch: 14 },
      { wch: 25 },
      { wch: 14 },
    ]
    XLSX.utils.book_append_sheet(wb, wsSubs, 'Tagihan Rutin')
  }

  // 5. Sheet Budget Bulanan
  const budgetRows = budgets.map((b, idx) => {
    const cat = categoryMap.get(b.categoryId)
    const spent = transactions
      .filter((t) => t.categoryId === b.categoryId && t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)
    const remaining = b.amount - spent
    const usagePercent = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0
    let status = 'Aman'
    if (usagePercent > 100) status = 'Melebihi Budget (Overbudget)'
    else if (usagePercent >= 80) status = 'Waspada'

    return {
      No: idx + 1,
      Bulan: b.month,
      Kategori: cat?.name || 'Kategori ' + b.categoryId,
      'Alokasi Budget (Rp)': b.amount,
      'Realisasi Pengeluaran (Rp)': spent,
      'Sisa Budget (Rp)': remaining,
      'Utilisasi (%)': `${usagePercent}%`,
      Status: status
    }
  })

  const wsBudgets = XLSX.utils.json_to_sheet(budgetRows)
  wsBudgets['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 22 },
    { wch: 20 },
    { wch: 25 },
    { wch: 18 },
    { wch: 15 },
    { wch: 28 }
  ]
  XLSX.utils.book_append_sheet(wb, wsBudgets, 'Analisis Budget')

  // 6. Sheet Saldo Dompet
  const walletRows = wallets.map((w, idx) => {
    const income = transactions
      .filter((t) => t.walletId === w.id && t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0)
    const expense = transactions
      .filter((t) => t.walletId === w.id && t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)
    const calculatedBalance = (w.balance || 0) + income - expense

    return {
      No: idx + 1,
      'Nama Dompet / Akun': w.name,
      'Jenis Dompet': w.type,
      'Saldo Awal (Rp)': w.balance || 0,
      'Total Masuk (Rp)': income,
      'Total Keluar (Rp)': expense,
      'Saldo Akhir (Rp)': calculatedBalance,
      'Saldo Format': formatRupiah(calculatedBalance)
    }
  })

  const wsWallets = XLSX.utils.json_to_sheet(walletRows)
  wsWallets['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 }
  ]
  XLSX.utils.book_append_sheet(wb, wsWallets, 'Saldo Dompet')

  // 7. Sheet Rekap Kategori
  const categorySummaryRows = categories.map((cat, idx) => {
    const catTransactions = transactions.filter((t) => t.categoryId === cat.id)
    const totalAmount = catTransactions.reduce((acc, t) => acc + t.amount, 0)
    return {
      No: idx + 1,
      'Nama Kategori': cat.name,
      'Jenis': cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      'Frekuensi Transaksi': catTransactions.length,
      'Total Nominal (Rp)': totalAmount,
      'Format Nominal': formatRupiah(totalAmount)
    }
  })

  const wsCategory = XLSX.utils.json_to_sheet(categorySummaryRows)
  wsCategory['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 16 },
    { wch: 20 },
    { wch: 20 },
    { wch: 22 }
  ]
  XLSX.utils.book_append_sheet(wb, wsCategory, 'Rekap Kategori')

  const fileName = `Laporan_Keuangan_Dompetku_${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, fileName)
}
