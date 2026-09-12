import { NextRequest } from 'next/server'
import { apiError, apiSuccess, getAuthUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { categories } from '@/lib/schema'
import { eq } from 'drizzle-orm'

interface ScanReceiptResult {
  type: 'expense' | 'income'
  amount: number
  description: string
  categoryName: string
  categoryId?: number | null
  date: string
  rawSummary?: string
  confidence: number
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)

    // Ambil daftar kategori pengguna saat ini agar AI bisa mencocokkan ke kategori yang sudah ada
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

    // Parsing payload: mendukung JSON { imageBase64, mimeType } atau FormData (file)
    let base64Data = ''
    let mimeType = 'image/jpeg'

    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = (formData as any).get('file') as File | null
      if (!file) {
        return apiError('File foto struk wajib diunggah', 422)
      }
      const buffer = await file.arrayBuffer()
      base64Data = Buffer.from(buffer).toString('base64')
      mimeType = file.type || 'image/jpeg'
    }

    let bodyApiKey = ''
    if (!contentType.includes('multipart/form-data')) {
      const body = await req.json().catch(() => ({}))
      base64Data = body.imageBase64 || ''
      mimeType = body.mimeType || 'image/jpeg'
      bodyApiKey = body.apiKey || ''
    }

    if (!base64Data) {
      return apiError('Data gambar struk (base64) tidak ditemukan', 422)
    }

    // Bersihkan prefix data URI jika ada (misal: data:image/png;base64,...)
    if (base64Data.includes(',')) {
      const parts = base64Data.split(',')
      const match = parts[0].match(/:(.*?);/)
      if (match) mimeType = match[1]
      base64Data = parts[1]
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      req.headers.get('x-gemini-api-key') ||
      bodyApiKey

    if (!apiKey) {
      return apiError(
        'Kunci Gemini API belum terpasang. Untuk membaca foto struk secara nyata dengan AI, silakan pasang GEMINI_API_KEY di file .env.local atau di menu Pengaturan aplikasi (Dapatkan gratis di https://aistudio.google.com/app/apikey).',
        400
      )
    }

    // Panggil Gemini 1.5 Flash Vision API
    const parsedResult: ScanReceiptResult = await callGeminiVision(base64Data, mimeType, apiKey, {
      expenseCategories: expenseCatNames,
      incomeCategories: incomeCatNames,
    })

    // Cocokkan categoryId jika cocok dengan nama kategori pengguna
    if (parsedResult.categoryName) {
      const matched = userCats.find(
        (c) =>
          c.type === parsedResult.type &&
          c.name.toLowerCase().includes(parsedResult.categoryName.toLowerCase())
      )
      if (matched) {
        parsedResult.categoryId = matched.id
      }
    }

    return apiSuccess(parsedResult, 'Foto struk berhasil dianalisis dengan AI')
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') return apiError('Unauthorized', 401)
    console.error('Scan receipt error:', err)
    return apiError(err?.message || 'Gagal menganalisis foto struk', 500)
  }
}

/**
 * Panggilan ke Google Gemini 1.5 Flash API menggunakan direct REST endpoint
 */
async function callGeminiVision(
  base64Image: string,
  mimeType: string,
  apiKey: string,
  categories: { expenseCategories: string[]; incomeCategories: string[] }
): Promise<ScanReceiptResult> {
  const candidateModels = [
    'gemini-3.6-flash',
    'gemini-flash-latest',
    'gemini-3.7-flash',
    'gemini-2.5-flash',
  ]

  const prompt = `Anda adalah asisten cerdas pencatat keuangan (financial receipt scanner) di Indonesia.
Analisis gambar ini (struk kasir belanja, invoice, karcis, screenshot bukti transfer/mutasi bank seperti BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, QRIS, dsb).

Tugas Anda:
1. Tentukan apakah ini uang keluar ("expense") atau uang masuk ("income"). 
   - Bukti belanja toko (Indomaret, Alfamart, resto, SPBU, supermarket) atau bukti transfer keluar = "expense".
   - Bukti transfer masuk / penerimaan dana / topup saldo masuk = "income".
2. Ekstrak TOTAL NOMINAL pembayaran akhir yang harus dibayarkan (angka integer positif dalam Rupiah tanpa titik/koma desimal).
3. Ekstrak nama merchant/toko atau catatan pengirim (misal: "Indomaret Kemang", "Kopi Kenangan", "Transfer Masuk dari Budi").
4. Pilih kategori yang paling cocok dari daftar kategori berikut:
   Kategori Pengeluaran yang tersedia: ${categories.expenseCategories.join(', ') || 'Makanan, Belanja, Transportasi, Utilitas, Lainnya'}
   Kategori Pemasukan yang tersedia: ${categories.incomeCategories.join(', ') || 'Gaji, Bonus, Transfer Masuk, Lainnya'}
5. Ambil tanggal transaksi dalam format YYYY-MM-DD. Jika tidak terlihat, gunakan tanggal hari ini: ${new Date().toISOString().slice(0, 10)}.

Kembalikan HANYA format JSON valid tanpa markdown fence atau teks penjelasan lain:
{
  "type": "expense" | "income",
  "amount": number,
  "description": string,
  "categoryName": string,
  "date": "YYYY-MM-DD",
  "rawSummary": string,
  "confidence": number
}`

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  }

  let lastError = ''
  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorText = await res.text()
        lastError = `[${model}] ${res.status}: ${errorText}`
        continue
      }

      const json = await res.json()
      const candidate = json.candidates?.[0]?.content?.parts?.[0]?.text
      if (!candidate) continue

      let cleaned = candidate.trim()
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '')
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '')
      if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '')

      const data = JSON.parse(cleaned.trim())

      return {
        type: data.type === 'income' ? 'income' : 'expense',
        amount: Math.round(Number(data.amount)) || 0,
        description: String(data.description || 'Transaksi Struk').trim(),
        categoryName: String(data.categoryName || 'Belanja').trim(),
        date: data.date || new Date().toISOString().slice(0, 10),
        rawSummary: data.rawSummary || `Dipindai otomatis oleh ${model}`,
        confidence: Number(data.confidence) || 0.95,
      }
    } catch (e: any) {
      lastError = e?.message || String(e)
    }
  }

  throw new Error(`Semua model Gemini gagal merespon. Detail error: ${lastError}`)
}

/**
 * Heuristic/Mock parser cerdas ketika GEMINI_API_KEY belum dikonfigurasi
 */
function fallbackHeuristicParser(
  base64: string,
  userCats: any[]
): ScanReceiptResult {
  const expenseCat = userCats.find((c) => c.type === 'expense')?.name || 'Belanja'
  const today = new Date().toISOString().slice(0, 10)

  // Contoh hasil deteksi struk realistis
  return {
    type: 'expense',
    amount: 78500,
    description: 'Belanja Harian (Scan Struk AI)',
    categoryName: expenseCat,
    date: today,
    rawSummary: 'Dipindai dengan Smart Receipt Scanner (Simulasi AI). Tambahkan GEMINI_API_KEY di .env untuk analisis langsung dengan Google Gemini.',
    confidence: 0.85,
  }
}
