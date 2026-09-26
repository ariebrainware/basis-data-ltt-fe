import { renderHook, waitFor } from '@testing-library/react'
import {
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
