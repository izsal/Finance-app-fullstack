import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { categories, goals, transactions } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'
import { ensureTahap2Tables } from '@/lib/db-init'

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    await ensureTahap2Tables()
    const user = await getAuthUser(req)
    const { id } = await props.params
    const goalId = parseInt(id, 10)
    if (isNaN(goalId)) return apiError('ID target tabungan tidak valid', 400)

    const body = await req.json()
    const { amount, walletId } = body

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return apiError('Nominal alokasi tabungan harus berupa angka lebih dari 0', 422)
    }

    const [existing] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)))

    if (!existing) return apiError('Target tabungan tidak ditemukan', 404)

    const newCurrent = existing.currentAmount + Math.round(amount)
    const isAchieved = newCurrent >= existing.targetAmount

    const [updated] = await db
      .update(goals)
      .set({
        currentAmount: newCurrent,
        isAchieved,
      })
      .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)))
      .returning()

    // If wallet selected, record expense transaction for tabungan
    if (walletId && !isNaN(Number(walletId))) {
      let tabunganCat = await db
        .select()
        .from(categories)
        .where(and(eq(categories.userId, user.id), eq(categories.name, 'Tabungan & Investasi')))

      let catId = tabunganCat[0]?.id
      if (!catId) {
        const [inserted] = await db
          .insert(categories)
          .values({
            userId: user.id,
            name: 'Tabungan & Investasi',
            type: 'expense',
            color: 'emerald',
          })
          .returning()
        catId = inserted.id
      }

      await db.insert(transactions).values({
        userId: user.id,
        walletId: Number(walletId),
        categoryId: catId,
        type: 'expense',
        amount: Math.round(amount),
        description: `Alokasi Tabungan: ${existing.name}`,
        date: new Date(),
      })
    }

    return apiSuccess(
      {
        ...updated,
        percentage: Math.min(100, Math.round((newCurrent / updated.targetAmount) * 100)),
        remaining: Math.max(0, updated.targetAmount - newCurrent),
      },
      'Setoran tabungan berhasil dicatat',
      200
    )
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal menyetor ke target tabungan', 500)
  }
}
