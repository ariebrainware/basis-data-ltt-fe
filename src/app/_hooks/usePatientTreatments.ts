import { useEffect, useState, useCallback } from 'react'
import { apiFetch } from '../_functions/apiFetch'
import { TreatmentType } from '../_types/treatment'

export interface PatientTreatmentsResult {
  treatments: TreatmentType[]
  total: number
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook to fetch all treatment records related to a specific patient.
 * Uses the patient_code or patient_name to query the treatment endpoint.
 */
export function usePatientTreatments(
  patientCode?: string | number | null,
  patientName?: string | null,
  enabled: boolean = true
): PatientTreatmentsResult {
  const HISTORY_FETCH_LIMIT = 100
  const MAX_HISTORY_FETCH_PAGES = 50
  const [treatments, setTreatments] = useState<TreatmentType[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const refetch = useCallback(() => {
    setRefreshIndex((prev) => prev + 1)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const queryKey =
      patientCode !== null &&
      patientCode !== undefined &&
      String(patientCode).trim() !== ''
        ? String(patientCode).trim()
        : patientName
          ? String(patientName).trim()
          : ''

    if (!queryKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTreatments([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const fetchHistory = async () => {
      try {
        let raw: TreatmentType[] = []
        let offset = 0
        let pageCount = 0
        let totalFromApi: number | null = null

        while (pageCount < MAX_HISTORY_FETCH_PAGES) {
          const query = `/treatment?keyword=${encodeURIComponent(queryKey)}&limit=${HISTORY_FETCH_LIMIT}&offset=${offset}`
          const res = await apiFetch(query)
          if (res.status === 401) {
            return
          }
          if (!res.ok) {
            throw new Error('Gagal mengambil riwayat penanganan')
          }

          const json = await res.json()
          const pageItems: TreatmentType[] = Array.isArray(
            json?.data?.treatments
          )
            ? json.data.treatments
            : Array.isArray(json?.data)
              ? json.data
              : []
          const pageTotal =
            typeof json?.data?.total === 'number' ? json.data.total : null

          if (totalFromApi === null && pageTotal !== null) {
            totalFromApi = pageTotal
          }

          raw = [...raw, ...pageItems]
          pageCount += 1

          if (
            pageItems.length === 0 ||
            pageItems.length < HISTORY_FETCH_LIMIT ||
            (totalFromApi !== null && raw.length >= totalFromApi)
          ) {
            break
          }

          offset += HISTORY_FETCH_LIMIT
        }

        const normalizedCode =
          patientCode !== null && patientCode !== undefined
            ? String(patientCode).trim().toLowerCase()
            : ''
        const normalizedName =
          patientName !== null && patientName !== undefined
            ? String(patientName).trim().toLowerCase()
            : ''

        let filtered = raw.filter((t: TreatmentType) => {
          if (
            normalizedCode &&
            t.patient_code !== null &&
            t.patient_code !== undefined &&
            String(t.patient_code).trim().toLowerCase() === normalizedCode
          ) {
            return true
          }
          if (
            normalizedName &&
            t.patient_name &&
            t.patient_name.trim().toLowerCase() === normalizedName
          ) {
            return true
          }
          return false
        })

        // If strict match gave nothing but query matched raw results, fallback to raw
        if (filtered.length === 0 && raw.length > 0) {
          filtered = raw
        }

        if (!cancelled) {
          setTreatments(filtered)
          setLoading(false)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Gagal mengambil riwayat penanganan')
          setLoading(false)
        }
      }
    }

    void fetchHistory()

    return () => {
      cancelled = true
    }
  }, [patientCode, patientName, enabled, refreshIndex])

  return {
    treatments,
    total: treatments.length,
    loading,
    error,
    refetch,
  }
}
