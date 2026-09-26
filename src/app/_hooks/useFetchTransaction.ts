import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../_functions/apiFetch'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import {
  PaymentMethodBreakdown,
  TransactionSummary,
  TransactionType,
} from '../_types/transaction'

export interface ListTransactionResponse {
  data: TransactionType[]
  summary: TransactionSummary | null
  total: number
  loading: boolean
}

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatDate(value: unknown): string {
  if (value === null || value === undefined || value === '') return ''
  const v = String(value)
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return v
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`
}

export function normalizeTransaction(item: any): TransactionType {
  return {
    ID: toNumber(item?.ID ?? item?.id),
    treatment_id: toNumber(item?.treatment_id),
    patient_name: String(item?.patient_name ?? ''),
    pricing_name: String(
      item?.payment_method ?? item?.pricing_name ?? item?.price_name ?? ''
    ),
    amount: toNumber(item?.amount ?? item?.price),
    payment_status: String(item?.payment_status ?? item?.status ?? ''),
    notes: String(item?.remarks ?? item?.notes ?? item?.remark ?? ''),
    transaction_date: formatDate(
      item?.transaction_date ??
        item?.CreatedAt ??
        item?.created_at ??
        item?.date ??
        ''
    ),
    treatment_date: String(
      item?.treatment_date ?? item?.therapy_date ?? item?.service_date ?? ''
    ),
    therapist_name: String(item?.therapist_name ?? ''),
    items: Array.isArray(item?.items)
      ? item.items.map((i: any) => ({
          item_id: toNumber(i?.item_id ?? i?.ItemID),
          quantity: toNumber(i?.quantity ?? i?.Quantity),
          price: i?.price !== undefined ? toNumber(i.price) : undefined,
        }))
      : [],
    attachment_path: String(item?.attachment_path ?? ''),
  }
}

export function formatPaymentMethodLabel(method: string): string {
  if (!method || method.trim() === '') return 'Lainnya / Belum Ditentukan'
  const lower = method.trim().toLowerCase()
  if (lower === 'cash') return 'Cash / Tunai'
  if (
    lower === 'transfer_or_qris' ||
    lower === 'transfer' ||
    lower === 'qris'
  ) {
    return 'Transfer / QRIS'
  }
  if (lower === 'debit') return 'Debit'
  return method
    .replace(/[_\-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export function calculatePaymentMethodBreakdown(
  transactions: TransactionType[]
): PaymentMethodBreakdown[] {
  const methodMap = new Map<string, { count: number; total_amount: number }>()

  for (const item of transactions) {
    const rawMethod = item.pricing_name || 'other'
    const normalizedKey = rawMethod.trim().toLowerCase() || 'other'
    const existing = methodMap.get(normalizedKey) || {
      count: 0,
      total_amount: 0,
    }
    methodMap.set(normalizedKey, {
      count: existing.count + 1,
      total_amount: existing.total_amount + (Number(item.amount) || 0),
    })
  }

  return Array.from(methodMap.entries())
    .map(([method, stats]) => ({
      method,
      label: formatPaymentMethodLabel(method),
      count: stats.count,
      total_amount: stats.total_amount,
    }))
    .sort((a, b) => b.total_amount - a.total_amount)
}

export function normalizeSummary(rawSummary: any): TransactionSummary | null {
  if (!rawSummary || typeof rawSummary !== 'object') return null
  return {
    total_amount: toNumber(rawSummary.total_amount),
    payment_status_counts: {
      paid: toNumber(rawSummary.payment_status_counts?.paid),
      partial: toNumber(rawSummary.payment_status_counts?.partial),
      unpaid: toNumber(rawSummary.payment_status_counts?.unpaid),
    },
    therapist_patient_counts: Array.isArray(rawSummary.therapist_patient_counts)
      ? rawSummary.therapist_patient_counts.map((t: any) => ({
          therapist_name: String(t?.therapist_name ?? ''),
          patient_count: toNumber(t?.patient_count),
        }))
      : [],
    payment_method_breakdown: Array.isArray(rawSummary.payment_method_breakdown)
      ? rawSummary.payment_method_breakdown.map((pm: any) => ({
          method: String(pm?.method ?? ''),
          label: formatPaymentMethodLabel(
            String(pm?.label ?? pm?.method ?? '')
          ),
          count: toNumber(pm?.count),
          total_amount: toNumber(pm?.total_amount),
        }))
      : undefined,
  }
}

export function useFetchTransaction(
  currentPage: number,
  keyword: string,
  startDate: string,
  endDate: string,
  refreshTrigger: number
): ListTransactionResponse {
  const [transaction, setTransaction] = useState<TransactionType[]>([])
  const [summary, setSummary] = useState<TransactionSummary | null>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setLoading(true)
        const limit = 100
        const offset = (currentPage - 1) * limit
        let params = `limit=${limit}&offset=${offset}`
        if (keyword && keyword.trim() !== '') {
          params += `&keyword=${encodeURIComponent(keyword.trim())}`
        }

        const trimmedStart = startDate ? startDate.trim() : ''
        const trimmedEnd = endDate ? endDate.trim() : ''

        if (trimmedStart && trimmedEnd) {
          params += `&start_date=${encodeURIComponent(trimmedStart)}&end_date=${encodeURIComponent(trimmedEnd)}`
        } else if (trimmedStart && !trimmedEnd) {
          params += `&start_date=${encodeURIComponent(trimmedStart)}&end_date=${encodeURIComponent(trimmedStart)}`
        } else if (!trimmedStart && trimmedEnd) {
          params += `&start_date=${encodeURIComponent(trimmedEnd)}&end_date=${encodeURIComponent(trimmedEnd)}`
        }

        const res = await apiFetch(`/transaction?${params}`, { method: 'GET' })
        if (res.status === 401) {
          UnauthorizedAccess(router)
          return
        }
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
        const responseData = await res.json()

        const payload = responseData?.data

        let rawArray: any[] = []
        let rawSummary: any = null

        if (payload) {
          if (Array.isArray(payload)) {
            rawArray = payload
          } else if (Array.isArray(payload.transactions)) {
            rawArray = payload.transactions
            rawSummary = payload.summary
          } else if (Array.isArray(payload.transaction)) {
            rawArray = payload.transaction
            rawSummary = payload.summary
          }
        }

        if (!rawSummary && responseData?.summary) {
          rawSummary = responseData.summary
        }

        const transactionArray = rawArray.map(normalizeTransaction)
        const parsedSummary = normalizeSummary(rawSummary)

        if (isMounted) {
          setTransaction(transactionArray)
          setSummary(parsedSummary)

          const totalFromCounts = parsedSummary?.payment_status_counts
            ? parsedSummary.payment_status_counts.paid +
              parsedSummary.payment_status_counts.partial +
              parsedSummary.payment_status_counts.unpaid
            : null

          const finalTotal =
            totalFromCounts ??
            responseData?.data?.total ??
            responseData?.total ??
            offset + transactionArray.length

          setTotal(finalTotal)
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          UnauthorizedAccess(router)
        }
        console.error('Error fetching transaction:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    })()

    return () => {
      isMounted = false
    }
  }, [currentPage, keyword, startDate, endDate, router, refreshTrigger])

  return { data: transaction, summary, total, loading }
}
