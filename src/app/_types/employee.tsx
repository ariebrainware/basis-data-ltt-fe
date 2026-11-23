export interface EmployeeType {
  ID: number
  nik: string
  full_name: string
  gender: string
  address: string
  religion: string
  phone_number: string
  email: string
  joined_date: string
  position: string
  base_salary: number
  lunch_money: number
}

export type EmployeeAttachmentCategory = 'contract' | 'identity' | 'other'

export interface EmployeeAttachmentType {
  ID: number
  CreatedAt: string
  employee_id: number
  category: EmployeeAttachmentCategory
  file_name: string
  content_type: string
  size: number
}

export const EMPLOYEE_ATTACHMENT_CATEGORY_LABELS: Record<
  EmployeeAttachmentCategory,
  string
> = {
  contract: 'Kontrak Kerja',
  identity: 'Identitas (KTP/KK)',
  other: 'Lainnya',
}
