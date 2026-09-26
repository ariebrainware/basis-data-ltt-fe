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
  attachment_path?: string
}

export interface PaymentStatusSummary {
  paid: number
  partial: number
  unpaid: number
}

export interface TherapistPatientCount {
  therapist_name: string
  patient_count: number
}

export interface TransactionSummary {
  total_amount: number
  payment_status_counts: PaymentStatusSummary
  therapist_patient_counts: TherapistPatientCount[]
}
