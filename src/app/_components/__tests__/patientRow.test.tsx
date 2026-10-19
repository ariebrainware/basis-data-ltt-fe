import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Patient from '../patientRow'
import { PatientType } from '../../_types/patient'
import { apiFetch } from '../../_functions/apiFetch'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

jest.mock('../../_functions/apiFetch', () => ({
  apiFetch: jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: {} }),
    })
  ),
}))

jest.mock('../../_functions/userRole', () => ({
  isAdmin: jest.fn(() => true),
}))

// Mock PatientTreatmentHistory
jest.mock('../patientTreatmentHistory', () => ({
  PatientTreatmentHistory: (props: any) => (
    <div data-testid="patient-treatment-history">
      Riwayat Penanganan for {props.patientName} ({props.patientCode})
    </div>
  ),
}))

// Mock PatientForm
jest.mock('../patientForm', () => ({
  PatientForm: (props: any) => (
    <div data-testid="patient-form">
      Patient Form for {props.full_name} ({props.patient_code})
    </div>
  ),
}))

// Mock Material Tailwind
jest.mock('@material-tailwind/react', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Dialog: ({ children, open }: any) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogBody: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}))

describe('Patient Row Component', () => {
  const mockPatient: PatientType = {
    ID: 1,
    full_name: 'Ahmad Dahlan',
    phone_number: ['08123456789'],
    job: 'Guru',
    age: 40,
    gender: 'male',
    email: 'ahmad@example.com',
    address: 'Jl. Merdeka No. 1',
    health_history: 'Hypertension',
    surgery_history: '-',
    last_visit: '2026-05-10',
    patient_code: 'P-101',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders patient row data correctly', () => {
    render(
      <table>
        <tbody>
          <Patient {...mockPatient} />
        </tbody>
      </table>
    )

    expect(screen.getByText('Ahmad Dahlan')).toBeInTheDocument()
    expect(screen.getByText('08123456789')).toBeInTheDocument()
    expect(screen.getByText('Guru')).toBeInTheDocument()
    expect(screen.getByText('40')).toBeInTheDocument()
    expect(screen.getByText('Laki-laki')).toBeInTheDocument()
    expect(screen.getByText('P-101')).toBeInTheDocument()
  })

  it('opens treatment record history when patient row is clicked (selected)', async () => {
    render(
      <table>
        <tbody>
          <Patient {...mockPatient} />
        </tbody>
      </table>
    )

    const row = screen.getByText('Ahmad Dahlan').closest('tr')
    expect(row).toBeInTheDocument()
    fireEvent.click(row!)

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
      expect(
        screen.getByTestId('patient-treatment-history')
      ).toBeInTheDocument()
    })
  })

  it('opens treatment record history when history button is clicked', async () => {
    render(
      <table>
        <tbody>
          <Patient {...mockPatient} />
        </tbody>
      </table>
    )

    const historyBtn = screen.getByRole('button', {
      name: /lihat riwayat penanganan/i,
    })
    fireEvent.click(historyBtn)

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
      expect(
        screen.getByTestId('patient-treatment-history')
      ).toBeInTheDocument()
    })
  })

  it('opens patient edit form when edit button is clicked, and can switch to history tab', async () => {
    render(
      <table>
        <tbody>
          <Patient {...mockPatient} />
        </tbody>
      </table>
    )

    const editBtn = screen.getByRole('button', { name: /edit patient/i })
    fireEvent.click(editBtn)

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
      expect(screen.getByTestId('patient-form')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/disease', { method: 'GET' })
      expect(apiFetch).toHaveBeenCalledWith('/patient/1', { method: 'GET' })
    })

    // Click tab to switch to Riwayat Penanganan
    const historyTab = screen.getByTestId('tab-history')
    fireEvent.click(historyTab)

    await waitFor(() => {
      expect(
        screen.getByTestId('patient-treatment-history')
      ).toBeInTheDocument()
    })
  })
})
