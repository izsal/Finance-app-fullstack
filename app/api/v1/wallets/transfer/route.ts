import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { categories, transactions, wallets } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    const body = await req.json()
    const { fromWalletId, toWalletId, amount, description, date } = body

    if (!fromWalletId || !toWalletId || fromWalletId === toWalletId) {
      return apiError('Dompet sumber dan dompet tujuan harus berbeda dan valid', 422)
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return apiError('Nominal transfer harus berupa angka lebih dari 0', 422)
    }

    const [fromW, toW] = await Promise.all([
      db.select().from(wallets).where(and(eq(wallets.id, Number(fromWalletId)), eq(wallets.userId, user.id))),
      db.select().from(wallets).where(and(eq(wallets.id, Number(toWalletId)), eq(wallets.userId, user.id))),
    ])

    if (!fromW.length || !toW.length) {
      return apiError('Dompet tidak ditemukan', 404)
    }

    // Find or create category for transfer
    let transferCat = await db
      .select()
      .from(categories)
      .where(and(eq(categories.userId, user.id), eq(categories.name, 'Transfer Saldo')))

    let categoryId = transferCat[0]?.id
    if (!categoryId) {
      const [inserted] = await db
        .insert(categories)
        .values({
          userId: user.id,
          name: 'Transfer Saldo',
          type: 'expense',
          color: 'indigo',
        })
        .returning()
      categoryId = inserted.id
    }

    const descFrom = description?.trim()
      ? `${description.trim()} (Transfer ke ${toW[0].name})`
      : `Transfer keluar ke ${toW[0].name}`
    const descTo = description?.trim()
      ? `${description.trim()} (Transfer dari ${fromW[0].name})`
      : `Transfer masuk dari ${fromW[0].name}`

    const txDate = date ? new Date(date) : new Date()

    const [expenseTx, incomeTx] = await Promise.all([
      db
        .insert(transactions)
        .values({
          userId: user.id,
          walletId: Number(fromWalletId),
          categoryId,
          type: 'expense',
          amount: Math.round(amount),
          description: descFrom,
          date: txDate,
        })
        .returning(),
      db
        .insert(transactions)
        .values({
          userId: user.id,
          walletId: Number(toWalletId),
          categoryId,
          type: 'income',
          amount: Math.round(amount),
          description: descTo,
          date: txDate,
        })
        .returning(),
    ])

    return apiSuccess(
      {
        fromTransaction: expenseTx[0],
        toTransaction: incomeTx[0],
      },
      'Transfer saldo antar dompet berhasil diproses',
      201
    )
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal memproses transfer', 500)
  }
}
