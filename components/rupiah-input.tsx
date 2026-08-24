'use client'

import React, { useEffect, useState } from 'react'
import { formatRupiah, parseRupiahToNumber, terbilangRupiah } from '@/lib/utils'
import { Coins, Sparkles, X } from 'lucide-react'

interface RupiahInputProps {
  value: number | string
  onChange: (value: number) => void
  label?: string
  placeholder?: string
  required?: boolean
  showPresets?: boolean
  showTerbilang?: boolean
  className?: string
  id?: string
  name?: string
  disabled?: boolean
  autoFocus?: boolean
}

export function RupiahInput({
  value,
  onChange,
  label = 'Nominal',
  placeholder = 'Rp 0',
  required = false,
  showPresets = true,
  showTerbilang = true,
  className = '',
  id,
  name,
  disabled = false,
  autoFocus = false,
}: RupiahInputProps) {
  const numericValue = typeof value === 'string' ? parseRupiahToNumber(value) : (value || 0)
  const [displayValue, setDisplayValue] = useState<string>(() => (numericValue > 0 ? formatRupiah(numericValue, true) : ''))

  useEffect(() => {
    if (numericValue === 0 && displayValue === '') return
    setDisplayValue(numericValue > 0 ? formatRupiah(numericValue, true) : '')
  }, [numericValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const parsed = parseRupiahToNumber(raw)
    
    if (parsed === 0 && raw.trim() === '') {
      setDisplayValue('')
      onChange(0)
    } else {
      setDisplayValue(formatRupiah(parsed, true))
      onChange(parsed)
    }
  }

  const addPreset = (amount: number) => {
    const next = numericValue + amount
    setDisplayValue(formatRupiah(next, true))
    onChange(next)
  }

  const clearInput = () => {
    setDisplayValue('')
    onChange(0)
  }

  const presets = [
    { label: '+10 rb', amount: 10000 },
    { label: '+50 rb', amount: 50000 },
    { label: '+100 rb', amount: 100000 },
    { label: '+500 rb', amount: 500000 },
    { label: '+1 jt', amount: 1000000 },
    { label: '+5 jt', amount: 5000000 },
  ]

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {numericValue > 0 && (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              {formatRupiah(numericValue, true)}
            </span>
          )}
        </div>
      )}

      <div className="relative flex items-center">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
          <Coins className="h-4 w-4 text-emerald-600" />
        </div>

        <input
          type="text"
          inputMode="numeric"
          id={id}
          name={name}
          disabled={disabled}
          autoFocus={autoFocus}
          required={required}
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-base font-bold text-slate-800 shadow-sm transition-all placeholder:font-normal placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 disabled:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        />

        {numericValue > 0 && !disabled && (
          <button
            type="button"
            onClick={clearInput}
            aria-label="Bersihkan nominal"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showTerbilang && numericValue > 0 && (
        <div className="flex items-start gap-1.5 rounded-lg bg-emerald-50/70 p-2 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <span className="italic font-medium leading-relaxed">
            {terbilangRupiah(numericValue)}
          </span>
        </div>
      )}

      {showPresets && !disabled && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {presets.map((preset) => (
            <button
              key={preset.amount}
              type="button"
              onClick={() => addPreset(preset.amount)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {preset.label}
            </button>
          ))}
          {numericValue > 0 && (
            <button
              type="button"
              onClick={clearInput}
              className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-100 active:scale-95 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400"
            >
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  )
}
