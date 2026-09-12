import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform, Linking } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import {
  AuthUser,
  emptySummary,
  GoalItem,
  SubscriptionItem,
  SummaryData,
  TransactionItem,
  WalletItem,
} from './mockData'

const DEFAULT_LOCAL_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000'
const STORAGE_KEY_BASE_URL = '@dompetku_api_base_url'
const STORAGE_KEY_AUTH_TOKEN = '@dompetku_auth_token'

export class ApiService {
  private static baseUrl: string = DEFAULT_LOCAL_URL
  private static token: string | null = null
  private static currentUser: AuthUser | null = null

  static async init() {
    try {
      const savedUrl = await AsyncStorage.getItem(STORAGE_KEY_BASE_URL)
      if (savedUrl) this.baseUrl = savedUrl

      const savedToken = await AsyncStorage.getItem(STORAGE_KEY_AUTH_TOKEN)
      if (savedToken) {
        this.token = savedToken
        await this.getMe()
      }
    } catch (e) {
      console.warn('Gagal memuat setting API:', e)
    }
  }

  static getBaseUrl(): string {
    return this.baseUrl
  }

  static async setBaseUrl(url: string) {
    this.baseUrl = url.trim().replace(/\/$/, '')
    await AsyncStorage.setItem(STORAGE_KEY_BASE_URL, this.baseUrl)
  }

  static getToken(): string | null {
    return this.token
  }

  static getCurrentUser(): AuthUser | null {
    return this.currentUser
  }

  static async setToken(token: string | null) {
    this.token = token
    if (token) {
      await AsyncStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token)
      await this.getMe()
    } else {
      this.currentUser = null
      await AsyncStorage.removeItem(STORAGE_KEY_AUTH_TOKEN)
    }
  }

  static async logout() {
    await this.setToken(null)
  }

  private static getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    return headers
  }

  static async testConnection(urlToTest?: string): Promise<{ ok: boolean; message: string; ms: number }> {
    const target = urlToTest || this.baseUrl
    const start = Date.now()
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 4000)

      const res = await fetch(`${target}/api/v1`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      clearTimeout(timer)
      const elapsed = Date.now() - start

      if (res.ok) {
        const data = await res.json()
        return {
          ok: true,
          message: data.name || 'API terhubung dengan baik!',
          ms: elapsed,
        }
      }
      return {
        ok: false,
        message: `Server merespon dengan status ${res.status}`,
        ms: elapsed,
      }
    } catch (err: any) {
      return {
        ok: false,
        message: err?.name === 'AbortError' ? 'Koneksi timeout (4s)' : (err?.message || 'Tidak dapat menghubungi server'),
        ms: Date.now() - start,
      }
    }
  }

  static async getMe(): Promise<AuthUser | null> {
    if (!this.token) return null
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/auth/me`, {
        headers: this.getHeaders(),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          this.currentUser = json.data
          return json.data
        }
      }
      if (res.status === 401) {
        await this.logout()
      }
    } catch (e) {
      console.warn('Gagal memverifikasi user profil:', e)
    }
    return null
  }

  static async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        await this.setToken(json.data.token)
        this.currentUser = json.data.user
        return {
          success: true,
          message: json.message || 'Login berhasil',
          user: json.data.user,
        }
      }
      return {
        success: false,
        message: json.message || 'Login gagal, periksa email & kata sandi',
      }
    } catch (e: any) {
      return {
        success: false,
        message: e?.message || 'Tidak dapat terhubung ke server backend',
      }
    }
  }

  static async register(name: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ name, email, password }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        await this.setToken(json.data.token)
        this.currentUser = json.data.user
        return {
          success: true,
          message: json.message || 'Registrasi akun berhasil',
          user: json.data.user,
        }
      }
      return {
        success: false,
        message: json.message || 'Registrasi gagal',
      }
    } catch (e: any) {
      return {
        success: false,
        message: e?.message || 'Tidak dapat terhubung ke server backend',
      }
    }
  }

  static async loginWithGoogle(): Promise<{ success: boolean; message?: string; token?: string }> {
    const callbackUrl = `${this.baseUrl}/api/v1/auth/mobile-callback`
    const authUrl = `${this.baseUrl}/api/auth/sign-in/social?provider=google&callbackURL=${encodeURIComponent(callbackUrl)}`

    try {
      if (Platform.OS === 'web') {
        window.location.href = authUrl
        return { success: true }
      }

      // Di iOS / Android gunakan WebBrowser session
      const result = await WebBrowser.openAuthSessionAsync(authUrl, 'dompetku://')
      if (result.type === 'success' && result.url) {
        const parsed = new URL(result.url)
        const token = parsed.searchParams.get('token')
        if (token) {
          await this.setToken(token)
          return { success: true, token }
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        return { success: false, message: 'Login Google dibatalkan' }
      }
      return { success: false, message: 'Gagal mendapatkan token Google' }
    } catch (err: any) {
      // Fallback: Buka browser biasa
      await Linking.openURL(authUrl)
      return { success: false, message: 'Membuka Google Sign-In di browser...' }
    }
  }

  static async getSummary(): Promise<SummaryData> {
    if (!this.token) {
      throw new Error('UNAUTHORIZED')
    }

    const res = await fetch(`${this.baseUrl}/api/v1/summary`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (res.status === 401) {
      await this.logout()
      throw new Error('UNAUTHORIZED')
    }

    const json = await res.json()
    if (res.ok && json.success && json.data) {
      return json.data
    }

    throw new Error(json.message || 'Gagal memuat ringkasan data finansial')
  }

  static async getWallets(): Promise<WalletItem[]> {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/wallets`, {
      headers: this.getHeaders(),
    })
    if (res.status === 401) {
      await this.logout()
      throw new Error('UNAUTHORIZED')
    }
    const json = await res.json()
    if (res.ok && json.success && Array.isArray(json.data)) {
      return json.data
    }
    return []
  }

  static async transferBetweenWallets(
    fromWalletId: number,
    toWalletId: number,
    amount: number,
    description: string
  ): Promise<{ success: boolean; message: string }> {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/wallets/transfer`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        fromWalletId,
        toWalletId,
        amount,
        description,
        date: new Date().toISOString().split('T')[0],
      }),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      return { success: true, message: json.message || 'Transfer berhasil!' }
    }
    return { success: false, message: json.message || 'Gagal melakukan transfer' }
  }

  static async addTransaction(tx: {
    walletId: number
    categoryId: number
    type: 'income' | 'expense'
    amount: number
    description: string
    date: string
  }): Promise<{ success: boolean; message: string }> {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/transactions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(tx),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      return { success: true, message: 'Transaksi berhasil disimpan ke database!' }
    }
    return { success: false, message: json.message || 'Gagal menyimpan transaksi' }
  }

  static async updateTransaction(
    id: number,
    tx: Partial<{
      walletId: number
      categoryId: number
      type: 'income' | 'expense'
      amount: number
      description: string
      date: string
    }>
  ): Promise<{ success: boolean; message: string }> {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/transactions/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(tx),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      return { success: true, message: 'Transaksi berhasil diperbarui' }
    }
    return { success: false, message: json.message || 'Gagal memperbarui transaksi' }
  }

  static async deleteTransaction(id: number): Promise<{ success: boolean; message: string }> {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/transactions/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      return { success: true, message: 'Transaksi berhasil dihapus' }
    }
    return { success: false, message: json.message || 'Gagal menghapus transaksi' }
  }

  static async addWallet(data: {
    name: string
    type: string
    balance: number
    color?: string
  }): Promise<{ success: boolean; message: string }> {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/wallets`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      return { success: true, message: 'Rekening dompet berhasil ditambahkan!' }
    }
    return { success: false, message: json.message || 'Gagal menambahkan dompet' }
  }

  static async updateWallet(
    id: number,
    data: {
      name?: string
      type?: string
      balance?: number
      color?: string
    }
  ): Promise<{ success: boolean; message: string }> {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/wallets/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      return { success: true, message: 'Rekening dompet berhasil diperbarui!' }
    }
    return { success: false, message: json.message || 'Gagal memperbarui dompet' }
  }

  static async deleteWallet(id: number): Promise<{ success: boolean; message: string }> {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/wallets/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      return { success: true, message: 'Rekening dompet berhasil dihapus!' }
    }
    return { success: false, message: json.message || 'Gagal menghapus dompet' }
  }

  static async getCategories(type?: 'income' | 'expense'): Promise<any[]> {
    if (!this.token) return []
    try {
      const url = type ? `${this.baseUrl}/api/v1/categories?type=${type}` : `${this.baseUrl}/api/v1/categories`
      const res = await fetch(url, { headers: this.getHeaders() })
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) return json.data
      }
    } catch (e) {}
    return []
  }

  static async addCategory(data: {
    name: string
    type: 'income' | 'expense'
    color?: string
  }): Promise<{ success: boolean; message: string }> {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/categories`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      return { success: true, message: 'Kategori berhasil ditambahkan!' }
    }
    return { success: false, message: json.message || 'Gagal menambahkan kategori' }
  }

  static async updateCategory(
    id: number,
    data: {
      name?: string
      type?: 'income' | 'expense'
      color?: string
    }
  ): Promise<{ success: boolean; message: string }> {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/categories/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      return { success: true, message: 'Kategori berhasil diperbarui!' }
    }
    return { success: false, message: json.message || 'Gagal memperbarui kategori' }
  }

  static async deleteCategory(id: number): Promise<{ success: boolean; message: string }> {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/categories/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      return { success: true, message: 'Kategori berhasil dihapus!' }
    }
    return { success: false, message: json.message || 'Gagal menghapus kategori' }
  }

  static async getGoals(): Promise<GoalItem[]> {
    if (!this.token) return []
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/goals`, {
        headers: this.getHeaders(),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          if (Array.isArray(json.data)) {
            return json.data
          }
          if (json.data && Array.isArray(json.data.goals)) {
            return json.data.goals
          }
        }
      }
    } catch (e) {
      console.error('Error fetching goals:', e)
    }
    return []
  }

  static async addGoal(data: {
    name: string
    targetAmount: number
    targetDate: string
    color?: string
  }): Promise<{ success: boolean; message: string }> {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/goals`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      return { success: true, message: 'Target impian berhasil ditambahkan!' }
    }
    return { success: false, message: json.message || 'Gagal menambahkan target' }
  }

  static async updateGoal(
    id: number,
    data: {
      name?: string
      targetAmount?: number
      targetDate?: string
      color?: string
    }
  ): Promise<{ success: boolean; message: string }> {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/goals/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      return { success: true, message: 'Target impian berhasil diperbarui!' }
    }
    return { success: false, message: json.message || 'Gagal memperbarui target' }
  }

  static async deleteGoal(id: number): Promise<{ success: boolean; message: string }> {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/goals/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      return { success: true, message: 'Target impian berhasil dihapus!' }
    }
    return { success: false, message: json.message || 'Gagal menghapus target' }
  }

  static async depositToGoal(goalId: number, amount: number, walletId: number) {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/goals/${goalId}/deposit`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ amount, walletId }),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      return { success: true, message: 'Setoran tabungan berhasil disimpan!' }
    }
    return { success: false, message: json.message || 'Gagal mencatat setoran' }
  }

  static async getSubscriptions(): Promise<SubscriptionItem[]> {
    if (!this.token) return []
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/subscriptions`, {
        headers: this.getHeaders(),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          if (Array.isArray(json.data)) {
            return json.data
          }
          if (json.data && Array.isArray(json.data.subscriptions)) {
            return json.data.subscriptions
          }
        }
      }
    } catch (e) {
      console.error('Error fetching subscriptions:', e)
    }
    return []
  }

  static async addSubscription(data: {
    name: string
    amount: number
    dueDate: number
    walletId: number
    billingCycle?: string
    reminderDaysBefore?: number
  }): Promise<{ success: boolean; message: string }> {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/subscriptions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      return { success: true, message: 'Tagihan rutin berhasil ditambahkan!' }
    }
    return { success: false, message: json.message || 'Gagal menambahkan tagihan' }
  }

  static async updateSubscription(
    id: number,
    data: {
      name?: string
      amount?: number
      dueDate?: number
      walletId?: number
      billingCycle?: string
      reminderDaysBefore?: number
    }
  ): Promise<{ success: boolean; message: string }> {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/subscriptions/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      return { success: true, message: 'Tagihan rutin berhasil diperbarui!' }
    }
    return { success: false, message: json.message || 'Gagal memperbarui tagihan' }
  }

  static async deleteSubscription(id: number): Promise<{ success: boolean; message: string }> {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/subscriptions/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      return { success: true, message: 'Tagihan rutin berhasil dihapus!' }
    }
    return { success: false, message: json.message || 'Gagal menghapus tagihan' }
  }

  static async paySubscription(id: number, walletId: number) {
    if (!this.token) throw new Error('UNAUTHORIZED')

    const res = await fetch(`${this.baseUrl}/api/v1/subscriptions/${id}/pay`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ walletId }),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      return { success: true, message: 'Tagihan berhasil dibayar!' }
    }
    return { success: false, message: json.message || 'Gagal memproses pembayaran tagihan' }
  }

  static isPro(): boolean {
    return this.currentUser?.plan === 'pro'
  }

  static async updatePlan(targetPlan: 'free' | 'pro'): Promise<{ success: boolean; message: string; isPro: boolean }> {
    if (!this.token) throw new Error('UNAUTHORIZED')
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/auth/plan`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ plan: targetPlan }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        if (this.currentUser) {
          this.currentUser.plan = targetPlan
        }
        return { success: true, message: json.message, isPro: targetPlan === 'pro' }
      }
      return { success: false, message: json.message || 'Gagal memperbarui status paket', isPro: false }
    } catch (e: any) {
      return { success: false, message: e?.message || 'Koneksi error', isPro: false }
    }
  }

  static async scanReceipt(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<{
    success: boolean
    data?: {
      type: 'expense' | 'income'
      amount: number
      description: string
      categoryName: string
      categoryId?: number | null
      date: string
      rawSummary?: string
      confidence: number
    }
    message?: string
  }> {
    if (!this.token) throw new Error('UNAUTHORIZED')
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/scan-receipt`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ imageBase64, mimeType }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        return { success: true, data: json.data, message: json.message }
      }
      return { success: false, message: json.message || 'Gagal menganalisis struk' }
    } catch (e: any) {
      return { success: false, message: e?.message || 'Gagal terhubung ke scanner AI' }
    }
  }

  static formatRupiah(val: number): string {
    return 'Rp ' + Math.round(val || 0).toLocaleString('id-ID')
  }
}
