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
      screen.getByRole('button', { name: /lihat lampiran/i })
    ).toBeInTheDocument()
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

  test('handles upload failure and alerts backend error message', async () => {
    const originalAlert = window.alert
    window.alert = jest.fn()
    ;(apiFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        msg: 'Failed to create upload directory',
        error: 'mkdir storage: permission denied',
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
    const file = new File(['invoice content'], 'invoice.pdf', {
      type: 'application/pdf',
    })
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Failed to create upload directory'
      )
    })
    window.alert = originalAlert
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

  test('does not overwrite local attachment deletion when transaction details request resolves', async () => {
    const originalEnv = process.env.NODE_ENV
    ;(process.env as Record<string, string | undefined>).NODE_ENV =
      'development'
    try {
      let resolveTransactionDetails: (value: any) => void
      const transactionDetailsPromise = new Promise((resolve) => {
        resolveTransactionDetails = resolve
      })

      ;(apiFetch as jest.Mock).mockImplementation((url: string) => {
        if (url === '/item?limit=1000') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: [] }),
          })
        }
        if (url === '/transaction/1') {
          return transactionDetailsPromise
        }
        return Promise.resolve({ ok: true, json: async () => ({}) })
      })

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
          attachment_path="uploads/attachments/old_receipt.pdf"
        />
      )

      expect(screen.getByText('old_receipt.pdf')).toBeInTheDocument()

      // User deletes the old receipt while request is in flight
      const deleteBtn = screen.getByRole('button', { name: /hapus lampiran/i })
      fireEvent.click(deleteBtn)
      expect(screen.queryByText('old_receipt.pdf')).not.toBeInTheDocument()

      // Transaction details request resolves with server attachment
      resolveTransactionDetails!({
        ok: true,
        json: async () => ({
          data: {
            attachment_path: 'uploads/attachments/server_receipt.pdf',
          },
        }),
      })

      await waitFor(() => {
        expect(apiFetch).toHaveBeenCalledWith('/transaction/1', {
          method: 'GET',
        })
      })

      // Ensure server response did not restore attachment list
      expect(screen.queryByText('server_receipt.pdf')).not.toBeInTheDocument()
      expect(screen.queryByText('old_receipt.pdf')).not.toBeInTheDocument()
      const hiddenAttachmentInput =
        document.querySelector<HTMLInputElement>('#attachment_path')
      expect(hiddenAttachmentInput?.value).toBe('')
    } finally {
      ;(process.env as Record<string, string | undefined>).NODE_ENV =
        originalEnv
    }
  })

  test('does not overwrite locally uploaded attachment when transaction details request resolves', async () => {
    const originalEnv = process.env.NODE_ENV
    ;(process.env as Record<string, string | undefined>).NODE_ENV =
      'development'
    try {
      let resolveTransactionDetails: (value: any) => void
      const transactionDetailsPromise = new Promise((resolve) => {
        resolveTransactionDetails = resolve
      })

      ;(apiFetch as jest.Mock).mockImplementation((url: string) => {
        if (url === '/item?limit=1000') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: [] }),
          })
        }
        if (url === '/transaction/1') {
          return transactionDetailsPromise
        }
        if (url === '/transaction/upload') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              data: {
                attachment_path: 'uploads/attachments/new_upload.pdf',
              },
            }),
          })
        }
        return Promise.resolve({ ok: true, json: async () => ({}) })
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
      const file = new File(['upload content'], 'new_upload.pdf', {
        type: 'application/pdf',
      })
      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('new_upload.pdf')).toBeInTheDocument()
      })

      // Transaction details request resolves with old server attachment
      resolveTransactionDetails!({
        ok: true,
        json: async () => ({
          data: {
            attachment_path: 'uploads/attachments/old_server_receipt.pdf',
          },
        }),
      })

      await waitFor(() => {
        expect(apiFetch).toHaveBeenCalledWith('/transaction/1', {
          method: 'GET',
        })
      })

      // Server response should not overwrite the new upload
      expect(screen.getByText('new_upload.pdf')).toBeInTheDocument()
      expect(
        screen.queryByText('old_server_receipt.pdf')
      ).not.toBeInTheDocument()
      const hiddenAttachmentInput =
        document.querySelector<HTMLInputElement>('#attachment_path')
      expect(hiddenAttachmentInput?.value).toBe(
        'uploads/attachments/new_upload.pdf'
      )
    } finally {
      ;(process.env as Record<string, string | undefined>).NODE_ENV =
        originalEnv
    }
  })

  test('calls onUploadingChange when upload starts and completes', async () => {
    let resolveUpload: (value: any) => void
    const uploadPromise = new Promise((resolve) => {
      resolveUpload = resolve
    })

    ;(apiFetch as jest.Mock).mockReturnValueOnce(uploadPromise)

    const onUploadingChange = jest.fn()

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
        onUploadingChange={onUploadingChange}
      />
    )

    // Initial state is false
    expect(onUploadingChange).toHaveBeenLastCalledWith(false)

    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    const file = new File(['upload content'], 'new_receipt.pdf', {
      type: 'application/pdf',
    })
    fireEvent.change(fileInput, { target: { files: [file] } })

    // When upload starts
    await waitFor(() => {
      expect(onUploadingChange).toHaveBeenLastCalledWith(true)
    })

    // Resolve upload
    resolveUpload!({
      ok: true,
      json: async () => ({
        data: {
          attachment_path: 'uploads/attachments/new_receipt.pdf',
        },
      }),
    })

    // When upload finishes
    await waitFor(() => {
      expect(onUploadingChange).toHaveBeenLastCalledWith(false)
    })
  })

  test('renders storage/attachments paths and allows clicking Lihat Lampiran', async () => {
    const originalOpen = window.open
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL
    window.open = jest.fn()
    URL.createObjectURL = jest
      .fn()
      .mockReturnValue('blob:http://localhost/mock')
    URL.revokeObjectURL = jest.fn()
    window.localStorage.setItem('session-token', 'test-token')
    ;(global.fetch as any) = jest.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['pdf content']),
    })

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
        attachment_path="storage/attachments/1789201450665503000_IMG_2438.JPG"
      />
    )

    expect(
      screen.getByText('1789201450665503000_IMG_2438.JPG')
    ).toBeInTheDocument()

    const button = screen.getByRole('button', { name: /lihat lampiran/i })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          'storage/attachments/1789201450665503000_IMG_2438.JPG'
        ),
        expect.objectContaining({
          headers: expect.objectContaining({
            'session-token': 'test-token',
          }),
        })
      )
    })

    window.open = originalOpen
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  test('renders storage/attachments paths and allows clicking Unduh to download with proper filename', async () => {
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL
    URL.createObjectURL = jest
      .fn()
      .mockReturnValue('blob:http://localhost/mock-download')
    URL.revokeObjectURL = jest.fn()
    window.localStorage.setItem('session-token', 'test-token')
    ;(global.fetch as any) = jest.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['image content']),
      headers: new Headers({ 'content-type': 'image/jpeg' }),
    })

    let downloadedFilename = ''
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloadedFilename = this.download
      })

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
        attachment_path="storage/attachments/1789201450665503000_IMG_2438.JPG"
      />
    )

    const unduhButton = screen.getByRole('button', { name: /unduh/i })
    expect(unduhButton).toBeInTheDocument()

    fireEvent.click(unduhButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          'storage/attachments/1789201450665503000_IMG_2438.JPG'
        ),
        expect.objectContaining({
          headers: expect.objectContaining({
            'session-token': 'test-token',
          }),
        })
      )
      expect(clickSpy).toHaveBeenCalled()
      expect(downloadedFilename).toBe('1789201450665503000_IMG_2438.JPG')
    })

    clickSpy.mockRestore()
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  test('calls onAttachmentChange when new attachment is uploaded and when deleted', async () => {
    const onAttachmentChangeMock = jest.fn()
    ;(apiFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          file_path: 'storage/attachments/newly_uploaded.pdf',
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
        attachment_path="storage/attachments/existing.pdf"
        onAttachmentChange={onAttachmentChangeMock}
      />
    )

    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    const file = new File(['pdf-content'], 'test.pdf', {
      type: 'application/pdf',
    })
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(onAttachmentChangeMock).toHaveBeenCalledWith(
        'storage/attachments/existing.pdf,storage/attachments/newly_uploaded.pdf'
      )
    })

    // Now delete the first attachment
    const deleteButtons = screen.getAllByRole('button', {
      name: /hapus lampiran/i,
    })
    expect(deleteButtons.length).toBe(2)
    fireEvent.click(deleteButtons[0])

    expect(onAttachmentChangeMock).toHaveBeenCalledWith(
      'storage/attachments/newly_uploaded.pdf'
    )
  })

  test('falls back to /patient/upload when /transaction/upload returns 404', async () => {
    const onAttachmentChangeMock = jest.fn()
    ;(apiFetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          msg: 'Route not found',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            file_path: 'uploads/attachments/fallback_upload.pdf',
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
        onAttachmentChange={onAttachmentChangeMock}
      />
    )

    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    const file = new File(['pdf-content'], 'test.pdf', {
      type: 'application/pdf',
    })
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        '/transaction/upload',
        expect.any(Object)
      )
      expect(apiFetch).toHaveBeenCalledWith(
        '/patient/upload',
        expect.any(Object)
      )
      expect(onAttachmentChangeMock).toHaveBeenCalledWith(
        'uploads/attachments/fallback_upload.pdf'
      )
    })
  })
})
