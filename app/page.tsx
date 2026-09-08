import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getFinanceData, seedDefaults } from '@/app/actions/finance'
import Dashboard from '@/components/dashboard'
import LandingPage from '@/components/landing-page'

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return <LandingPage />
  }

  const userRecord = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.id, session.user.id),
  })

  let data = await getFinanceData()
  if (!data.wallets.length || !data.categories.length) data = await seedDefaults()
  return (
    <Dashboard
      user={{
        ...session.user,
        plan: userRecord?.plan || 'free',
      }}
      initialData={data}
    />
  )
}

