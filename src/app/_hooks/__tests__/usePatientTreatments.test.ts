import { renderHook, waitFor } from '@testing-library/react'
import { usePatientTreatments } from '../usePatientTreatments'
import { apiFetch } from '../../_functions/apiFetch'

jest.mock('../../_functions/apiFetch', () => ({
  apiFetch: jest.fn(),
}))

describe('usePatientTreatments hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches treatments for a patient by patientCode', async () => {
    const mockTreatments = [
      {
        ID: '101',
        patient_code: 'P001',
        patient_name: 'John Doe',
        treatment_date: '2026-05-10',
        therapist_name: 'Therapist A',
        issues: 'Back pain',
        treatment: 'Acupuncture',
        remarks: 'Improving',
        next_visit: '2026-05-17',
      },
      {
        ID: '102',
        patient_code: 'P001',
        patient_name: 'John Doe',
        treatment_date: '2026-05-01',
        therapist_name: 'Therapist B',
        issues: 'Neck stiffness',
        treatment: 'Cupping',
        remarks: 'First session',
        next_visit: '2026-05-10',
      },
    ]

    ;(apiFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          treatments: mockTreatments,
          total: 2,
        },
      }),
    })

    const { result } = renderHook(() =>
      usePatientTreatments('P001', 'John Doe', true)
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(apiFetch).toHaveBeenCalledWith(
      '/treatment?keyword=P001&limit=100&offset=0'
    )
    expect(result.current.treatments).toHaveLength(2)
    expect(result.current.total).toBe(2)
    expect(result.current.error).toBeNull()
  })

  it('filters treatments matching the patient when backend returns multiple results', async () => {
    const mixedTreatments = [
      {
        ID: '101',
        patient_code: 'P001',
        patient_name: 'John Doe',
        treatment_date: '2026-05-10',
      },
      {
        ID: '102',
        patient_code: 'P002',
        patient_name: 'Jane Smith',
        treatment_date: '2026-05-01',
      },
    ]

    ;(apiFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          treatments: mixedTreatments,
        },
      }),
    })

    const { result } = renderHook(() =>
      usePatientTreatments('P001', 'John Doe', true)
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.treatments).toHaveLength(1)
    expect(result.current.treatments[0].ID).toBe('101')
  })

  it('fetches additional pages when first page reaches fetch limit', async () => {
    const firstPage = Array.from({ length: 100 }, (_, idx) => ({
      ID: `P001-${idx + 1}`,
      patient_code: 'P001',
      patient_name: 'John Doe',
      treatment_date: `2026-05-${String((idx % 28) + 1).padStart(2, '0')}`,
    }))
    const secondPage = [
      {
        ID: 'P001-101',
        patient_code: 'P001',
        patient_name: 'John Doe',
        treatment_date: '2026-06-01',
      },
    ]

    ;(apiFetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            treatments: firstPage,
            total: 101,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            treatments: secondPage,
            total: 101,
          },
        }),
      })

    const { result } = renderHook(() =>
      usePatientTreatments('P001', 'John Doe', true)
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(apiFetch).toHaveBeenNthCalledWith(
      1,
      '/treatment?keyword=P001&limit=100&offset=0'
    )
    expect(apiFetch).toHaveBeenNthCalledWith(
      2,
      '/treatment?keyword=P001&limit=100&offset=100'
    )
    expect(result.current.treatments).toHaveLength(101)
    expect(result.current.total).toBe(101)
  })

  it('handles error response gracefully', async () => {
    ;(apiFetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    })

    const { result } = renderHook(() =>
      usePatientTreatments('P001', 'John Doe', true)
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Gagal mengambil riwayat penanganan')
    expect(result.current.treatments).toEqual([])
  })

  it('does not fetch when enabled is false or patientCode/patientName is empty', async () => {
    const { result } = renderHook(() => usePatientTreatments('', '', true))

    expect(apiFetch).not.toHaveBeenCalled()
    expect(result.current.treatments).toEqual([])
    expect(result.current.loading).toBe(false)
  })
})
