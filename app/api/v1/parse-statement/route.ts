import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { categories } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { extractText, getDocumentProxy } from 'unpdf'
import {
  matchCategoryId,
  parseBankStatement,
  type ParsedStatementTransaction,
  type StatementTransactionType,
} from '@/lib/bank-statement'
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMITS,
  rateLimitResponse,
  applyRateLimitHeaders,
} from '@/lib/rate-limiter'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['.pdf']

interface StatementTransaction extends ParsedStatementTransaction {
  categoryId: number | null
}

interface StatementParseResponse {
  source: 'local' | 'gemini'
  bankName: string | null
  period: string | null
  periodLabel: string | null
  openingBalance: number | null
  closingBalance: number | null
  transactions: StatementTransaction[]
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)

    const clientIp = getClientIp(req)
    const rateLimitResult = checkRateLimit(
      `parse-statement:${user.id || clientIp}`,
      RATE_LIMITS.PARSE_STATEMENT
    )

    if (!rateLimitResult.allowed) {
      return rateLimitResponse(
        rateLimitResult,
        `Terlalu banyak import rekening koran. Harap tunggu ${rateLimitResult.resetInSeconds} detik.`
      )
    }

    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return apiError('Kirim file PDF melalui multipart/form-data dengan field "file"', 415)
    }

    const formData = await req.formData()
    const file = (formData as any).get('file') as File | null
    const password = String((formData as any).get('password') || '')

    if (!file) {
      return apiError('File PDF rekening koran wajib diunggah', 422)
    }

    const lowerName = (file.name || '').toLowerCase()
    const isPdf = file.type === 'application/pdf' || ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))

    if (!isPdf) {
      return apiError('Format file harus PDF', 415)
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError('Ukuran file PDF tidak boleh melebihi 10MB', 413)
    }

    const buffer = new Uint8Array(await file.arrayBuffer())
    const userCats = await db.select().from(categories).where(eq(categories.userId, user.id))

    if (userCats.length === 0) {
      return apiError('Buat minimal satu kategori terlebih dahulu sebelum import', 422)
    }

    let extractedText = ''
    let passwordError: 'required' | 'invalid' | null = null
    try {
      const pdf = await getDocumentProxy(buffer, password ? { password } : undefined)
      const extracted = await extractText(pdf, { mergePages: true })
      extractedText = Array.isArray(extracted.text) ? extracted.text.join('\n') : extracted.text
    } catch (err: any) {
      if (err?.name === 'PasswordException') {
        passwordError = err?.code === 2 ? 'invalid' : 'required'
      } else {
        console.warn('[parse-statement] Gagal mengekstrak teks PDF:', err)
      }
    }

    if (passwordError === 'invalid') {
      return apiError(
        'Password PDF salah. Periksa kembali password rekening koran kamu.',
        422,
        { code: 'PDF_PASSWORD_INVALID' }
      )
    }

    if (passwordError === 'required') {
      return apiError(
        'PDF ini terkunci password. Masukkan password untuk membukanya.',
        422,
        { code: 'PDF_PASSWORD_REQUIRED' }
      )
    }

    let response: StatementParseResponse | null = null

    if (extractedText.trim().length >= 40) {
      const parsed = parseBankStatement(extractedText)
      if (parsed.transactions.length > 0) {
        response = {
          source: 'local',
          bankName: parsed.bankName,
          period: parsed.period,
          periodLabel: parsed.periodLabel,
          openingBalance: parsed.openingBalance,
          closingBalance: parsed.closingBalance,
          transactions: parsed.transactions.map((transaction) => ({
            ...transaction,
            categoryId: matchCategoryId(userCats, transaction.categoryName, transaction.type),
          })),
        }
      }
    }

    if (!response) {
      const apiKey =
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        req.headers.get('x-gemini-api-key')

      if (!apiKey) {
        return apiError(
          'Tidak ada transaksi yang bisa dibaca dari PDF ini. Jika PDF berupa hasil scan/foto, pasang GEMINI_API_KEY agar AI dapat membacanya.',
          422
        )
      }

      const aiResult = await callGeminiStatement({
        apiKey,
        userCats,
        text: extractedText.trim().length >= 40 ? extractedText.slice(0, 150_000) : undefined,
        base64Pdf:
          extractedText.trim().length >= 40
            ? undefined
            : Buffer.from(buffer).toString('base64'),
      })

      response = {
        source: 'gemini',
        bankName: aiResult.bankName,
        period: aiResult.period,
        periodLabel: aiResult.period,
        openingBalance: null,
        closingBalance: null,
        transactions: aiResult.transactions.map((transaction) => ({
          ...transaction,
          categoryId: matchCategoryId(userCats, transaction.categoryName, transaction.type),
        })),
      }
    }

    if (response.transactions.length === 0) {
      return apiError('Tidak ada transaksi yang terdeteksi di dalam PDF', 422)
    }

    const successResponse = apiSuccess(
      response,
      `${response.transactions.length} transaksi berhasil dibaca dari rekening koran`
    )
    return applyRateLimitHeaders(successResponse, rateLimitResult)
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    console.error('[parse-statement] Error:', err)
    return apiError(err?.message || 'Gagal memproses file rekening koran', 500)
  }
}

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.7-flash',
  'gemini-2.5-flash',
]

async function callGeminiStatement({
  apiKey,
  userCats,
  text,
  base64Pdf,
}: {
  apiKey: string
  userCats: { id: number; name: string; type: string }[]
  text?: string
  base64Pdf?: string
}): Promise<{
  bankName: string | null
  period: string | null
  transactions: ParsedStatementTransaction[]
}> {
  const expenseNames = userCats.filter((c) => c.type === 'expense').map((c) => c.name)
  const incomeNames = userCats.filter((c) => c.type === 'income').map((c) => c.name)
  const today = new Date().toISOString().slice(0, 10)

  const sourceBlock = text
    ? `Berikut TEKS hasil ekstraksi PDF (urutan baris bisa tidak sempurna):\n\n---\n${text}\n---`
    : 'File PDF rekening koran terlampir.'

  const prompt = `Kamu adalah asisten keuangan yang membaca rekening koran / mutasi bank (bank Indonesia: BCA, Mandiri, BRI, BNI, BSI, CIMB, Permata, dan lainnya).

${sourceBlock}

Ekstrak SELURUH baris transaksi pada rekening koran tersebut. Aturan:
1. Abaikan baris SALDO AWAL, SALDO AKHIR, MUTASI CR, MUTASI DB, header halaman, dan catatan.
2. Untuk setiap transaksi tentukan type: "income" jika uang masuk (CR / KREDIT / KR), "expense" jika uang keluar (DB / DEBIT).
3. amount adalah nominal mutasi dalam Rupiah sebagai bilangan bulat (tanpa titik/koma pemisah). Contoh "2,000.00" = 2000, "1,779,940.00" = 1779940.
4. date wajib format YYYY-MM-DD. Gunakan tahun dari periode rekening koran.
5. description adalah nama merchant/penerima/pengirim yang paling informatif, maksimal 60 karakter. Contoh: "TRANSJAKAR", "SHOPEEPAY", "BI-FAST dari IZSAL QURLINAS AFA", "Biaya Admin".
6. categoryName pilih PERSIS salah satu dari daftar berikut:
   - Jika expense: ${expenseNames.join(', ') || 'Makanan & Minuman, Belanja Kebutuhan, Transportasi & Bensin, Tagihan & Utilitas, Hiburan & Rekreasi'}
   - Jika income: ${incomeNames.join(', ') || 'Gaji & Pendapatan'}
7. confidence antara 0.0 sampai 1.0.

Kembalikan HANYA JSON valid tanpa markdown:
{
  "bankName": string | null,
  "period": "YYYY-MM" | null,
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": string,
      "amount": number,
      "type": "expense" | "income",
      "categoryName": string,
      "confidence": number
    }
  ]
}

Jika tidak ada transaksi, kembalikan transactions array kosong. Tanggal hari ini: ${today}.`

  const parts: Array<Record<string, unknown>> = [{ text: prompt }]
  if (base64Pdf) {
    parts.push({
      inlineData: {
        mimeType: 'application/pdf',
        data: base64Pdf,
      },
    })
  }

  const payload = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.05,
      responseMimeType: 'application/json',
    },
  }

  const errors: string[] = []
  let sawBusy = false
  let sawFatal = false

  for (const model of CANDIDATE_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const result = await postGemini(endpoint, payload)

      if (!result.ok) {
        errors.push(`[${model}] ${result.status || 'ERR'}: ${result.error}`)
        if (result.status === 0 || result.status === 429 || result.status === 503) sawBusy = true
        else if (result.status !== 404) sawFatal = true
        continue
      }

      const json = result.json as any
      const raw = json.candidates?.[0]?.content?.parts?.[0]?.text
      if (!raw) {
        errors.push(`[${model}] Empty response`)
        sawFatal = true
        continue
      }

      let cleaned = raw.trim()
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/, '')
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '')
      if (cleaned.endsWith('```')) cleaned = cleaned.replace(/\s*```$/, '')

      const data = JSON.parse(cleaned.trim())
      const transactions: ParsedStatementTransaction[] = Array.isArray(data.transactions)
        ? data.transactions
            .map((item: any) => {
              const type: StatementTransactionType = item?.type === 'income' ? 'income' : 'expense'
              const amount = Math.round(Math.abs(Number(item?.amount))) || 0
              const date = /^\d{4}-\d{2}-\d{2}$/.test(String(item?.date || ''))
                ? String(item.date)
                : today

              return {
                date,
                description: String(item?.description || 'Transaksi').trim().slice(0, 100),
                amount,
                type,
                categoryName: String(item?.categoryName || '').trim(),
                confidence: Math.min(1, Math.max(0, Number(item?.confidence) || 0.8)),
              }
            })
            .filter((item: ParsedStatementTransaction) => item.amount > 0)
        : []

      return {
        bankName: data.bankName ? String(data.bankName).trim() : null,
        period: data.period ? String(data.period).trim() : null,
        transactions,
      }
    } catch (err: any) {
      errors.push(`[${model}] ${err?.message || String(err)}`)
      sawFatal = true
    }
  }

  if (sawBusy && !sawFatal) {
    throw new Error(
      'Layanan AI Gemini sedang sibuk (503). Coba lagi beberapa saat lagi — data PDF kamu tidak hilang.'
    )
  }

  throw new Error(`Semua model Gemini gagal membaca PDF. Detail: ${errors.join('; ')}`)
}

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504])
const MAX_ATTEMPTS = 2

async function postGemini(
  endpoint: string,
  payload: unknown
): Promise<
  | { ok: true; json: unknown }
  | { ok: false; status: number; error: string }
> {
  let lastStatus = 0
  let lastError = ''

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(45000),
      })

      if (res.ok) {
        return { ok: true, json: await res.json() }
      }

      lastStatus = res.status
      lastError = (await res.text()).slice(0, 200)

      if (!RETRYABLE_STATUS.has(res.status)) break
    } catch (err: any) {
      lastStatus = 0
      lastError = err?.message || String(err)
    }

    if (attempt < MAX_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 900))
    }
  }

  return { ok: false, status: lastStatus, error: lastError }
}
