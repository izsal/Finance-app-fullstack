import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.qwarts.my.id'),
  title: {
    default: 'Dompetku — Dashboard & Aplikasi Pengelola Keuangan Pribadi',
    template: '%s | Dompetku',
  },
  description:
    'Kelola transaksi, dompet, rekening bank, anggaran bulanan, tagihan rutin, dan target impian finansial Anda dengan rapi, aman, dan mudah.',
  applicationName: 'Dompetku',
  authors: [{ name: 'Dompetku', url: 'https://www.qwarts.my.id' }],
  keywords: [
    'aplikasi keuangan pribadi',
    'catat pengeluaran',
    'budgeting app indonesia',
    'financial tracker',
    'dompet digital',
    'dompetku',
    'qwarts',
  ],
  alternates: {
    canonical: 'https://www.qwarts.my.id',
  },
  openGraph: {
    title: 'Dompetku — Dashboard & Aplikasi Pengelola Keuangan Pribadi',
    description:
      'Catat transaksi, atur anggaran bulanan, kelola tagihan rutin, dan capai target impian finansialmu dengan mudah, rapi, dan aman.',
    url: 'https://www.qwarts.my.id',
    siteName: 'Dompetku',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 675,
        alt: 'Dompetku - Personal Finance Dashboard',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dompetku — Dashboard & Aplikasi Pengelola Keuangan Pribadi',
    description:
      'Catat transaksi, atur anggaran bulanan, kelola tagihan rutin, dan capai target impian finansialmu dengan mudah.',
    images: ['/og-image.png'],
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
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
