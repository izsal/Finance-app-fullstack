import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { categories } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
  applyRateLimitHeaders,
} from '@/lib/rate-limiter'

// 10 requests per menit per user — lebih longgar dari scan-receipt karena teks lebih ringan
const VOICE_RATE_LIMIT = { limit: 10, windowMs: 60 * 1000 }

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

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)

    // Rate limiting
    const clientIp = getClientIp(req)
    const rateLimitKey = `parse-voice:${user.id || clientIp}`
    const rateLimitResult = checkRateLimit(rateLimitKey, VOICE_RATE_LIMIT)

    if (!rateLimitResult.allowed) {
      return rateLimitResponse(
        rateLimitResult,
        `Terlalu banyak permintaan voice. Harap tunggu ${rateLimitResult.resetInSeconds} detik.`
      )
    }

    const body = await req.json().catch(() => ({}))
    const transcript: string = (body.transcript || '').trim()

    if (!transcript || transcript.length < 2) {
      return apiError('Teks suara tidak boleh kosong', 422)
    }

    if (transcript.length > 500) {
      return apiError('Teks terlalu panjang (maks 500 karakter)', 422)
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      req.headers.get('x-gemini-api-key')

    if (!apiKey) {
      console.warn('[parse-voice] GEMINI_API_KEY belum terpasang — parser lokal akan dipakai')
    }

    // Ambil kategori user agar AI bisa cocokkan ke nama kategori yang nyata
    const userCats = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, user.id))

    const expenseCatNames = userCats
      .filter((c) => c.type === 'expense')
      .map((c) => c.name)

    const incomeCatNames = userCats
      .filter((c) => c.type === 'income')
      .map((c) => c.name)

    // ── Strategi parsing: lokal dulu, Gemini sebagai fallback ──
    // Parser lokal cepat & gratis, tangani pola umum (cth: "jajan 25 ribu")
    // Gemini dipanggil hanya kalau lokal tidak yakin, untuk kasus kompleks/ambigu
    const localResult = localParseTranscript(transcript, userCats)

    // Debug log — lihat apa yang dihasilkan parser lokal
    console.log('[parse-voice] Local:', {
      transcript,
      amount: localResult.amount,
      type: localResult.type,
      categoryId: localResult.categoryId,
      categoryName: localResult.categoryName,
      confidence: localResult.confidence,
      skipGemini: localResult.amount > 0 && !!localResult.categoryId,
    })

    let parsedResult: VoiceParseResult
    let parseSource = 'local'

    if (localResult.amount > 0 && localResult.categoryId) {
      // Lokal cukup yakin → pakai langsung, skip API call
      parsedResult = localResult
    } else if (!apiKey) {
      // Tidak ada API key → pakai lokal (best effort)
      parsedResult = localResult
      if (parsedResult.amount === 0) {
        console.error('[parse-voice] Nominal tidak terdeteksi. Transcript:', `"${transcript}"`)
        return apiError(`Tidak dapat mengekstrak nominal dari: "${transcript}". Sebutkan nominal, contoh: "jajan kopi 25 ribu"`, 422)
      }
    } else {
      // Lokal tidak yakin → coba Gemini untuk hasil lebih akurat
      try {
        parsedResult = await callGeminiTextParse(transcript, apiKey, {
          expenseCategories: expenseCatNames,
          incomeCategories: incomeCatNames,
        })
        parseSource = 'gemini'
      } catch (geminiErr: any) {
        // Gemini gagal (503, rate limit, dll) → fallback ke hasil lokal
        console.warn('[parse-voice] Gemini gagal, pakai parser lokal:', geminiErr?.message)
        parsedResult = localResult
        if (parsedResult.amount === 0) {
          console.error('[parse-voice] Nominal tidak terdeteksi (Gemini juga gagal). Transcript:', `"${transcript}"`)
          return apiError(
            `Tidak dapat mengekstrak nominal dari: "${transcript}". Sebutkan nominal, contoh: "jajan kopi 25 ribu"`,
            422
          )
        }
      }
    }

    // Cocokkan categoryId dari nama kategori (untuk hasil Gemini atau lokal yang belum match)
    if (parsedResult.categoryName && !parsedResult.categoryId) {
      const matched = userCats.find(
        (c) =>
          c.type === parsedResult.type &&
          c.name.toLowerCase().includes(parsedResult.categoryName.toLowerCase())
      )
      if (matched) {
        parsedResult.categoryId = matched.id
      }
    }

    const successResponse = apiSuccess(
      parsedResult,
      `Input suara berhasil diparse (${parseSource === 'gemini' ? 'AI' : 'lokal'}): ${parsedResult.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'} ${parsedResult.description}`
    )
    return applyRateLimitHeaders(successResponse, rateLimitResult)
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    console.error('[parse-voice] Error:', err)
    return apiError(err?.message || 'Gagal memproses input suara', 500)
  }
}

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.7-flash',
  'gemini-2.5-flash',
]

async function callGeminiTextParse(
  transcript: string,
  apiKey: string,
  cats: { expenseCategories: string[]; incomeCategories: string[] }
): Promise<VoiceParseResult> {
  const today = new Date().toISOString().slice(0, 10)

  const prompt = `Kamu adalah asisten pencatat keuangan pribadi (personal finance voice assistant) untuk aplikasi Qwarts Finance.

Pengguna berbicara atau mengetik dalam Bahasa Indonesia. Tugasmu adalah mengekstrak informasi transaksi keuangan dari teks berikut.

Teks input dari pengguna: "${transcript}"

Tugas kamu:
1. Tentukan apakah ini uang KELUAR ("expense") atau uang MASUK ("income").
   - Kata kunci pengeluaran: beli, jajan, bayar, beli, bensin, makan, belanja, transfer ke, kasih, bayarin, isi, top up (keluar), cicilan, tagihan
   - Kata kunci pemasukan: terima, dapat, gaji, masuk, nerima, dibayar, bayaran, bonus, cashback, refund, transfer masuk, top up (masuk ke rekening sendiri)
   - Default ke "expense" jika tidak jelas.
2. Ekstrak NOMINAL dalam Rupiah sebagai angka integer positif.
   - "15rb" atau "15ribu" = 15000
   - "1.5jt" atau "1,5 juta" = 1500000
   - "50k" = 50000
   - Abaikan kata "Rp", "rupiah", titik, koma desimal.
3. Buat deskripsi singkat dan jelas (maks 50 karakter) berdasarkan konteks ucapan.
4. Pilih kategori yang paling cocok dari daftar berikut (pilih PERSIS satu nama):
   Kategori Pengeluaran: ${cats.expenseCategories.join(', ') || 'Makanan & Minuman, Belanja Kebutuhan, Transportasi & Bensin, Tagihan & Utilitas, Hiburan & Rekreasi'}
   Kategori Pemasukan: ${cats.incomeCategories.join(', ') || 'Gaji & Pendapatan, Investasi & Passive'}
5. Tentukan tanggal transaksi dalam format YYYY-MM-DD.
   - "tadi", "barusan", "tadi pagi/siang/malam" = hari ini: ${today}
   - "kemarin" = satu hari sebelum hari ini
   - Jika tidak disebutkan = hari ini: ${today}
6. Berikan confidence score antara 0.0-1.0 (seberapa yakin kamu dengan hasil parse ini).

Kembalikan HANYA JSON valid tanpa markdown, tanpa penjelasan:
{
  "type": "expense" | "income",
  "amount": number,
  "description": string,
  "categoryName": string,
  "date": "YYYY-MM-DD",
  "confidence": number
}

Contoh input dan output yang benar:
- Input: "jajan gorengan 5 ribu" → {"type":"expense","amount":5000,"description":"Jajan gorengan","categoryName":"Makanan & Minuman","date":"${today}","confidence":0.97}
- Input: "bayar listrik 250rb" → {"type":"expense","amount":250000,"description":"Bayar listrik PLN","categoryName":"Tagihan & Utilitas","date":"${today}","confidence":0.95}
- Input: "terima gaji 5 juta" → {"type":"income","amount":5000000,"description":"Terima gaji bulanan","categoryName":"Gaji & Pendapatan","date":"${today}","confidence":0.98}
- Input: "beli bensin 80 ribu kemarin" → {"type":"expense","amount":80000,"description":"Beli bensin","categoryName":"Transportasi & Bensin","date":"kemarin diganti tanggal nyata","confidence":0.96}`

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.05,
      responseMimeType: 'application/json',
    },
  }

  let lastError = ''

  // Coba semua model secara paralel — pakai yang pertama berhasil
  // Timeout 10 detik per model, jadi total maks 10 detik (bukan 4×30 detik)
  const attempts = CANDIDATE_MODELS.map(async (model) => {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10 detik timeout per model
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`[${model}] ${res.status}: ${errText.slice(0, 200)}`)
    }

    const json = await res.json()
    const raw = json.candidates?.[0]?.content?.parts?.[0]?.text
    if (!raw) throw new Error(`[${model}] Empty response`)

    // Strip markdown fences jika ada
    let cleaned = raw.trim()
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/, '')
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '')
    if (cleaned.endsWith('```')) cleaned = cleaned.replace(/\s*```$/, '')

    const data = JSON.parse(cleaned.trim())

    // Handle kemarin → actual date
    let date = data.date || today
    if (date === 'kemarin' || date.toLowerCase().includes('kemarin')) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      date = yesterday.toISOString().slice(0, 10)
    }
    // Validate YYYY-MM-DD format, fallback to today
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      date = today
    }

    return {
      type: data.type === 'income' ? 'income' : 'expense',
      amount: Math.round(Math.abs(Number(data.amount))) || 0,
      description: String(data.description || transcript).trim().slice(0, 100),
      categoryName: String(data.categoryName || '').trim(),
      categoryId: null,
      date,
      confidence: Math.min(1, Math.max(0, Number(data.confidence) || 0.8)),
      rawTranscript: transcript,
    } as VoiceParseResult
  })

  try {
    return await Promise.any(attempts)
  } catch (aggregateErr: any) {
    // Semua model gagal — kumpulkan error messages
    const errors = aggregateErr?.errors?.map((e: any) => e?.message || String(e)) || [aggregateErr?.message || 'Unknown']
    lastError = errors.join('; ')
    throw new Error(`Semua model Gemini gagal memproses input suara. Error: ${lastError}`)
  }
}

// ── Parser lokal (regex-based) ─────────────────────────────────────────────
// Parsing cepat tanpa API untuk pola umum Bahasa Indonesia.
// Dipakai sebagai primary untuk input sederhana, fallback ketika Gemini gagal.

// Konversi kata angka Indonesia → digit (cth: "dua puluh lima ribu" → 25000)
const ID_NUMBER_WORDS: Record<string, number> = {
  'satu': 1, 'dua': 2, 'tiga': 3, 'empat': 4, 'lima': 5,
  'enam': 6, 'tujuh': 7, 'delapan': 8, 'sembilan': 9,
  'sepuluh': 10, 'sebelas': 11,
}

function parseCompoundIdNumber(wordsStr: string): number {
  // Parse compound: "dua puluh lima" → 25, "lima puluh" → 50, "dua ratus" → 200
  const words = wordsStr.trim().split(/\s+/)
  let total = 0
  let i = 0

  // Hundreds: "X ratus" atau "seratus"
  if (i < words.length) {
    if (words[i] === 'seratus') { total += 100; i++ }
    else if (i + 1 < words.length && words[i + 1] === 'ratus') {
      total += (ID_NUMBER_WORDS[words[i]] || 0) * 100; i += 2
    }
  }

  // Tens: "X puluh", "sepuluh", "sebelas"
  if (i < words.length) {
    if (words[i] === 'sepuluh') { total += 10; i++ }
    else if (words[i] === 'sebelas') { total += 11; i++ }
    else if (i + 1 < words.length && words[i + 1] === 'puluh') {
      total += (ID_NUMBER_WORDS[words[i]] || 0) * 10; i += 2
      // Unit setelah puluh: "dua puluh lima" → 20 + 5 = 25
      if (i < words.length && ID_NUMBER_WORDS[words[i]] !== undefined && ID_NUMBER_WORDS[words[i]] < 10) {
        total += ID_NUMBER_WORDS[words[i]]; i++
      }
    }
  }

  // Units
  if (i < words.length && ID_NUMBER_WORDS[words[i]] !== undefined) {
    total += ID_NUMBER_WORDS[words[i]]; i++
  }

  return total
}

function parseIdWordAmount(text: string): number {
  // Special: "seribu" → 1000
  if (/\bseribu\b/i.test(text)) return 1000
  // Special: "seratus ribu" → 100000
  if (/\bseratus\s+ribu\b/i.test(text)) return 100000

  const numWordList = Object.keys(ID_NUMBER_WORDS).join('|') + '|puluh|ratus'

  // "[number words] ribu" → × 1000
  const ribuPattern = new RegExp(`((?:${numWordList})(?:\\s+(?:${numWordList}))*)\\s+ribu\\b`, 'i')
  const ribuMatch = text.match(ribuPattern)
  if (ribuMatch) {
    const num = parseCompoundIdNumber(ribuMatch[1])
    if (num > 0) return num * 1000
  }

  // "[number words] juta" → × 1000000
  const jutaPattern = new RegExp(`((?:${numWordList})(?:\\s+(?:${numWordList}))*)\\s+juta\\b`, 'i')
  const jutaMatch = text.match(jutaPattern)
  if (jutaMatch) {
    const num = parseCompoundIdNumber(jutaMatch[1])
    if (num > 0) return num * 1000000
  }

  return 0
}

function localParseTranscript(
  transcript: string,
  userCats: { id: number; name: string; type: string }[]
): VoiceParseResult {
  const today = new Date().toISOString().slice(0, 10)
  const text = transcript.toLowerCase().trim()

  // ── Extract amount ──
  let amount = 0

  // 1. Coba digit-based patterns dulu (cepat, akurat)
  // "1.5 juta", "1,5jt", "1 juta", "2jt", "1.5jt"
  const jutaMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:juta|jt)\b/i)
  // "25 ribu", "25rb", "25 rb", "25k", "25 k"
  const ribuMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:ribu|rb|k)\b/i)
  // "Rp 25000", "25000", "Rp 25.000"
  const plainMatch = text.match(/(?:rp\.?\s*)?(\d[\d.]{2,})/i)

  if (jutaMatch) {
    amount = Math.round(parseFloat(jutaMatch[1].replace(',', '.')) * 1_000_000)
  } else if (ribuMatch) {
    amount = Math.round(parseFloat(ribuMatch[1].replace(',', '.')) * 1000)
  } else if (plainMatch) {
    // Bersihkan titik pemisah ribuan (cth: "25.000" → 25000)
    amount = parseInt(plainMatch[1].replace(/\./g, ''), 10)
  }

  // 2. Fallback: coba word-based (cth: "dua puluh lima ribu" → 25000)
  if (amount === 0) {
    amount = parseIdWordAmount(text)
  }

  // 3. Heuristik: angka kecil tanpa unit → asumsikan ribu
  // Cth: "jajan 25" → 25000, "beli 50" → 50000 (dalam konteks Indonesia, jarang ada nominal < 1000)
  if (amount === 0) {
    const smallNumMatch = text.match(/(?:rp\.?\s*)?(\d{1,3})(?!\d)/i)
    if (smallNumMatch) {
      const num = parseInt(smallNumMatch[1], 10)
      // Hanya asumsikan ribu jika ada kata transaksi dan angkanya masuk akal (1-999)
      const hasTransactionKeyword = /\b(?:jajan|beli|bayar|makan|bensin|belanja|top\s?up|isi|kasih|kopi|snack|gorengan|minum|warung|jual|terima|dapat|gaji|bonus|cashback|refund|cicilan|tagihan|transfer|utang|parkir|tol|gojek|grab|ojol)\b/i.test(text)
      if (num > 0 && num < 1000 && hasTransactionKeyword) {
        amount = num * 1000
      }
    }
  }

  // ── Detect type (income vs expense) ──
  // Income patterns lebih spesifik, dicek dulu
  const incomePatterns = [
    'terima gaji', 'dapat gaji', 'gaji masuk', 'gaji turun',
    'dapat bonus', 'terima bonus',
    'cashback', 'refund',
    'transfer masuk', 'ada transfer',
    'dibayar', 'dapat bayaran', 'terima bayaran',
    'dapat uang', 'terima uang',
    'jualan', 'untung', 'dividen',
  ]
  let type: 'expense' | 'income' = 'expense'
  for (const p of incomePatterns) {
    if (text.includes(p)) {
      type = 'income'
      break
    }
  }
  // "gaji" sendiri kemungkinan besar income
  if (!incomePatterns.some((p) => text.includes(p)) && /\bgaji\b/i.test(text)) {
    type = 'income'
  }

  // ── Detect date ──
  let date = today
  if (text.includes('kemarin')) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    date = yesterday.toISOString().slice(0, 10)
  }

  // ── Build description ──
  // Bersihkan nominal, kata pengali, dan referensi waktu dari teks
  let desc = text
    .replace(/\d+(?:[.,]\d+)?\s*(?:juta|jt)\b/gi, '')
    .replace(/\d+(?:[.,]\d+)?\s*(?:ribu|rb|k)\b/gi, '')
    .replace(/(?:rp\.?\s*)?\d[\d.]*/gi, '')
    .replace(/kemarin/gi, '')
    .replace(/\b(?:tadi|barusan|tadi pagi|tadi siang|tadi malam|sekarang|hari ini)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Capitalize first letter
  desc = desc.charAt(0).toUpperCase() + desc.slice(1)
  if (!desc || desc.length < 2) desc = transcript.slice(0, 50)

  // ── Match category ──
  // Kelompok keyword → nama kategori yang mungkin cocok
  const categoryGroups: { keywords: string[]; matchNames: string[] }[] = [
    {
      keywords: ['makan', 'jajan', 'kopi', 'snack', 'gorengan', 'ngopi', 'minum',
        'sarapan', 'cemil', 'cemilan', 'warung', 'restoran', 'cafe', 'nasi',
        'mie', 'ayam', 'bakso', 'es', 'seblak', 'dimsum', 'burger', 'pizza'],
      matchNames: ['makan', 'food', 'minum', 'drink', 'jajan', 'snack'],
    },
    {
      keywords: ['bensin', 'bbm', 'pertamina', 'shell', 'transport', 'gojek',
        'grab', 'ojol', 'parkir', 'tol', 'angkot', 'bus', 'kereta', 'travel',
        'kendara', 'naik', 'motor', 'mobil'],
      matchNames: ['transport', 'bensin', 'kendara', 'travel'],
    },
    {
      keywords: ['listrik', 'pln', 'pdam', 'air', 'wifi', 'internet', 'pulsa',
        'paket data', 'tagihan', 'cicilan', 'subscribe', 'langganan',
        'netflix', 'spotify', 'utilitas', 'token'],
      matchNames: ['tagihan', 'utilitas', 'utility', 'langganan', 'cicilan', 'subscribe'],
    },
    {
      keywords: ['belanja', 'supermarket', 'indomaret', 'alfamart', 'sembako',
        'kebutuhan', 'sabun', 'shampoo', 'tissue', 'tisu', 'shopping',
        'grocery', 'pendaping'],
      matchNames: ['belanja', 'kebutuhan', 'shopping', 'sembako', 'grocery'],
    },
    {
      keywords: ['hiburan', 'bioskop', 'game', 'nonton', 'tiket', 'konser',
        'karaoke', 'main', 'diamond', 'voucher', 'rekreasi', 'mabar', 'top up game'],
      matchNames: ['hiburan', 'rekreasi', 'entertainment', 'game', 'fun'],
    },
    {
      keywords: ['kesehatan', 'obat', 'apotek', 'dokter', 'rumah sakit',
        'klinik', 'vitamin', 'puskesmas'],
      matchNames: ['kesehatan', 'health', 'medis'],
    },
    {
      keywords: ['pendidikan', 'sekolah', 'kursus', 'buku', 'ujian', 'les',
        'sapras', 'alat tulis'],
      matchNames: ['pendidikan', 'edukasi', 'education', 'sekolah'],
    },
    // Income categories
    {
      keywords: ['gaji', 'salary', 'upah', 'thr', 'tunjangan'],
      matchNames: ['gaji', 'pendapatan', 'income', 'salary', 'upah'],
    },
    {
      keywords: ['investasi', 'dividen', 'saham', 'bunga', 'deposito', 'reksadana'],
      matchNames: ['investasi', 'investment', 'passive', 'pasif'],
    },
    {
      keywords: ['jualan', 'jual', 'untung', 'omzet', 'bisnis', 'usaha'],
      matchNames: ['bisnis', 'usaha', 'jualan', 'omzet', 'profit'],
    },
  ]

  let categoryName = ''
  let categoryId: number | null = null

  const userCatsByType = userCats.filter((c) => c.type === type)

  for (const group of categoryGroups) {
    const hasKeyword = group.keywords.some((kw) => text.includes(kw))
    if (!hasKeyword) continue
    const matched = userCatsByType.find((c) => {
      const catName = c.name.toLowerCase()
      return group.matchNames.some((frag) => catName.includes(frag))
    })
    if (matched) {
      categoryName = matched.name
      categoryId = matched.id
      break
    }
  }

  // Fallback: kategori pertama dengan tipe yang sesuai
  if (!categoryId && userCatsByType.length > 0) {
    categoryName = userCatsByType[0].name
    categoryId = userCatsByType[0].id
  }

  // Confidence: tinggi jika amount + kategori cocok, rendah jika tidak
  let confidence = 0.7
  if (amount === 0) confidence = 0.3
  else if (!categoryId) confidence = 0.5

  return {
    type,
    amount,
    description: desc.slice(0, 100),
    categoryName,
    categoryId,
    date,
    confidence,
    rawTranscript: transcript,
  }
}
