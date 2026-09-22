import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.qwarts.my.id'),
  title: {
    default: 'Aplikasi Budgeting Bulanan & Cara Mencatat Pengeluaran Harian | Qwarts Finance',
    template: '%s | Qwarts Finance',
  },
  description:
    'Cari cara mencatat pengeluaran harian atau aplikasi budgeting bulanan gratis? Qwarts Finance membantu melacak arus kas harian, atur budget kategori, multi-dompet, dan target tabungan impian tanpa ribet.',
  applicationName: 'Qwarts Finance',
  authors: [{ name: 'Qwarts Finance', url: 'https://www.qwarts.my.id' }],
  keywords: [
    'cara mencatat pengeluaran harian',
    'aplikasi budgeting bulanan',
    'aplikasi pengatur keuangan pribadi',
    'cara mengatur keuangan bulanan',
    'cara kelola gaji dan pengeluaran',
    'aplikasi pencatat keuangan gratis',
    'budgeting app indonesia',
    'catat arus kas harian',
    'financial tracker',
    'aplikasi pengatur anggaran',
    'manajemen keuangan pribadi',
    'qwarts finance',
    'qwarts',
  ],
  alternates: {
    canonical: 'https://www.qwarts.my.id',
  },
  openGraph: {
    title: 'Aplikasi Budgeting Bulanan & Cara Mencatat Pengeluaran Harian | Qwarts Finance',
    description:
      'Solusi praktis cara mencatat pengeluaran harian dan aplikasi budgeting bulanan gratis. Kelola pos anggaran, multi-dompet, dan target tabungan dengan rapi.',
    url: 'https://www.qwarts.my.id',
    siteName: 'Qwarts Finance',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 675,
        alt: 'Qwarts Finance - Aplikasi Budgeting Bulanan & Catat Pengeluaran Harian',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aplikasi Budgeting Bulanan & Cara Mencatat Pengeluaran Harian | Qwarts Finance',
    description:
      'Solusi praktis cara mencatat pengeluaran harian dan aplikasi budgeting bulanan gratis. Kelola pos anggaran, multi-dompet, dan target tabungan dengan rapi.',
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
