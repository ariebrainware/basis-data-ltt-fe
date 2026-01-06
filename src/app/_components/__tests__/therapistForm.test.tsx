import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TherapistForm } from '../therapistForm'
import { TherapistType } from '@/app/_types/therapist'

// Mock Material Tailwind components
jest.mock('@material-tailwind/react', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  Input: ({
    id,
    label,
    defaultValue,
    disabled,
  }: {
    id?: string
    label?: string
    defaultValue?: string
    disabled?: boolean
  }) => (
    <input
      id={id}
      data-testid={id}
      aria-label={label}
      defaultValue={defaultValue}
      disabled={disabled}
    />
  ),
  Textarea: ({
    id,
    label,
    defaultValue,
  }: {
    id?: string
    label?: string
    defaultValue?: string
  }) => (
    <textarea
      id={id}
      data-testid={id}
      aria-label={label}
      defaultValue={defaultValue}
    />
  ),
}))

// Mock ControlledSelect component
jest.mock('../selectTherapistRole', () => ({
  ControlledSelect: ({
    id,
    value,
    onChange,
  }: {
    id?: string
    value?: string
    onChange?: (value: string) => void
  }) => (
    <select
      id={id}
      data-testid={id}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
    >
      <option value="">Select Role</option>
      <option value="admin">Admin</option>
      <option value="therapist">Therapist</option>
    </select>
  ),
}))

describe('TherapistForm Component', () => {
  const mockOnRoleChange = jest.fn()

  const mockTherapist: TherapistType = {
    ID: 1,
    is_approved: true,
    full_name: 'Dr. Jane Smith',
    email: 'jane@example.com',
    phone_number: '+628123456789',
    address: 'Jl. Therapy No. 456',
    date_of_birth: '1985-05-15',
    nik: '1234567890123456',
    weight: 60,
    height: 165,
    role: 'therapist',
  }

  beforeEach(() => {
    mockOnRoleChange.mockClear()
  })

  test('renders therapist form with all fields', () => {
    render(<TherapistForm {...mockTherapist} onRoleChange={mockOnRoleChange} />)

    // Check if form is rendered
    expect(screen.getByTestId('card')).toBeInTheDocument()

    // Check if all input fields are present
    expect(screen.getByTestId('ID')).toBeInTheDocument()
    expect(screen.getByTestId('is_approved')).toBeInTheDocument()
    expect(screen.getByTestId('full_name')).toBeInTheDocument()
    expect(screen.getByTestId('email')).toBeInTheDocument()
    expect(screen.getByTestId('phone_number')).toBeInTheDocument()
    expect(screen.getByTestId('address')).toBeInTheDocument()
    expect(screen.getByTestId('date_of_birth')).toBeInTheDocument()
    expect(screen.getByTestId('nik')).toBeInTheDocument()
    expect(screen.getByTestId('weight')).toBeInTheDocument()
    expect(screen.getByTestId('height')).toBeInTheDocument()
    expect(screen.getByTestId('role')).toBeInTheDocument()
  })

  test('displays correct therapist data', () => {
    render(<TherapistForm {...mockTherapist} onRoleChange={mockOnRoleChange} />)

    // Check if data is displayed correctly
    expect(screen.getByTestId('ID')).toHaveValue('1')
    expect(screen.getByTestId('is_approved')).toHaveValue('Approved')
    expect(screen.getByTestId('full_name')).toHaveValue('Dr. Jane Smith')
    expect(screen.getByTestId('email')).toHaveValue('jane@example.com')
    expect(screen.getByTestId('phone_number')).toHaveValue('+628123456789')
    expect(screen.getByTestId('address')).toHaveValue('Jl. Therapy No. 456')
    expect(screen.getByTestId('date_of_birth')).toHaveValue('1985-05-15')
    expect(screen.getByTestId('nik')).toHaveValue('1234567890123456')
    expect(screen.getByTestId('weight')).toHaveValue('60')
    expect(screen.getByTestId('height')).toHaveValue('165')
  })

  test('displays "Not Approved" for unapproved therapist', () => {
    const unapprovedTherapist = { ...mockTherapist, is_approved: false }
    render(
      <TherapistForm {...unapprovedTherapist} onRoleChange={mockOnRoleChange} />
    )

    expect(screen.getByTestId('is_approved')).toHaveValue('Not Approved')
  })

  test('ID and is_approved fields are disabled', () => {
    render(<TherapistForm {...mockTherapist} onRoleChange={mockOnRoleChange} />)

    expect(screen.getByTestId('ID')).toBeDisabled()
    expect(screen.getByTestId('is_approved')).toBeDisabled()
  })

  test('role change triggers onRoleChange callback', () => {
    render(<TherapistForm {...mockTherapist} onRoleChange={mockOnRoleChange} />)

    const roleSelect = screen.getByTestId('role')
    fireEvent.change(roleSelect, { target: { value: 'admin' } })

    expect(mockOnRoleChange).toHaveBeenCalledWith('admin')
  })

  test('renders with empty role', () => {
    const therapistWithoutRole = { ...mockTherapist, role: '' }
    render(
      <TherapistForm
        {...therapistWithoutRole}
        onRoleChange={mockOnRoleChange}
      />
    )

    const roleSelect = screen.getByTestId('role')
    expect(roleSelect).toHaveValue('')
  })
})
