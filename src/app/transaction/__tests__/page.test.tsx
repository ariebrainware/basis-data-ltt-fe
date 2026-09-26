import React from 'react'
import { render, screen } from '@testing-library/react'
import TransactionPage from '../page'
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

describe('TransactionPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders transaction page header and metric summary cards', async () => {
    ;(apiFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          transactions: [
            {
              ID: 1,
              treatment_id: 10,
              patient_name: 'Budi Santoso',
              amount: 150000,
              payment_status: 'paid',
              notes: 'Selesai',
              transaction_date: '2026-05-01 10:00',
              treatment_date: '2026-05-01',
              therapist_name: 'Dr. John',
            },
          ],
          summary: {
            total_amount: 150000,
            payment_status_counts: {
              paid: 1,
              partial: 0,
              unpaid: 0,
            },
            therapist_patient_counts: [
              {
                therapist_name: 'Dr. John',
                patient_count: 1,
              },
            ],
          },
        },
      }),
    })

    render(<TransactionPage />)

    expect(screen.getByText('Daftar Transaksi')).toBeInTheDocument()
    expect(screen.getByText('Total Transaksi')).toBeInTheDocument()
    expect(screen.getByText('Status Pembayaran')).toBeInTheDocument()
    expect(screen.getByText('Pasien per Terapis')).toBeInTheDocument()

    expect(await screen.findByText('Rp 150.000')).toBeInTheDocument()
    expect(await screen.findByText('Lunas: 1')).toBeInTheDocument()
    expect(await screen.findByText('Dr. John: 1 Pasien')).toBeInTheDocument()
  })
})
