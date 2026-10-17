import { NextRequest } from 'next/server'
import { apiSuccess } from '@/lib/api-auth'
import { DuitkuService } from '@/lib/duitku'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const amountParam = searchParams.get('amount')
    const amount = amountParam ? parseInt(amountParam, 10) : 19000

    const methods = await DuitkuService.getPaymentMethods(amount)

    // Curated categorization with user-friendly names and icons
    const enhanced = methods.map((m) => {
      let category = 'va'
      let shortName = m.paymentName

      if (m.paymentMethod === 'SP' || m.paymentMethod === 'NQ' || m.paymentMethod === 'LQ') {
        category = 'qris'
        shortName = 'QRIS (Semua E-Wallet & Mobile Banking)'
      } else if (m.paymentMethod === 'VC' || m.paymentMethod === 'CC') {
        category = 'card'
        shortName = 'Kartu Kredit / Debit Visa & Mastercard'
      } else if (m.paymentMethod === 'FT') {
        category = 'retail'
        shortName = 'Retail (Indomaret / Alfamart)'
      } else {
        category = 'va'
        shortName = m.paymentName.replace(' H2H', '').replace(' VA', '') + ' Virtual Account'
      }

      return {
        code: m.paymentMethod,
        name: shortName,
        originalName: m.paymentName,
        category,
        image: m.paymentImage,
        fee: m.totalFee || '0',
      }
    })

    return apiSuccess(enhanced, 'Daftar metode pembayaran berhasil diambil')
  } catch (err: any) {
    return apiSuccess([], 'Gagal mengambil metode pembayaran')
  }
}
