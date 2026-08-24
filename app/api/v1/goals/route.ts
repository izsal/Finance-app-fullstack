import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { goals } from '@/lib/schema'
import { desc, eq } from 'drizzle-orm'
import { ensureTahap2Tables } from '@/lib/db-init'

export async function GET(req: NextRequest) {
  try {
    await ensureTahap2Tables()
    const user = await getAuthUser(req)

    const list = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, user.id))
      .orderBy(desc(goals.createdAt))

    const enriched = list.map((g) => {
      const percentage = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0
      const remaining = Math.max(0, g.targetAmount - g.currentAmount)
      return {
        ...g,
        percentage,
        remaining,
      }
    })

    return apiSuccess(enriched, 'Daftar target tabungan berhasil dimuat')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal memuat target tabungan', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTahap2Tables()
    const user = await getAuthUser(req)
    const body = await req.json()

    const { name, targetAmount, currentAmount, targetDate, color, icon, walletId } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return apiError('Nama target tabungan wajib diisi', 422)
    }
    if (!targetAmount || typeof targetAmount !== 'number' || targetAmount <= 0) {
      return apiError('Nominal target harus berupa angka lebih dari 0', 422)
    }

    const cur = currentAmount ? Math.round(Number(currentAmount)) : 0
    const tgt = Math.round(Number(targetAmount))

    const [created] = await db
      .insert(goals)
      .values({
        userId: user.id,
        name: name.trim(),
        targetAmount: tgt,
        currentAmount: cur,
        targetDate: targetDate ? new Date(targetDate) : null,
        color: color || 'teal',
        icon: icon || 'target',
        walletId: walletId ? Number(walletId) : null,
        isAchieved: cur >= tgt,
      })
      .returning()

    return apiSuccess(created, 'Target tabungan berhasil dibuat', 201)
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal membuat target tabungan', 500)
  }
}
