'use client'

import React, { useRef } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { formatIndoDate } from '@/lib/utils'

interface DatePickerInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
  type?: 'date' | 'month'
  className?: string
  id?: string
}

export function DatePickerInput({
  value,
  onChange,
  label,
  required = false,
  type = 'date',
  className = '',
  id,
}: DatePickerInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (inputRef.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          inputRef.current.showPicker()
        } catch {
          inputRef.current.focus()
        }
      } else {
        inputRef.current.focus()
      }
    }
  }

  const formatDisplay = (val: string) => {
    if (!val) return 'Pilih Tanggal'
    if (type === 'month') {
      const [year, month] = val.split('-')
      if (year && month) {
        const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1)
        return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      }
      return val
    }
    return formatIndoDate(val, true)
  }

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div
        onClick={handleClick}
        className="group relative flex items-center justify-between w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm transition-all hover:border-emerald-500 hover:bg-emerald-50/20 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Calendar className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
            {formatDisplay(value)}
          </span>
        </div>

        <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition shrink-0 ml-2" />

        {/* Underlying native input that responds to showPicker */}
        <input
          ref={inputRef}
          type={type}
          id={id}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
    </div>
  )
}
