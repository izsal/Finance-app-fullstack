import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { goals } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'
import { ensureTahap2Tables } from '@/lib/db-init'

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    await ensureTahap2Tables()
    const user = await getAuthUser(req)
    const { id } = await props.params
    const goalId = parseInt(id, 10)
    if (isNaN(goalId)) return apiError('ID target tabungan tidak valid', 400)

    const [found] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)))
      .limit(1)

    if (!found) return apiError('Target tabungan tidak ditemukan', 404)

    const percentage = found.targetAmount > 0 ? Math.min(100, Math.round((found.currentAmount / found.targetAmount) * 100)) : 0
    const remaining = Math.max(0, found.targetAmount - found.currentAmount)

    return apiSuccess({ ...found, percentage, remaining }, 'Detail target tabungan ditemukan')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal memuat target tabungan', 500)
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    await ensureTahap2Tables()
    const user = await getAuthUser(req)
    const { id } = await props.params
    const goalId = parseInt(id, 10)
    if (isNaN(goalId)) return apiError('ID target tabungan tidak valid', 400)

    const body = await req.json()
    const { name, targetAmount, currentAmount, targetDate, color, icon, walletId, isAchieved } = body

    const existing = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)))
      .limit(1)

    if (!existing.length) return apiError('Target tabungan tidak ditemukan', 404)

    const updatePayload: Record<string, any> = {}
    if (name !== undefined) updatePayload.name = String(name).trim()
    if (targetAmount !== undefined) updatePayload.targetAmount = Math.round(Number(targetAmount))
    if (currentAmount !== undefined) updatePayload.currentAmount = Math.round(Number(currentAmount))
    if (targetDate !== undefined) updatePayload.targetDate = targetDate ? new Date(targetDate) : null
    if (color !== undefined) updatePayload.color = color
    if (icon !== undefined) updatePayload.icon = icon
    if (walletId !== undefined) updatePayload.walletId = walletId ? Number(walletId) : null

    const finalTarget = updatePayload.targetAmount ?? existing[0].targetAmount
    const finalCurrent = updatePayload.currentAmount ?? existing[0].currentAmount
    updatePayload.isAchieved = isAchieved !== undefined ? Boolean(isAchieved) : finalCurrent >= finalTarget

    const [updated] = await db
      .update(goals)
      .set(updatePayload)
      .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)))
      .returning()

    return apiSuccess(updated, 'Target tabungan berhasil diperbarui')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal memperbarui target tabungan', 500)
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    await ensureTahap2Tables()
    const user = await getAuthUser(req)
    const { id } = await props.params
    const goalId = parseInt(id, 10)
    if (isNaN(goalId)) return apiError('ID target tabungan tidak valid', 400)

    const deleted = await db
      .delete(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)))
      .returning()

    if (!deleted.length) return apiError('Target tabungan tidak ditemukan atau sudah dihapus', 404)

    return apiSuccess({ id: goalId }, 'Target tabungan berhasil dihapus')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal menghapus target tabungan', 500)
  }
}
