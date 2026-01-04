import React from 'react'
import { render, screen } from '@testing-library/react'
import { PatientForm } from '../patientForm'
import { PatientType } from '@/app/_types/patient'

// Mock Material Tailwind components
jest.mock('@material-tailwind/react', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  Input: ({ id, label, defaultValue, disabled }: any) => (
    <input
      id={id}
      data-testid={id}
      aria-label={label}
      defaultValue={defaultValue}
      disabled={disabled}
    />
  ),
  Textarea: ({ id, label, defaultValue }: any) => (
    <textarea
      id={id}
      data-testid={id}
      aria-label={label}
      defaultValue={defaultValue}
    />
  ),
}))

describe('PatientForm Component', () => {
  const mockPatient: PatientType = {
    ID: 1,
    full_name: 'John Doe',
    phone_number: '+628123456789',
    job: 'Software Engineer',
    age: 30,
    email: 'john@example.com',
    gender: 'male',
    address: 'Jl. Test No. 123',
    health_history: '1,2',
    surgery_history: 'None',
    patient_code: 'PAT001',
  }

  test('renders patient form with all fields', () => {
    render(<PatientForm {...mockPatient} />)
    
    // Check if form is rendered
    expect(screen.getByTestId('card')).toBeInTheDocument()
    
    // Check if all input fields are present
    expect(screen.getByTestId('ID')).toBeInTheDocument()
    expect(screen.getByTestId('patient_code')).toBeInTheDocument()
    expect(screen.getByTestId('full_name')).toBeInTheDocument()
    expect(screen.getByTestId('phone_number')).toBeInTheDocument()
    expect(screen.getByTestId('job')).toBeInTheDocument()
    expect(screen.getByTestId('age')).toBeInTheDocument()
    expect(screen.getByTestId('email')).toBeInTheDocument()
    expect(screen.getByTestId('gender')).toBeInTheDocument()
    expect(screen.getByTestId('address')).toBeInTheDocument()
    expect(screen.getByTestId('health_history')).toBeInTheDocument()
    expect(screen.getByTestId('surgery_history')).toBeInTheDocument()
  })

  test('displays correct patient data', () => {
    render(<PatientForm {...mockPatient} />)
    
    // Check if data is displayed correctly
    expect(screen.getByTestId('ID')).toHaveValue('1')
    expect(screen.getByTestId('full_name')).toHaveValue('John Doe')
    expect(screen.getByTestId('phone_number')).toHaveValue('+628123456789')
    expect(screen.getByTestId('job')).toHaveValue('Software Engineer')
    expect(screen.getByTestId('age')).toHaveValue('30')
    expect(screen.getByTestId('email')).toHaveValue('john@example.com')
    expect(screen.getByTestId('gender')).toHaveValue('male')
    expect(screen.getByTestId('address')).toHaveValue('Jl. Test No. 123')
    expect(screen.getByTestId('health_history')).toHaveValue('1,2')
    expect(screen.getByTestId('surgery_history')).toHaveValue('None')
    expect(screen.getByTestId('patient_code')).toHaveValue('PAT001')
  })

  test('ID and patient_code fields are disabled', () => {
    render(<PatientForm {...mockPatient} />)
    
    expect(screen.getByTestId('ID')).toBeDisabled()
    expect(screen.getByTestId('patient_code')).toBeDisabled()
  })

  test('renders with empty data', () => {
    const emptyPatient: PatientType = {
      ID: 0,
      full_name: '',
      phone_number: '',
      job: '',
      age: 0,
      email: '',
      gender: '',
      address: '',
      health_history: '',
      surgery_history: '',
      patient_code: '',
    }
    
    render(<PatientForm {...emptyPatient} />)
    
    expect(screen.getByTestId('full_name')).toHaveValue('')
    expect(screen.getByTestId('email')).toHaveValue('')
  })
})
