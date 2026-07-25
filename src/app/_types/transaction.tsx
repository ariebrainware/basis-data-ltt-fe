export interface TransactionItem {
  item_id: number
  quantity: number
  price?: number
}

export interface TransactionType {
  ID: number
  treatment_id: number
  patient_name: string
  pricing_name: string
  amount: number
  payment_status: string
  notes: string
  transaction_date: string
  treatment_date: string
  therapist_name?: string
  items?: TransactionItem[]
}
