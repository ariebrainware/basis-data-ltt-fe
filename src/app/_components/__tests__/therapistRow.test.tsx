import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Therapist from '../therapistRow'
import { apiFetch } from '../../_functions/apiFetch'
import Swal from 'sweetalert2'

const mockRefresh = jest.fn()
const mockDeleteTherapist = jest.fn()

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
    <button onClick={props.onClick}>{props.children}</button>
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

jest.mock('../../_hooks/useDeleteResource', () => ({
  useDeleteResource: () => mockDeleteTherapist,
}))

jest.mock('sweetalert2', () => ({
  fire: jest.fn(() => Promise.resolve({})),
}))

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
      <option value="therapist">Therapist</option>
    </select>
  ),
}))

describe('TherapistRow Component', () => {
  const mockOnDataChange = jest.fn()

  const defaultProps = {
    ID: 1,
    full_name: 'Dr. Jane Smith',
    email: 'jane@example.com',
    phone_number: '08123456789',
    address: 'Jl. Melati',
    date_of_birth: '1990-01-01',
    nik: '1234567890123456',
    weight: 60,
    height: 165,
    role: 'therapist',
    is_approved: true,
    commission: '50000',
    onDataChange: mockOnDataChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(apiFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    })
  })

  test('renders therapist row with commission displayed', () => {
    render(
      <table>
        <tbody>
          <Therapist {...defaultProps} />
        </tbody>
      </table>
    )

    expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Komisi: 50000')).toBeInTheDocument()
  })

  test('submits PATCH payload with commission when admin edits therapist', async () => {
    render(
      <table>
        <tbody>
          <Therapist {...defaultProps} />
        </tbody>
      </table>
    )

    // Open edit dialog
    fireEvent.click(screen.getByLabelText('Edit terapis'))
    // Click confirm
    fireEvent.click(screen.getByText('Confirm'))

    await waitFor(() => expect(apiFetch).toHaveBeenCalled())
    const [url, request] = (apiFetch as jest.Mock).mock.calls[0]
    expect(url).toBe('/therapist/1')
    expect(request.method).toBe('PATCH')
    const body = JSON.parse(request.body)
    expect(body.commission).toBe('50000')
    expect(body.full_name).toBe('Dr. Jane Smith')
  })

  test('shows warning when commission is empty because each therapist must have commission', async () => {
    render(
      <table>
        <tbody>
          <Therapist {...defaultProps} commission="" />
        </tbody>
      </table>
    )

    // Open edit dialog
    fireEvent.click(screen.getByLabelText('Edit terapis'))

    // Clear commission input
    const commissionInput = screen.getByLabelText('Komisi')
    fireEvent.change(commissionInput, { target: { value: '' } })

    // Click confirm
    fireEvent.click(screen.getByText('Confirm'))

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Komisi terapis tidak boleh kosong.',
        icon: 'warning',
      })
    )
    expect(apiFetch).not.toHaveBeenCalled()
  })
})
