import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool, type PoolConfig } from 'pg'
import * as schema from './schema'

function getDatabaseConfig(): PoolConfig {
  let connectionString = process.env.DATABASE_URL

  if (connectionString) {
    try {
      const url = new URL(connectionString)
      const sslmode = url.searchParams.get('sslmode')
      if (sslmode && !url.searchParams.has('uselibpqcompat')) {
        url.searchParams.set('uselibpqcompat', 'true')
      }
      connectionString = url.toString()
    } catch {
      if (connectionString.includes('sslmode=') && !connectionString.includes('uselibpqcompat')) {
        connectionString = connectionString.includes('?')
          ? `${connectionString}&uselibpqcompat=true`
          : `${connectionString}?uselibpqcompat=true`
      }
    }
  }

  return {
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  }
}

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined
}

export const pool = globalForDb.pool ?? new Pool(getDatabaseConfig())

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool
}

export const db = drizzle(pool, { schema })

