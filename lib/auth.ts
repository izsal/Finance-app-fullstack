import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

const origin = (value?: string) => value ? (value.startsWith('http') ? value : `https://${value}`) : undefined
const defaultBaseUrl = process.env.NODE_ENV === 'production' ? 'https://www.qwarts.my.id' : 'http://localhost:3000'
const baseURL = process.env.BETTER_AUTH_URL || origin(process.env.VERCEL_PROJECT_PRODUCTION_URL) || origin(process.env.VERCEL_URL) || process.env.V0_RUNTIME_URL || defaultBaseUrl
const trustedOrigins = [
  'http://localhost:3000',
  'https://qwarts.my.id',
  'https://www.qwarts.my.id',
  origin(process.env.BETTER_AUTH_URL),
  origin(process.env.VERCEL_URL),
  origin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
  process.env.V0_RUNTIME_URL,
  process.env.V0_DEV_APP_URL,
  process.env.V0_BUILD_URL,
  process.env.V0_SANDBOX_URL,
].filter(Boolean) as string[]

export const auth = betterAuth({
  baseURL,
  trustedOrigins,
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      const resendApiKey = process.env.RESEND_API_KEY?.trim()
      const rawEmailFrom = process.env.EMAIL_FROM || 'Dompetku <noreply@mail.qwarts.my.id>'
      // Hapus tanda petik ganda/tunggal yang mungkin terbawa dari .env atau Vercel
      const emailFrom = rawEmailFrom.replace(/^["']|["']$/g, '').trim()

      // Pastikan URL verifikasi selalu menggunakan domain yang benar (https://www.qwarts.my.id jika di production)
      let verifyUrl = url
      try {
        const parsed = new URL(url, baseURL)
        if (process.env.NODE_ENV === 'production' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
          parsed.protocol = 'https:'
          parsed.host = 'www.qwarts.my.id'
          parsed.port = ''
        }
        verifyUrl = parsed.toString()
      } catch {
        verifyUrl = `${baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
      }

      if (resendApiKey) {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: emailFrom,
              to: user.email,
              subject: 'Verifikasi Akun Dompetku Anda',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #0d9488; margin: 0; font-size: 24px;">Dompetku</h1>
                    <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Dashboard Keuangan Pribadi</p>
                  </div>
                  <h2 style="color: #0f172a; font-size: 18px;">Halo, ${user.name}!</h2>
                  <p style="color: #334155; font-size: 14px; line-height: 1.6;">
                    Terima kasih telah mendaftar di Dompetku. Untuk mengaktifkan akun Anda dan mulai mengelola keuangan dengan rapi, silakan klik tombol verifikasi di bawah ini:
                  </p>
                  <div style="text-align: center; margin: 28px 0;">
                    <a href="${verifyUrl}" style="background-color: #0d9488; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                      Verifikasi Email Saya
                    </a>
                  </div>
                  <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
                    Atau salin tautan berikut ke browser Anda:<br />
                    <a href="${verifyUrl}" style="color: #0d9488; word-break: break-all;">${verifyUrl}</a>
                  </p>
                  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                  <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
                    Jika Anda tidak pernah mendaftar di Dompetku, abaikan email ini.
                  </p>
                </div>
              `,
            }),
          })

          if (!res.ok) {
            const errText = await res.text()
            console.error('[Resend Email Error]:', res.status, errText)
            throw new Error(`Gagal mengirim email via Resend (${res.status}): ${errText}`)
          } else {
            const resData = await res.json()
            console.log('[Resend Email Sent Successfully]:', resData)
          }
        } catch (err) {
          console.error('Exception sending verification email:', err)
          throw err
        }
      } else {
        console.warn('[Resend Warning]: RESEND_API_KEY tidak ditemukan di environment variables!')
        console.log(`\n========================================\n[DOMPETKU EMAIL VERIFICATION]\nTo: ${user.email}\nVerify URL: ${url}\n========================================\n`)
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  baseURL,
  trustedOrigins,
  ...(process.env.NODE_ENV === 'development' ? { advanced: { defaultCookieAttributes: { sameSite: 'none' as const, secure: true } } } : {}),
})
