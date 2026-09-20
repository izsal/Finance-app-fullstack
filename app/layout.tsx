import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.qwarts.my.id'),
  title: {
    default: 'Qwarts Finance — Catat Keuangan Pribadi & Budgeting',
    template: '%s | Qwarts Finance',
  },
  description:
    'Catat pemasukan, pengeluaran & arus kas gratis. Upgrade ke PRO untuk budget, multi-dompet unlimited, target impian, dan ekspor data.',
  applicationName: 'Qwarts Finance',
  authors: [{ name: 'Qwarts Finance', url: 'https://www.qwarts.my.id' }],
  keywords: [
    'aplikasi keuangan pribadi',
    'catat pengeluaran',
    'budgeting app indonesia',
    'financial tracker',
    'dompet digital',
    'qwarts finance',
    'qwarts',
  ],
  alternates: {
    canonical: 'https://www.qwarts.my.id',
  },
  openGraph: {
    title: 'Qwarts Finance — Catat Keuangan Pribadi & Budgeting',
    description:
      'Catat pemasukan, pengeluaran & arus kas harian tanpa biaya. Upgrade ke PRO saat siap mengatur budget, banyak dompet, dan target tabungan.',
    url: 'https://www.qwarts.my.id',
    siteName: 'Qwarts Finance',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 675,
        alt: 'Qwarts Finance - Personal Finance Dashboard',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qwarts Finance — Catat Keuangan Pribadi & Budgeting',
    description:
      'Catat pemasukan, pengeluaran & arus kas harian tanpa biaya. Upgrade ke PRO saat siap mengatur budget, banyak dompet, dan target tabungan.',
    images: ['/twitter-image.png'],
  },
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="bg-[#f7f9fb]">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' &&
          <>
            <Analytics />
            <SpeedInsights />
          </>
        }
      </body>
    </html>
  )
}
