import dns from 'node:dns'
import { betterAuth } from 'better-auth'
import { pool } from './db'

try {
  dns.setDefaultResultOrder('ipv4first')
} catch {}

const origin = (value?: string) => value ? (value.startsWith('http') ? value : `https://${value}`) : undefined
const baseURL = process.env.BETTER_AUTH_URL || origin(process.env.VERCEL_PROJECT_PRODUCTION_URL) || origin(process.env.VERCEL_URL) || process.env.V0_RUNTIME_URL || 'http://localhost:3000'
const trustedOrigins = [
  'http://localhost:3000',
  ...(process.env.NODE_ENV === 'development'
    ? [
      'https://personal-finance-dashboard-3.v0.build',
      process.env.V0_RUNTIME_URL,
      process.env.V0_DEV_APP_URL,
      process.env.V0_BUILD_URL,
      process.env.V0_SANDBOX_URL,
    ]
    : []),
  ...(process.env.NODE_ENV === 'production'
    ? [origin(process.env.VERCEL_URL), origin(process.env.VERCEL_PROJECT_PRODUCTION_URL)]
    : []),
].filter(Boolean) as string[]

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET || 'personal_finance_better_auth_secret_dev_key_2026',
  emailAndPassword: { enabled: true },
  baseURL,
  trustedOrigins,
  ...(process.env.V0_RUNTIME_URL ? { advanced: { defaultCookieAttributes: { sameSite: 'none' as const, secure: true } } } : {}),
})