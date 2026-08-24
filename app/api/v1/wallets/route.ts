import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { transactions, wallets } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)

    const [allWallets, allTransactions] = await Promise.all([
      db.select().from(wallets).where(eq(wallets.userId, user.id)),
      db.select().from(transactions).where(eq(transactions.userId, user.id)),
    ])

    const enriched = allWallets.map((w) => {
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
        createdAt: w.createdAt,
      }
    })

    return apiSuccess(enriched, 'Daftar dompet berhasil dimuat')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal memuat dompet', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    const body = await req.json()
    const { name, type, balance, color } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return apiError('Nama dompet wajib diisi', 422)
    }

    const [created] = await db
      .insert(wallets)
      .values({
        userId: user.id,
        name: name.trim(),
        type: type || 'Bank',
        balance: balance ? Math.round(Number(balance)) : 0,
        color: color || 'teal',
      })
      .returning()

    return apiSuccess(created, 'Dompet berhasil dibuat', 201)
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal membuat dompet', 500)
  }
}
