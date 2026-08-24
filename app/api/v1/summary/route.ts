import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { budgets, categories, transactions, wallets } from '@/lib/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)

    const [allWallets, allCategories, allBudgets, allTransactions] = await Promise.all([
      db.select().from(wallets).where(eq(wallets.userId, user.id)),
      db.select().from(categories).where(eq(categories.userId, user.id)),
      db.select().from(budgets).where(eq(budgets.userId, user.id)),
      db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, user.id))
        .orderBy(desc(transactions.date)),
    ])

    // Calculate dynamic wallet balances
    const calculatedWallets = allWallets.map((w) => {
      const inc = allTransactions
        .filter((t) => t.walletId === w.id && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const exp = allTransactions
        .filter((t) => t.walletId === w.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      const currentBalance = (w.balance || 0) + inc - exp
      return {
        id: w.id,
        name: w.name,
        type: w.type,
        color: w.color,
        initialBalance: w.balance,
        currentBalance,
        totalIncome: inc,
        totalExpense: exp,
      }
    })

    const totalBalance = calculatedWallets.reduce((acc, w) => acc + w.currentBalance, 0)
    const totalIncome = allTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0)
    const totalExpense = allTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)
    const netSavings = totalIncome - totalExpense
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0

    // Expense breakdown by category
    const catMap = new Map(allCategories.map((c) => [c.id, c]))
    const expByCatMap = new Map<number, number>()
    allTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expByCatMap.set(t.categoryId, (expByCatMap.get(t.categoryId) || 0) + t.amount)
      })

    const categoryBreakdown = Array.from(expByCatMap.entries())
      .map(([catId, amount]) => {
        const cat = catMap.get(catId)
        return {
          categoryId: catId,
          categoryName: cat?.name || 'Tanpa Kategori',
          color: cat?.color || 'slate',
          totalAmount: amount,
          percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
        }
      })
      .sort((a, b) => b.totalAmount - a.totalAmount)

    return apiSuccess(
      {
        metrics: {
          totalBalance,
          totalIncome,
          totalExpense,
          netSavings,
          savingsRate,
          totalTransactionsCount: allTransactions.length,
          totalWalletsCount: allWallets.length,
        },
        wallets: calculatedWallets,
        categoryBreakdown,
        recentTransactions: allTransactions.slice(0, 10).map((t) => ({
          ...t,
          categoryName: catMap.get(t.categoryId)?.name || 'Kategori',
        })),
      },
      'Ringkasan data finansial berhasil dimuat'
    )
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized. Silakan sertakan header Authorization: Bearer <token>', 401)
    }
    return apiError(err?.message || 'Gagal memuat ringkasan', 500)
  }
}
