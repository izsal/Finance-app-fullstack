import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'
export default async function SignInPage() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (session?.user) redirect('/')
  } catch {
    // If not authenticated or error, continue to render sign-in form
  }
  return <AuthForm mode="sign-in" />
}

