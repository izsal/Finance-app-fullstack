import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { categories } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    const conditions = [eq(categories.userId, user.id)]
    if (type && (type === 'income' || type === 'expense')) {
      conditions.push(eq(categories.type, type))
    }

    const items = await db
      .select()
      .from(categories)
      .where(and(...conditions))

    return apiSuccess(items, 'Daftar kategori berhasil dimuat')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal memuat kategori', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    const body = await req.json()
    const { name, type, color } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return apiError('Nama kategori wajib diisi', 422)
    }
    if (type !== 'income' && type !== 'expense') {
      return apiError('Tipe kategori harus "income" atau "expense"', 422)
    }

    const [created] = await db
      .insert(categories)
      .values({
        userId: user.id,
        name: name.trim(),
        type,
        color: color || 'slate',
      })
      .returning()

    return apiSuccess(created, 'Kategori berhasil dibuat', 201)
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal membuat kategori', 500)
  }
}
