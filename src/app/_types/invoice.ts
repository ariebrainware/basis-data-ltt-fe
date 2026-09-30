export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface InvoiceData {
  companyName: string
  companyPhone: string
  companyEmail: string
  companyAddress: string
  invoiceNumber: string
  orderDate: string
  patientName: string
  patientPhone: string
  items: InvoiceLineItem[]
  subtotal: number
  discount: number
  total: number
  bestRegards: string
}
