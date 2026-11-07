'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react'

interface VoiceParseResult {
  type: 'expense' | 'income'
  amount: number
  description: string
  categoryName: string
  categoryId?: number | null
  date: string
  confidence: number
  rawTranscript: string
}

interface VoiceInputButtonProps {
  lang: 'id' | 'en'
  onResult: (result: VoiceParseResult) => void
  onError?: (msg: string) => void
  disabled?: boolean
}

type RecordState = 'idle' | 'listening' | 'processing' | 'done' | 'error'

// Deteksi apakah browser support Web Speech API
function getSpeechRecognition(): SpeechRecognition | null {
  if (typeof window === 'undefined') return null
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRecognition) return null
  return new SpeechRecognition()
}

export function VoiceInputButton({
  lang,
  onResult,
  onError,
  disabled = false,
}: VoiceInputButtonProps) {
  const [state, setState] = useState<RecordState>('idle')
  const [transcript, setTranscript] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Ref untuk menyimpan transcript terbaru — menghindari stale closure di onend
  const transcriptRef = useRef('')

  useEffect(() => {
    if (!getSpeechRecognition()) {
      setIsSupported(false)
    }
  }, [])

  const cleanup = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch { }
      recognitionRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    transcriptRef.current = ''
  }, [])

  const parseWithGemini = useCallback(async (text: string) => {
    setState('processing')
    setStatusMsg(lang === 'id' ? 'Memproses dengan AI...' : 'Processing with AI...')

    try {
      const res = await fetch('/api/v1/parse-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      })
      const json = await res.json()

      if (res.ok && json.success && json.data) {
        const d = json.data as VoiceParseResult
        setState('done')
        const typeLabel = d.type === 'expense'
          ? (lang === 'id' ? 'Pengeluaran' : 'Expense')
          : (lang === 'id' ? 'Pemasukan' : 'Income')
        const amtFormatted = `Rp ${new Intl.NumberFormat('id-ID').format(d.amount)}`
        setStatusMsg(`✅ ${typeLabel} • ${amtFormatted} • ${d.description}`)
        onResult(d)
        // Auto-reset UI setelah 3 detik
        timeoutRef.current = setTimeout(() => {
          setState('idle')
          setTranscript('')
          setStatusMsg('')
        }, 3000)
      } else {
        const errMsg =
          res.status === 429
            ? (lang === 'id' ? 'Terlalu banyak permintaan. Tunggu sebentar.' : 'Too many requests. Please wait.')
            : json.message || (lang === 'id' ? 'Gagal memparse suara.' : 'Failed to parse voice.')
        setState('error')
        setStatusMsg(errMsg)
        onError?.(errMsg)
        timeoutRef.current = setTimeout(() => { setState('idle'); setStatusMsg('') }, 4000)
      }
    } catch (err: any) {
      const msg = err?.message || (lang === 'id' ? 'Gagal terhubung ke server.' : 'Failed to connect to server.')
      setState('error')
      setStatusMsg(msg)
      onError?.(msg)
      timeoutRef.current = setTimeout(() => { setState('idle'); setStatusMsg('') }, 4000)
    }
  }, [lang, onResult, onError])

  const startListening = useCallback(() => {
    cleanup()
    const recognition = getSpeechRecognition()
    if (!recognition) {
      const msg = lang === 'id'
        ? 'Browser kamu tidak mendukung input suara. Gunakan Chrome atau Edge.'
        : 'Your browser does not support voice input. Use Chrome or Edge.'
      setState('error')
      setStatusMsg(msg)
      onError?.(msg)
      return
    }

    recognition.lang = lang === 'id' ? 'id-ID' : 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognitionRef.current = recognition

    recognition.onstart = () => {
      setState('listening')
      setTranscript('')
      transcriptRef.current = ''
      setStatusMsg(
        lang === 'id'
          ? '🎙️ Bicara sekarang... (cth: "Jajan kopi 25 ribu")'
          : '🎙️ Speak now... (e.g. "Coffee 25 thousand")'
      )
      // Auto-stop setelah 10 detik jika tidak ada suara berhenti sendiri
      timeoutRef.current = setTimeout(() => {
        try { recognition.stop() } catch { }
      }, 10000)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('')
      transcriptRef.current = current
      setTranscript(current)
      setStatusMsg(`"${current}"`)
    }

    recognition.onend = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      // Baca dari ref agar selalu dapat transcript terbaru (menghindari stale closure)
      const finalText = transcriptRef.current || ''
      if (finalText.trim().length > 1) {
        parseWithGemini(finalText.trim())
      } else {
        setState('idle')
        setTranscript('')
        setStatusMsg('')
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      const errCode = event.error
      let msg = ''
      if (errCode === 'not-allowed' || errCode === 'permission-denied') {
        msg = lang === 'id'
          ? 'Akses mikrofon ditolak. Izinkan akses mikrofon di browser kamu.'
          : 'Microphone access denied. Allow microphone access in your browser.'
      } else if (errCode === 'no-speech') {
        msg = lang === 'id' ? 'Tidak terdeteksi suara. Coba lagi.' : 'No speech detected. Try again.'
      } else if (errCode === 'network') {
        msg = lang === 'id' ? 'Masalah jaringan saat merekam suara.' : 'Network error during recording.'
      } else {
        msg = lang === 'id' ? `Error: ${errCode}` : `Error: ${errCode}`
      }
      setState('error')
      setStatusMsg(msg)
      onError?.(msg)
      timeoutRef.current = setTimeout(() => { setState('idle'); setStatusMsg('') }, 4000)
    }

    try {
      recognition.start()
    } catch (err: any) {
      setState('error')
      const msg = lang === 'id' ? 'Gagal memulai mikrofon.' : 'Failed to start microphone.'
      setStatusMsg(msg)
      onError?.(msg)
    }
  }, [lang, parseWithGemini, cleanup, onError])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch { }
    }
  }, [])

  const reset = useCallback(() => {
    cleanup()
    setState('idle')
    setTranscript('')
    setStatusMsg('')
    transcriptRef.current = ''
  }, [cleanup])

  // Cleanup on unmount
  useEffect(() => () => cleanup(), [cleanup])

  if (!isSupported) return null

  // ── Button appearance based on state ──────────────────────────────────────

  const buttonConfig = {
    idle: {
      className: 'border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/60',
      icon: <Mic className="h-3.5 w-3.5" />,
      label: lang === 'id' ? 'Input Suara' : 'Voice Input',
    },
    listening: {
      className: 'border-rose-500/60 bg-rose-500/15 text-rose-600 dark:text-rose-400 animate-pulse',
      icon: <MicOff className="h-3.5 w-3.5" />,
      label: lang === 'id' ? 'Berhenti' : 'Stop',
    },
    processing: {
      className: 'border-violet-500/40 bg-violet-500/10 text-violet-500 cursor-not-allowed opacity-70',
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      label: lang === 'id' ? 'Memproses...' : 'Processing...',
    },
    done: {
      className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: lang === 'id' ? 'Berhasil!' : 'Done!',
    },
    error: {
      className: 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      label: lang === 'id' ? 'Error' : 'Error',
    },
  }

  const cfg = buttonConfig[state]

  return (
    <div className="flex flex-col gap-1.5">
      {/* Main trigger button */}
      <button
        type="button"
        disabled={disabled || state === 'processing' || state === 'done'}
        onClick={state === 'listening' ? stopListening : startListening}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold shadow-sm transition cursor-pointer disabled:cursor-not-allowed ${cfg.className}`}
        title={
          state === 'listening'
            ? (lang === 'id' ? 'Klik untuk berhenti merekam' : 'Click to stop recording')
            : (lang === 'id' ? 'Klik dan bicara untuk isi otomatis' : 'Click and speak to auto-fill')
        }
      >
        {cfg.icon}
        <span>{cfg.label}</span>
        {state === 'listening' && (
          <span className="flex gap-0.5 items-end h-3">
            <span className="w-0.5 bg-rose-500 rounded-full animate-[bounce_0.6s_0.0s_infinite]" style={{ height: '8px' }} />
            <span className="w-0.5 bg-rose-500 rounded-full animate-[bounce_0.6s_0.2s_infinite]" style={{ height: '12px' }} />
            <span className="w-0.5 bg-rose-500 rounded-full animate-[bounce_0.6s_0.4s_infinite]" style={{ height: '6px' }} />
          </span>
        )}
      </button>

      {/* Status / transcript feedback */}
      {statusMsg && (
        <div className={`flex items-start gap-1.5 rounded-xl px-2.5 py-2 text-[11px] font-medium leading-snug ${state === 'error'
          ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
          : state === 'done'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
            : 'bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-900/60'
          }`}>
          <span className="flex-1">{statusMsg}</span>
          {(state === 'error') && (
            <button
              type="button"
              onClick={reset}
              className="shrink-0 rounded p-0.5 hover:opacity-70 transition"
              aria-label="Dismiss"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
