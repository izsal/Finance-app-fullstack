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
      apiKey: process.env.DUITKU_API_KEY || '4b84b483634ac5100f39bc8bb5d96c14',
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
   * Create an invoice through Duitku v2 Inquiry API
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

    const signature = this.generateInquirySignature(
      config.merchantCode,
      params.merchantOrderId,
      params.amount,
      config.apiKey
    )

    const payload = {
      merchantCode: config.merchantCode,
      paymentAmount: params.amount,
      paymentMethod: params.paymentMethod || 'SP', // Default to QRIS (All E-Wallets & Mobile Banking)
      merchantOrderId: params.merchantOrderId,
      productDetails: params.productDetails,
      email: params.email,
      customerVaName: params.customerName || 'Customer',
      phoneNumber: params.phoneNumber || '',
      callbackUrl,
      returnUrl,
      signature,
      expiryPeriod: params.expiryMinutes || 1440, // 24 hours default
    }

    const endpoint = `${this.getBaseUrl(config.env)}/v2/inquiry`

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (data.statusCode === '00' && data.paymentUrl) {
        return {
          success: true,
          merchantCode: data.merchantCode,
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
        error: data.statusMessage || `Duitku inquiry failed with status ${data.statusCode || res.status}`,
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
    if (!config.apiKey) return false

    const expectedSignature = this.generateCallbackSignature(
      data.merchantCode,
      data.amount,
      data.merchantOrderId,
      config.apiKey
    )

    return expectedSignature.toLowerCase() === (data.signature || '').toLowerCase()
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
