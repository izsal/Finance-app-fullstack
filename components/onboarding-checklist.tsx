'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, X, ChevronRight, Wallet, Receipt, Tag, Star, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

type Step = {
  id: string
  title: string
  titleEn: string
  desc: string
  descEn: string
  tip: string
  tipEn: string
  icon: React.ReactNode
  action?: () => void
}

interface OnboardingChecklistProps {
  hasWallets: boolean
  hasTransactions: boolean
  hasCategories: boolean
  isPro: boolean
  lang: 'id' | 'en'
  onNavigate: (tab: string) => void
}

export function OnboardingChecklist({
  hasWallets,
  hasTransactions,
  hasCategories,
  isPro,
  lang,
  onNavigate,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false)
  const [activeTip, setActiveTip] = useState<string | null>(null)

  useEffect(() => {
    const isDismissed = localStorage.getItem('qwarts-onboarding-dismissed') === 'true'
    setDismissed(isDismissed)
  }, [])

  const steps: Step[] = [
    {
      id: 'wallet',
      title: 'Tambah dompet pertamamu',
      titleEn: 'Add your first wallet',
      desc: 'Buat dompet untuk BCA, GoPay, atau uang tunai',
      descEn: 'Create a wallet for your bank, e-wallet, or cash',
      tip: '💡 Kamu bisa tambahkan hingga 2 dompet di paket gratis (BCA, GoPay, Tunai, dll). Klik tab "Dompet" lalu tekan tombol "+ Tambah Dompet Baru".',
      tipEn: '💡 You can add up to 2 wallets on the free plan (BCA, GoPay, Cash, etc). Click the "Wallets" tab then press "+ Add New Wallet".',
      icon: <Wallet className="h-4 w-4" />,
      action: () => onNavigate('Dompet'),
    },
    {
      id: 'category',
      title: 'Cek kategori transaksi',
      titleEn: 'Check transaction categories',
      desc: 'Kategori default sudah tersedia, kamu bisa kustomisasi',
      descEn: 'Default categories are ready, customize as needed',
      tip: '💡 Sudah ada 8 kategori default (Gaji, Makanan, Transportasi, dll). Kamu bisa menambah atau mengedit nama dan warna kategori sesuai kebutuhan di tab "Kategori".',
      tipEn: '💡 8 default categories are ready (Salary, Food, Transport, etc). You can add or edit category names and colors in the "Categories" tab.',
      icon: <Tag className="h-4 w-4" />,
      action: () => onNavigate('Kategori'),
    },
    {
      id: 'transaction',
      title: 'Catat transaksi pertamamu',
      titleEn: 'Log your first transaction',
      desc: 'Mulai catat pemasukan atau pengeluaran hari ini',
      descEn: 'Start logging income or expenses today',
      tip: '💡 Tekan tombol hijau "+ Catat Transaksi" di pojok kanan atas, atau tombol "+ Pemasukan" / "- Pengeluaran" di bawah greeting. Isi nominal, kategori, dan dompet — selesai dalam 5 detik!',
      tipEn: '💡 Press the green "+ Add Transaction" button top-right, or the "+ Income" / "- Expense" buttons below the greeting. Fill in amount, category, and wallet — done in 5 seconds!',
      icon: <Receipt className="h-4 w-4" />,
      action: () => onNavigate('Transaksi'),
    },
    {
      id: 'pro',
      title: 'Eksplorasi fitur PRO',
      titleEn: 'Explore PRO features',
      desc: 'Budget, target impian, dan tagihan rutin tersedia di PRO',
      descEn: 'Budget limits, savings goals, and bill tracking in PRO',
      tip: '💡 Fitur PRO meliputi: Budget Bulanan per kategori, Target Tabungan Impian, Pelacak Tagihan Rutin, Unlimited Dompet, dan Ekspor Excel. Harga mulai Rp 19.000/bulan.',
      tipEn: '💡 PRO features include: Monthly Budget limits, Savings Goals, Recurring Bill Tracker, Unlimited Wallets, and Excel Export. Starting from Rp 19,000/month.',
      icon: <Star className="h-4 w-4" />,
      action: () => onNavigate('Budget'),
    },
  ]

  const completedMap: Record<string, boolean> = {
    wallet: hasWallets,
    category: hasCategories,
    transaction: hasTransactions,
    pro: isPro,
  }

  const completedCount = steps.filter((s) => completedMap[s.id]).length
  const allDone = completedCount === steps.length

  if (dismissed || allDone) return null

  const progressPercent = Math.round((completedCount / steps.length) * 100)

  const dismiss = () => {
    setDismissed(true)
    localStorage.setItem('qwarts-onboarding-dismissed', 'true')
  }

  // Find the first incomplete step to auto-highlight
  const firstIncompleteStep = steps.find(s => !completedMap[s.id])

  return (
    <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-950/50 to-slate-900/80 p-4 sm:p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-bold text-white">
              {lang === 'id' ? '👋 Selamat datang di Qwarts Finance!' : '👋 Welcome to Qwarts Finance!'}
            </span>
            <span className="rounded-full bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 text-[10px] font-bold text-teal-300 shrink-0">
              {completedCount}/{steps.length} {lang === 'id' ? 'selesai' : 'done'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {lang === 'id'
              ? 'Selesaikan langkah berikut untuk mulai menggunakan dashboard secara optimal.'
              : 'Complete these steps to get the most out of your dashboard.'}
          </p>
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition"
          title={lang === 'id' ? 'Tutup panduan' : 'Dismiss guide'}
          aria-label="Dismiss onboarding checklist"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          {progressPercent === 0
            ? (lang === 'id' ? 'Mulai dari langkah pertama 👇' : 'Start with the first step 👇')
            : progressPercent < 75
              ? (lang === 'id' ? `Bagus! ${completedCount} dari ${steps.length} langkah selesai.` : `Good! ${completedCount} of ${steps.length} steps done.`)
              : (lang === 'id' ? '🎉 Hampir selesai!' : '🎉 Almost there!')}
        </p>
      </div>

      {/* Steps */}
      <div className="grid gap-2 sm:grid-cols-2">
        {steps.map((step) => {
          const done = completedMap[step.id]
          const isHighlighted = !done && step.id === firstIncompleteStep?.id
          const showTip = activeTip === step.id

          return (
            <div key={step.id} className="flex flex-col gap-1">
              <button
                onClick={() => {
                  if (!done) {
                    setActiveTip(showTip ? null : step.id)
                  }
                }}
                className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition ${done
                    ? 'border-emerald-500/20 bg-emerald-950/30 cursor-default'
                    : isHighlighted
                      ? 'border-teal-500/50 bg-teal-950/40 ring-1 ring-teal-500/20 cursor-pointer'
                      : 'border-slate-700/80 bg-slate-900/60 hover:border-teal-500/40 hover:bg-slate-800/80 cursor-pointer'
                  }`}
              >
                <div
                  className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full ${done
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isHighlighted
                        ? 'bg-teal-500/20 text-teal-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-semibold leading-tight ${done ? 'text-slate-400 line-through' : isHighlighted ? 'text-white' : 'text-slate-300'}`}>
                    {lang === 'id' ? step.title : step.titleEn}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight truncate">
                    {lang === 'id' ? step.desc : step.descEn}
                  </p>
                </div>
                {!done && (
                  <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition ${showTip ? 'rotate-90 text-teal-400' : 'text-slate-500 group-hover:text-teal-400'}`} />
                )}
              </button>

              {/* Expandable tip panel */}
              {showTip && !done && (
                <div className="mx-1 rounded-xl border border-teal-500/20 bg-teal-950/30 p-3 text-xs text-slate-300 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-150">
                  <p>{lang === 'id' ? step.tip : step.tipEn}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      step.action?.()
                      setActiveTip(null)
                    }}
                    className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-teal-500/20 border border-teal-500/30 hover:bg-teal-500/30 px-3 py-1.5 text-[11px] font-bold text-teal-300 transition"
                  >
                    <ArrowRight className="h-3 w-3" />
                    <span>{lang === 'id' ? 'Pergi ke sana sekarang' : 'Go there now'}</span>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom quick-upgrade nudge for free users */}
      {!isPro && completedCount >= 2 && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-950/20 p-3 flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="text-[11px] text-slate-300 flex-1">
            {lang === 'id'
              ? 'Sudah paham dasarnya? Buka fitur Budget & Target Impian dengan upgrade ke PRO.'
              : 'Got the basics? Unlock Budget & Savings Goals by upgrading to PRO.'}
          </p>
          <Link
            href="#"
            onClick={(e) => { e.preventDefault(); onNavigate('Pengaturan') }}
            className="shrink-0 text-[11px] font-bold text-amber-400 hover:underline whitespace-nowrap"
          >
            {lang === 'id' ? 'Lihat PRO →' : 'See PRO →'}
          </Link>
        </div>
      )}
    </div>
  )
}
