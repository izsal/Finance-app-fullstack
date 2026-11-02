'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, Circle, X, ChevronRight, Wallet, Receipt, Tag, BarChart3, Star } from 'lucide-react'

type Step = {
  id: string
  title: string
  titleEn: string
  desc: string
  descEn: string
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
  const [isVisible, setIsVisible] = useState(false)

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
      icon: <Wallet className="h-4 w-4" />,
      action: () => onNavigate('Dompet'),
    },
    {
      id: 'category',
      title: 'Cek kategori transaksi',
      titleEn: 'Check transaction categories',
      desc: 'Kategori default sudah tersedia, kamu bisa kustomisasi',
      descEn: 'Default categories are ready, customize as needed',
      icon: <Tag className="h-4 w-4" />,
      action: () => onNavigate('Kategori'),
    },
    {
      id: 'transaction',
      title: 'Catat transaksi pertamamu',
      titleEn: 'Log your first transaction',
      desc: 'Mulai catat pemasukan atau pengeluaran hari ini',
      descEn: 'Start logging income or expenses today',
      icon: <Receipt className="h-4 w-4" />,
      action: () => onNavigate('Transaksi'),
    },
    {
      id: 'pro',
      title: 'Eksplorasi fitur PRO',
      titleEn: 'Explore PRO features',
      desc: 'Budget, target impian, dan tagihan rutin tersedia di PRO',
      descEn: 'Budget limits, savings goals, and bill tracking in PRO',
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

  // Auto-hide when all steps done or dismissed
  if (dismissed || allDone) return null

  const progressPercent = Math.round((completedCount / steps.length) * 100)

  const dismiss = () => {
    setDismissed(true)
    localStorage.setItem('qwarts-onboarding-dismissed', 'true')
  }

  return (
    <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-950/50 to-slate-900/80 p-4 sm:p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-white">
              {lang === 'id' ? '👋 Selamat datang di Qwarts Finance!' : '👋 Welcome to Qwarts Finance!'}
            </span>
            <span className="rounded-full bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 text-[10px] font-bold text-teal-300">
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
      </div>

      {/* Steps */}
      <div className="grid gap-2 sm:grid-cols-2">
        {steps.map((step) => {
          const done = completedMap[step.id]
          return (
            <button
              key={step.id}
              onClick={step.action}
              disabled={done}
              className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                done
                  ? 'border-emerald-500/20 bg-emerald-950/30 cursor-default'
                  : 'border-slate-700/80 bg-slate-900/60 hover:border-teal-500/40 hover:bg-slate-800/80 cursor-pointer'
              }`}
            >
              <div
                className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full ${
                  done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-teal-400'
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold leading-tight ${done ? 'text-slate-400 line-through' : 'text-white'}`}>
                  {lang === 'id' ? step.title : step.titleEn}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                  {lang === 'id' ? step.desc : step.descEn}
                </p>
              </div>
              {!done && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-teal-400 transition" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
