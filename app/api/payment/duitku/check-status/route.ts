import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { payments as paymentsTable } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req)
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return apiError('Missing orderId parameter', 400)
    }

    const found = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.orderId, orderId))
      .limit(1)

    if (found.length === 0) {
      return apiError('Order not found', 404)
    }

    const payment = found[0]

    return apiSuccess({
      orderId: payment.orderId,
      status: payment.status,
      plan: payment.plan,
      isSuccess: payment.status === 'SUCCESS',
      isPro: authUser.plan === 'pro' || payment.status === 'SUCCESS',
    })
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized', 401)
    }
    return apiError(err?.message || 'Failed to check status', 500)
  }
}
