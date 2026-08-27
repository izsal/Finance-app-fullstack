import dns from 'node:dns'
import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

try {
  dns.setDefaultResultOrder('ipv4first')
} catch {}

dotenv.config({ path: '.env.local' })

export default defineConfig({
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!,
  },
})

