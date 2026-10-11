'use client'

import { useState, useEffect } from 'react'
import { Download, X, Share, PlusSquare, Sparkles } from 'lucide-react'
import Image from 'next/image'

export function PwaInstallPrompt({ lang = 'id' }: { lang?: 'id' | 'en' }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const [dismissed, setDismissed] = useState(true) // default true until verified

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Check if already running in standalone PWA mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')

    setIsStandalone(isStandaloneMode)
    if (isStandaloneMode) return

    // 2. Check if recently dismissed in localStorage (e.g. 3 days)
    const lastDismissed = localStorage.getItem('qwarts_pwa_dismissed')
    if (lastDismissed) {
      const dismissedTime = parseInt(lastDismissed, 10)
      if (Date.now() - dismissedTime < 3 * 24 * 60 * 60 * 1000) {
        return // Still in cooldown
      }
    }
    setDismissed(false)

    // 3. Detect iOS
    const ua = window.navigator.userAgent
    const isIosDevice = /iPhone|iPad|iPod/i.test(ua) && !(window as any).MSStream
    setIsIos(isIosDevice)

    // 4. Capture Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setDismissed(false)
    }

    // 5. Custom event for manual trigger from buttons or settings
    const handleManualTrigger = () => {
      setDismissed(false)
      if (deferredPrompt) {
        deferredPrompt.prompt()
      } else {
        setShowIosGuide(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('qwarts-trigger-pwa-install', handleManualTrigger)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('qwarts-trigger-pwa-install', handleManualTrigger)
    }
  }, [deferredPrompt])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setDismissed(true)
      }
    } else if (isIos) {
      setShowIosGuide(true)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('qwarts_pwa_dismissed', Date.now().toString())
  }

  // If already standalone or user dismissed, don't show
  if (isStandalone || dismissed) return null

  // If neither Android install prompt is ready nor iOS detected, don't show floating banner
  if (!deferredPrompt && !isIos) return null

  return (
    <>
      {/* Floating Modern PWA Install Banner */}
      <aside
        aria-label="Install App"
        className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-3.5 sm:p-4 shadow-2xl shadow-emerald-950/20 animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-start gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-emerald-500/20 shadow-md">
            <Image
              src="/icon-192x192.png"
              alt="Qwarts Finance"
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                Qwarts Finance
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.2 text-[9px] font-black text-emerald-700 dark:text-emerald-400">
                <Sparkles className="h-2 w-2" /> App
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              {lang === 'en'
                ? 'Install to Home Screen for faster access & full screen mode!'
                : 'Pasang ke layar utama HP Anda untuk akses instan & mode layar penuh!'}
            </p>

            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3 py-1.5 text-xs font-bold shadow-sm shadow-emerald-600/30 transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{lang === 'en' ? 'Install App' : 'Pasang Aplikasi'}</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 font-semibold transition"
              >
                {lang === 'en' ? 'Later' : 'Nanti'}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* iOS Safari Step-by-Step Installation Modal */}
      {showIosGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl overflow-hidden border border-emerald-500/20">
                  <Image src="/icon-192x192.png" alt="Logo" width={36} height={36} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {lang === 'en' ? 'Install on iPhone / iPad' : 'Pasang di iPhone / iPad'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'en' ? 'Add Qwarts Finance to Home Screen' : 'Tambahkan ke Layar Utama Safari'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {lang === 'en' ? 'Tap the Share Button' : 'Tekan Tombol Bagikan (Share)'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    {lang === 'en' ? 'Tap the' : 'Klik ikon'} <Share className="h-3.5 w-3.5 text-blue-500 inline" /> {lang === 'en' ? 'icon at the bottom of Safari' : 'di bilah navigasi bawah Safari.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {lang === 'en' ? 'Choose "Add to Home Screen"' : 'Pilih "Tambah ke Layar Utama"'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    {lang === 'en' ? 'Scroll down and tap' : 'Gulir ke bawah dan klik'} <PlusSquare className="h-3.5 w-3.5 text-emerald-500 inline" /> {lang === 'en' ? '"Add to Home Screen"' : '"Add to Home Screen".'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
                  3
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {lang === 'en' ? 'Tap "Add" at the Top Right' : 'Klik "Tambah" (Add) di Kanan Atas'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {lang === 'en'
                      ? 'The app will appear on your home screen and open without Safari address bar!'
                      : 'Ikon aplikasi Qwarts Finance akan muncul di layar HP Anda dan siap dibuka dalam mode full-screen!'}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white shadow-sm transition"
            >
              {lang === 'en' ? 'Understood' : 'Mengerti, Terima Kasih'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
