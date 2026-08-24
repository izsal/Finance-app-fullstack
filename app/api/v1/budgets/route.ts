import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { budgets, categories, transactions } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)

    const [userBudgets, userCategories, userTransactions] = await Promise.all([
      db
        .select()
        .from(budgets)
        .where(and(eq(budgets.userId, user.id), eq(budgets.month, month))),
      db.select().from(categories).where(eq(categories.userId, user.id)),
      db.select().from(transactions).where(eq(transactions.userId, user.id)),
    ])

    const catMap = new Map(userCategories.map((c) => [c.id, c]))

    const enriched = userBudgets.map((b) => {
      const cat = catMap.get(b.categoryId)
      const spent = userTransactions
        .filter((t) => {
          const matchCat = t.categoryId === b.categoryId
          const matchMonth = new Date(t.date).toISOString().slice(0, 7) === b.month
          return matchCat && matchMonth && t.type === 'expense'
        })
        .reduce((sum, t) => sum + t.amount, 0)
      const remaining = b.amount - spent
      const percentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0

      return {
        id: b.id,
        categoryId: b.categoryId,
        categoryName: cat?.name || 'Kategori',
        categoryColor: cat?.color || 'slate',
        month: b.month,
        amount: b.amount,
        spent,
        remaining,
        percentage,
        isOverbudget: percentage > 100,
        createdAt: b.createdAt,
      }
    })

    const totalBudget = enriched.reduce((sum, b) => sum + b.amount, 0)
    const totalSpentInBudgets = enriched.reduce((sum, b) => sum + b.spent, 0)
    const totalRemaining = totalBudget - totalSpentInBudgets

    return apiSuccess(
      {
        month,
        summary: {
          totalBudget,
          totalSpent: totalSpentInBudgets,
          totalRemaining,
          overallPercentage: totalBudget > 0 ? Math.round((totalSpentInBudgets / totalBudget) * 100) : 0,
        },
        budgets: enriched,
      },
      `Data budget untuk bulan ${month} berhasil dimuat`
    )
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal memuat budget', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    const body = await req.json()
    const { categoryId, amount, month } = body

    if (!categoryId || isNaN(Number(categoryId))) {
      return apiError('ID kategori tidak valid', 422)
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return apiError('Nominal budget harus berupa angka lebih dari 0', 422)
    }
    if (!month || typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
      return apiError('Format bulan tidak valid (gunakan YYYY-MM contoh: 2026-08)', 422)
    }

    const existing = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, user.id),
          eq(budgets.categoryId, Number(categoryId)),
          eq(budgets.month, month)
        )
      )

    let result
    if (existing.length > 0) {
      const [updated] = await db
        .update(budgets)
        .set({ amount: Math.round(amount) })
        .where(and(eq(budgets.id, existing[0].id), eq(budgets.userId, user.id)))
        .returning()
      result = updated
    } else {
      const [created] = await db
        .insert(budgets)
        .values({
          userId: user.id,
          categoryId: Number(categoryId),
          amount: Math.round(amount),
          month,
        })
        .returning()
      result = created
    }

    return apiSuccess(result, 'Budget berhasil disimpan', 201)
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal menyimpan budget', 500)
  }
}
