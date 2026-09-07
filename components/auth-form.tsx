'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react'

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
  const [verificationSent, setVerificationSent] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [resendSuccess, setResendSuccess] = useState('')
  const [isVerifiedNotice, setIsVerifiedNotice] = useState(false)
  const [isEmailUnverified, setIsEmailUnverified] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('verified') === 'true') {
        setIsVerifiedNotice(true)
      }
    }
  }, [])

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

  async function handleResendVerification() {
    if (!email) {
      setError('Masukkan email Anda untuk mengirim ulang verifikasi.')
      return
    }
    setResendingEmail(true)
    setError('')
    setResendSuccess('')
    try {
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: '/sign-in?verified=true',
      })
      if (result?.error) {
        setError(result.error.message || 'Gagal mengirim ulang email verifikasi.')
      } else {
        setResendSuccess('Tautan verifikasi baru berhasil dikirim ke email Anda.')
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat mengirim verifikasi.')
    } finally {
      setResendingEmail(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResendSuccess('')
    setIsEmailUnverified(false)

    try {
      if (signup) {
        const result = await authClient.signUp.email({
          name,
          email,
          password,
          callbackURL: '/sign-in?verified=true',
        })

        if (result.error) {
          setError(result.error.message || 'Gagal mendaftar. Pastikan email belum terdaftar.')
          return
        }

        // Tampilkan layar konfirmasi verifikasi email
        setVerificationSent(true)
      } else {
        const result = await authClient.signIn.email({
          email,
          password,
          callbackURL: '/',
        })

        if (result.error) {
          const msg = result.error.message || ''
          const isNotVerified =
            msg.toLowerCase().includes('verify') ||
            msg.toLowerCase().includes('verification') ||
            (result.error as any).code === 'EMAIL_NOT_VERIFIED'

          if (isNotVerified) {
            setIsEmailUnverified(true)
            setError(
              'Email Anda belum diverifikasi. Silakan periksa inbox/spam Anda untuk mengonfirmasi akun.'
            )
          } else {
            setError(msg || 'Email atau kata sandi tidak sesuai.')
          }
          return
        }

        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat memproses permintaan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 p-4 sm:p-6 text-slate-100 selection:bg-teal-500 selection:text-white">
      {/* Background Animated Gradient Mesh */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-teal-500/25 via-emerald-500/15 to-transparent blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[550px] w-[550px] rounded-full bg-gradient-to-tl from-cyan-500/20 via-teal-600/15 to-transparent blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[100px]" />
        {/* Subtle dot matrix grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Floating Micro Finance Cards (Visible on Desktop) */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block overflow-hidden">
        {/* Top-Left Floating Badge */}
        <div className="absolute top-[18%] left-[10%] animate-pulse duration-1000">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl shadow-teal-950/40 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Arus Kas Positif
                </p>
                <p className="text-sm font-bold text-white">+Rp 8.450.000 / bln</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-Right Floating Badge */}
        <div className="absolute bottom-[20%] right-[10%]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl shadow-teal-950/40 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Target Dana Darurat
                  </p>
                  <span className="text-[11px] font-bold text-emerald-400">85%</span>
                </div>
                <div className="mt-2 w-36 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 w-[85%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md my-8">
        {/* Back to Home Link */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-medium text-teal-400">
            <ShieldCheck className="h-3 w-3" />
            <span>Enkripsi 256-bit</span>
          </span>
        </div>

        {/* Glassmorphic Auth Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900/80 p-7 sm:p-9 shadow-2xl shadow-slate-950/80 backdrop-blur-2xl">
          {/* Header */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25">
              <Wallet className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-400">Dompetku</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {signup ? 'Mulai Gratis Sekarang' : 'Selamat Datang Kembali'}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              {signup
                ? 'Kelola cashflow, budget, dan impian finansialmu dengan rapi.'
                : 'Masuk untuk memantau saldo dan transaksi keuanganmu.'}
            </p>
          </div>

          {/* Success notice if redirected after email verification */}
          {isVerifiedNotice && (
            <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs text-emerald-300 leading-relaxed">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <div>
                <p className="font-bold text-white">Email Berhasil Diverifikasi!</p>
                <p className="mt-0.5">Akun Anda telah aktif. Silakan masuk dengan email dan kata sandi Anda.</p>
              </div>
            </div>
          )}

          {/* Verification Sent State (When user just signed up) */}
          {verificationSent ? (
            <div className="space-y-5 text-center py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30">
                <Mail className="h-7 w-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Periksa Email Anda</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Kami telah mengirimkan tautan verifikasi ke email:
                </p>
                <p className="mt-1 font-bold text-teal-400 text-sm">{email}</p>
                <p className="mt-2 text-xs text-slate-400">
                  Silakan buka inbox atau folder spam email Anda, lalu klik tautan untuk mengaktifkan akun.
                </p>
              </div>

              {resendSuccess && (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-950/50 p-2.5 text-xs text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{resendSuccess}</span>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-rose-950/50 p-2.5 text-xs text-rose-300 border border-rose-500/30">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
                >
                  {resendingEmail ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Kirim Ulang Email Verifikasi</span>
                </button>

                <Link
                  href="/sign-in"
                  className="block text-xs font-bold text-teal-400 hover:underline"
                >
                  Sudah verifikasi? Masuk sekarang
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Google OAuth Button */}
              <div className="mb-6">
                <button
                  type="button"
                  id="google-signin-btn"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                  className="relative flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-800/80 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 hover:border-slate-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {googleLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-teal-400" />
                  ) : (
                    <GoogleIcon className="h-5 w-5" />
                  )}
                  <span>{signup ? 'Daftar dengan Google' : 'Lanjutkan dengan Google'}</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <span className="relative bg-slate-900/90 px-3 text-xs font-medium text-slate-500">
                  atau lanjutkan dengan email
                </span>
              </div>

              {/* Form */}
              <form onSubmit={submit} className="space-y-4">
                {signup && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Nama Lengkap
                    </label>
                    <div className="relative mt-1.5">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        id="name-input"
                        type="text"
                        placeholder="Nama Lengkap Anda"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Email
                  </label>
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      id="email-input"
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Kata Sandi
                  </label>
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
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
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div
                    role="alert"
                    className="flex flex-col gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300 leading-relaxed"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                      <span>{error}</span>
                    </div>
                    {isEmailUnverified && (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendingEmail}
                        className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-teal-600/30 border border-teal-500/40 px-3 py-1.5 text-[11px] font-bold text-teal-300 hover:bg-teal-600/40 transition disabled:opacity-50"
                      >
                        {resendingEmail ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                        <span>Kirim Ulang Email Verifikasi</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Resend success in signin mode */}
                {resendSuccess && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-950/50 p-2.5 text-xs text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{resendSuccess}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  id="submit-auth-btn"
                  type="submit"
                  disabled={loading || googleLoading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:from-teal-400 hover:to-emerald-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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
              <p className="mt-6 text-center text-xs sm:text-sm text-slate-400">
                {signup ? 'Sudah punya akun? ' : 'Belum punya akun? '}
                <Link
                  id="switch-auth-mode-link"
                  className="font-bold text-teal-400 hover:text-teal-300 hover:underline"
                  href={signup ? '/sign-in' : '/sign-up'}
                >
                  {signup ? 'Masuk sekarang' : 'Daftar gratis'}
                </Link>
              </p>
            </>
          )}
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Data keuangan Anda aman, terenkripsi, dan terisolasi privat di qwarts.my.id.
        </p>
      </div>
    </main>
  )
}
