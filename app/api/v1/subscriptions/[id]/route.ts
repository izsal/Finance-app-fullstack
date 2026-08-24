import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { subscriptions } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'
import { ensureTahap2Tables } from '@/lib/db-init'

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    await ensureTahap2Tables()
    const user = await getAuthUser(req)
    const { id } = await props.params
    const subId = parseInt(id, 10)
    if (isNaN(subId)) return apiError('ID tagihan tidak valid', 400)

    const [found] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.id, subId), eq(subscriptions.userId, user.id)))
      .limit(1)

    if (!found) return apiError('Tagihan tidak ditemukan', 404)

    return apiSuccess(found, 'Detail tagihan ditemukan')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal memuat tagihan', 500)
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    await ensureTahap2Tables()
    const user = await getAuthUser(req)
    const { id } = await props.params
    const subId = parseInt(id, 10)
    if (isNaN(subId)) return apiError('ID tagihan tidak valid', 400)

    const body = await req.json()
    const { name, amount, billingCycle, dueDate, categoryId, walletId, isActive, reminderDaysBefore } = body

    const existing = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.id, subId), eq(subscriptions.userId, user.id)))
      .limit(1)

    if (!existing.length) return apiError('Tagihan tidak ditemukan', 404)

    const updatePayload: Record<string, any> = {}
    if (name !== undefined) updatePayload.name = String(name).trim()
    if (amount !== undefined) updatePayload.amount = Math.round(Number(amount))
    if (billingCycle !== undefined) updatePayload.billingCycle = billingCycle
    if (dueDate !== undefined) updatePayload.dueDate = Math.min(31, Math.max(1, Number(dueDate)))
    if (categoryId !== undefined) updatePayload.categoryId = categoryId ? Number(categoryId) : null
    if (walletId !== undefined) updatePayload.walletId = walletId ? Number(walletId) : null
    if (isActive !== undefined) updatePayload.isActive = Boolean(isActive)
    if (reminderDaysBefore !== undefined) updatePayload.reminderDaysBefore = Number(reminderDaysBefore)

    const [updated] = await db
      .update(subscriptions)
      .set(updatePayload)
      .where(and(eq(subscriptions.id, subId), eq(subscriptions.userId, user.id)))
      .returning()

    return apiSuccess(updated, 'Tagihan rutin berhasil diperbarui')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal memperbarui tagihan', 500)
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    await ensureTahap2Tables()
    const user = await getAuthUser(req)
    const { id } = await props.params
    const subId = parseInt(id, 10)
    if (isNaN(subId)) return apiError('ID tagihan tidak valid', 400)

    const deleted = await db
      .delete(subscriptions)
      .where(and(eq(subscriptions.id, subId), eq(subscriptions.userId, user.id)))
      .returning()

    if (!deleted.length) return apiError('Tagihan tidak ditemukan atau sudah dihapus', 404)

    return apiSuccess({ id: subId }, 'Tagihan rutin berhasil dihapus')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal menghapus tagihan', 500)
  }
}
