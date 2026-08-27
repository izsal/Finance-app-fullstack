const dns = require('node:dns')
try {
  dns.setDefaultResultOrder('ipv4first')
} catch {}

const fs = require('node:fs')
const dotenv = require('dotenv')
const { Pool } = require('pg')

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' })
} else {
  dotenv.config()
}

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL

if (!connectionString) {
  console.error('Error: Tidak ada DATABASE_URL ditemukan.')
  process.exit(1)
}

const pool = new Pool({ connectionString })

async function cleanDatabase() {
  const client = await pool.connect()
  try {
    console.log('🔄 Memulai pembersihan tabel database...')
    
    // Truncate semua data transaksi, budget, dompet, kategori, target, subscription
    await client.query(`
      TRUNCATE TABLE transactions, budgets, goals, subscriptions, wallets, categories CASCADE;
    `)
    
    console.log('✅ Berhasil mengosongkan tabel data keuangan!')
    console.log('💡 Catatan: Tabel user & session tetap dipertahankan agar Anda tidak perlu login ulang.')
  } catch (err) {
    console.error('❌ Gagal membersihkan database:', err.message)
  } finally {
    client.release()
    await pool.end()
  }
}

cleanDatabase()
