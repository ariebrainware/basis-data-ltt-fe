import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { ExpenseForm } from '../expenseForm'

jest.mock('@material-tailwind/react', () => ({
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

describe('ExpenseForm', () => {
  test('renders form in add mode with default fields', () => {
    render(<ExpenseForm isEdit={false} />)

    expect(screen.getByLabelText('Tanggal Pengeluaran')).toBeInTheDocument()
    expect(screen.getByLabelText('Kategori Pengeluaran')).toBeInTheDocument()
    expect(screen.getByLabelText('Nominal (Rp)')).toBeInTheDocument()
    expect(screen.getByLabelText('Metode Pembayaran')).toBeInTheDocument()
    expect(screen.getByLabelText('Deskripsi / Keperluan')).toBeInTheDocument()
  })

  test('renders form in edit mode with prefilled values', () => {
    render(
      <ExpenseForm
        ID={42}
        expense_date="2025-02-10"
        category="Medical Supplies"
        amount={350000}
        description="Beli perban dan alkohol"
        payment_method="cash"
        receipt_url="https://receipt.jpg"
        notes="Urgent"
        isEdit={true}
      />
    )

    expect(screen.getByLabelText('ID Pengeluaran')).toHaveValue('42')
    expect(screen.getByLabelText('Tanggal Pengeluaran')).toHaveValue(
      '2025-02-10'
    )
    expect(screen.getByLabelText('Nominal (Rp)')).toHaveValue(350000)
    expect(screen.getByLabelText('Deskripsi / Keperluan')).toHaveValue(
      'Beli perban dan alkohol'
    )
  })
})
