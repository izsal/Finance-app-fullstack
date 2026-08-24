import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { session as sessionTable, user as userTable } from '@/lib/schema'
import { and, eq, gt } from 'drizzle-orm'

export interface AuthUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
}

export function apiSuccess<T>(data: T, message = 'Operasi berhasil', status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

export function apiError(message = 'Terjadi kesalahan', status = 400, errors: any = null) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser> {
  // 1. Check Bearer Token in Authorization header (standard for Android apps)
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.substring(7).trim()
    if (token) {
      const now = new Date()
      const foundSessions = await db
        .select()
        .from(sessionTable)
        .where(and(eq(sessionTable.token, token), gt(sessionTable.expiresAt, now)))
        .limit(1)

      if (foundSessions.length > 0) {
        const foundUser = await db
          .select()
          .from(userTable)
          .where(eq(userTable.id, foundSessions[0].userId))
          .limit(1)

        if (foundUser.length > 0) {
          return {
            id: foundUser[0].id,
            name: foundUser[0].name,
            email: foundUser[0].email,
            emailVerified: foundUser[0].emailVerified,
            image: foundUser[0].image,
          }
        }
      }
    }
  }

  // 2. Fallback to Better-Auth session from cookies/headers
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (session?.user) {
      return {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        emailVerified: session.user.emailVerified,
        image: session.user.image,
      }
    }
  } catch (e) {
    // ignore
  }

  throw new Error('UNAUTHORIZED')
}
