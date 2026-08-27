import { pool } from './db'

let isInitialized = false

export async function ensureTahap2Tables() {
  if (isInitialized) return
  try {
    const client = await pool.connect()
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS wallets (
          id SERIAL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          balance INTEGER NOT NULL DEFAULT 0,
          color TEXT NOT NULL DEFAULT 'teal',
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          color TEXT NOT NULL DEFAULT 'slate',
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS budgets (
          id SERIAL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "categoryId" INTEGER NOT NULL,
          amount INTEGER NOT NULL,
          month TEXT NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "walletId" INTEGER NOT NULL,
          "categoryId" INTEGER NOT NULL,
          type TEXT NOT NULL,
          amount INTEGER NOT NULL,
          description TEXT NOT NULL,
          date TIMESTAMP NOT NULL DEFAULT NOW(),
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
        );

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
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `)
      isInitialized = true
    } finally {
      client.release()
    }
  } catch (err) {
    console.error('Error ensuring tables:', err)
  }
}
