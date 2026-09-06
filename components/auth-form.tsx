'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { AlertCircle, ArrowRight, Loader2, Lock, Mail, User, Wallet } from 'lucide-react'

function GoogleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
        fill="#34A853"
      />
      <path
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const signup = mode === 'sign-up'
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setError('')
    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      })
      if (result?.error) {
        console.error('Google Sign In Error:', result.error)
        const isMissingConfig =
          result.error.message?.includes('Client Id') ||
          result.error.message?.includes('CLIENT_ID') ||
          result.error.status === 400 ||
          result.error.status === 500

        if (isMissingConfig) {
          setError(
            'Google OAuth belum aktif: Pastikan GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, dan BETTER_AUTH_SECRET sudah diisi di Environment Variables Vercel, lalu lakukan Redeploy.'
          )
        } else {
          setError(result.error.message || 'Gagal masuk dengan akun Google.')
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat menghubungkan ke akun Google.')
    } finally {
      setGoogleLoading(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = signup
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password })

      if (result.error) {
        setError(
          result.error.message ||
            (signup
              ? 'Gagal mendaftar. Pastikan email belum terdaftar.'
              : 'Email atau kata sandi tidak sesuai.')
        )
        return
      }
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat memproses permintaan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-100 p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-9 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
          {/* Header */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/20">
              <Wallet className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Dompetku</p>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {signup ? 'Buat Akun Baru' : 'Selamat Datang Kembali'}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {signup
                ? 'Mulai atur cashflow, budget, dan impian finansialmu.'
                : 'Masuk untuk mengelola dan memantau keuanganmu.'}
            </p>
          </div>

          {/* Google OAuth Button */}
          <div className="mb-6">
            <button
              type="button"
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="relative flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
              ) : (
                <GoogleIcon className="h-5 w-5" />
              )}
              <span>{signup ? 'Daftar dengan Google' : 'Lanjutkan dengan Google'}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-xs font-medium text-slate-400">
              atau lanjutkan dengan email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            {signup && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Nama Lengkap
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    id="name-input"
                    type="text"
                    placeholder="Nama Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Email
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email-input"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Kata Sandi
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password-input"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-700 leading-relaxed"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="submit-auth-btn"
              type="submit"
              disabled={loading || googleLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3 text-sm font-bold text-white shadow-md shadow-teal-700/20 transition hover:bg-teal-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>{signup ? 'Daftar Sekarang' : 'Masuk ke Dashboard'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p className="mt-6 text-center text-xs sm:text-sm text-slate-500">
            {signup ? 'Sudah punya akun? ' : 'Belum punya akun? '}
            <Link
              id="switch-auth-mode-link"
              className="font-bold text-teal-700 hover:text-teal-800 hover:underline"
              href={signup ? '/sign-in' : '/sign-up'}
            >
              {signup ? 'Masuk sekarang' : 'Daftar gratis'}
            </Link>
          </p>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Data keuangan Anda aman, terenkripsi, dan terisolasi secara privat.
        </p>
      </div>
    </main>
  )
}
