import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { apiError, apiSuccess } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { session as sessionTable, user as userTable } from '@/lib/schema'
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
