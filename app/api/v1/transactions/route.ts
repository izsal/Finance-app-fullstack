import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { categories, transactions, wallets } from '@/lib/schema'
import { and, desc, eq, gte, ilike, lte, sql } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    const { searchParams } = new URL(req.url)

    const type = searchParams.get('type')
    const walletId = searchParams.get('walletId')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const offset = (page - 1) * limit

    const conditions = [eq(transactions.userId, user.id)]

    if (type && (type === 'income' || type === 'expense')) {
      conditions.push(eq(transactions.type, type))
    }
    if (walletId && !isNaN(Number(walletId))) {
      conditions.push(eq(transactions.walletId, Number(walletId)))
    }
    if (categoryId && !isNaN(Number(categoryId))) {
      conditions.push(eq(transactions.categoryId, Number(categoryId)))
    }
    if (search && search.trim()) {
      conditions.push(ilike(transactions.description, `%${search.trim()}%`))
    }
    if (startDate) {
      conditions.push(gte(transactions.date, new Date(startDate)))
    }
    if (endDate) {
      conditions.push(lte(transactions.date, new Date(endDate)))
    }

    const whereClause = and(...conditions)

    const [items, countResult, allCats, allWallets] = await Promise.all([
      db
        .select()
        .from(transactions)
        .where(whereClause)
        .orderBy(desc(transactions.date))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(transactions)
        .where(whereClause),
      db.select().from(categories).where(eq(categories.userId, user.id)),
      db.select().from(wallets).where(eq(wallets.userId, user.id)),
    ])

    const total = Number(countResult[0]?.count || 0)
    const catMap = new Map(allCats.map((c) => [c.id, c]))
    const walMap = new Map(allWallets.map((w) => [w.id, w]))

    const enrichedItems = items.map((t) => ({
      ...t,
      category: catMap.get(t.categoryId) || null,
      wallet: walMap.get(t.walletId) || null,
    }))

    return apiSuccess(
      {
        transactions: enrichedItems,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: offset + items.length < total,
        },
      },
      'Daftar transaksi berhasil dimuat'
    )
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized. Silakan sertakan header Authorization: Bearer <token>', 401)
    }
    return apiError(err?.message || 'Gagal memuat transaksi', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    const body = await req.json()

    const { walletId, categoryId, type, amount, description, date } = body

    if (!description || typeof description !== 'string' || !description.trim()) {
      return apiError('Deskripsi transaksi wajib diisi', 422)
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return apiError('Nominal transaksi harus berupa angka lebih dari 0', 422)
    }
    if (type !== 'income' && type !== 'expense') {
      return apiError('Tipe transaksi harus "income" atau "expense"', 422)
    }
    if (!walletId || isNaN(Number(walletId))) {
      return apiError('ID dompet tidak valid', 422)
    }
    if (!categoryId || isNaN(Number(categoryId))) {
      return apiError('ID kategori tidak valid', 422)
    }

    const txDate = date ? new Date(date) : new Date()
    if (isNaN(txDate.getTime())) {
      return apiError('Format tanggal tidak valid (gunakan ISO string YYYY-MM-DD)', 422)
    }

    const [created] = await db
      .insert(transactions)
      .values({
        userId: user.id,
        walletId: Number(walletId),
        categoryId: Number(categoryId),
        type,
        amount: Math.round(amount),
        description: description.trim(),
        date: txDate,
      })
      .returning()

    return apiSuccess(created, 'Transaksi berhasil dicatat', 201)
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized. Silakan sertakan header Authorization: Bearer <token>', 401)
    }
    return apiError(err?.message || 'Gagal membuat transaksi', 500)
  }
}
