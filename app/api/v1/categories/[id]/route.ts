import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { categories } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req)
    const { id } = await props.params
    const catId = parseInt(id, 10)
    if (isNaN(catId)) return apiError('ID kategori tidak valid', 400)

    const body = await req.json()
    const { name, type, color } = body

    const updatePayload: Record<string, any> = {}
    if (name !== undefined) updatePayload.name = String(name).trim()
    if (type !== undefined) updatePayload.type = type
    if (color !== undefined) updatePayload.color = color

    const [updated] = await db
      .update(categories)
      .set(updatePayload)
      .where(and(eq(categories.id, catId), eq(categories.userId, user.id)))
      .returning()

    if (!updated) return apiError('Kategori tidak ditemukan', 404)

    return apiSuccess(updated, 'Kategori berhasil diperbarui')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal memperbarui kategori', 500)
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req)
    const { id } = await props.params
    const catId = parseInt(id, 10)
    if (isNaN(catId)) return apiError('ID kategori tidak valid', 400)

    const deleted = await db
      .delete(categories)
      .where(and(eq(categories.id, catId), eq(categories.userId, user.id)))
      .returning()

    if (!deleted.length) return apiError('Kategori tidak ditemukan atau sudah dihapus', 404)

    return apiSuccess({ id: catId }, 'Kategori berhasil dihapus')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal menghapus kategori', 500)
  }
}
