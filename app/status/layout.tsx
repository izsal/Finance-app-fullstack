import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'System Status & Live Uptime | Qwarts Finance',
  description:
    'Real-time system status, uptime monitoring, and infrastructure reliability for Qwarts Finance personal finance platform.',
  openGraph: {
    title: 'System Status & Live Uptime | Qwarts Finance',
    description:
      'Real-time system status, uptime monitoring, and infrastructure reliability for Qwarts Finance personal finance platform.',
    url: 'https://www.qwarts.my.id/status',
  },
}

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
