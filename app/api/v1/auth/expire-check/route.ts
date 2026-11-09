import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { user as userTable } from '@/lib/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /api/v1/auth/expire-check
 * Checks if a PRO user's subscription has expired and downgrades them if so.
 * Called on dashboard load to keep plan status accurate.
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req)

    const userRecord = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, authUser.id),
    })

    if (!userRecord) {
      return apiError('User not found', 404)
    }

    // Only run expiry check for PRO users
    if (userRecord.plan !== 'pro') {
      return apiSuccess({ plan: userRecord.plan, expired: false }, 'Plan status OK')
    }

    // If proExpiresAt is set and has passed, downgrade to free
    if (userRecord.proExpiresAt && new Date() > userRecord.proExpiresAt) {
      await db
        .update(userTable)
        .set({
          plan: 'free',
          proExpiresAt: null,
          updatedAt: new Date(),
        })
        .where(eq(userTable.id, authUser.id))

      console.log(`[expire-check] User ${authUser.id} PRO expired — downgraded to free`)

      return apiSuccess(
        { plan: 'free', expired: true, expiredAt: userRecord.proExpiresAt },
        'Masa berlaku PRO Anda telah habis. Akun dialihkan ke paket Starter.'
      )
    }

    return apiSuccess(
      {
        plan: 'pro',
        expired: false,
        expiresAt: userRecord.proExpiresAt,
        daysLeft: userRecord.proExpiresAt
          ? Math.ceil((userRecord.proExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
      },
      'Paket PRO masih aktif'
    )
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized', 401)
    }
    return apiError(err?.message || 'Gagal memeriksa status langganan', 500)
  }
}
