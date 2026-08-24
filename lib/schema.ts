import { pgTable, text, timestamp, integer, boolean, serial } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
})

export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  balance: integer('balance').notNull().default(0),
  color: text('color').notNull().default('teal'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  color: text('color').notNull().default('slate'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const budgets = pgTable('budgets', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  categoryId: integer('categoryId').notNull(),
  amount: integer('amount').notNull(),
  month: text('month').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  walletId: integer('walletId').notNull(),
  categoryId: integer('categoryId').notNull(),
  type: text('type').notNull(),
  amount: integer('amount').notNull(),
  description: text('description').notNull(),
  date: timestamp('date').notNull().defaultNow(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  targetAmount: integer('targetAmount').notNull(),
  currentAmount: integer('currentAmount').notNull().default(0),
  targetDate: timestamp('targetDate'),
  color: text('color').notNull().default('teal'),
  icon: text('icon').notNull().default('target'),
  walletId: integer('walletId'),
  isAchieved: boolean('isAchieved').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  amount: integer('amount').notNull(),
  billingCycle: text('billingCycle').notNull().default('monthly'),
  dueDate: integer('dueDate').notNull().default(1),
  categoryId: integer('categoryId'),
  walletId: integer('walletId'),
  isActive: boolean('isActive').notNull().default(true),
  reminderDaysBefore: integer('reminderDaysBefore').notNull().default(3),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export type Wallet = typeof wallets.$inferSelect
export type Category = typeof categories.$inferSelect
export type Budget = typeof budgets.$inferSelect
export type Transaction = typeof transactions.$inferSelect
export type Goal = typeof goals.$inferSelect
export type Subscription = typeof subscriptions.$inferSelect
