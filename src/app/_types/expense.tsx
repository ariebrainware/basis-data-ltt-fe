export interface ExpenseType {
  ID: number
  CreatedAt?: string
  UpdatedAt?: string
  expense_date: string
  category: string
  amount: number
  description: string
  payment_method: string
  receipt_url?: string
  notes?: string
}

export interface CategoryExpenseBreakdown {
  category: string
  total_amount: number
  count: number
}

export interface ExpenseSummary {
  total_amount: number
  total_count: number
  category_breakdown: CategoryExpenseBreakdown[]
}

export const EXPENSE_CATEGORIES = [
  'Operational',
  'Medical Supplies',
  'Equipment',
  'Salary',
  'Utilities',
  'Marketing',
  'Other',
] as const

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash / Tunai' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'e-wallet', label: 'E-Wallet' },
  { value: 'qris', label: 'QRIS' },
] as const
