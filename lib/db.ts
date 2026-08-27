import dns from 'node:dns'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// Prioritize IPv4 to avoid network EHOSTUNREACH errors on IPv6-incompatible networks
try {
  dns.setDefaultResultOrder('ipv4first')
} catch {
  // ignore if not supported in runtime
}

// Prevent creating multiple pg Pool instances during Next.js Hot Reloading
const globalForDb = globalThis as unknown as {
  pgPool: Pool | undefined
}

const connectionString =
  (process.env.NODE_ENV !== 'production' && process.env.DATABASE_URL_UNPOOLED)
    ? process.env.DATABASE_URL_UNPOOLED
    : (process.env.DATABASE_URL || process.env.POSTGRES_URL)

export const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString,
    connectionTimeoutMillis: 20000,
    idleTimeoutMillis: 30000,
    max: 10,
  })

if (!globalForDb.pgPool) {
  pool.on('error', (err) => {
    console.warn('[PostgreSQL Pool] Idle client warning:', err.message)
  })
}

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pgPool = pool
}

export const db = drizzle(pool, { schema })

