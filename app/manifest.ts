import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Qwarts Finance - Aplikasi Keuangan Pribadi',
    short_name: 'Qwarts Finance',
    description: 'Aplikasi pencatat pengeluaran harian dan budgeting bulanan pribadi.',
    start_url: '/',
    id: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui', 'browser'],
    background_color: '#090d16',
    theme_color: '#10b981',
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    categories: ['finance', 'productivity', 'utilities'],
    shortcuts: [
      {
        name: 'Catat Transaksi',
        short_name: 'Transaksi Baru',
        description: 'Buka langsung form catat pemasukan / pengeluaran',
        url: '/?action=add-transaction',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Lihat Dompet',
        short_name: 'Dompet',
        description: 'Cek saldo dan kelola dompet rekening',
        url: '/?tab=wallets',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
    ],
  }
}
