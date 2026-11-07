export type StatementTransactionType = 'expense' | 'income'

export interface ParsedStatementTransaction {
  date: string
  description: string
  amount: number
  type: StatementTransactionType
  categoryName: string
  confidence: number
}

export interface ParsedStatement {
  bankName: string | null
  period: string | null
  periodLabel: string | null
  openingBalance: number | null
  closingBalance: number | null
  transactions: ParsedStatementTransaction[]
}

interface PeriodInfo {
  year: number
  month: number
  label: string
}

const MONTHS: Record<string, number> = {
  JANUARI: 1,
  FEBRUARI: 2,
  MARET: 3,
  APRIL: 4,
  MEI: 5,
  JUNI: 6,
  JULI: 7,
  AGUSTUS: 8,
  SEPTEMBER: 9,
  OKTOBER: 10,
  NOVEMBER: 11,
  DESEMBER: 12,
  JANUARY: 1,
  FEBRUARY: 2,
  MARCH: 3,
  MAY: 5,
  JUNE: 6,
  JULY: 7,
  AUGUST: 8,
  OCTOBER: 10,
  DECEMBER: 12,
}

const FORMATTED_AMOUNT = /(?<![\d.,])\d{1,3}(?:,\d{3})+\.\d{2}(?![\d])/g
const STANDALONE_AMOUNT = /^(\d{1,3}(?:,\d{3})+\.\d{2})(?:\s+\d{1,3}(?:,\d{3})+\.\d{2})?$/
const RECORD_START = /^(\d{2})\/(\d{2})\s+(.+)$/

const CATEGORY_HINTS: { hint: string; test: RegExp }[] = [
  { hint: 'Belanja Kebutuhan', test: /toko semb|sembako|indoma|indomar|alfamart|tokopedia|shopee|belanja|supermarket|grocery|kebutuhan/i },
  { hint: 'Makanan & Minuman', test: /warung|makan|makanan|kopi|coffee|coffe|kue|donut|jco|mie|nasi|sate|bebek|warteg|jajanan|soto|bakso|resto|cafe|fried|rm |rumah makan/i },
  { hint: 'Transportasi & Bensin', test: /transjakar|spbu|bensin|sewa motor|parkir|tol |grab|gojek|ojol|travel|transport/i },
  { hint: 'Tagihan & Utilitas', test: /biaya adm|flazz|top\s*up|topup|smartfren|pulsa|listrik|internet|tagihan|spinjam|tvlk|dana|gopay|shopeepay/i },
  { hint: 'Hiburan & Rekreasi', test: /astro|bioskop|game|hiburan|rekreasi|nonton|konser/i },
  { hint: 'Kesehatan & Edukasi', test: /apotek|klinik|dokter|rumah sakit|vitamin|sekolah|kursus|buku/i },
  { hint: 'Gaji & Pendapatan', test: /bi-fast|dompet anak bangsa|kr otomatis|transfer masuk|gaji|payroll/i },
]

function toAmount(raw: string): number {
  const value = Number.parseFloat(raw.replace(/,/g, ''))
  return Number.isFinite(value) ? Math.round(value) : 0
}

function stripSpacing(line: string): string {
  return line.replace(/\s+/g, ' ').trim()
}

function isNoise(line: string): boolean {
  if (/^bersambung ke halaman berikut$/i.test(line)) return true
  if (/^tangg?al\s+keterangan/i.test(line)) return true
  if (/^\d+\s*\/\s*\d+$/.test(line)) return true
  if (/^saldo awal\b/i.test(line)) return true
  if (/^saldo akhir\b/i.test(line)) return true
  if (/^mutasi (cr|db)\b/i.test(line)) return true
  if (/^(catatan|halaman|periode|mata uang|no\. rekening)\s*:/i.test(line)) return true
  const compact = line.replace(/\s/g, '')
  if (compact.length > 0 && line.length / compact.length >= 1.8) return true
  return false
}

function extractPeriod(raw: string): PeriodInfo | null {
  const named = raw.match(/PERIODE\s*:\s*([A-Za-z]+)\s+(\d{4})/i)
  if (named) {
    const month = MONTHS[named[1].toUpperCase()]
    const year = Number(named[2])
    if (month && year) {
      return {
        year,
        month,
        label: `${named[1][0].toUpperCase()}${named[1].slice(1).toLowerCase()} ${year}`,
      }
    }
  }

  const numeric = raw.match(/PERIODE\s*:\s*\d{2}\/(\d{2})\/(\d{4})/)
  if (numeric) {
    const month = Number(numeric[1])
    const year = Number(numeric[2])
    return { year, month, label: `${String(month).padStart(2, '0')}/${year}` }
  }

  return null
}

function buildDate(day: string, month: string, period: PeriodInfo | null): string {
  const d = Number(day)
  const m = Number(month)
  let year = period?.year ?? new Date().getFullYear()

  if (!d || !m || d > 31 || m > 12) {
    return new Date().toISOString().slice(0, 10)
  }

  if (period) {
    if (m > period.month + 1) year -= 1
    else if (m === 1 && period.month === 12) year += 1
  }

  return `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function detectType(text: string): StatementTransactionType {
  if (/BI-FAST CR|TRSF E-BANKING CR|KR OTOMATIS|\bCR\b/i.test(text)) return 'income'
  return 'expense'
}

function extractAmount(lines: string[], type: StatementTransactionType): number {
  const joined = lines.join(' ')

  if (type === 'expense') {
    const markerMatch = joined.match(/(?<![\d.,])(\d{1,3}(?:,\d{3})+\.\d{2})\s+DB\b/)
    if (markerMatch) return toAmount(markerMatch[1])
  }

  const standalone = lines
    .map((line) => line.trim().match(STANDALONE_AMOUNT))
    .filter((match): match is RegExpMatchArray => Boolean(match))

  if (standalone.length > 0) {
    return toAmount(standalone[standalone.length - 1][1])
  }

  const formatted = joined.match(FORMATTED_AMOUNT)
  if (formatted) return toAmount(formatted[0])

  const small = joined.match(/(?<![\d.,])(\d{1,4}\.\d{2})(?![\d])/)
  return small ? toAmount(small[1]) : 0
}

function cleanDescription(value: string): string {
  return stripSpacing(value)
    .replace(/\s*-\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function extractDescription(lines: string[], type: StatementTransactionType): string {
  const firstLine = lines[0].replace(/^\d{2}\/\d{2}\s*/, '').trim()
  const upper = firstLine.toUpperCase()

  const merchantLine = lines.find((line) => /0{3,}\.00/.test(line))
  if (merchantLine) {
    const merchant = merchantLine.match(/0{3,}\.00\s*(.+)$/)
    if (merchant?.[1]) return cleanDescription(merchant[1])
  }

  if (upper.includes('BI-FAST')) {
    const sender = lines
      .slice(1)
      .find((line) => /[A-Za-z]{3,}/.test(line) && !/^(G\d|PLTS)/i.test(line))
    return sender ? `BI-FAST dari ${cleanDescription(sender)}` : 'BI-FAST Transfer'
  }

  if (upper.includes('TRSF E-BANKING')) {
    const reference = lines.slice(1).find((line) => /^\d{3,}\//.test(line))
    if (reference) {
      const name = cleanDescription(reference.split('/').slice(1).join('/'))
      if (name) return name
    }

    const names = lines
      .slice(1)
      .filter((line) => /[A-Za-z]{3,}/.test(line) && !/^(G\d|PLTS)/i.test(line))
    if (names.length > 0) return cleanDescription(names[names.length - 1])

    return type === 'income' ? 'Transfer Masuk' : 'Transfer Keluar'
  }

  if (upper.includes('BIAYA ADM')) return 'Biaya Admin'
  if (upper.includes('FLAZZ') && upper.includes('TOPUP')) return 'Top Up Flazz'
  if (upper.includes('KR OTOMATIS')) return 'Transfer Kolektif'
  if (upper.includes('TRANSAKSI DEBIT')) return 'Transaksi Debit'

  const stripped = firstLine.replace(/\s+\d{3,}$/, '').trim()
  return cleanDescription(stripped || 'Transaksi')
}

function guessCategory(description: string, type: StatementTransactionType): string {
  const rule = CATEGORY_HINTS.find(({ test }) => test.test(description))
  if (rule) {
    if (type === 'income' && rule.hint !== 'Gaji & Pendapatan') return ''
    return rule.hint
  }
  return ''
}

export function matchCategoryId(
  categories: { id: number; name: string; type: string }[],
  categoryName: string,
  type: StatementTransactionType
): number | null {
  const candidates = categories.filter((category) => category.type === type)
  if (candidates.length === 0) return null

  if (categoryName) {
    const words = categoryName
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((word) => word.length >= 4 && word !== 'lainnya')

    const exact = candidates.find((category) => {
      const name = category.name.toLowerCase()
      return name === categoryName.toLowerCase() || words.some((word) => name.includes(word))
    })
    if (exact) return exact.id

    const partial = candidates.find((category) => {
      const name = category.name.toLowerCase()
      return categoryName
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter((word) => word.length >= 3)
        .some((word) => name.includes(word))
    })
    if (partial) return partial.id
  }

  return candidates[0].id
}

export function parseBankStatement(rawText: string): ParsedStatement {
  const period = extractPeriod(rawText)

  const rawLines = rawText
    .split(/\r?\n/)
    .map(stripSpacing)
    .filter(Boolean)

  const lines: string[] = []
  let inPageHeader = false

  for (const line of rawLines) {
    if (/^REKENING\b/i.test(line) && !RECORD_START.test(line)) {
      inPageHeader = true
      continue
    }
    if (inPageHeader) {
      if (/^TANGGAL\s+KETERANGAN/i.test(line)) inPageHeader = false
      continue
    }
    if (isNoise(line)) continue
    lines.push(line)
  }

  const records: string[][] = []
  let current: string[] | null = null

  for (const line of lines) {
    const start = line.match(RECORD_START)
    if (start) {
      if (/saldo awal/i.test(line)) {
        current = null
        continue
      }
      current = [line]
      records.push(current)
    } else if (current) {
      current.push(line)
    }
  }

  const openingMatch = rawText.match(/SALDO AWAL\s*:?\s*([\d.,]+)/i)
  const closingMatch = rawText.match(/SALDO AKHIR\s*:?\s*([\d.,]+)/i)

  const transactions: ParsedStatementTransaction[] = []

  for (const record of records) {
    const start = record[0].match(RECORD_START)
    if (!start) continue

    const joined = record.join(' ')
    const type = detectType(joined)
    const amount = extractAmount(record, type)
    if (amount <= 0) continue

    const description = extractDescription(record, type)
    const categoryName = guessCategory(description, type)

    let confidence = 0.9
    if (amount <= 0) confidence = 0.3
    if (!description || description === 'Transaksi') confidence = 0.6

    transactions.push({
      date: buildDate(start[1], start[2], period),
      description,
      amount,
      type,
      categoryName,
      confidence,
    })
  }

  return {
    bankName: /BCA|BANK CENTRAL ASIA/i.test(rawText) ? 'BCA' : null,
    period: period ? `${period.year}-${String(period.month).padStart(2, '0')}` : null,
    periodLabel: period?.label ?? null,
    openingBalance: openingMatch ? toAmount(openingMatch[1]) : null,
    closingBalance: closingMatch ? toAmount(closingMatch[1]) : null,
    transactions,
  }
}
