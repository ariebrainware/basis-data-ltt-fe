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
    <button onClick={props.onClick} disabled={props.disabled}>
      {props.children}
    </button>
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
    expect(JSON.parse(request.body)).toEqual({
      amount: 250000,
      remarks: 'catatan',
      payment_method: 'Paket Gold',
      payment_status: 'cash',
      items: [],
      attachment_path: '',
    })
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled())
  })

  test('submits PATCH payload with multiple attachment paths', async () => {
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
            attachment_path="uploads/attachments/receipt1.pdf,uploads/attachments/receipt2.png"
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
      amount: 250000,
      remarks: 'catatan',
      payment_method: 'Paket Gold',
      payment_status: 'cash',
      items: [],
      attachment_path:
        'uploads/attachments/receipt1.pdf,uploads/attachments/receipt2.png',
    })
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled())
  })

  test('disables Confirm button and rejects submission while attachment is uploading', async () => {
    let resolveUpload: (value: any) => void
    const uploadPromise = new Promise((resolve) => {
      resolveUpload = resolve
    })

    ;(apiFetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/transaction/upload') {
        return uploadPromise
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({}),
      })
    })

    const { container } = render(
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

    const confirmButton = screen.getByRole('button', { name: 'Confirm' })
    expect(confirmButton).toBeEnabled()

    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    const file = new File(['dummy receipt'], 'receipt_new.pdf', {
      type: 'application/pdf',
    })

    // Start upload
    fireEvent.change(fileInput, { target: { files: [file] } })

    // Confirm button should be disabled during upload
    expect(confirmButton).toBeDisabled()

    // Attempting to click Confirm while uploading should not trigger PATCH
    fireEvent.click(confirmButton)
    expect(apiFetch).toHaveBeenCalledTimes(1)
    expect((apiFetch as jest.Mock).mock.calls[0][0]).toBe('/transaction/upload')

    // Finish upload
    resolveUpload!({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          attachment_path: 'uploads/attachments/receipt_new.pdf',
        },
      }),
    })

    await waitFor(() => {
      expect(confirmButton).toBeEnabled()
    })

    // Now clicking Confirm should send PATCH with the newly uploaded attachment
    fireEvent.click(confirmButton)

    await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(2))
    const [patchUrl, patchRequest] = (apiFetch as jest.Mock).mock.calls[1]
    expect(patchUrl).toBe('/transaction/10')
    expect(patchRequest.method).toBe('PATCH')
    expect(JSON.parse(patchRequest.body)).toEqual({
      amount: 250000,
      remarks: 'catatan',
      payment_method: 'Paket Gold',
      payment_status: 'cash',
      items: [],
      attachment_path: 'uploads/attachments/receipt_new.pdf',
    })
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled())
  })
})
