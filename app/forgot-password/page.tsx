import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'

export const metadata = {
  title: 'Lupa Kata Sandi - Qwarts Finance',
  description: 'Pulihkan akses akun Qwarts Finance Anda melalui email terdaftar.',
}

export default async function ForgotPasswordPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/')
  return <AuthForm mode="forgot-password" />
}
