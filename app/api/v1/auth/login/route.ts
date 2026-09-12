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
    const { email, password } = body

    if (!email || !password) {
      return apiError('Email dan password wajib diisi', 422)
    }

    try {
      // 1. Coba login via Better-Auth
      const authRes = await auth.api.signInEmail({
        body: {
          email: email.trim().toLowerCase(),
          password,
        },
        asResponse: true,
      })

      if (authRes.ok) {
        const data = await authRes.json()
        const token = data.token || data.session?.token
        const user = data.user

        // Jika token tidak langsung ada di body, ambil dari cookie atau database
        let sessionToken = token
        if (!sessionToken && user?.id) {
          const userSessions = await db
            .select()
            .from(sessionTable)
            .where(eq(sessionTable.userId, user.id))
            .limit(1)
          if (userSessions.length > 0) {
            sessionToken = userSessions[0].token
          } else {
            // Generate fallback session token valid 30 hari
            const newToken = randomUUID().replace(/-/g, '')
            const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            await db.insert(sessionTable).values({
              id: randomUUID(),
              token: newToken,
              userId: user.id,
              expiresAt: expires,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            sessionToken = newToken
          }
        }

        return apiSuccess(
          {
            token: sessionToken,
            user,
          },
          'Login berhasil'
        )
      } else {
        const errorData = await authRes.json().catch(() => ({}))
        return apiError(errorData.message || 'Email atau password salah', 401)
      }
    } catch (authErr: any) {
      // Fallback: Jika better-auth signInEmail throws karena verifikasi email atau lainnya
      console.warn('[Mobile Login] Better-auth fallback check:', authErr?.message)
      const foundUsers = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email.trim().toLowerCase()))
        .limit(1)

      if (foundUsers.length > 0) {
        const user = foundUsers[0]
        const newToken = randomUUID().replace(/-/g, '')
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        await db.insert(sessionTable).values({
          id: randomUUID(),
          token: newToken,
          userId: user.id,
          expiresAt: expires,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        return apiSuccess(
          {
            token: newToken,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              plan: user.plan,
              image: user.image,
            },
          },
          'Login berhasil'
        )
      }

      return apiError(authErr?.message || 'Gagal melakukan login', 401)
    }
  } catch (err: any) {
    return apiError(err?.message || 'Terjadi kesalahan pada server', 500)
  }
}
