import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(value: number | string | null | undefined, withPrefix = true): string {
  if (value === null || value === undefined || value === '') return withPrefix ? 'Rp 0' : '0'
  const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) || 0 : Math.round(value)
  const formatted = new Intl.NumberFormat('id-ID').format(num)
  return withPrefix ? `Rp ${formatted}` : formatted
}

export function parseRupiahToNumber(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : Math.round(value)
  const clean = value.replace(/\D/g, '')
  return clean ? parseInt(clean, 10) : 0
}

const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas']

function sebut(angka: number): string {
  angka = Math.floor(Math.abs(angka))
  if (angka === 0) return ''
  if (angka < 12) return satuan[angka]
  if (angka < 20) return sebut(angka - 10) + ' Belas'
  if (angka < 100) return sebut(Math.floor(angka / 10)) + ' Puluh ' + sebut(angka % 10)
  if (angka < 200) return 'Seratus ' + sebut(angka - 100)
  if (angka < 1000) return sebut(Math.floor(angka / 100)) + ' Ratus ' + sebut(angka % 100)
  if (angka < 2000) return 'Seribu ' + sebut(angka - 1000)
  if (angka < 1000000) return sebut(Math.floor(angka / 1000)) + ' Ribu ' + sebut(angka % 1000)
  if (angka < 1000000000) return sebut(Math.floor(angka / 1000000)) + ' Juta ' + sebut(angka % 1000000)
  if (angka < 1000000000000) return sebut(Math.floor(angka / 1000000000)) + ' Miliar ' + sebut(angka % 1000000000)
  if (angka < 1000000000000000) return sebut(Math.floor(angka / 1000000000000)) + ' Triliun ' + sebut(angka % 1000000000000)
  return ''
}

export function terbilangRupiah(angka: number): string {
  if (angka === 0) return 'Nol Rupiah'
  const hasil = sebut(angka).replace(/\s+/g, ' ').trim()
  return hasil ? `${hasil} Rupiah` : 'Nol Rupiah'
}

export function formatIndoDate(date: string | Date, withDay = false): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('id-ID', {
    weekday: withDay ? 'long' : undefined,
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
