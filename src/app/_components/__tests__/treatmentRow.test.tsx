import React from 'react'
import { render, screen } from '@testing-library/react'
import { isTherapist, isAdmin } from '../../_functions/userRole'
import { getUserId, getTherapistId } from '../../_functions/userId'
import Treatment from '../treatmentRow'
import { TreatmentType } from '../../_types/treatment'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
    replace: jest.fn(),
  }),
}))

// Mock Material Tailwind elements
jest.mock('@material-tailwind/react', () => ({
  Button: ({ children, disabled, onClick }: any) => (
    <button disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogBody: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}))

// Mock Sub-components
jest.mock('../treatmentForm', () => ({
  TreatmentForm: () => <div data-testid="treatment-form" />,
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
    expect(screen.getByText('Back pain')).toBeInTheDocument()
    expect(screen.getByText('Dr. Jane Smith (10)')).toBeInTheDocument()
  })

  test('disables edit button for normal users', () => {
    ;(isAdmin as jest.Mock).mockReturnValue(false)
    ;(isTherapist as jest.Mock).mockReturnValue(false)

    render(
      <table>
        <tbody>
          <Treatment {...mockTreatment} />
        </tbody>
      </table>
    )

    const editBtn = screen.getByRole('button', { name: /edit treatment/i })
    expect(editBtn).toBeDisabled()
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

  test('disables edit button for therapist non-owner', () => {
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

    const editBtn = screen.getByRole('button', { name: /edit treatment/i })
    expect(editBtn).toBeDisabled()
  })
})
