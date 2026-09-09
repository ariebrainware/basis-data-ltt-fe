import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import ExpenseRow from '../expenseRow'
import { apiFetch } from '../../_functions/apiFetch'

const mockRefresh = jest.fn()
const mockDeleteExpense = jest.fn()

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
  Select: ({
    children,
    onChange,
    label,
    value,
    id,
  }: {
    children: React.ReactNode
    onChange?: (v?: string) => void
    label?: string
    value?: string
    id?: string
  }) => (
    <select
      id={id}
      data-testid={id}
      aria-label={label}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
    >
      {children}
    </select>
  ),
  Option: ({
    value,
    children,
  }: {
    value: string
    children: React.ReactNode
  }) => <option value={value}>{children}</option>,
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh, replace: jest.fn() }),
}))

jest.mock('../../_functions/apiFetch', () => ({
  apiFetch: jest.fn(),
}))

jest.mock('../../_functions/unauthorized', () => ({
  UnauthorizedAccess: jest.fn(),
}))

jest.mock('../../_hooks/useDeleteResource', () => ({
  useDeleteResource: () => mockDeleteExpense,
}))

jest.mock('sweetalert2', () => ({
  fire: jest.fn(() => Promise.resolve({ isConfirmed: true })),
}))

describe('ExpenseRow', () => {
  const mockOnDataChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(apiFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    })
  })

  test('renders expense row data properly', () => {
    render(
      <table>
        <tbody>
          <ExpenseRow
            ID={10}
            expense_date="2025-01-15"
            category="Operational"
            amount={150000}
            description="Tagihan listrik"
            payment_method="bank_transfer"
            receipt_url="https://receipt.jpg"
            notes="Lunas"
            onDataChange={mockOnDataChange}
          />
        </tbody>
      </table>
    )

    expect(screen.getByText('#10')).toBeInTheDocument()
    expect(screen.getByText('2025-01-15')).toBeInTheDocument()
    expect(screen.getAllByText('Operational')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Tagihan listrik')[0]).toBeInTheDocument()
    expect(screen.getByText('bank transfer')).toBeInTheDocument()
    expect(screen.getByText('Rp 150.000')).toBeInTheDocument()
    expect(screen.getByText('Lihat Bukti')).toBeInTheDocument()
    expect(screen.getAllByText('Lunas')[0]).toBeInTheDocument()
  })

  test('submits PATCH when editing and saving changes', async () => {
    render(
      <table>
        <tbody>
          <ExpenseRow
            ID={10}
            expense_date="2025-01-15"
            category="Operational"
            amount={150000}
            description="Tagihan listrik"
            payment_method="bank_transfer"
            onDataChange={mockOnDataChange}
          />
        </tbody>
      </table>
    )

    fireEvent.click(screen.getByLabelText('Edit expense'))
    fireEvent.click(screen.getByText('Simpan Perubahan'))

    await waitFor(() => expect(apiFetch).toHaveBeenCalled())
    const [endpoint, request] = (apiFetch as jest.Mock).mock.calls[0]
    expect(endpoint).toBe('/expense/10')
    expect(request.method).toBe('PATCH')
    const payload = JSON.parse(request.body)
    expect(payload.category).toBe('Operational')
    expect(payload.amount).toBe(150000)
    expect(payload.description).toBe('Tagihan listrik')
    await waitFor(() => expect(mockOnDataChange).toHaveBeenCalled())
  })

  test('triggers delete handler when delete button is clicked', () => {
    render(
      <table>
        <tbody>
          <ExpenseRow
            ID={10}
            expense_date="2025-01-15"
            category="Operational"
            amount={150000}
            description="Tagihan listrik"
            payment_method="bank_transfer"
          />
        </tbody>
      </table>
    )

    fireEvent.click(screen.getByLabelText('Delete expense'))
    expect(mockDeleteExpense).toHaveBeenCalled()
  })
})
