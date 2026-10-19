import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PatientTreatmentHistory } from '../patientTreatmentHistory'
import { TreatmentType } from '../../_types/treatment'
import { viewAttachment } from '../../_functions/viewAttachment'

jest.mock('../../_functions/viewAttachment', () => ({
  viewAttachment: jest.fn(),
}))

jest.mock('../../_hooks/usePatientTreatments', () => ({
  usePatientTreatments: jest.fn(() => ({
    treatments: [],
    loading: false,
    error: null,
    refetch: jest.fn(),
  })),
}))

describe('PatientTreatmentHistory Component', () => {
  const mockTreatments: TreatmentType[] = [
    {
      ID: '101',
      patient_code: 123,
      patient_name: 'Budi Santoso',
      treatment_date: '2026-05-15',
      therapist_name: 'Dr. Jane Smith',
      therapist_id: '1',
      issues: 'Nyeri punggung bawah',
      treatment: 'Bekam, Akupunktur',
      remarks: 'Kondisi membaik',
      next_visit: '2026-05-22',
      attachment_path: 'uploads/attachments/foto1.png',
      age: 35,
      gender: 'male',
    },
    {
      ID: '102',
      patient_code: 123,
      patient_name: 'Budi Santoso',
      treatment_date: '2026-05-01',
      therapist_name: 'Dr. John Doe',
      therapist_id: '2',
      issues: 'Sakit leher',
      treatment: 'Fisioterapi',
      remarks: 'Sesi pertama',
      next_visit: '2026-05-15',
      age: 35,
      gender: 'male',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders treatments correctly with all information', () => {
    render(
      <PatientTreatmentHistory
        patientCode="123"
        patientName="Budi Santoso"
        initialTreatments={mockTreatments}
        currentTreatmentId="101"
      />
    )

    // Checks header
    expect(screen.getByText('Riwayat Penanganan Pasien')).toBeInTheDocument()
    expect(screen.getByText('2 Catatan')).toBeInTheDocument()

    // Checks current session badge
    expect(screen.getByText('Sesi Saat Ini')).toBeInTheDocument()

    // Checks treatment dates
    expect(screen.getByText('2026-05-15')).toBeInTheDocument()
    expect(screen.getByText('2026-05-01')).toBeInTheDocument()

    // Checks therapists
    expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Dr. John Doe')).toBeInTheDocument()

    // Checks issues & treatments
    expect(screen.getByText('Nyeri punggung bawah')).toBeInTheDocument()
    expect(screen.getByText('Bekam')).toBeInTheDocument()
    expect(screen.getByText('Akupunktur')).toBeInTheDocument()
    expect(screen.getByText('Kondisi membaik')).toBeInTheDocument()
    expect(screen.getByText('2026-05-22')).toBeInTheDocument()
  })

  it('allows filtering treatments by search query', () => {
    render(
      <PatientTreatmentHistory
        patientCode="123"
        patientName="Budi Santoso"
        initialTreatments={mockTreatments}
      />
    )

    const searchInput = screen.getByPlaceholderText(
      /Cari keluhan, terapis, tanggal/i
    )
    fireEvent.change(searchInput, { target: { value: 'leher' } })

    // Only second session matches 'leher'
    expect(screen.getByText('Dr. John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Nyeri punggung bawah')).not.toBeInTheDocument()
  })

  it('renders empty state when there are no treatments', () => {
    render(
      <PatientTreatmentHistory
        patientCode="123"
        patientName="Budi Santoso"
        initialTreatments={[]}
      />
    )

    expect(screen.getByText('Belum Ada Riwayat Penanganan')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Pasien ini belum memiliki catatan riwayat penanganan lainnya.'
      )
    ).toBeInTheDocument()
  })

  it('calls viewAttachment when attachment button is clicked', () => {
    render(
      <PatientTreatmentHistory
        patientCode="123"
        patientName="Budi Santoso"
        initialTreatments={mockTreatments}
      />
    )

    const attachmentBtn = screen.getByTitle('Lihat Lampiran')
    fireEvent.click(attachmentBtn)

    expect(viewAttachment).toHaveBeenCalledWith(
      'uploads/attachments/foto1.png',
      'foto1.png'
    )
  })

  it('uses keyboard-focusable button for history expansion control', () => {
    render(
      <PatientTreatmentHistory
        patientCode="123"
        patientName="Budi Santoso"
        initialTreatments={mockTreatments}
      />
    )

    const toggleBtn = screen.getByRole('button', { name: /2026-05-15/i })
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(toggleBtn)
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false')
  })
})
