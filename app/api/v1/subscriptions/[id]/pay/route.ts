import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { categories, subscriptions, transactions } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'
import { ensureTahap2Tables } from '@/lib/db-init'

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    await ensureTahap2Tables()
    const user = await getAuthUser(req)
    const { id } = await props.params
    const subId = parseInt(id, 10)
    if (isNaN(subId)) return apiError('ID tagihan tidak valid', 400)

    const body = await req.json().catch(() => ({}))
    const { walletId, date } = body

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.id, subId), eq(subscriptions.userId, user.id)))

    if (!sub) return apiError('Tagihan tidak ditemukan', 404)

    const targetWalletId = walletId ? Number(walletId) : sub.walletId
    if (!targetWalletId) {
      return apiError('Mohon tentukan walletId yang digunakan untuk pembayaran', 422)
    }

    let catId = sub.categoryId
    if (!catId) {
      let billCat = await db
        .select()
        .from(categories)
        .where(and(eq(categories.userId, user.id), eq(categories.name, 'Tagihan & Utilitas')))

      catId = billCat[0]?.id
      if (!catId) {
        const [inserted] = await db
          .insert(categories)
          .values({
            userId: user.id,
            name: 'Tagihan & Utilitas',
            type: 'expense',
            color: 'cyan',
          })
          .returning()
        catId = inserted.id
      }
    }

    const txDate = date ? new Date(date) : new Date()

    const [createdTx] = await db
      .insert(transactions)
      .values({
        userId: user.id,
        walletId: targetWalletId,
        categoryId: catId,
        type: 'expense',
        amount: sub.amount,
        description: `Pembayaran: ${sub.name}`,
        date: txDate,
      })
      .returning()

    return apiSuccess(
      {
        subscription: sub,
        transaction: createdTx,
      },
      `Pembayaran tagihan "${sub.name}" berhasil dicatat`,
      201
    )
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal membayar tagihan', 500)
  }
}
