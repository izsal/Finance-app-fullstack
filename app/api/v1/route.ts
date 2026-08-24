import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    name: 'Dompetku Mobile REST API',
    version: '1.2.0',
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
      },
      {
        path: '/api/v1/budgets/:id',
        methods: ['DELETE'],
        description: 'Hapus budget bulanan',
      },
      {
        path: '/api/v1/goals',
        methods: ['GET', 'POST'],
        description: 'Tahap 2: Target Tabungan Impian (Financial Goals) dengan progress bar & deadline',
        bodyExample: {
          name: 'Beli Rumah Impian',
          targetAmount: 150000000,
          currentAmount: 25000000,
          targetDate: '2027-12-31',
        },
      },
      {
        path: '/api/v1/goals/:id',
        methods: ['GET', 'PUT', 'DELETE'],
        description: 'Detail, update, dan hapus target tabungan',
      },
      {
        path: '/api/v1/goals/:id/deposit',
        methods: ['POST'],
        description: 'Setor / alokasi saldo tabungan ke target tertentu',
        bodyExample: {
          amount: 1000000,
          walletId: 1,
        },
      },
      {
        path: '/api/v1/subscriptions',
        methods: ['GET', 'POST'],
        description: 'Tahap 2: Manajemen Tagihan Rutin & Langganan (Netflix, BPJS, PLN, WiFi)',
        bodyExample: {
          name: 'Netflix Premium',
          amount: 186000,
          billingCycle: 'monthly',
          dueDate: 15,
          walletId: 1,
          reminderDaysBefore: 3,
        },
      },
      {
        path: '/api/v1/subscriptions/:id',
        methods: ['GET', 'PUT', 'DELETE'],
        description: 'Detail, edit, dan hapus data tagihan rutin',
      },
      {
        path: '/api/v1/subscriptions/:id/pay',
        methods: ['POST'],
        description: '1-Click Bayar Tagihan langsung memotong saldo dompet & mencatat transaksi',
        bodyExample: {
          walletId: 1,
        },
      },
    ],
  })
}
