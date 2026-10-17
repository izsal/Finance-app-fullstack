import crypto from 'crypto'

export interface DuitkuConfig {
  apiKey: string
  merchantCode: string
  env: 'sandbox' | 'production'
  callbackUrl?: string
  returnUrl?: string
}

export interface CreateInvoiceParams {
  merchantOrderId: string
  amount: number
  productDetails: string
  email: string
  customerName?: string
  phoneNumber?: string
  paymentMethod?: string
  callbackUrl?: string
  returnUrl?: string
  expiryMinutes?: number
}

export interface DuitkuInvoiceResponse {
  success: boolean
  merchantCode?: string
  reference?: string
  paymentUrl?: string
  vaNumber?: string
  amount?: string
  statusCode?: string
  statusMessage?: string
  error?: string
}

export interface DuitkuCallbackData {
  merchantCode: string
  amount: string | number
  merchantOrderId: string
  signature: string
  resultCode: string
  reference?: string
  additionalParam?: string
}

export class DuitkuService {
  private static getConfig(): DuitkuConfig {
    return {
      apiKey: process.env.DUITKU_API_KEY || '',
      merchantCode: process.env.DUITKU_MERCHANT_CODE || '',
      env: (process.env.DUITKU_ENV as 'sandbox' | 'production') || 'sandbox',
      callbackUrl: process.env.DUITKU_CALLBACK_URL,
      returnUrl: process.env.DUITKU_RETURN_URL,
    }
  }

  private static getBaseUrl(env: 'sandbox' | 'production'): string {
    return env === 'production'
      ? 'https://passport.duitku.com/webapi/api/merchant'
      : 'https://sandbox.duitku.com/webapi/api/merchant'
  }

  /**
   * Generates MD5 signature for creating an invoice
   * Formula: md5(merchantCode + merchantOrderId + paymentAmount + apiKey)
   */
  public static generateInquirySignature(
    merchantCode: string,
    merchantOrderId: string,
    amount: number,
    apiKey: string
  ): string {
    const raw = `${merchantCode}${merchantOrderId}${amount}${apiKey}`
    return crypto.createHash('md5').update(raw).digest('hex')
  }

  /**
   * Generates / Verifies MD5 signature for incoming webhook callback
   * Formula: md5(merchantCode + amount + merchantOrderId + apiKey)
   */
  public static generateCallbackSignature(
    merchantCode: string,
    amount: string | number,
    merchantOrderId: string,
    apiKey: string
  ): string {
    const raw = `${merchantCode}${amount}${merchantOrderId}${apiKey}`
    return crypto.createHash('md5').update(raw).digest('hex')
  }

  /**
   * Generates MD5 signature for checking transaction status
   * Formula: md5(merchantCode + merchantOrderId + apiKey)
   */
  public static generateStatusSignature(
    merchantCode: string,
    merchantOrderId: string,
    apiKey: string
  ): string {
    const raw = `${merchantCode}${merchantOrderId}${apiKey}`
    return crypto.createHash('md5').update(raw).digest('hex')
  }

  /**
   * Get active payment methods available for the merchant
   */
  public static async getPaymentMethods(amount: number = 10000): Promise<Array<{
    paymentMethod: string
    paymentName: string
    paymentImage: string
    totalFee: string
  }>> {
    const config = this.getConfig()
    if (!config.merchantCode || !config.apiKey) return []

    const datetime = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const signature = crypto
      .createHash('sha256')
      .update(`${config.merchantCode}${amount}${datetime}${config.apiKey}`)
      .digest('hex')

    const endpoint = `${this.getBaseUrl(config.env)}/paymentmethod/getpaymentmethod`

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          merchantcode: config.merchantCode,
          amount,
          datetime,
          signature,
        }),
      })
      const data = await res.json().catch(() => null)
      if (data?.responseCode === '00' && Array.isArray(data?.paymentFee)) {
        return data.paymentFee
      }
      return []
    } catch {
      return []
    }
  }

  private static getPopBaseUrl(env: 'sandbox' | 'production'): string {
    return env === 'production'
      ? 'https://api-prod.duitku.com/api/merchant'
      : 'https://api-sandbox.duitku.com/api/merchant'
  }

  /**
   * Create an invoice through Duitku Hosted Checkout (POP API).
   * Generates a checkout URL where customers can choose ANY payment method
   * (QRIS, VA BCA, Mandiri, BRI, BNI, Permata, ShopeePay, etc.) directly on Duitku's official page.
   */
  public static async createInvoice(params: CreateInvoiceParams): Promise<DuitkuInvoiceResponse> {
    const config = this.getConfig()

    if (!config.apiKey) {
      return {
        success: false,
        error: 'DUITKU_API_KEY is not configured in environment variables.',
      }
    }

    if (!config.merchantCode) {
      return {
        success: false,
        error: 'DUITKU_MERCHANT_CODE belum diset. Silakan masukkan Kode Merchant dari Dashboard Duitku ke file .env.local',
      }
    }

    const host = process.env.BETTER_AUTH_URL || 'http://localhost:3000'
    const callbackUrl = params.callbackUrl || config.callbackUrl || `${host}/api/payment/duitku/callback`
    const returnUrl = params.returnUrl || config.returnUrl || `${host}?payment=finish&orderId=${encodeURIComponent(params.merchantOrderId)}`

    // Timestamp in milliseconds
    const timestamp = Date.now().toString()
    // Formula: HMAC_SHA256(merchantCode + timestamp, apiKey)
    const stringToSign = `${config.merchantCode}${timestamp}`
    const signature = crypto
      .createHmac('sha256', config.apiKey)
      .update(stringToSign)
      .digest('hex')

    const fullName = (params.customerName || 'Pengguna Qwarts').trim()
    const nameParts = fullName.split(/\s+/)
    const firstName = nameParts[0] || 'Pengguna'
    const lastName = nameParts.slice(1).join(' ') || firstName
    const phoneNumber = params.phoneNumber || '08123456789'

    const payload: any = {
      paymentAmount: params.amount,
      merchantOrderId: params.merchantOrderId,
      productDetails: params.productDetails,
      email: params.email,
      phoneNumber,
      customerVaName: fullName.slice(0, 20),
      callbackUrl,
      returnUrl,
      expiryPeriod: params.expiryMinutes || 1440, // 24 hours default
      customerDetail: {
        firstName,
        lastName,
        email: params.email,
        phoneNumber,
      },
      itemDetails: [
        {
          name: params.productDetails,
          price: params.amount,
          quantity: 1,
        },
      ],
    }

    // Optional: if a specific payment method is explicitly requested
    if (params.paymentMethod) {
      payload.paymentMethod = params.paymentMethod
    }

    const endpoint = `${this.getPopBaseUrl(config.env)}/createInvoice`

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-duitku-merchantcode': config.merchantCode,
          'x-duitku-timestamp': timestamp,
          'x-duitku-signature': signature,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (data.statusCode === '00' && data.paymentUrl) {
        return {
          success: true,
          merchantCode: data.merchantCode || config.merchantCode,
          reference: data.reference,
          paymentUrl: data.paymentUrl,
          vaNumber: data.vaNumber,
          amount: data.amount,
          statusCode: data.statusCode,
          statusMessage: data.statusMessage,
        }
      }

      return {
        success: false,
        statusCode: data.statusCode,
        statusMessage: data.statusMessage,
        error: data.statusMessage || `Duitku createInvoice failed with status ${data.statusCode || res.status}`,
      }
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to connect to Duitku API',
      }
    }
  }

  /**
   * Validate webhook signature received from Duitku
   */
  public static verifyCallback(data: DuitkuCallbackData): boolean {
    const config = this.getConfig()
    if (!config.apiKey || !config.merchantCode) return false
    if (!data.merchantCode || String(data.merchantCode) !== config.merchantCode) return false
    if (!data.signature) return false

    const expectedSignature = this.generateCallbackSignature(
      data.merchantCode,
      data.amount,
      data.merchantOrderId,
      config.apiKey
    )

    try {
      const sigA = Buffer.from(String(data.signature).toLowerCase(), 'utf-8')
      const sigB = Buffer.from(expectedSignature.toLowerCase(), 'utf-8')
      if (sigA.length !== sigB.length || sigA.length === 0) return false
      return crypto.timingSafeEqual(sigA, sigB)
    } catch {
      return false
    }
  }

  /**
   * Check transaction status on Duitku
   */
  public static async checkStatus(merchantOrderId: string): Promise<any> {
    const config = this.getConfig()
    if (!config.merchantCode || !config.apiKey) return null

    const signature = this.generateStatusSignature(config.merchantCode, merchantOrderId, config.apiKey)
    const endpoint = `${this.getBaseUrl(config.env)}/transactionStatus`

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantCode: config.merchantCode,
          merchantOrderId,
          signature,
        }),
      })
      return await res.json().catch(() => null)
    } catch {
      return null
    }
  }
}
