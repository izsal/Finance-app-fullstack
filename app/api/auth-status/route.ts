import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    betterAuthUrl: process.env.BETTER_AUTH_URL || null,
    hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    timestamp: new Date().toISOString(),
  })
}
