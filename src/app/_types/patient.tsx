export interface PatientType {
  ID: number
  full_name: string
  phone_number: string
  job: string
  age: number
  email: string
  gender: string
  address: string
  health_history: string
  surgery_history: string
  last_visit: string
  patient_code: string
  onDataChange?: () => void
}
