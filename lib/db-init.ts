import { pool } from './db'

let isInitialized = false

/**
 * Runs ALTER TABLE migrations to add new columns that may not exist yet.
 * Safe to call multiple times — uses IF NOT EXISTS so it's idempotent.
 * Called at the start of page.tsx before any DB queries that use new columns.
 */
export async function ensureTahap2Tables() {
  if (isInitialized) return
  try {
    const client = await pool.connect()
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS goals (
          id SERIAL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          name TEXT NOT NULL,
          "targetAmount" INTEGER NOT NULL,
          "currentAmount" INTEGER NOT NULL DEFAULT 0,
          "targetDate" TIMESTAMP,
          color TEXT NOT NULL DEFAULT 'teal',
          icon TEXT NOT NULL DEFAULT 'target',
          "walletId" INTEGER,
          "isAchieved" BOOLEAN NOT NULL DEFAULT FALSE,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS subscriptions (
          id SERIAL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          name TEXT NOT NULL,
          amount INTEGER NOT NULL,
          "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
          "dueDate" INTEGER NOT NULL DEFAULT 1,
          "categoryId" INTEGER,
          "walletId" INTEGER,
          "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
          "reminderDaysBefore" INTEGER NOT NULL DEFAULT 3,
          "lastPaidAt" TIMESTAMP,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
        );

        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "lastPaidAt" TIMESTAMP;

        -- Add proExpiresAt to user table for subscription expiry tracking
        ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "proExpiresAt" TIMESTAMP;

        -- Add expiresAt to payments table
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP;
      `)
      isInitialized = true
    } finally {
      client.release()
    }
  } catch (err) {
    // Log tapi jangan throw — app tetap jalan meski migration gagal
    console.error('Error ensuring tables:', err)
  }
}
