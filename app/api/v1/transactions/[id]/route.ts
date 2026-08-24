import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { transactions } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req)
    const { id } = await props.params
    const txId = parseInt(id, 10)

    if (isNaN(txId)) return apiError('ID transaksi tidak valid', 400)

    const found = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, txId), eq(transactions.userId, user.id)))
      .limit(1)

    if (!found.length) return apiError('Transaksi tidak ditemukan', 404)

    return apiSuccess(found[0], 'Detail transaksi ditemukan')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized', 401)
    }
    return apiError(err?.message || 'Gagal memuat transaksi', 500)
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req)
    const { id } = await props.params
    const txId = parseInt(id, 10)
    if (isNaN(txId)) return apiError('ID transaksi tidak valid', 400)

    const body = await req.json()
    const { walletId, categoryId, type, amount, description, date } = body

    const existing = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, txId), eq(transactions.userId, user.id)))
      .limit(1)

    if (!existing.length) return apiError('Transaksi tidak ditemukan', 404)

    const updatePayload: Record<string, any> = {}
    if (description !== undefined) updatePayload.description = String(description).trim()
    if (amount !== undefined) updatePayload.amount = Math.round(Number(amount))
    if (type !== undefined) updatePayload.type = type
    if (walletId !== undefined) updatePayload.walletId = Number(walletId)
    if (categoryId !== undefined) updatePayload.categoryId = Number(categoryId)
    if (date !== undefined) updatePayload.date = new Date(date)

    const [updated] = await db
      .update(transactions)
      .set(updatePayload)
      .where(and(eq(transactions.id, txId), eq(transactions.userId, user.id)))
      .returning()

    return apiSuccess(updated, 'Transaksi berhasil diperbarui')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized', 401)
    }
    return apiError(err?.message || 'Gagal memperbarui transaksi', 500)
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req)
    const { id } = await props.params
    const txId = parseInt(id, 10)
    if (isNaN(txId)) return apiError('ID transaksi tidak valid', 400)

    const deleted = await db
      .delete(transactions)
      .where(and(eq(transactions.id, txId), eq(transactions.userId, user.id)))
      .returning()

    if (!deleted.length) return apiError('Transaksi tidak ditemukan atau sudah dihapus', 404)

    return apiSuccess({ id: txId }, 'Transaksi berhasil dihapus')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized', 401)
    }
    return apiError(err?.message || 'Gagal menghapus transaksi', 500)
  }
}
