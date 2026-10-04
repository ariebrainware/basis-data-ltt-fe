import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { isTherapist, isAdmin } from '../../_functions/userRole'
import { getUserId, getTherapistId } from '../../_functions/userId'
import Treatment from '../treatmentRow'
import { TreatmentType } from '../../_types/treatment'

import { apiFetch } from '../../_functions/apiFetch'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
    replace: jest.fn(),
  }),
}))

jest.mock('../../_functions/apiFetch', () => ({
  apiFetch: jest.fn(),
}))

jest.mock('sweetalert2', () => ({
  fire: jest.fn(() => Promise.resolve({ isConfirmed: true })),
}))

// Mock Material Tailwind elements
jest.mock('@material-tailwind/react', () => ({
  Button: ({ children, disabled, onClick }: any) => (
    <button disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
  Dialog: ({ children, open }: any) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogBody: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}))

// Mock Sub-components
jest.mock('../treatmentForm', () => ({
  TreatmentForm: (props: any) => (
    <div
      data-testid="treatment-form"
      data-attachment-path={props.attachment_path}
    >
      <button
        data-testid="upload-mock-btn"
        onClick={() =>
          props.onAttachmentChange &&
          props.onAttachmentChange('uploads/attachments/new_file.pdf')
        }
      >
        Upload File
      </button>
    </div>
  ),
}))

// Mock role and ID helpers
jest.mock('../../_functions/userRole', () => ({
  isTherapist: jest.fn(),
  isAdmin: jest.fn(),
  getUserRole: jest.fn(),
}))

jest.mock('../../_functions/userId', () => ({
  getUserId: jest.fn(),
  getTherapistId: jest.fn(),
}))

describe('Treatment Row Component', () => {
  const mockTreatment: TreatmentType = {
    ID: '1',
    treatment_date: '2024-01-15',
    patient_code: 123,
    patient_name: 'John Doe',
    therapist_name: 'Dr. Jane Smith',
    therapist_id: '10',
    issues: 'Back pain',
    treatment: 'Massage therapy',
    remarks: 'Patient responding well',
    next_visit: '2024-01-22',
    age: 42,
    gender: 'male',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders treatment details correctly', () => {
    ;(isAdmin as jest.Mock).mockReturnValue(false)
    ;(isTherapist as jest.Mock).mockReturnValue(false)

    render(
      <table>
        <tbody>
          <Treatment {...mockTreatment} />
        </tbody>
      </table>
    )

    expect(screen.getByText('John Doe (123)')).toBeInTheDocument()
    expect(screen.getByText('42 tahun • Laki-laki')).toBeInTheDocument()
    expect(screen.getByText('Back pain')).toBeInTheDocument()
    expect(screen.getByText('Dr. Jane Smith (10)')).toBeInTheDocument()
  })

  test('shows view button (enabled) for normal users', () => {
    ;(isAdmin as jest.Mock).mockReturnValue(false)
    ;(isTherapist as jest.Mock).mockReturnValue(false)

    render(
      <table>
        <tbody>
          <Treatment {...mockTreatment} />
        </tbody>
      </table>
    )

    const viewBtn = screen.getByRole('button', { name: /view treatment/i })
    expect(viewBtn).not.toBeDisabled()
  })

  test('enables edit button for super admins', () => {
    ;(isAdmin as jest.Mock).mockReturnValue(true)
    ;(isTherapist as jest.Mock).mockReturnValue(false)

    render(
      <table>
        <tbody>
          <Treatment {...mockTreatment} />
        </tbody>
      </table>
    )

    const editBtn = screen.getByRole('button', { name: /edit treatment/i })
    expect(editBtn).not.toBeDisabled()
  })

  test('enables edit button for therapist owner', () => {
    ;(isAdmin as jest.Mock).mockReturnValue(false)
    ;(isTherapist as jest.Mock).mockReturnValue(true)
    ;(getTherapistId as jest.Mock).mockReturnValue('10') // matches therapist_id

    render(
      <table>
        <tbody>
          <Treatment {...mockTreatment} />
        </tbody>
      </table>
    )

    const editBtn = screen.getByRole('button', { name: /edit treatment/i })
    expect(editBtn).not.toBeDisabled()
  })

  test('shows view button (enabled) for therapist non-owner', () => {
    ;(isAdmin as jest.Mock).mockReturnValue(false)
    ;(isTherapist as jest.Mock).mockReturnValue(true)
    ;(getTherapistId as jest.Mock).mockReturnValue('20') // different from therapist_id 10

    render(
      <table>
        <tbody>
          <Treatment {...mockTreatment} />
        </tbody>
      </table>
    )

    const viewBtn = screen.getByRole('button', { name: /view treatment/i })
    expect(viewBtn).not.toBeDisabled()
  })

  test('passes attachment_path to TreatmentForm when dialog opens', async () => {
    ;(isAdmin as jest.Mock).mockReturnValue(true)

    const treatmentWithAttachment: TreatmentType = {
      ...mockTreatment,
      attachment_path: 'uploads/attachments/history.pdf',
    }

    render(
      <table>
        <tbody>
          <Treatment {...treatmentWithAttachment} />
        </tbody>
      </table>
    )

    const editBtn = screen.getByRole('button', { name: /edit treatment/i })
    fireEvent.click(editBtn)

    await waitFor(() => {
      const form = screen.getByTestId('treatment-form')
      expect(form).toHaveAttribute(
        'data-attachment-path',
        'uploads/attachments/history.pdf'
      )
    })
  })

  test('updates treatment with new attachment_path when uploaded and confirmed', async () => {
    ;(isAdmin as jest.Mock).mockReturnValue(true)
    ;(apiFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          attachment_path: 'uploads/attachments/new_file.pdf',
        },
      }),
    })

    render(
      <table>
        <tbody>
          <Treatment {...mockTreatment} />
        </tbody>
      </table>
    )

    const editBtn = screen.getByRole('button', { name: /edit treatment/i })
    fireEvent.click(editBtn)

    await waitFor(() => {
      expect(screen.getByTestId('treatment-form')).toBeInTheDocument()
    })

    // Simulate file upload inside TreatmentForm triggering onAttachmentChange
    fireEvent.click(screen.getByTestId('upload-mock-btn'))

    // Click Confirm button in dialog footer
    const confirmBtn = screen.getByRole('button', { name: /confirm/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        '/treatment/1',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('uploads/attachments/new_file.pdf'),
        })
      )
    })
  })
})
