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

export function printInvoiceDocument(invoice: InvoiceData): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  const existingIframe = document.getElementById('invoice-print-iframe')
  if (existingIframe) {
    existingIframe.remove()
  }

  const iframe = document.createElement('iframe')
  iframe.id = 'invoice-print-iframe'
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.style.visibility = 'hidden'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) return

  const itemsHtml = invoice.items
    .map((item, idx) => {
      const isOdd = (idx + 1) % 2 !== 0
      const bg = isOdd ? '#F3F3F3' : '#FFFFFF'
      return `
        <tr style="background-color: ${bg};">
          <td style="padding: 6px 10px; text-align: center; font-size: 11px; color: #4B5563; border-bottom: 1px solid #E5E7EB;">${idx + 1}</td>
          <td style="padding: 6px 12px; font-size: 12px; color: #1F2937; border-bottom: 1px solid #E5E7EB; font-weight: 500;">${item.description}</td>
          <td style="padding: 6px 10px; text-align: center; font-size: 12px; color: #1F2937; border-bottom: 1px solid #E5E7EB;">${item.quantity}</td>
          <td style="padding: 6px 12px; text-align: right; font-size: 12px; color: #1F2937; border-bottom: 1px solid #E5E7EB;">${formatRupiah(item.unitPrice)}</td>
          <td style="padding: 6px 12px; text-align: right; font-size: 12px; color: #111827; border-bottom: 1px solid #E5E7EB; font-weight: 600;">${formatRupiah(item.total)}</td>
        </tr>
      `
    })
    .join('')

  const minRows = 8
  const emptyRows = Math.max(0, minRows - invoice.items.length)
  let emptyRowsHtml = ''
  for (let i = 0; i < emptyRows; i++) {
    const rowNum = invoice.items.length + i + 1
    const isOdd = rowNum % 2 !== 0
    const bg = isOdd ? '#F3F3F3' : '#FFFFFF'
    emptyRowsHtml += `
      <tr style="background-color: ${bg};">
        <td style="padding: 6px 10px; text-align: center; font-size: 11px; color: #9CA3AF; border-bottom: 1px solid #E5E7EB;">${rowNum}</td>
        <td style="padding: 6px 12px; border-bottom: 1px solid #E5E7EB;">&nbsp;</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #E5E7EB;">&nbsp;</td>
        <td style="padding: 6px 12px; border-bottom: 1px solid #E5E7EB;">&nbsp;</td>
        <td style="padding: 6px 12px; border-bottom: 1px solid #E5E7EB;">&nbsp;</td>
      </tr>
    `
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice - ${invoice.invoiceNumber}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            width: 100%;
            height: auto;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
          }
          body {
            font-family: 'Poppins', Arial, Helvetica, sans-serif;
            color: #111827;
            font-size: 12px;
            line-height: 1.4;
          }
          .invoice-box {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
            background: #ffffff;
          }
          .header-banner {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #F3F3F3;
            padding: 14px 18px;
            border-bottom: 4px solid #B7B7B7;
          }
          .company-title {
            font-size: 24px;
            font-weight: 800;
            color: #111827;
            letter-spacing: 0.5px;
          }
          .company-details {
            text-align: right;
            font-size: 11px;
            color: #666666;
            line-height: 1.45;
          }
          .company-phone {
            font-weight: 700;
            color: #4B5563;
          }
          .invoice-title-row {
            text-align: center;
            padding: 12px 0 8px 0;
          }
          .invoice-title {
            font-size: 20px;
            font-weight: 700;
            color: #666666;
          }
          .info-box {
            border: 1px solid #B7B7B7;
            padding: 10px 14px;
            margin-bottom: 14px;
            display: flex;
            justify-content: space-between;
            background: #ffffff;
          }
          .info-left {
            width: 50%;
          }
          .info-right {
            width: 45%;
            text-align: right;
          }
          .label-sub {
            font-size: 10px;
            color: #6B7280;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 2px;
          }
          .info-patient-name {
            font-size: 13px;
            font-weight: 700;
            color: #111827;
          }
          .info-patient-phone {
            font-size: 11px;
            font-weight: 500;
            color: #4B5563;
          }
          .meta-row {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            font-size: 11px;
            margin-bottom: 2px;
          }
          .meta-label {
            color: #4B5563;
          }
          .meta-value {
            font-weight: 700;
            color: #111827;
            min-width: 95px;
            text-align: left;
          }
          table.items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
          }
          table.items-table th {
            padding: 7px 10px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: #999999;
            background-color: #ffffff;
            border-bottom: 1px solid #B7B7B7;
          }
          .totals-container {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 16px;
          }
          .totals-table {
            width: 250px;
            font-size: 11px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 4px;
            border-bottom: 1px solid #D9D9D9;
          }
          .totals-row.subtotal {
            border-top: 1px solid #D9D9D9;
          }
          .totals-row.grand-total {
            background-color: #B7B7B7;
            color: #ffffff;
            font-weight: 700;
            font-size: 12px;
            padding: 6px 8px;
            border-bottom: 2px solid #FF6D01;
            margin-top: 3px;
          }
          .footer-signoff {
            text-align: right;
            margin-top: 20px;
            font-size: 11px;
          }
          .signoff-label {
            color: #4B5563;
            margin-bottom: 2px;
          }
          .signoff-name {
            font-size: 13px;
            font-weight: 800;
            color: #111827;
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header-banner">
            <div class="company-title">${invoice.companyName}</div>
            <div class="company-details">
              <div class="company-phone">${invoice.companyPhone}</div>
              <div>${invoice.companyEmail}</div>
              <div>${invoice.companyAddress}</div>
            </div>
          </div>

          <div class="invoice-title-row">
            <div class="invoice-title">Invoice</div>
          </div>

          <div class="info-box">
            <div class="info-left">
              <div class="label-sub">Kepada:</div>
              <div class="info-patient-name">${invoice.patientName || '-'}</div>
              <div class="info-patient-phone">${invoice.patientPhone || '-'}</div>
            </div>
            <div class="info-right">
              <div class="meta-row">
                <span class="meta-label">Invoice #</span>
                <span class="meta-value">: ${invoice.invoiceNumber}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Tanggal Pesanan</span>
                <span class="meta-value">: ${invoice.orderDate}</span>
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 36px; text-align: center;">No</th>
                <th style="text-align: left;">Deskripsi Barang</th>
                <th style="width: 60px; text-align: center;">Jumlah</th>
                <th style="width: 110px; text-align: right;">Harga Satuan</th>
                <th style="width: 110px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              ${emptyRowsHtml}
            </tbody>
          </table>

          <div class="totals-container">
            <div class="totals-table">
              <div class="totals-row subtotal">
                <span>Subtotal :</span>
                <strong>${formatRupiah(invoice.subtotal)}</strong>
              </div>
              <div class="totals-row">
                <span>Diskon :</span>
                <strong>${formatRupiah(invoice.discount)}</strong>
              </div>
              <div class="totals-row grand-total">
                <span>TOTAL :</span>
                <span>${formatRupiah(invoice.total)}</span>
              </div>
            </div>
          </div>

          <div class="footer-signoff">
            <div class="signoff-label">Best Regards,</div>
            <div class="signoff-name">${invoice.bestRegards}</div>
          </div>
        </div>
      </body>
    </html>
  `

  doc.open()
  doc.write(htmlContent)
  doc.close()

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    } catch (e) {
      console.error('Failed to trigger iframe print:', e)
      window.print()
    }
    setTimeout(() => {
      iframe.remove()
    }, 1500)
  }, 200)
}

export { formatRupiah }
