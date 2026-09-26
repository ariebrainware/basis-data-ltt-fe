import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import TableTreatment from '../tableTreatment'
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
  Typography: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
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

// Mock role helpers
jest.mock('../../_functions/userRole', () => ({
  isTherapist: jest.fn(() => false),
  isAdmin: jest.fn(() => false),
  getUserRole: jest.fn(() => 'user'),
}))

jest.mock('../../_functions/userId', () => ({
  getUserId: jest.fn(() => '1'),
  getTherapistId: jest.fn(() => '1'),
}))

describe('TableTreatment Sorting', () => {
  const mockTreatments: TreatmentType[] = [
    {
      ID: '1',
      treatment_date: '2024-03-01 10:00',
      patient_code: 101,
      patient_name: 'Charlie Brown',
      therapist_name: 'Dr. Smith',
      therapist_id: '1',
      issues: 'Shoulder Pain',
      treatment: 'Acupuncture',
      remarks: 'First session',
      next_visit: '2024-03-10',
      age: 30,
    },
    {
      ID: '2',
      treatment_date: '2024-03-05 14:00',
      patient_code: 102,
      patient_name: 'Alice Wonderland',
      therapist_name: 'Dr. Adams',
      therapist_id: '2',
      issues: 'Knee Pain',
      treatment: 'Massage',
      remarks: 'Improving',
      next_visit: '2024-03-08',
      age: 25,
    },
    {
      ID: '3',
      treatment_date: '2024-02-20 09:00',
      patient_code: 103,
      patient_name: 'Bob Builder',
      therapist_name: 'Dr. Taylor',
      therapist_id: '3',
      issues: 'Back Spasm',
      treatment: 'Chiropractic',
      remarks: 'Follow-up needed',
      next_visit: '2024-03-15',
      age: 45,
    },
  ]

  test('renders all headers including sortable ones', () => {
    render(<TableTreatment Data={{ treatment: mockTreatments }} />)

    expect(screen.getByText('Waktu & Tanggal')).toBeInTheDocument()
    expect(screen.getByText('Nama Pasien')).toBeInTheDocument()
    expect(screen.getByText('Keluhan')).toBeInTheDocument()
    expect(screen.getByText('Penanganan')).toBeInTheDocument()
    expect(screen.getByText('Keterangan')).toBeInTheDocument()
    expect(screen.getByText('Kunjungan Selanjutnya')).toBeInTheDocument()
    expect(screen.getByText('Terapis')).toBeInTheDocument()
  })

  test('sorts by Nama Pasien ascending then descending when header is clicked', () => {
    render(<TableTreatment Data={{ treatment: mockTreatments }} />)

    const patientHeader = screen.getByText('Nama Pasien').closest('th')!

    // First click: Sort Ascending -> Alice, Bob, Charlie
    fireEvent.click(patientHeader)
    let patientCells = screen.getAllByText(/Wonderland|Builder|Brown/)
    expect(patientCells[0]).toHaveTextContent('Alice Wonderland (102)')
    expect(patientCells[1]).toHaveTextContent('Bob Builder (103)')
    expect(patientCells[2]).toHaveTextContent('Charlie Brown (101)')

    // Second click: Sort Descending -> Charlie, Bob, Alice
    fireEvent.click(patientHeader)
    patientCells = screen.getAllByText(/Wonderland|Builder|Brown/)
    expect(patientCells[0]).toHaveTextContent('Charlie Brown (101)')
    expect(patientCells[1]).toHaveTextContent('Bob Builder (103)')
    expect(patientCells[2]).toHaveTextContent('Alice Wonderland (102)')
  })

  test('sorts by Waktu & Tanggal ascending then descending', () => {
    render(<TableTreatment Data={{ treatment: mockTreatments }} />)

    const dateHeader = screen.getByText('Waktu & Tanggal').closest('th')!

    // Ascending: 2024-02-20 (Bob), 2024-03-01 (Charlie), 2024-03-05 (Alice)
    fireEvent.click(dateHeader)
    let patientCells = screen.getAllByText(/Wonderland|Builder|Brown/)
    expect(patientCells[0]).toHaveTextContent('Bob Builder (103)')
    expect(patientCells[1]).toHaveTextContent('Charlie Brown (101)')
    expect(patientCells[2]).toHaveTextContent('Alice Wonderland (102)')

    // Descending: 2024-03-05 (Alice), 2024-03-01 (Charlie), 2024-02-20 (Bob)
    fireEvent.click(dateHeader)
    patientCells = screen.getAllByText(/Wonderland|Builder|Brown/)
    expect(patientCells[0]).toHaveTextContent('Alice Wonderland (102)')
    expect(patientCells[1]).toHaveTextContent('Charlie Brown (101)')
    expect(patientCells[2]).toHaveTextContent('Bob Builder (103)')
  })

  test('sorts by Keluhan ascending then descending', () => {
    render(<TableTreatment Data={{ treatment: mockTreatments }} />)

    const issuesHeader = screen.getByText('Keluhan').closest('th')!

    // Ascending: Back Spasm (Bob), Knee Pain (Alice), Shoulder Pain (Charlie)
    fireEvent.click(issuesHeader)
    let patientCells = screen.getAllByText(/Wonderland|Builder|Brown/)
    expect(patientCells[0]).toHaveTextContent('Bob Builder (103)')
    expect(patientCells[1]).toHaveTextContent('Alice Wonderland (102)')
    expect(patientCells[2]).toHaveTextContent('Charlie Brown (101)')
  })

  test('sorts by Terapis ascending then descending', () => {
    render(<TableTreatment Data={{ treatment: mockTreatments }} />)

    const therapistHeader = screen.getByText('Terapis').closest('th')!

    // Ascending: Dr. Adams (Alice), Dr. Smith (Charlie), Dr. Taylor (Bob)
    fireEvent.click(therapistHeader)
    let patientCells = screen.getAllByText(/Wonderland|Builder|Brown/)
    expect(patientCells[0]).toHaveTextContent('Alice Wonderland (102)')
    expect(patientCells[1]).toHaveTextContent('Charlie Brown (101)')
    expect(patientCells[2]).toHaveTextContent('Bob Builder (103)')
  })

  test('supports controlled mode via props', () => {
    const handleSortChange = jest.fn()
    render(
      <TableTreatment
        Data={{ treatment: mockTreatments }}
        sortBy="patient_name"
        sortDir="desc"
        onSortChange={handleSortChange}
      />
    )

    const patientHeader = screen.getByText('Nama Pasien').closest('th')!
    fireEvent.click(patientHeader)

    expect(handleSortChange).toHaveBeenCalledWith('patient_name')
  })

  test('renders loading and error states appropriately', () => {
    const { rerender } = render(
      <TableTreatment Data={{ treatment: [] }} loading={true} />
    )
    expect(screen.getByText('Memuat data penanganan...')).toBeInTheDocument()

    rerender(
      <TableTreatment Data={{ treatment: [] }} error="Gagal mengambil data" />
    )
    expect(screen.getByText('Gagal mengambil data')).toBeInTheDocument()

    rerender(
      <TableTreatment
        Data={{ treatment: [] }}
        emptyMessage="Tidak ada jadwal penanganan hari ini"
      />
    )
    expect(
      screen.getByText('Tidak ada jadwal penanganan hari ini')
    ).toBeInTheDocument()
  })
})
