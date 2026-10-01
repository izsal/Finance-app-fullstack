export interface AuthUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  plan?: string
  image?: string | null
}

export interface WalletItem {
  id: number
  name: string
  type: string
  color: string
  initialBalance: number
  currentBalance: number
  totalIncome: number
  totalExpense: number
  createdAt?: string
}

export interface CategoryBreakdown {
  categoryId: number
  categoryName: string
  color: string
  totalAmount: number
  percentage: number
}

export interface CategoryItem {
  id: number
  userId?: string
  name: string
  type: 'income' | 'expense'
  color: string
  createdAt?: string
}

export interface TransactionItem {
  id: number
  userId?: string
  walletId: number
  categoryId: number
  categoryName?: string
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  createdAt?: string
}

export interface BudgetItem {
  id: number
  categoryId: number
  categoryName: string
  categoryColor: string
  month: string
  amount: number
  spent: number
  remaining: number
  percentage: number
  isOverbudget: boolean
  createdAt?: string
}

export interface BudgetResponse {
  month: string
  summary: {
    totalBudget: number
    totalSpent: number
    totalRemaining: number
    overallPercentage: number
  }
  budgets: BudgetItem[]
}

export interface GoalItem {
  id: number
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  color?: string
}

export interface SubscriptionItem {
  id: number
  name: string
  amount: number
  billingCycle: string
  dueDate: number
  walletId: number
  reminderDaysBefore: number
  active?: boolean
  lastPaidAt?: string | Date | null
  isPaidThisMonth?: boolean
  paymentStatus?: 'paid' | 'overdue' | 'due_soon' | 'unpaid'
}

export interface SummaryData {
  metrics: {
    totalBalance: number
    totalIncome: number
    totalExpense: number
    netSavings: number
    savingsRate: number
    totalTransactionsCount: number
    totalWalletsCount: number
  }
  wallets: WalletItem[]
  categoryBreakdown: CategoryBreakdown[]
  recentTransactions: TransactionItem[]
}

export const emptySummary: SummaryData = {
  metrics: {
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    savingsRate: 0,
    totalTransactionsCount: 0,
    totalWalletsCount: 0,
  },
  wallets: [],
  categoryBreakdown: [],
  recentTransactions: [],
}
