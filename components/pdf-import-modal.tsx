'use client'

import React, { useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Lock,
  RefreshCw,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import { importTransactions } from '@/app/actions/finance'
import { formatRupiah } from '@/lib/utils'
import type { Budget, Category, Goal, Subscription, Transaction, Wallet } from '@/lib/schema'
import type { Language } from '@/lib/i18n'

const MAX_FILE_SIZE = 10 * 1024 * 1024

type TransactionType = 'expense' | 'income'

interface ParsedTransaction {
  date: string
  description: string
  amount: number
  type: TransactionType
  categoryName: string
  categoryId: number | null
  confidence?: number
}

interface StatementMeta {
  source: 'local' | 'gemini'
  bankName: string | null
  period: string | null
  periodLabel: string | null
}

interface PreviewRow extends Omit<ParsedTransaction, 'categoryId'> {
  key: number
  selected: boolean
  duplicate: boolean
  categoryId: number
}

export interface PdfImportData {
  wallets: Wallet[]
  categories: Category[]
  budgets: Budget[]
  transactions: Transaction[]
  goals?: Goal[]
  subscriptions?: Subscription[]
}

interface PdfImportModalProps {
  data: PdfImportData
  lang: Language
  close: () => void
  done: (message: string, freshData?: PdfImportData) => void
}

type Step = 'upload' | 'parsing' | 'preview' | 'importing'

function defaultCategoryId(categories: Category[], type: TransactionType): number {
  return categories.find((category) => category.type === type)?.id ?? categories[0]?.id ?? 0
}

function isoDate(value: unknown): string {
  const date = new Date(value as string | Date)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

function duplicateKey(date: string, amount: number, description: string): string {
  return `${date}|${amount}|${description.trim().toLowerCase()}`
}

export function PdfImportModal({ data, lang, close, done }: PdfImportModalProps) {
  const txt = (id: string, en: string) => (lang === 'id' ? id : en)

  const [step, setStep] = useState<Step>('upload')
  const [error, setError] = useState('')
  const [rows, setRows] = useState<PreviewRow[]>([])
  const [meta, setMeta] = useState<StatementMeta | null>(null)
  const [fileName, setFileName] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pdfPassword, setPdfPassword] = useState('')
  const [needsPassword, setNeedsPassword] = useState(false)
  const [walletId, setWalletId] = useState<number>(data.wallets[0]?.id ?? 0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const existingKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const transaction of data.transactions) {
      keys.add(
        duplicateKey(
          isoDate(transaction.date),
          transaction.amount,
          transaction.description || ''
        )
      )
    }
    return keys
  }, [data.transactions])

  const selectedRows = useMemo(() => rows.filter((row) => row.selected), [rows])

  const totals = useMemo(() => {
    return selectedRows.reduce(
      (acc, row) => {
        if (row.type === 'income') acc.income += row.amount
        else acc.expense += row.amount
        return acc
      },
      { income: 0, expense: 0 }
    )
  }, [selectedRows])

  const updateRow = (key: number, patch: Partial<PreviewRow>) => {
    setRows((previous) =>
      previous.map((row) => {
        if (row.key !== key) return row
        const next = { ...row, ...patch }
        if (patch.type && patch.type !== row.type) {
          next.categoryId = defaultCategoryId(data.categories, patch.type)
        }
        return next
      })
    )
  }

  const handleFile = async (file: File, password?: string) => {
    setError('')

    if (file.size > MAX_FILE_SIZE) {
      setError(txt('Ukuran file melebihi 10MB.', 'File size exceeds 10MB.'))
      return
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setError(txt('File harus berformat PDF.', 'The file must be a PDF.'))
      return
    }

    setFileName(file.name)
    setPendingFile(file)
    setStep('parsing')

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (password) formData.append('password', password)

      const res = await fetch('/api/v1/parse-statement', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()

      if (!res.ok || !json.success) {
        const errorCode = json?.errors?.code

        if (errorCode === 'PDF_PASSWORD_REQUIRED' || errorCode === 'PDF_PASSWORD_INVALID') {
          setNeedsPassword(true)
          setError(
            errorCode === 'PDF_PASSWORD_INVALID'
              ? txt('Password salah. Coba lagi.', 'Incorrect password. Try again.')
              : ''
          )
          setStep('upload')
          return
        }

        setError(
          json.message ||
            (res.status === 429
              ? txt('Terlalu banyak permintaan. Tunggu sebentar.', 'Too many requests. Please wait.')
              : txt('Gagal membaca PDF.', 'Failed to read the PDF.'))
        )
        setStep('upload')
        return
      }

      setNeedsPassword(false)
      setPdfPassword('')
      setPendingFile(null)

      const parsed = json.data as {
        source: 'local' | 'gemini'
        bankName: string | null
        period: string | null
        periodLabel: string | null
        transactions: ParsedTransaction[]
      }

      const previewRows: PreviewRow[] = parsed.transactions.map((transaction, index) => {
        const type: TransactionType = transaction.type === 'income' ? 'income' : 'expense'
        const date = isoDate(transaction.date)
        const categoryId =
          typeof transaction.categoryId === 'number'
            ? transaction.categoryId
            : defaultCategoryId(data.categories, type)

        return {
          ...transaction,
          type,
          date: date || new Date().toISOString().slice(0, 10),
          categoryId,
          key: index,
          selected: !existingKeys.has(
            duplicateKey(date, Math.round(transaction.amount), transaction.description || '')
          ),
          duplicate: existingKeys.has(
            duplicateKey(date, Math.round(transaction.amount), transaction.description || '')
          ),
        }
      })

      setRows(previewRows)
      setMeta({
        source: parsed.source,
        bankName: parsed.bankName,
        period: parsed.period,
        periodLabel: parsed.periodLabel,
      })
      setStep('preview')
    } catch (err: any) {
      setError(err?.message || txt('Gagal terhubung ke server.', 'Failed to connect to the server.'))
      setStep('upload')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) void handleFile(file)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  const toggleAll = (selected: boolean) => {
    setRows((previous) => previous.map((row) => ({ ...row, selected })))
  }

  const handleImport = async () => {
    if (!walletId) {
      setError(txt('Pilih dompet tujuan terlebih dahulu.', 'Select a destination wallet first.'))
      return
    }

    const payload = selectedRows
      .filter((row) => row.amount > 0)
      .map((row) => ({
        categoryId: row.categoryId,
        type: row.type,
        amount: Math.round(row.amount),
        description: row.description,
        date: row.date,
      }))

    if (payload.length === 0) {
      setError(txt('Tidak ada transaksi yang dipilih.', 'No transactions selected.'))
      return
    }

    setError('')
    setStep('importing')

    try {
      const fresh = await importTransactions({ walletId, transactions: payload })
      done(
        lang === 'id'
          ? `${payload.length} transaksi berhasil diimpor!`
          : `${payload.length} transactions imported successfully!`,
        fresh as PdfImportData
      )
      close()
    } catch (err: any) {
      setError(err?.message || txt('Gagal mengimpor transaksi.', 'Failed to import transactions.'))
      setStep('preview')
    }
  }

  const resetUpload = () => {
    setRows([])
    setMeta(null)
    setFileName('')
    setPendingFile(null)
    setPdfPassword('')
    setNeedsPassword(false)
    setError('')
    setStep('upload')
  }

  const isWorking = step === 'parsing' || step === 'importing'

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {txt('Import Rekening Koran', 'Import Bank Statement')}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400">
            {txt(
              'Upload PDF mutasi bank, lalu periksa sebelum disimpan.',
              'Upload a bank statement PDF, then review before saving.'
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          className="rounded-xl p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 px-3 py-2 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {step === 'upload' && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handleInputChange}
          />
          {needsPassword ? (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                if (pendingFile && pdfPassword) void handleFile(pendingFile, pdfPassword)
              }}
              className="space-y-3 rounded-2xl border border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/20 p-4"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {txt('PDF ini terkunci password', 'This PDF is password-protected')}
                  </p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{fileName}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="password"
                  autoFocus
                  value={pdfPassword}
                  onChange={(event) => setPdfPassword(event.target.value)}
                  placeholder={txt('Password PDF', 'PDF password')}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!pdfPassword || !pendingFile}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Lock className="h-3.5 w-3.5" />
                  {txt('Buka PDF', 'Unlock PDF')}
                </button>
              </div>

              <button
                type="button"
                onClick={resetUpload}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
              >
                {txt('Pilih file lain', 'Choose another file')}
              </button>
            </form>
          ) : (
            <>
              <div
                onDragOver={(event) => {
                  event.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-5 py-10 text-center transition ${isDragging
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
                  }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {txt('Pilih atau tarik file PDF ke sini', 'Choose or drop a PDF file here')}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {txt(
                      'Rekening koran BCA, Mandiri, BRI, BNI, dan bank lain. Maksimal 10MB.',
                      'BCA, Mandiri, BRI, BNI, and other bank statements. Max 10MB.'
                    )}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition">
                  <Upload className="h-3.5 w-3.5" />
                  {txt('Pilih File PDF', 'Select PDF File')}
                </span>
              </div>
              <div className="flex items-start gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 px-3 py-2 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
                <span>
                  {txt(
                    'Transaksi dibaca otomatis dari PDF. Jika PDF berupa hasil scan, AI akan membacanya (perlu Gemini API key). PDF terkunci akan meminta password.',
                    'Transactions are read automatically from the PDF. Scanned PDFs are read by AI (requires a Gemini API key). Locked PDFs will ask for a password.'
                  )}
                </span>
              </div>
            </>
          )}
        </>
      )}

      {step === 'parsing' && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-5 py-12 text-center dark:bg-violet-950/30">
          <Loader2 className="h-7 w-7 animate-spin text-violet-500" />
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {txt('Membaca rekening koran...', 'Reading bank statement...')}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{fileName}</p>
          </div>
        </div>
      )}

      {(step === 'preview' || step === 'importing') && (
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 px-3 py-2 text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
              <FileText className="h-3.5 w-3.5 text-emerald-500" />
              {meta?.bankName || 'PDF'}
            </span>
            {meta?.periodLabel && (
              <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 font-semibold text-slate-600 dark:text-slate-300">
                {meta.periodLabel}
              </span>
            )}
            <span className="rounded-full bg-violet-500/15 px-2 py-0.5 font-bold text-violet-600 dark:text-violet-400">
              {meta?.source === 'gemini' ? 'AI Gemini' : txt('Parser PDF', 'PDF parser')}
            </span>
            <span className="ml-auto text-slate-500 dark:text-slate-400">
              {rows.length} {txt('transaksi terbaca', 'transactions found')}
            </span>
            <button
              type="button"
              onClick={resetUpload}
              disabled={isWorking}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
            >
              <RefreshCw className="h-3 w-3" />
              {txt('Ganti PDF', 'Change PDF')}
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {txt('Dompet tujuan', 'Destination wallet')}
              </span>
              <select
                value={walletId}
                onChange={(event) => setWalletId(Number(event.target.value))}
                disabled={isWorking || data.wallets.length === 0}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                {data.wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name} ({wallet.type})
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-[11px]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {txt('Dipilih', 'Selected')}
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-100">
                  {selectedRows.length} / {rows.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-rose-600 dark:text-rose-400 font-semibold">
                  -{formatRupiah(totals.expense)}
                </p>
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  +{formatRupiah(totals.income)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-[11px]">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleAll(true)}
                disabled={isWorking}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
              >
                {txt('Pilih semua', 'Select all')}
              </button>
              <button
                type="button"
                onClick={() => toggleAll(false)}
                disabled={isWorking}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
              >
                {txt('Kosongkan', 'Clear')}
              </button>
            </div>
            {rows.some((row) => row.duplicate) && (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                {txt(
                  'Baris kuning sudah pernah dicatat',
                  'Yellow rows may already exist'
                )}
              </span>
            )}
          </div>

          <div className="max-h-[45vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="hidden sm:grid grid-cols-[2rem_7rem_minmax(0,1fr)_7.5rem_7.5rem_9.5rem] gap-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-2 py-1.5 text-[9px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <span />
              <span>{txt('Tanggal', 'Date')}</span>
              <span>{txt('Deskripsi', 'Description')}</span>
              <span>{txt('Nominal', 'Amount')}</span>
              <span>{txt('Tipe', 'Type')}</span>
              <span>{txt('Kategori', 'Category')}</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((row) => {
                const categoryOptions = data.categories.filter(
                  (category) => category.type === row.type
                )

                return (
                  <div
                    key={row.key}
                    className={`grid grid-cols-[2rem_1fr] gap-2 px-2 py-2 sm:grid-cols-[2rem_7rem_minmax(0,1fr)_7.5rem_7.5rem_9.5rem] sm:items-center ${
                      row.duplicate ? 'bg-amber-50 dark:bg-amber-950/20' : ''
                    } ${row.selected ? '' : 'opacity-50'}`}
                  >
                    <div className="flex items-center justify-between sm:justify-start">
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={(event) =>
                          updateRow(row.key, { selected: event.target.checked })
                        }
                        disabled={isWorking}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </div>

                    <input
                      type="date"
                      value={row.date}
                      onChange={(event) => updateRow(row.key, { date: event.target.value })}
                      disabled={isWorking}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1.5 py-1 text-[11px] text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
                    />

                    <input
                      type="text"
                      value={row.description}
                      onChange={(event) =>
                        updateRow(row.key, { description: event.target.value })
                      }
                      disabled={isWorking}
                      className="col-span-2 sm:col-span-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-[11px] text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
                    />

                    <input
                      type="number"
                      min={0}
                      value={row.amount}
                      onChange={(event) =>
                        updateRow(row.key, { amount: Number(event.target.value) || 0 })
                      }
                      disabled={isWorking}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-right text-[11px] font-semibold text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
                    />

                    <select
                      value={row.type}
                      onChange={(event) =>
                        updateRow(row.key, { type: event.target.value as TransactionType })
                      }
                      disabled={isWorking}
                      className={`rounded-lg border px-1.5 py-1 text-[11px] font-semibold focus:outline-none ${
                        row.type === 'income'
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                          : 'border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      <option value="expense">{txt('Pengeluaran', 'Expense')}</option>
                      <option value="income">{txt('Pemasukan', 'Income')}</option>
                    </select>

                    <select
                      value={row.categoryId}
                      onChange={(event) =>
                        updateRow(row.key, { categoryId: Number(event.target.value) })
                      }
                      disabled={isWorking}
                      className="col-span-2 sm:col-span-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1.5 py-1 text-[11px] text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
                    >
                      {categoryOptions.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={close}
          disabled={isWorking && step === 'importing'}
          className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition disabled:opacity-50"
        >
          {txt('Batal', 'Cancel')}
        </button>

        <button
          type="button"
          onClick={handleImport}
          disabled={
            step !== 'preview' ||
            selectedRows.length === 0 ||
            !walletId ||
            data.wallets.length === 0
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {step === 'importing' ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {txt('Menyimpan...', 'Saving...')}
            </>
          ) : selectedRows.length > 0 ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              {txt(`Import ${selectedRows.length} Transaksi`, `Import ${selectedRows.length} Transactions`)}
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              {txt('Import Transaksi', 'Import Transactions')}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
