import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { session as sessionTable } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    let token = session?.session?.token

    if (!token && session?.user?.id) {
      const found = await db
        .select()
        .from(sessionTable)
        .where(eq(sessionTable.userId, session.user.id))
        .orderBy(desc(sessionTable.createdAt))
        .limit(1)
      if (found.length > 0) {
        token = found[0].token
      }
    }

    if (!token) {
      // Coba cek cookie langsung
      const cookies = req.cookies
      token = cookies.get('better-auth.session_token')?.value
    }

    if (token) {
      const deepLink = `dompetku://auth?token=${encodeURIComponent(token)}`
      
      const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Google Berhasil — Dompetku Mobile</title>
  <style>
    body {
      background: #050814;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 32px;
      max-width: 440px;
      width: 100%;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 40px rgba(6, 182, 212, 0.2);
    }
    .icon {
      width: 64px;
      height: 64px;
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 32px;
    }
    h1 {
      font-size: 20px;
      margin: 0 0 10px;
      font-weight: 800;
    }
    p {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.5;
      margin: 0 0 24px;
    }
    .btn {
      display: block;
      background: linear-gradient(135deg, #06b6d4, #0284c7);
      color: #ffffff;
      text-decoration: none;
      font-weight: 700;
      padding: 14px;
      border-radius: 14px;
      box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
      transition: opacity 0.2s;
    }
    .btn:hover {
      opacity: 0.9;
    }
    .token-box {
      margin-top: 20px;
      background: rgba(0, 0, 0, 0.3);
      padding: 10px;
      border-radius: 10px;
      font-size: 11px;
      color: #64748b;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✨</div>
    <h1>Login Berhasil!</h1>
    <p>Akun Anda telah terhubung. Silakan klik tombol di bawah untuk kembali ke aplikasi Dompetku Mobile.</p>
    <a href="${deepLink}" class="btn">Buka Aplikasi Dompetku Mobile</a>
    <div class="token-box">
      Token Sesi: ${token.slice(0, 10)}...${token.slice(-10)}
    </div>
  </div>
  <script>
    // Auto redirect to deep-link
    window.location.href = "${deepLink}";
  </script>
</body>
</html>`

      return new NextResponse(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      })
    }

    return NextResponse.json(
      { success: false, message: 'Tidak dapat mendeteksi sesi login Google' },
      { status: 400 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Terjadi kesalahan callback' },
      { status: 500 }
    )
  }
}
