import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { categories, subscriptions, wallets } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { ensureTahap2Tables } from '@/lib/db-init'

export async function GET(req: NextRequest) {
  try {
    await ensureTahap2Tables()
    const user = await getAuthUser(req)

    const [subs, allCats, allWallets] = await Promise.all([
      db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, user.id))
        .orderBy(subscriptions.dueDate),
      db.select().from(categories).where(eq(categories.userId, user.id)),
      db.select().from(wallets).where(eq(wallets.userId, user.id)),
    ])

    const catMap = new Map(allCats.map((c) => [c.id, c]))
    const walMap = new Map(allWallets.map((w) => [w.id, w]))

    const todayDate = new Date().getDate()

    const enriched = subs.map((s) => {
      const daysUntilDue = s.dueDate >= todayDate ? s.dueDate - todayDate : 30 - (todayDate - s.dueDate)
      const isDueSoon = s.isActive && daysUntilDue <= s.reminderDaysBefore

      return {
        ...s,
        category: s.categoryId ? catMap.get(s.categoryId) || null : null,
        wallet: s.walletId ? walMap.get(s.walletId) || null : null,
        daysUntilDue,
        isDueSoon,
      }
    })

    const totalActiveMonthly = enriched
      .filter((s) => s.isActive)
      .reduce((sum, s) => {
        if (s.billingCycle === 'yearly') return sum + Math.round(s.amount / 12)
        if (s.billingCycle === 'weekly') return sum + s.amount * 4
        return sum + s.amount
      }, 0)

    return apiSuccess(
      {
        totalActiveMonthly,
        totalCount: subs.length,
        dueSoonCount: enriched.filter((s) => s.isDueSoon).length,
        subscriptions: enriched,
      },
      'Daftar langganan & tagihan rutin berhasil dimuat'
    )
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal memuat langganan & tagihan', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTahap2Tables()
    const user = await getAuthUser(req)
    const body = await req.json()

    const { name, amount, billingCycle, dueDate, categoryId, walletId, reminderDaysBefore } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return apiError('Nama tagihan / langganan wajib diisi', 422)
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return apiError('Nominal tagihan harus berupa angka lebih dari 0', 422)
    }

    const due = dueDate ? Math.min(31, Math.max(1, Number(dueDate))) : 1

    const [created] = await db
      .insert(subscriptions)
      .values({
        userId: user.id,
        name: name.trim(),
        amount: Math.round(amount),
        billingCycle: billingCycle || 'monthly',
        dueDate: due,
        categoryId: categoryId ? Number(categoryId) : null,
        walletId: walletId ? Number(walletId) : null,
        reminderDaysBefore: reminderDaysBefore ? Number(reminderDaysBefore) : 3,
        isActive: true,
      })
      .returning()

    return apiSuccess(created, 'Tagihan rutin berhasil dibuat', 201)
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    return apiError(err?.message || 'Gagal membuat tagihan rutin', 500)
  }
}
