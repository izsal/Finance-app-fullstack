import type { Metadata } from 'next'
import DemoClient from './demo-client'

export const metadata: Metadata = {
  title: 'Demo Interaktif Gratis | Qwarts Finance',
  description:
    'Coba Qwarts Finance tanpa daftar. Eksplorasi dashboard, budget planner, target tabungan, dan tagihan rutin secara langsung.',
  alternates: {
    canonical: 'https://www.qwarts.my.id/demo',
  },
  openGraph: {
    title: 'Demo Interaktif | Qwarts Finance',
    description: 'Coba fitur dashboard keuangan pribadi secara langsung tanpa perlu akun.',
    url: 'https://www.qwarts.my.id/demo',
  },
}

export default function DemoPage() {
  return <DemoClient />
}
