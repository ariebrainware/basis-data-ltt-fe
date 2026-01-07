import React from 'react'
import { render, screen } from '@testing-library/react'
import { TreatmentForm } from '../treatmentForm'
import { TreatmentType } from '@/app/_types/treatment'
import { isTherapist } from '@/app/_functions/userRole'

jest.spyOn(console, 'error').mockImplementation((msg) => {
  if (/Not implemented: navigation/.test(msg)) return
  // otherwise show other errors
  console.error(msg)
})

// Mock Material Tailwind components
jest.mock('@material-tailwind/react', () => {
  // use imported React from module scope

  const MockField = ({
    id,
    label,
    defaultValue,
    disabled,
    as,
  }: {
    id?: string
    label?: string
    defaultValue?: string | number | readonly string[] | undefined
    disabled?: boolean
    as?: 'input' | 'textarea'
  }) =>
    as === 'textarea' ? (
      <textarea
        id={id}
        data-testid={id}
        aria-label={label}
        defaultValue={defaultValue}
        disabled={disabled}
      />
    ) : (
      <input
        id={id}
        data-testid={id}
        aria-label={label}
        defaultValue={defaultValue}
        disabled={disabled}
      />
    )

  type MockProps = {
    id?: string
    label?: string
    defaultValue?: string | number | readonly string[] | undefined
    disabled?: boolean
  }

  return {
    Card: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="card">{children}</div>
    ),
    Input: ({ id, label, defaultValue, disabled }: MockProps) =>
      MockField({ id, label, defaultValue, disabled, as: 'input' }),
    Textarea: ({ id, label, defaultValue, disabled }: MockProps) =>
      MockField({ id, label, defaultValue, disabled, as: 'textarea' }),
  }
})

// Mock isTherapist function
jest.mock('@/app/_functions/userRole', () => ({
  isTherapist: jest.fn(() => false),
}))

describe('TreatmentForm Component', () => {
  const mockTreatment: TreatmentType = {
    ID: '1',
    treatment_date: '2024-01-15',
    patient_code: 1,
    patient_name: 'John Doe',
    therapist_name: 'Dr. Jane Smith',
    therapist_id: '10',
    issues: 'Back pain',
    treatment: 'Massage therapy',
    remarks: 'Patient responding well',
    next_visit: '2024-01-22',
    age: 42,
  }

  test('renders treatment form with all fields', () => {
    render(<TreatmentForm {...mockTreatment} />)

    // Check if form is rendered
    expect(screen.getByTestId('card')).toBeInTheDocument()

    // Check if all input fields are present
    expect(screen.getByTestId('ID')).toBeInTheDocument()
    expect(screen.getByTestId('treatment_date')).toBeInTheDocument()
    expect(screen.getByTestId('patient_code')).toBeInTheDocument()
    expect(screen.getByTestId('patient_name')).toBeInTheDocument()
    expect(screen.getByTestId('therapist_name')).toBeInTheDocument()
    expect(screen.getByTestId('therapist_id')).toBeInTheDocument()
    expect(screen.getByTestId('issues')).toBeInTheDocument()
    expect(screen.getByTestId('treatment')).toBeInTheDocument()
    expect(screen.getByTestId('remarks')).toBeInTheDocument()
    expect(screen.getByTestId('next_visit')).toBeInTheDocument()
  })

  test('displays correct treatment data', () => {
    render(<TreatmentForm {...mockTreatment} />)

    // Check if data is displayed correctly
    expect(screen.getByTestId('ID')).toHaveValue('1')
    expect(screen.getByTestId('treatment_date')).toHaveValue('2024-01-15')
    expect(screen.getByTestId('patient_code')).toHaveValue('1')
    expect(screen.getByTestId('patient_name')).toHaveValue('John Doe')
    expect(screen.getByTestId('therapist_name')).toHaveValue('Dr. Jane Smith')
    expect(screen.getByTestId('therapist_id')).toHaveValue('10')
    expect(screen.getByTestId('issues')).toHaveValue('Back pain')
    expect(screen.getByTestId('treatment')).toHaveValue('Massage therapy')
    expect(screen.getByTestId('remarks')).toHaveValue('Patient responding well')
    expect(screen.getByTestId('next_visit')).toHaveValue('2024-01-22')
  })

  test('ID field is always disabled', () => {
    render(<TreatmentForm {...mockTreatment} />)

    expect(screen.getByTestId('ID')).toBeDisabled()
  })

  test('certain fields are disabled for therapist role', () => {
    ;(isTherapist as jest.Mock).mockReturnValue(true)

    render(<TreatmentForm {...mockTreatment} />)

    // These fields should be disabled for therapists
    expect(screen.getByTestId('treatment_date')).toBeDisabled()
    expect(screen.getByTestId('patient_code')).toBeDisabled()
    expect(screen.getByTestId('patient_name')).toBeDisabled()
    expect(screen.getByTestId('therapist_name')).toBeDisabled()
    expect(screen.getByTestId('therapist_id')).toBeDisabled()
    expect(screen.getByTestId('issues')).toBeDisabled()
  })

  test('treatment and remarks fields are always editable', () => {
    ;(isTherapist as jest.Mock).mockReturnValue(true)

    render(<TreatmentForm {...mockTreatment} />)

    // These fields should not be disabled even for therapists
    expect(screen.getByTestId('treatment')).not.toBeDisabled()
    expect(screen.getByTestId('remarks')).not.toBeDisabled()
    expect(screen.getByTestId('next_visit')).not.toBeDisabled()
  })

  test('renders with empty data', () => {
    const emptyTreatment: TreatmentType = {
      ID: '0',
      treatment_date: '',
      patient_code: 0,
      patient_name: '',
      therapist_name: '',
      therapist_id: '',
      issues: '',
      treatment: '',
      remarks: '',
      next_visit: '',
      age: 0,
    }

    render(<TreatmentForm {...emptyTreatment} />)

    expect(screen.getByTestId('patient_name')).toHaveValue('')
    expect(screen.getByTestId('treatment')).toHaveValue('')
  })
})
