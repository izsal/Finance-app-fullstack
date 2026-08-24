import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    name: 'Dompetku Mobile REST API',
    version: '1.0.0',
    description: 'API backend untuk integrasi aplikasi Android, iOS, dan web clients.',
    baseUrl: '/api/v1',
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <session_token>',
      cookieSupport: 'Better-Auth session cookie',
    },
    endpoints: [
      {
        path: '/api/v1/auth/me',
        methods: ['GET'],
        description: 'Mendapatkan profil pengguna yang sedang login',
      },
      {
        path: '/api/v1/summary',
        methods: ['GET'],
        description: 'Ringkasan finansial utama (total saldo, pemasukan, pengeluaran, per kategori, dompet, recent tx)',
      },
      {
        path: '/api/v1/transactions',
        methods: ['GET', 'POST'],
        queryParams: ['type (income|expense)', 'walletId', 'categoryId', 'search', 'startDate', 'endDate', 'page', 'limit'],
        bodyExample: {
          walletId: 1,
          categoryId: 2,
          type: 'expense',
          amount: 50000,
          description: 'Makan siang',
          date: '2026-08-24',
        },
      },
      {
        path: '/api/v1/transactions/:id',
        methods: ['GET', 'PUT', 'DELETE'],
        description: 'Detail, update, dan hapus transaksi spesifik',
      },
      {
        path: '/api/v1/wallets',
        methods: ['GET', 'POST'],
        description: 'Daftar dan buat dompet/rekening baru dengan kalkulasi saldo dinamis',
        bodyExample: {
          name: 'BCA Utama',
          type: 'Bank',
          balance: 1000000,
          color: 'teal',
        },
      },
      {
        path: '/api/v1/wallets/:id',
        methods: ['PUT', 'DELETE'],
        description: 'Update dan hapus dompet',
      },
      {
        path: '/api/v1/wallets/transfer',
        methods: ['POST'],
        description: 'Transfer saldo antar dompet / rekening',
        bodyExample: {
          fromWalletId: 1,
          toWalletId: 2,
          amount: 250000,
          description: 'Top-up GoPay',
          date: '2026-08-24',
        },
      },
      {
        path: '/api/v1/categories',
        methods: ['GET', 'POST'],
        queryParams: ['type (income|expense)'],
        description: 'Daftar dan buat kategori transaksi',
        bodyExample: {
          name: 'Makanan & Minuman',
          type: 'expense',
          color: 'amber',
        },
      },
      {
        path: '/api/v1/categories/:id',
        methods: ['PUT', 'DELETE'],
        description: 'Update dan hapus kategori',
      },
      {
        path: '/api/v1/budgets',
        methods: ['GET', 'POST'],
        queryParams: ['month (YYYY-MM)'],
        description: 'Daftar budget per bulan dengan realisasi & persentase, serta upsert budget',
        bodyExample: {
          categoryId: 1,
          amount: 1500000,
          month: '2026-08',
        },
      },
      {
        path: '/api/v1/budgets/:id',
        methods: ['DELETE'],
        description: 'Hapus budget bulanan',
      },
    ],
  })
}
