import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { wallets } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req)
    const { id } = await props.params
    const walletId = parseInt(id, 10)
    if (isNaN(walletId)) return apiError('ID dompet tidak valid', 400)

    const body = await req.json()
    const { name, type, color, balance } = body

    const updatePayload: Record<string, any> = {}
    if (name !== undefined) updatePayload.name = String(name).trim()
    if (type !== undefined) updatePayload.type = type
    if (color !== undefined) updatePayload.color = color
    if (balance !== undefined) updatePayload.balance = Math.round(Number(balance))

    const [updated] = await db
      .update(wallets)
      .set(updatePayload)
      .where(and(eq(wallets.id, walletId), eq(wallets.userId, user.id)))
      .returning()

    if (!updated) return apiError('Dompet tidak ditemukan', 404)

    return apiSuccess(updated, 'Dompet berhasil diperbarui')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal memperbarui dompet', 500)
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req)
    const { id } = await props.params
    const walletId = parseInt(id, 10)
    if (isNaN(walletId)) return apiError('ID dompet tidak valid', 400)

    const deleted = await db
      .delete(wallets)
      .where(and(eq(wallets.id, walletId), eq(wallets.userId, user.id)))
      .returning()

    if (!deleted.length) return apiError('Dompet tidak ditemukan atau sudah dihapus', 404)

    return apiSuccess({ id: walletId }, 'Dompet berhasil dihapus')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal menghapus dompet', 500)
  }
}
