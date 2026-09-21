import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { DuitkuService } from '@/lib/duitku'
import { db } from '@/lib/db'
import { payments as paymentsTable } from '@/lib/schema'

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req)
    const body = await req.json().catch(() => ({}))

    const billingCycle = body.billingCycle === 'monthly' ? 'monthly' : 'yearly'
    const amount = billingCycle === 'yearly' ? 149000 : 19000
    const planName = billingCycle === 'yearly' ? 'Paket Tahunan (Hemat 35%)' : 'Paket Bulanan'
    const productDetails = `Qwarts Finance PRO - ${planName}`

    // Format Unique Merchant Order ID: QWARTS-{userId}-{timestamp}
    const sanitizedUserId = authUser.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)
    const merchantOrderId = `QW-${sanitizedUserId}-${Date.now()}`

    // Insert pending payment record
    try {
      await db.insert(paymentsTable).values({
        orderId: merchantOrderId,
        userId: authUser.id,
        amount,
        plan: 'pro',
        billingCycle,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } catch (dbErr: any) {
      console.error('Failed to create payment record in DB:', dbErr)
    }

    // Call Duitku API
    const invoiceRes = await DuitkuService.createInvoice({
      merchantOrderId,
      amount,
      productDetails,
      email: authUser.email,
      customerName: authUser.name || 'Pengguna Qwarts Finance',
      paymentMethod: body.paymentMethod || '', // blank opens all channels in Duitku
    })

    if (!invoiceRes.success || !invoiceRes.paymentUrl) {
      return apiError(
        invoiceRes.error || invoiceRes.statusMessage || 'Gagal membuat invoice Duitku',
        400,
        { statusCode: invoiceRes.statusCode }
      )
    }

    // Update payment record with paymentUrl & reference
    try {
      const { eq } = await import('drizzle-orm')
      await db
        .update(paymentsTable)
        .set({
          paymentUrl: invoiceRes.paymentUrl,
          reference: invoiceRes.reference,
          updatedAt: new Date(),
        })
        .where(eq(paymentsTable.orderId, merchantOrderId))
    } catch {}

    return apiSuccess(
      {
        orderId: merchantOrderId,
        paymentUrl: invoiceRes.paymentUrl,
        reference: invoiceRes.reference,
        amount,
        billingCycle,
      },
      'Invoice Duitku berhasil dibuat'
    )
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') {
      return apiError('Silakan login terlebih dahulu', 401)
    }
    return apiError(err?.message || 'Terjadi kesalahan sistem', 500)
  }
}
