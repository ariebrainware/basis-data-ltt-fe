import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TransactionForm } from '../transactionForm'
import { apiFetch } from '../../_functions/apiFetch'

// Mock Material Tailwind components
jest.mock('@material-tailwind/react', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  Input: (props: React.ComponentProps<'input'> & { label?: string }) => (
    <input
      {...props}
      id={props.id}
      data-testid={String(props.id)}
      aria-label={props.label}
    />
  ),
  Textarea: (props: React.ComponentProps<'textarea'> & { label?: string }) => (
    <textarea
      {...props}
      id={props.id}
      data-testid={String(props.id)}
      aria-label={props.label}
    />
  ),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}))

jest.mock('../../_functions/apiFetch', () => ({
  apiFetch: jest.fn(),
}))

describe('TransactionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.alert = jest.fn()
  })

  test('renders form fields with transaction data and single attachment', () => {
    render(
      <TransactionForm
        ID={1}
        treatment_id={100}
        patient_name="John Doe"
        pricing_name="cash"
        amount={150000}
        payment_status="paid"
        notes="Pembayaran lunas"
        transaction_date="2026-05-20 10:00"
        treatment_date="2026-05-20"
        attachment_path="uploads/attachments/receipt1.pdf"
      />
    )

    expect(screen.getByTestId('patient_name')).toHaveValue('John Doe')
    expect(screen.getByText('receipt1.pdf')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /lihat lampiran/i })
    ).toHaveAttribute(
      'href',
      expect.stringContaining('uploads/attachments/receipt1.pdf')
    )
    const hiddenAttachmentInput =
      document.querySelector<HTMLInputElement>('#attachment_path')
    expect(hiddenAttachmentInput?.value).toBe(
      'uploads/attachments/receipt1.pdf'
    )
  })

  test('renders multiple attachments and allows deleting one', () => {
    render(
      <TransactionForm
        ID={1}
        treatment_id={100}
        patient_name="John Doe"
        pricing_name="cash"
        amount={150000}
        payment_status="paid"
        notes="Pembayaran lunas"
        transaction_date="2026-05-20 10:00"
        treatment_date="2026-05-20"
        attachment_path="uploads/attachments/receipt1.pdf,uploads/attachments/receipt2.png"
      />
    )

    expect(screen.getByText('receipt1.pdf')).toBeInTheDocument()
    expect(screen.getByText('receipt2.png')).toBeInTheDocument()

    const deleteButtons = screen.getAllByRole('button', {
      name: /hapus lampiran/i,
    })
    expect(deleteButtons).toHaveLength(2)

    // Delete the first attachment
    fireEvent.click(deleteButtons[0])

    expect(screen.queryByText('receipt1.pdf')).not.toBeInTheDocument()
    expect(screen.getByText('receipt2.png')).toBeInTheDocument()

    const hiddenAttachmentInput =
      document.querySelector<HTMLInputElement>('#attachment_path')
    expect(hiddenAttachmentInput?.value).toBe(
      'uploads/attachments/receipt2.png'
    )
  })

  test('uploads attachment successfully via /transaction/upload', async () => {
    ;(apiFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          attachment_path: 'uploads/attachments/new_invoice.pdf',
        },
      }),
    })

    const { container } = render(
      <TransactionForm
        ID={1}
        treatment_id={100}
        patient_name="John Doe"
        pricing_name="cash"
        amount={150000}
        payment_status="paid"
        notes="Pembayaran lunas"
        transaction_date="2026-05-20 10:00"
        treatment_date="2026-05-20"
      />
    )

    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    expect(fileInput).toBeInTheDocument()

    const file = new File(['invoice content'], 'invoice.pdf', {
      type: 'application/pdf',
    })
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => expect(apiFetch).toHaveBeenCalled())
    const [url, options] = (apiFetch as jest.Mock).mock.calls[0]
    expect(url).toBe('/transaction/upload')
    expect(options.method).toBe('POST')

    await waitFor(() => {
      expect(screen.getByText('new_invoice.pdf')).toBeInTheDocument()
    })

    const hiddenAttachmentInput =
      document.querySelector<HTMLInputElement>('#attachment_path')
    expect(hiddenAttachmentInput?.value).toBe(
      'uploads/attachments/new_invoice.pdf'
    )
  })

  test('rejects files exceeding 5MB limit', async () => {
    const { container } = render(
      <TransactionForm
        ID={1}
        treatment_id={100}
        patient_name="John Doe"
        pricing_name="cash"
        amount={150000}
        payment_status="paid"
        notes="Pembayaran lunas"
        transaction_date="2026-05-20 10:00"
        treatment_date="2026-05-20"
      />
    )

    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    const largeFile = new File(['a'.repeat(6 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    })
    Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 })

    fireEvent.change(fileInput, { target: { files: [largeFile] } })

    expect(window.alert).toHaveBeenCalledWith('Ukuran file maksimal adalah 5MB')
    expect(apiFetch).not.toHaveBeenCalled()
  })
})
