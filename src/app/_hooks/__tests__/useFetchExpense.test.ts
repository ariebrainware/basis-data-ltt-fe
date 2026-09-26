import { renderHook, waitFor } from '@testing-library/react'
import { useFetchExpense } from '../useFetchExpense'
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

describe('useFetchExpense hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches expenses and builds correct query parameters with keyword and category', async () => {
    ;(apiFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          expenses: [
            {
              ID: 1,
              expense_date: '2026-05-01',
              category: 'Operational',
              amount: 50000,
              description: 'Office supplies',
              payment_method: 'cash',
            },
          ],
          summary: {
            total_amount: 50000,
            total_count: 1,
            category_breakdown: [
              { category: 'Operational', total_amount: 50000, count: 1 },
            ],
          },
        },
      }),
    })

    const { result } = renderHook(() =>
      useFetchExpense(
        1,
        'supplies',
        'Operational',
        '2026-05-01',
        '2026-05-31',
        0
      )
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(apiFetch).toHaveBeenCalledWith(
      '/expense?limit=100&offset=0&keyword=supplies&category=Operational&start_date=2026-05-01&end_date=2026-05-31',
      { method: 'GET' }
    )
    expect(result.current.data).toHaveLength(1)
    expect(result.current.total).toBe(1)
    expect(result.current.summary?.total_amount).toBe(50000)
  })

  it('omits category parameter when category is empty or "all"', async () => {
    ;(apiFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          expenses: [],
          summary: { total_amount: 0, total_count: 0, category_breakdown: [] },
        },
      }),
    })

    const { result } = renderHook(() =>
      useFetchExpense(1, 'electricity', 'all', '', '', 0)
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(apiFetch).toHaveBeenCalledWith(
      '/expense?limit=100&offset=0&keyword=electricity',
      { method: 'GET' }
    )
  })

  it('handles flat array payload format correctly', async () => {
    ;(apiFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            ID: 2,
            expense_date: '2026-05-02',
            category: 'Salary',
            amount: 5000000,
            description: 'Monthly Staff Salary',
            payment_method: 'bank_transfer',
          },
        ],
        total: 1,
      }),
    })

    const { result } = renderHook(() => useFetchExpense(1, '', '', '', '', 0))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toHaveLength(1)
    expect(result.current.total).toBe(1)
  })
})
