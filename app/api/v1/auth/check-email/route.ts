import { NextRequest, NextResponse } from 'next/server'
import { apiError, apiSuccess } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { user as userTable } from '@/lib/schema'
import { eq } from 'drizzle-orm'

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
    const { email } = body

    if (!email || typeof email !== 'string') {
      return apiError('Email wajib diisi', 422)
    }

    const cleanEmail = email.trim().toLowerCase()

    const existing = await db
      .select({ id: userTable.id, email: userTable.email })
      .from(userTable)
      .where(eq(userTable.email, cleanEmail))
      .limit(1)

    const exists = existing.length > 0

    return apiSuccess(
      {
        exists,
        email: cleanEmail,
      },
      exists
        ? 'Email sudah pernah terdaftar'
        : 'Email tersedia untuk pendaftaran'
    )
  } catch (err: any) {
    return apiError(err?.message || 'Gagal memeriksa email', 500)
  }
}
