import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { budgets } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req)
    const { id } = await props.params
    const budgetId = parseInt(id, 10)
    if (isNaN(budgetId)) return apiError('ID budget tidak valid', 400)

    const deleted = await db
      .delete(budgets)
      .where(and(eq(budgets.id, budgetId), eq(budgets.userId, user.id)))
      .returning()

    if (!deleted.length) return apiError('Budget tidak ditemukan atau sudah dihapus', 404)

    return apiSuccess({ id: budgetId }, 'Budget berhasil dihapus')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal menghapus budget', 500)
  }
}
