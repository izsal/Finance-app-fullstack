import { NextRequest, NextResponse } from 'next/server'
import { DuitkuService } from '@/lib/duitku'
import { db } from '@/lib/db'
import { payments as paymentsTable, user as userTable } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    // Duitku can send both application/x-www-form-urlencoded or application/json
    const contentType = req.headers.get('content-type') || ''
    let data: any = {}

    const rawText = await req.text()
    if (contentType.includes('application/json')) {
      try {
        data = JSON.parse(rawText)
      } catch {
        data = {}
      }
    } else {
      const searchParams = new URLSearchParams(rawText)
      searchParams.forEach((val, key) => {
        data[key] = val
      })
    }

    const {
      merchantCode,
      amount,
      merchantOrderId,
      signature,
      resultCode,
      reference,
    } = data

    if (!merchantOrderId || !amount || !signature) {
      return new NextResponse('Bad Request: Missing parameters', { status: 400 })
    }

    // 1. Verify Duitku Signature
    const isValid = DuitkuService.verifyCallback({
      merchantCode: String(merchantCode || ''),
      amount: String(amount || ''),
      merchantOrderId: String(merchantOrderId || ''),
      signature: String(signature || ''),
      resultCode: String(resultCode || ''),
      reference: String(reference || ''),
    })

    if (!isValid) {
      console.error('Invalid Duitku Webhook Signature for order:', merchantOrderId)
      return new NextResponse('Bad Signature', { status: 400 })
    }

    // 2. Fetch Payment Record
    const existingPayments = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.orderId, String(merchantOrderId)))
      .limit(1)

    const paymentRecord = existingPayments[0]

    // 3. Process Payment Status
    if (resultCode === '00') {
      // SUCCESSFUL PAYMENT!
      console.log(`[Duitku Success] Order ${merchantOrderId} paid successfully!`)

      // Update payment status in database
      await db
        .update(paymentsTable)
        .set({
          status: 'SUCCESS',
          reference: reference || paymentRecord?.reference,
          updatedAt: new Date(),
        })
        .where(eq(paymentsTable.orderId, String(merchantOrderId)))

      // Upgrade user to PRO in database
      if (paymentRecord?.userId) {
        await db
          .update(userTable)
          .set({
            plan: 'pro',
            updatedAt: new Date(),
          })
          .where(eq(userTable.id, paymentRecord.userId))

        console.log(`[Duitku] User ${paymentRecord.userId} successfully upgraded to PRO!`)
      }
    } else {
      // Failed / Expired
      console.warn(`[Duitku Failed] Order ${merchantOrderId} with result code ${resultCode}`)
      await db
        .update(paymentsTable)
        .set({
          status: 'FAILED',
          updatedAt: new Date(),
        })
        .where(eq(paymentsTable.orderId, String(merchantOrderId)))
    }

    // Duitku expects 'OK' HTTP 200 response
    return new NextResponse('OK', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  } catch (err: any) {
    console.error('Duitku callback error:', err)
    return new NextResponse('Server Error', { status: 500 })
  }
}
