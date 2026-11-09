'use client'

import React, { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from 'lucide-react'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Token pemulihan kata sandi tidak ditemukan atau sudah kedaluwarsa.')
      return
    }

    if (password.length < 8) {
      setError('Kata sandi baru minimal 8 karakter.')
      return
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok dengan kata sandi baru.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const errorMsg = data?.message || ''
        if (
          errorMsg.includes('INVALID_TOKEN') ||
          errorMsg.toLowerCase().includes('token') ||
          res.status === 400
        ) {
          setError(
            'Tautan reset kata sandi tidak valid atau telah kedaluwarsa. Silakan ajukan permohonan reset kata sandi baru.'
          )
        } else if (errorMsg.includes('PASSWORD_TOO_SHORT')) {
          setError('Kata sandi terlalu pendek. Minimal 8 karakter.')
        } else {
          setError(errorMsg || 'Gagal mengatur ulang kata sandi.')
        }
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/sign-in')
      }, 2500)
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan jaringan saat memproses reset kata sandi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative z-10 w-full max-w-md my-8">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Halaman Masuk</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-medium text-teal-400">
          <ShieldCheck className="h-3 w-3" />
          <span>Enkripsi 256-bit</span>
        </span>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900/80 p-7 sm:p-9 shadow-2xl shadow-slate-950/80 backdrop-blur-2xl">
        {/* Header */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25">
            <KeyRound className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-teal-400">Qwarts Finance</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Atur Ulang Kata Sandi
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Buat kata sandi baru yang kuat untuk mengamankan akun keuangan Anda.
          </p>
        </div>

        {/* Missing or Invalid Token Alert */}
        {!token && !success && (
          <div className="space-y-4 text-center py-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tautan Tidak Lengkap</h3>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                Token pengaturan ulang kata sandi tidak ditemukan pada tautan ini. Silakan buka tautan dari email Anda atau ajukan permintaan baru.
              </p>
            </div>
            <Link
              href="/sign-in?forgot=true"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:from-teal-400 hover:to-emerald-500"
            >
              <span>Ajukan Reset Kata Sandi Baru</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Success State */}
        {success ? (
          <div className="space-y-5 text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Kata Sandi Berhasil Diubah!</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Kata sandi baru Anda telah aktif. Anda sekarang dapat masuk menggunakan kata sandi yang baru saja dibuat.
              </p>
              <p className="mt-3 text-xs text-teal-400 font-medium animate-pulse">
                Mengalihkan Anda ke halaman masuk...
              </p>
            </div>

            <Link
              href="/sign-in"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:from-teal-400 hover:to-emerald-500"
            >
              <span>Masuk Sekarang</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          token && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Kata Sandi Baru */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Kata Sandi Baru
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="new-password-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi Baru */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="confirm-password-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi kata sandi baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300 leading-relaxed"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="submit-reset-password-btn"
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:from-teal-400 hover:to-emerald-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menyimpan Kata Sandi...</span>
                  </>
                ) : (
                  <>
                    <span>Simpan Kata Sandi Baru</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )
        )}
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-slate-500">
        Data keuangan Anda aman, terenkripsi, dan terisolasi privat di qwarts.my.id.
      </p>
    </div>
  )
}

export function ResetPasswordForm() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 p-4 sm:p-6 text-slate-100 selection:bg-teal-500 selection:text-white">
      {/* Background Animated Gradient Mesh */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-teal-500/25 via-emerald-500/15 to-transparent blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[550px] w-[550px] rounded-full bg-gradient-to-tl from-cyan-500/20 via-teal-600/15 to-transparent blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </main>
  )
}
