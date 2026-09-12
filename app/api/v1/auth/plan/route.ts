import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { user as userTable } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req)
    const isPro = authUser.plan === 'pro'

    return apiSuccess(
      {
        plan: authUser.plan || 'free',
        isPro,
        benefits: {
          maxWallets: isPro ? 'unlimited' : 2,
          hasGoals: isPro,
          hasSubscriptions: isPro,
          hasAnalytics: isPro,
          exportData: isPro,
        },
      },
      'Status paket berhasil diambil'
    )
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized', 401)
    }
    return apiError(err?.message || 'Gagal memproses permintaan', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req)
    const body = await req.json().catch(() => ({}))
    const targetPlan = body.plan === 'pro' ? 'pro' : 'free'

    await db
      .update(userTable)
      .set({
        plan: targetPlan,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, authUser.id))

    return apiSuccess(
      {
        plan: targetPlan,
        isPro: targetPlan === 'pro',
      },
      targetPlan === 'pro'
        ? 'Selamat! Akun Anda berhasil ditingkatkan ke Dompetku PRO 👑'
        : 'Status akun dialihkan ke paket Free'
    )
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized', 401)
    }
    return apiError(err?.message || 'Gagal mengubah status paket', 500)
  }
}
