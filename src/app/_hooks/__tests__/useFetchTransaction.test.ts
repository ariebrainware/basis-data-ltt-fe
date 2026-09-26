import { renderHook, waitFor } from '@testing-library/react'
import {
  calculatePaymentMethodBreakdown,
  formatPaymentMethodLabel,
  normalizeSummary,
  normalizeTransaction,
  useFetchTransaction,
} from '../useFetchTransaction'
import { apiFetch } from '../../_functions/apiFetch'

jest.mock('../../_functions/apiFetch', () => ({
  apiFetch: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

describe('useFetchTransaction and normalizers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('normalizeTransaction', () => {
    it('normalizes valid transaction object', () => {
      const input = {
        ID: 1,
        treatment_id: 10,
        patient_name: 'John Doe',
        payment_method: 'cash',
        amount: 150000,
        payment_status: 'paid',
        notes: 'Paid in full',
        transaction_date: '2026-05-01T10:00:00Z',
        treatment_date: '2026-05-01',
        therapist_name: 'Dr. Smith',
        items: [{ item_id: 1, quantity: 2, price: 50000 }],
        attachment_path: 'uploads/receipt.png',
      }

      const result = normalizeTransaction(input)
      expect(result.ID).toBe(1)
      expect(result.patient_name).toBe('John Doe')
      expect(result.amount).toBe(150000)
      expect(result.payment_status).toBe('paid')
      expect(result.items).toHaveLength(1)
    })

    it('handles empty / fallback values safely', () => {
      const result = normalizeTransaction(null)
      expect(result.ID).toBe(0)
      expect(result.patient_name).toBe('')
      expect(result.amount).toBe(0)
      expect(result.payment_status).toBe('')
      expect(result.items).toEqual([])
    })
  })

  describe('formatPaymentMethodLabel', () => {
    it('formats known payment methods correctly', () => {
      expect(formatPaymentMethodLabel('cash')).toBe('Cash / Tunai')
      expect(formatPaymentMethodLabel('transfer_or_qris')).toBe(
        'Transfer / QRIS'
      )
      expect(formatPaymentMethodLabel('transfer')).toBe('Transfer / QRIS')
      expect(formatPaymentMethodLabel('qris')).toBe('Transfer / QRIS')
      expect(formatPaymentMethodLabel('debit')).toBe('Debit')
      expect(formatPaymentMethodLabel('')).toBe('Lainnya / Belum Ditentukan')
      expect(formatPaymentMethodLabel('credit_card')).toBe('Credit Card')
    })
  })

  describe('calculatePaymentMethodBreakdown', () => {
    it('aggregates transactions correctly by payment method', () => {
      const transactions = [
        {
          ID: 1,
          treatment_id: 1,
          patient_name: 'A',
          pricing_name: 'cash',
          amount: 100000,
          payment_status: 'paid',
          notes: '',
          transaction_date: '',
          treatment_date: '',
        },
        {
          ID: 2,
          treatment_id: 2,
          patient_name: 'B',
          pricing_name: 'cash',
          amount: 50000,
          payment_status: 'paid',
          notes: '',
          transaction_date: '',
          treatment_date: '',
        },
        {
          ID: 3,
          treatment_id: 3,
          patient_name: 'C',
          pricing_name: 'transfer_or_qris',
          amount: 200000,
          payment_status: 'paid',
          notes: '',
          transaction_date: '',
          treatment_date: '',
        },
      ]

      const breakdown = calculatePaymentMethodBreakdown(transactions)
      expect(breakdown).toHaveLength(2)
      expect(breakdown[0].method).toBe('transfer_or_qris')
      expect(breakdown[0].label).toBe('Transfer / QRIS')
      expect(breakdown[0].total_amount).toBe(200000)
      expect(breakdown[0].count).toBe(1)

      expect(breakdown[1].method).toBe('cash')
      expect(breakdown[1].label).toBe('Cash / Tunai')
      expect(breakdown[1].total_amount).toBe(150000)
      expect(breakdown[1].count).toBe(2)
    })
  })

  describe('normalizeSummary', () => {
    it('normalizes valid summary data', () => {
      const rawSummary = {
        total_amount: 500000,
        payment_status_counts: {
          paid: 4,
          partial: 1,
          unpaid: 2,
        },
        therapist_patient_counts: [
          { therapist_name: 'Dr. Jane', patient_count: 5 },
        ],
        payment_method_breakdown: [
          { method: 'cash', count: 3, total_amount: 300000 },
        ],
      }

      const result = normalizeSummary(rawSummary)
      expect(result).not.toBeNull()
      expect(result?.total_amount).toBe(500000)
      expect(result?.payment_status_counts.paid).toBe(4)
      expect(result?.payment_status_counts.partial).toBe(1)
      expect(result?.payment_status_counts.unpaid).toBe(2)
      expect(result?.therapist_patient_counts).toEqual([
        { therapist_name: 'Dr. Jane', patient_count: 5 },
      ])
      expect(result?.payment_method_breakdown).toEqual([
        {
          method: 'cash',
          label: 'Cash / Tunai',
          count: 3,
          total_amount: 300000,
        },
      ])
    })

    it('returns null for null/invalid input', () => {
      expect(normalizeSummary(null)).toBeNull()
      expect(normalizeSummary('invalid')).toBeNull()
    })
  })

  describe('useFetchTransaction hook', () => {
    it('fetches and returns transactions with summary', async () => {
      ;(apiFetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            transactions: [
              {
                ID: 101,
                treatment_id: 1,
                patient_name: 'Alice',
                amount: 250000,
                payment_status: 'paid',
                payment_method: 'cash',
              },
            ],
            summary: {
              total_amount: 250000,
              payment_status_counts: {
                paid: 1,
                partial: 0,
                unpaid: 0,
              },
              therapist_patient_counts: [
                { therapist_name: 'Therapist A', patient_count: 1 },
              ],
            },
          },
        }),
      })

      const { result } = renderHook(() =>
        useFetchTransaction(1, '', '2026-05-01', '2026-05-02', 0)
      )

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toHaveLength(1)
      expect(result.current.data[0].patient_name).toBe('Alice')
      expect(result.current.summary?.total_amount).toBe(250000)
      expect(result.current.summary?.payment_status_counts.paid).toBe(1)
      expect(result.current.total).toBe(1)
    })
  })
})
