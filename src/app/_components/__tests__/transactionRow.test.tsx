import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import TransactionRow from '../transactionRow'
import { apiFetch } from '../../_functions/apiFetch'

const mockRefresh = jest.fn()

jest.mock('@material-tailwind/react', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogBody: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Button: (props: any) => (
    <button onClick={props.onClick}>{props.children}</button>
  ),
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Input: (props: React.ComponentProps<'input'> & { label?: string }) => (
    <input {...props} aria-label={props.label} />
  ),
  Textarea: (props: React.ComponentProps<'textarea'> & { label?: string }) => (
    <textarea {...props} aria-label={props.label} />
  ),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

jest.mock('../../_functions/apiFetch', () => ({
  apiFetch: jest.fn(),
}))

jest.mock('../../_functions/unauthorized', () => ({
  UnauthorizedAccess: jest.fn(),
}))

jest.mock('sweetalert2', () => ({
  fire: jest.fn(() => Promise.resolve({})),
}))

describe('TransactionRow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(apiFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    })
  })

  test('submits PATCH payload preserving pricing_name from current row data', async () => {
    render(
      <table>
        <tbody>
          <TransactionRow
            ID={10}
            treatment_id={30}
            patient_name="Budi"
            pricing_name="Paket Gold"
            amount={250000}
            payment_status="cash"
            notes="catatan"
            transaction_date="2026-05-20 10:00"
            treatment_date="2026-05-21"
          />
        </tbody>
      </table>
    )

    fireEvent.click(screen.getByLabelText('Edit transaction'))
    fireEvent.click(screen.getByText('Confirm'))

    await waitFor(() => expect(apiFetch).toHaveBeenCalled())
    const [, request] = (apiFetch as jest.Mock).mock.calls[0]
    expect(request.method).toBe('PATCH')
    expect(JSON.parse(request.body)).toEqual({
      treatment_id: 30,
      patient_name: 'Budi',
      pricing_name: 'Paket Gold',
      amount: 250000,
      payment_status: 'cash',
      transaction_date: '2026-05-20 10:00',
      treatment_date: '2026-05-21',
      notes: 'catatan',
      items: [],
    })
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled())
  })
})
