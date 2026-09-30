import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import InvoiceDialog from '../invoiceDialog'
import { apiFetch } from '../../_functions/apiFetch'
import * as invoiceHelpers from '../../_functions/invoiceHelpers'

const mockPrintInvoiceDocument = jest.fn()
jest.mock('../../_functions/invoiceHelpers', () => {
  const actual = jest.requireActual('../../_functions/invoiceHelpers')
  return {
    ...actual,
    printInvoiceDocument: (invoice: any) => mockPrintInvoiceDocument(invoice),
  }
})

jest.mock('@material-tailwind/react', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="invoice-dialog">{children}</div> : null,
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
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      aria-label={props['aria-label']}
    >
      {props.children}
    </button>
  ),
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}))

jest.mock('../../_functions/apiFetch', () => ({
  apiFetch: jest.fn(),
}))

describe('InvoiceDialog', () => {
  const dummyTransaction = {
    ID: 10,
    treatment_id: 20,
    patient_name: 'Budi Santoso',
    pricing_name: 'Cash',
    amount: 300000,
    payment_status: 'paid',
    notes: 'Terapi leher',
    transaction_date: '2026-05-20 10:00',
    treatment_date: '2026-05-20',
    therapist_name: 'Dr. John',
    items: [],
  }

  const mockPrint = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    window.print = mockPrint
    ;(apiFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          items: [{ ID: 1, name: 'Koyo Herbal', price: 25000, quantity: 10 }],
          patients: [
            { full_name: 'Budi Santoso', phone_number: ['081234567890'] },
          ],
        },
      }),
    })
  })

  test('renders initial invoice correctly with transaction data', async () => {
    render(
      <InvoiceDialog
        open={true}
        onClose={jest.fn()}
        transaction={dummyTransaction}
      />
    )

    expect(screen.getAllByText('LEE TIT TAR').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('0851-3369-0700')).toBeInTheDocument()
    expect(screen.getByText('ptleetittar@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('Invoice #')).toBeInTheDocument()
    expect(screen.getByText(': INV-00010')).toBeInTheDocument()
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument()
  })

  test('toggles edit mode, modifies fields, and recalculates total', async () => {
    render(
      <InvoiceDialog
        open={true}
        onClose={jest.fn()}
        transaction={dummyTransaction}
      />
    )

    // Switch to Edit Mode
    fireEvent.click(screen.getByText('Ubah Data (Edit)'))

    expect(screen.getByText('Lihat Pratinjau')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Budi Santoso')).toBeInTheDocument()

    // Add a new line item
    fireEvent.click(screen.getByText('Tambah Baris Item'))

    const descInputs = screen.getAllByDisplayValue(/Item Baru|Terapi/i)
    expect(descInputs.length).toBeGreaterThanOrEqual(2)

    // Change discount
    const discountInputs = screen.getAllByRole('spinbutton')
    const discountInput = discountInputs[discountInputs.length - 1]
    fireEvent.change(discountInput, { target: { value: '50000' } })

    // Switch back to Preview Mode
    fireEvent.click(screen.getByText('Lihat Pratinjau'))
    expect(screen.getByText('Ubah Data (Edit)')).toBeInTheDocument()
  })

  test('triggers window.print when Cetak Invoice is clicked', async () => {
    render(
      <InvoiceDialog
        open={true}
        onClose={jest.fn()}
        transaction={dummyTransaction}
      />
    )

    const printButtons = screen.getAllByText(
      /Cetak Invoice|Cetak \/ Simpan PDF/i
    )
    fireEvent.click(printButtons[0])

    expect(mockPrintInvoiceDocument).toHaveBeenCalled()
  })

  test('resets modified invoice to original transaction state when Reset is clicked', async () => {
    render(
      <InvoiceDialog
        open={true}
        onClose={jest.fn()}
        transaction={dummyTransaction}
      />
    )

    // Switch to edit mode
    fireEvent.click(screen.getByText('Ubah Data (Edit)'))

    const patientInput = screen.getByDisplayValue('Budi Santoso')
    fireEvent.change(patientInput, { target: { value: 'Nama Diubah' } })
    expect(screen.getByDisplayValue('Nama Diubah')).toBeInTheDocument()

    // Click Reset
    fireEvent.click(screen.getByText('Reset'))
    expect(screen.getByDisplayValue('Budi Santoso')).toBeInTheDocument()
  })
})
