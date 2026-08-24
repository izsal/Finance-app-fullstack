import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getFinanceData, seedDefaults } from '@/app/actions/finance'
import Dashboard from '@/components/dashboard'

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  let data = await getFinanceData()
  if (!data.wallets.length || !data.categories.length) data = await seedDefaults()
  return <Dashboard user={session.user} initialData={data} />
}
