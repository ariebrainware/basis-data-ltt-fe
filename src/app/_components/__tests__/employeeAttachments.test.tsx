import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Swal from 'sweetalert2'
import EmployeeAttachments from '../employeeAttachments'
import {
  deleteEmployeeAttachment,
  listEmployeeAttachments,
  uploadEmployeeAttachment,
} from '../../_functions/employeeAttachmentService'
import { viewAttachment } from '../../_functions/viewAttachment'

const mockRouter = { replace: jest.fn(), push: jest.fn() }
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

jest.mock('sweetalert2', () => ({
  __esModule: true,
  default: { fire: jest.fn() },
}))

jest.mock('../../_functions/viewAttachment', () => ({
  viewAttachment: jest.fn(),
  downloadAttachment: jest.fn(),
}))

jest.mock('../../_functions/unauthorized', () => ({
  UnauthorizedAccess: jest.fn(),
}))

jest.mock('../../_functions/employeeAttachmentService', () => {
  const actual = jest.requireActual(
    '../../_functions/employeeAttachmentService'
  )
  return {
    ...actual,
    listEmployeeAttachments: jest.fn(),
    uploadEmployeeAttachment: jest.fn(),
    deleteEmployeeAttachment: jest.fn(),
  }
})

const mockList = listEmployeeAttachments as jest.Mock
const mockUpload = uploadEmployeeAttachment as jest.Mock
const mockDelete = deleteEmployeeAttachment as jest.Mock
const mockFire = Swal.fire as jest.Mock

const contract = {
  ID: 1,
  CreatedAt: '2026-11-20T10:00:00Z',
  employee_id: 5,
  category: 'contract',
  file_name: 'kontrak.pdf',
  content_type: 'application/pdf',
  size: 2048,
}

describe('EmployeeAttachments', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows an empty state', async () => {
    mockList.mockResolvedValue([])
    render(<EmployeeAttachments employeeId={5} />)
    expect(
      await screen.findByText('Belum ada dokumen untuk karyawan ini.')
    ).toBeInTheDocument()
    expect(mockList).toHaveBeenCalledWith(5)
  })

  it('lists attachments and opens one for viewing', async () => {
    mockList.mockResolvedValue([contract])
    render(<EmployeeAttachments employeeId={5} />)

    expect(await screen.findByText('kontrak.pdf')).toBeInTheDocument()
    expect(screen.getByText(/Kontrak Kerja · 2.0 KB/)).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Lihat kontrak.pdf'))
    expect(viewAttachment).toHaveBeenCalledWith(
      '/employee/5/attachment/1',
      'kontrak.pdf'
    )
  })

  it('uploads the chosen file with the chosen category', async () => {
    mockList.mockResolvedValue([])
    mockUpload.mockResolvedValue({ ...contract, ID: 2, category: 'identity' })
    render(<EmployeeAttachments employeeId={5} />)
    await screen.findByText('Belum ada dokumen untuk karyawan ini.')

    const uploadButton = screen.getByRole('button', { name: 'Unggah' })
    expect(uploadButton).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Jenis dokumen'), {
      target: { value: 'identity' },
    })
    const file = new File(['%PDF-1.4'], 'ktp.pdf', { type: 'application/pdf' })
    fireEvent.change(screen.getByLabelText('File'), {
      target: { files: [file] },
    })
    expect(uploadButton).toBeEnabled()
    fireEvent.click(uploadButton)

    await waitFor(() =>
      expect(mockUpload).toHaveBeenCalledWith(5, file, 'identity')
    )
    expect(await screen.findByText('kontrak.pdf')).toBeInTheDocument()
  })

  it('rejects unsupported files before upload', async () => {
    mockList.mockResolvedValue([])
    render(<EmployeeAttachments employeeId={5} />)
    await screen.findByText('Belum ada dokumen untuk karyawan ini.')

    fireEvent.change(screen.getByLabelText('File'), {
      target: { files: [new File(['x'], 'cv.docx')] },
    })
    expect(mockFire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: 'warning' })
    )
    expect(screen.getByRole('button', { name: 'Unggah' })).toBeDisabled()
  })

  it('deletes after confirmation', async () => {
    mockList.mockResolvedValue([contract])
    mockDelete.mockResolvedValue(undefined)
    mockFire.mockResolvedValue({ isConfirmed: true })
    render(<EmployeeAttachments employeeId={5} />)

    fireEvent.click(await screen.findByLabelText('Hapus kontrak.pdf'))

    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(5, 1))
    await waitFor(() =>
      expect(screen.queryByText('kontrak.pdf')).not.toBeInTheDocument()
    )
  })

  it('keeps the file when deletion is cancelled', async () => {
    mockList.mockResolvedValue([contract])
    mockFire.mockResolvedValue({ isConfirmed: false })
    render(<EmployeeAttachments employeeId={5} />)

    fireEvent.click(await screen.findByLabelText('Hapus kontrak.pdf'))
    await waitFor(() => expect(mockFire).toHaveBeenCalled())
    expect(mockDelete).not.toHaveBeenCalled()
    expect(screen.getByText('kontrak.pdf')).toBeInTheDocument()
  })

  it('shows a retry option when loading fails', async () => {
    mockList
      .mockRejectedValueOnce(new Error('Server down'))
      .mockResolvedValueOnce([contract])
    render(<EmployeeAttachments employeeId={5} />)

    fireEvent.click(await screen.findByText('Coba lagi'))
    expect(await screen.findByText('kontrak.pdf')).toBeInTheDocument()
  })
})
