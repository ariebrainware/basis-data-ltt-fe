import { InvoiceData, InvoiceLineItem } from '../_types/invoice'
import { TransactionType } from '../_types/transaction'
import { ItemType } from '../_types/item'
import { formatRupiah } from './expenseHelpers'

export const DEFAULT_COMPANY_NAME = 'LEE TIT TAR'
export const DEFAULT_COMPANY_PHONE = '0851-3369-0700'
export const DEFAULT_COMPANY_EMAIL = 'ptleetittar@gmail.com'
export const DEFAULT_COMPANY_ADDRESS =
  'RUKO ACELLENCE, Batam Centre Blk. C No.38'

export function generateInvoiceNumber(id: number | string): string {
  const cleanId = String(id || '1').padStart(5, '0')
  return `INV-${cleanId}`
}

export function formatInvoiceDate(dateStr?: string | null): string {
  if (!dateStr || dateStr.trim() === '') {
    const today = new Date()
    return today.toISOString().slice(0, 10)
  }
  // If format is like "2026-05-20 10:00", return the date part or as is
  const parts = dateStr.trim().split(' ')
  return parts[0]
}

export function buildInitialInvoiceData(params: {
  transaction: Partial<TransactionType>
  allItems?: ItemType[]
  patientPhone?: string
  therapistName?: string
}): InvoiceData {
  const {
    transaction,
    allItems = [],
    patientPhone = '',
    therapistName = '',
  } = params

  const transId = transaction.ID ?? 1
  const invoiceNumber = generateInvoiceNumber(transId)
  const orderDate = formatInvoiceDate(
    transaction.treatment_date || transaction.transaction_date
  )
  const patientName = transaction.patient_name || ''
  const resolvedTherapist = therapistName || transaction.therapist_name || ''

  // Build items list
  const lines: InvoiceLineItem[] = []
  let additionalCost = 0

  if (Array.isArray(transaction.items) && transaction.items.length > 0) {
    transaction.items.forEach((item, idx) => {
      const detail = allItems.find((i) => i.ID === item.item_id)
      const desc = detail?.name || `Item Tambahan #${item.item_id}`
      const unitPrice =
        item.price !== undefined ? item.price : detail?.price || 0
      const qty = item.quantity > 0 ? item.quantity : 1
      const total = qty * unitPrice
      additionalCost += total

      lines.push({
        id: `trans-item-${item.item_id}-${idx}`,
        description: desc,
        quantity: qty,
        unitPrice,
        total,
      })
    })
  }

  // Calculate therapy base price
  const totalAmount = Number(transaction.amount) || 0
  const therapyPrice = Math.max(0, totalAmount - additionalCost)
  const therapyDesc = resolvedTherapist
    ? `Terapi (${resolvedTherapist})`
    : 'Layanan Terapi Lee Tit Tar'

  // Insert therapy as the first line item
  const allLines: InvoiceLineItem[] = [
    {
      id: 'therapy-item-1',
      description: therapyDesc,
      quantity: 1,
      unitPrice: therapyPrice,
      total: therapyPrice,
    },
    ...lines,
  ]

  const subtotal = allLines.reduce(
    (acc, curr) => acc + curr.quantity * curr.unitPrice,
    0
  )
  const discount = 0
  const grandTotal = Math.max(0, subtotal - discount)

  return {
    companyName: DEFAULT_COMPANY_NAME,
    companyPhone: DEFAULT_COMPANY_PHONE,
    companyEmail: DEFAULT_COMPANY_EMAIL,
    companyAddress: DEFAULT_COMPANY_ADDRESS,
    invoiceNumber,
    orderDate,
    patientName,
    patientPhone,
    items: allLines,
    subtotal,
    discount,
    total: grandTotal,
    bestRegards: DEFAULT_COMPANY_NAME,
  }
}

export function calculateInvoiceTotals(
  items: InvoiceLineItem[],
  discount = 0
): { subtotal: number; total: number } {
  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0
  )
  const validDiscount = Math.max(0, Number(discount) || 0)
  const total = Math.max(0, subtotal - validDiscount)
  return { subtotal, total }
}

export { formatRupiah }
