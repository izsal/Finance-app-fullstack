import { NextRequest, NextResponse } from 'next/server'

export interface RateLimitOptions {
  limit: number // Maksimum jumlah request yang diizinkan dalam window
  windowMs: number // Jangka waktu dalam milidetik (misal 60000 = 1 menit)
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetInSeconds: number
}

// In-memory store: Map<key, timestamp[]>
const rateLimitStore = new Map<string, number[]>()

// Bersihkan cache lama secara periodik (setiap 5 menit) untuk mencegah kebocoran memori
if (typeof globalThis !== 'undefined') {
  const CLEANUP_INTERVAL = 5 * 60 * 1000
  if (!(globalThis as any).__rateLimitCleanerStarted) {
    ;(globalThis as any).__rateLimitCleanerStarted = true
    setInterval(() => {
      const now = Date.now()
      for (const [key, timestamps] of rateLimitStore.entries()) {
        const filtered = timestamps.filter((t) => now - t < 10 * 60 * 1000)
        if (filtered.length === 0) {
          rateLimitStore.delete(key)
        } else {
          rateLimitStore.set(key, filtered)
        }
      }
    }, CLEANUP_INTERVAL).unref?.()
  }
}

/**
 * Ekstrak Client IP dari request headers
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    '127.0.0.1'
  )
}

/**
 * Cek apakah request masih dalam batas rate limit menggunakan Sliding Window Log
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const { limit, windowMs } = options
  const windowStart = now - windowMs

  const timestamps = rateLimitStore.get(key) || []
  // Ambil hanya timestamp yang masih berada dalam window aktif
  const validTimestamps = timestamps.filter((t) => t > windowStart)

  if (validTimestamps.length >= limit) {
    const oldest = validTimestamps[0]
    const resetInSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000))

    rateLimitStore.set(key, validTimestamps)
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetInSeconds,
    }
  }

  validTimestamps.push(now)
  rateLimitStore.set(key, validTimestamps)

  const oldest = validTimestamps[0]
  const resetInSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000))

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - validTimestamps.length),
    resetInSeconds,
  }
}

/**
 * Konfigurasi preset default untuk berbagai jenis aksi
 */
export const RATE_LIMITS = {
  // Upload & scan struk AI: 5 request per 60 detik (mencegah abuse AI Gemini & traffic data besar)
  SCAN_RECEIPT: { limit: 5, windowMs: 60 * 1000 },
  // Autentikasi (login / register): 10 request per 60 detik (mencegah brute-force password)
  AUTH: { limit: 10, windowMs: 60 * 1000 },
  // Endpoint API umum: 60 request per 60 detik
  GENERAL_API: { limit: 60, windowMs: 60 * 1000 },
} as const

/**
 * Buat respon 429 Too Many Requests standar dengan header HTTP yang lengkap
 */
export function rateLimitResponse(
  result: RateLimitResult,
  customMessage?: string
): NextResponse {
  const message =
    customMessage ||
    `Terlalu banyak permintaan. Harap tunggu ${result.resetInSeconds} detik sebelum mencoba lagi.`

  const res = NextResponse.json(
    {
      success: false,
      message,
      error: 'RATE_LIMIT_EXCEEDED',
      retryAfter: result.resetInSeconds,
      timestamp: new Date().toISOString(),
    },
    { status: 429 }
  )

  res.headers.set('Retry-After', String(result.resetInSeconds))
  res.headers.set('X-RateLimit-Limit', String(result.limit))
  res.headers.set('X-RateLimit-Remaining', String(result.remaining))
  res.headers.set('X-RateLimit-Reset', String(result.resetInSeconds))

  return res
}

/**
 * Sematkan header rate-limit pada NextResponse yang sukses
 */
export function applyRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(result.limit))
  response.headers.set('X-RateLimit-Remaining', String(result.remaining))
  response.headers.set('X-RateLimit-Reset', String(result.resetInSeconds))
  return response
}
