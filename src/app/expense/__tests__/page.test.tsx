import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ExpensePage from '../page'
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

describe('ExpensePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders expense page elements, search box with placeholder, and category filter with Show All option', async () => {
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
              amount: 75000,
              description: 'Cleaning Supplies',
              payment_method: 'cash',
              notes: 'Monthly cleaning',
            },
          ],
          summary: {
            total_amount: 75000,
            total_count: 1,
            category_breakdown: [
              {
                category: 'Operational',
                total_amount: 75000,
                count: 1,
              },
            ],
          },
        },
      }),
    })

    render(<ExpensePage />)

    expect(screen.getByText('Daftar Pengeluaran')).toBeInTheDocument()
    expect(screen.getByText('Total Pengeluaran')).toBeInTheDocument()
    expect(screen.getByText('Jumlah Transaksi')).toBeInTheDocument()
    expect(screen.getByText('Kategori Terbanyak')).toBeInTheDocument()

    // Test search box input with placeholder and Enter key
    const searchInput = screen.getByTestId('expense-search-input')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute(
      'placeholder',
      'Cari deskripsi atau catatan...'
    )

    // Test Show All option is present
    expect(screen.getByText('Show All')).toBeInTheDocument()

    fireEvent.change(searchInput, { target: { value: 'Cleaning' } })
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining('keyword=Cleaning'),
        expect.anything()
      )
    })
  })
})
