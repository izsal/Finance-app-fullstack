import { cookies, headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user as userTable } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getFinanceData } from '@/app/actions/finance'
import { ensureTahap2Tables } from '@/lib/db-init'
import Dashboard from '@/components/dashboard'
import LandingPage from '@/components/landing-page'

export default async function Page() {
  const cookieStore = await cookies()
  const hasSessionCookie = cookieStore
    .getAll()
    .some((c) => c.name.includes('better-auth.session_token') || c.name.includes('session_token'))

  // Jika pengunjung belum login, tampilkan LandingPage langsung tanpa menunggu database
  if (!hasSessionCookie) {
    return <LandingPage />
  }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return <LandingPage />
  }

  // Pastikan semua kolom baru sudah ada di DB sebelum query apapun
  await ensureTahap2Tables()

  let userRecord = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.id, session.user.id),
  })

  // Auto-downgrade PRO users whose subscription has expired
  if (userRecord?.plan === 'pro' && userRecord.proExpiresAt && new Date() > userRecord.proExpiresAt) {
    await db
      .update(userTable)
      .set({ plan: 'free', proExpiresAt: null, updatedAt: new Date() })
      .where(eq(userTable.id, session.user.id))
    userRecord = { ...userRecord, plan: 'free', proExpiresAt: null }
    console.log(`[page] User ${session.user.id} PRO expired — auto-downgraded to free`)
  }

  const data = await getFinanceData()
  return (
    <Dashboard
      user={{
        ...session.user,
        plan: userRecord?.plan || 'free',
        proExpiresAt: userRecord?.proExpiresAt?.toISOString() ?? null,
      }}
      initialData={data}
    />
  )
}

