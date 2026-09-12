import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { apiError, apiSuccess } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { session as sessionTable, user as userTable, wallets, categories } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return apiError('Nama, email, dan kata sandi wajib diisi', 422)
    }

    if (password.length < 6) {
      return apiError('Kata sandi minimal 6 karakter', 422)
    }

    const cleanEmail = email.trim().toLowerCase()

    // Cek apakah email sudah terdaftar
    const existing = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, cleanEmail))
      .limit(1)

    if (existing.length > 0) {
      return apiError('Email ini sudah terdaftar. Silakan login.', 409)
    }

    let createdUser: any = null
    let sessionToken: string = ''

    try {
      // 1. Coba registrasi lewat Better-Auth
      const authRes = await auth.api.signUpEmail({
        body: {
          name: name.trim(),
          email: cleanEmail,
          password,
        },
        asResponse: true,
      })

      if (authRes.ok) {
        const data = await authRes.json()
        createdUser = data.user
        sessionToken = data.token || data.session?.token
      }
    } catch (authErr: any) {
      console.warn('[Register Mobile] Better-Auth signUpEmail fallback:', authErr?.message)
    }

    // Jika belum terbuat via Better-Auth, buat record user manual
    if (!createdUser) {
      const newUserId = randomUUID()
      const [u] = await db
        .insert(userTable)
        .values({
          id: newUserId,
          name: name.trim(),
          email: cleanEmail,
          emailVerified: true,
          plan: 'free',
        })
        .returning()
      createdUser = u
    }

    if (!sessionToken && createdUser?.id) {
      sessionToken = randomUUID().replace(/-/g, '')
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      await db.insert(sessionTable).values({
        id: randomUUID(),
        token: sessionToken,
        userId: createdUser.id,
        expiresAt: expires,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Seed default wallets dan categories untuk user baru agar akun langsung siap pakai
    if (createdUser?.id) {
      const existingWallets = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, createdUser.id))
      if (existingWallets.length === 0) {
        await db.insert(wallets).values([
          { userId: createdUser.id, name: 'BCA Utama', type: 'Bank', balance: 0, color: 'teal' },
          { userId: createdUser.id, name: 'Kas Tunai', type: 'Tunai', balance: 0, color: 'emerald' },
          { userId: createdUser.id, name: 'GoPay / OVO', type: 'E-wallet', balance: 0, color: 'indigo' },
        ])
      }

      const existingCats = await db
        .select()
        .from(categories)
        .where(eq(categories.userId, createdUser.id))
      if (existingCats.length === 0) {
        await db.insert(categories).values([
          { userId: createdUser.id, name: 'Gaji & Pendapatan', type: 'income', color: 'emerald' },
          { userId: createdUser.id, name: 'Makanan & Minuman', type: 'expense', color: 'amber' },
          { userId: createdUser.id, name: 'Belanja Bulanan', type: 'expense', color: 'rose' },
          { userId: createdUser.id, name: 'Transportasi', type: 'expense', color: 'violet' },
          { userId: createdUser.id, name: 'Tagihan & Utilitas', type: 'expense', color: 'cyan' },
        ])
      }
    }

    return apiSuccess(
      {
        token: sessionToken,
        user: createdUser,
      },
      'Pendaftaran berhasil'
    )
  } catch (err: any) {
    return apiError(err?.message || 'Gagal memproses pendaftaran', 500)
  }
}
