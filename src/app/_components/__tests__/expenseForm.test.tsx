import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExpenseForm } from '../expenseForm'
import { apiFetch } from '../../_functions/apiFetch'

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

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}))

jest.mock('../../_functions/apiFetch', () => ({
  apiFetch: jest.fn(),
}))

describe('ExpenseForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders form in add mode with default fields and correct description placeholder', () => {
    render(<ExpenseForm isEdit={false} />)

    expect(screen.getByLabelText('Tanggal Pengeluaran')).toBeInTheDocument()
    expect(screen.getByLabelText('Kategori Pengeluaran')).toBeInTheDocument()
    expect(screen.getByLabelText('Nominal (Rp)')).toBeInTheDocument()
    expect(screen.getByLabelText('Metode Pembayaran')).toBeInTheDocument()

    const descInput = screen.getByLabelText('Deskripsi / Keperluan')
    expect(descInput).toBeInTheDocument()
    expect(descInput).toHaveAttribute(
      'placeholder',
      expect.stringContaining('Pembayaran tagihan listrik')
    )
    expect(screen.getByText(/Unggah Bukti \/ Kwitansi/i)).toBeInTheDocument()
  })

  test('renders form in edit mode with prefilled values and attachments', () => {
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
    expect(screen.getByText('receipt.jpg')).toBeInTheDocument()
  })

  test('uploads attachment successfully and adds to attachment list', async () => {
    ;(apiFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          file_path: 'uploads/expenses/kwitansi_januari.pdf',
        },
      }),
    })

    const onUploadingChange = jest.fn()
    const { container } = render(
      <ExpenseForm isEdit={false} onUploadingChange={onUploadingChange} />
    )

    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    expect(fileInput).toBeInTheDocument()

    const file = new File(['dummy content'], 'kwitansi_januari.pdf', {
      type: 'application/pdf',
    })
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        '/expense/upload',
        expect.objectContaining({ method: 'POST' })
      )
    })

    expect(await screen.findByText('kwitansi_januari.pdf')).toBeInTheDocument()

    const hiddenInput = container.querySelector(
      '#add_receipt_url'
    ) as HTMLInputElement
    expect(hiddenInput.value).toBe('uploads/expenses/kwitansi_januari.pdf')
  })

  test('removes an attachment when delete button is clicked', () => {
    const { container } = render(
      <ExpenseForm
        isEdit={false}
        receipt_url="uploads/receipt1.png,uploads/receipt2.pdf"
      />
    )

    expect(screen.getByText('receipt1.png')).toBeInTheDocument()
    expect(screen.getByText('receipt2.pdf')).toBeInTheDocument()

    const deleteBtn = screen.getByLabelText('Hapus bukti 1')
    fireEvent.click(deleteBtn)

    expect(screen.queryByText('receipt1.png')).not.toBeInTheDocument()
    expect(screen.getByText('receipt2.pdf')).toBeInTheDocument()

    const hiddenInput = container.querySelector(
      '#add_receipt_url'
    ) as HTMLInputElement
    expect(hiddenInput.value).toBe('uploads/receipt2.pdf')
  })
})
