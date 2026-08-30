import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../_functions/apiFetch'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import { TreatmentType } from '../_types/treatment'

interface ListTreatmentResponse {
  data: {
    treatment: TreatmentType[]
  }
  total: number
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useFetchTreatment(
  currentPage: number,
  keyword: string,
  filterByTherapist?: boolean,
  refreshTrigger?: number,
  groupByDate?: string
): ListTreatmentResponse {
  const [treatment, setTreatment] = useState<TreatmentType[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [internalRefresh, setInternalRefresh] = useState(0)
  const router = useRouter()

  const refetch = useCallback(() => {
    setInternalRefresh((prev) => prev + 1)
  }, [])

  const updateState = (payload: {
    treatments: TreatmentType[]
    total: number
  }) => {
    setTreatment(payload.treatments)
    setTotal(payload.total)
    setError(null)
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)

    const fetchData = async () => {
      try {
        const baseParams = buildTreatmentQuery(
          keyword,
          currentPage,
          filterByTherapist,
          groupByDate
        )
        const payload = await fetchTreatments(baseParams)
        if (!cancelled) {
          updateState(payload)
        }
      } catch (err: any) {
        if (err instanceof UnauthorizedFetchError) {
          UnauthorizedAccess(router)
          return
        }
        if (!cancelled) {
          const errMsg =
            err instanceof Error
              ? err.message
              : 'Gagal mengambil data penanganan'
          setError(errMsg)
          setLoading(false)
        }
        console.error('Error fetching treatment:', err)
      }
    }

    void fetchData()

    return () => {
      cancelled = true
    }
  }, [
    currentPage,
    keyword,
    filterByTherapist,
    refreshTrigger,
    internalRefresh,
    groupByDate,
    router,
  ])

  return { data: { treatment }, total, loading, error, refetch }
}

class UnauthorizedFetchError extends Error {}

function buildTreatmentQuery(
  keyword: string,
  currentPage: number,
  filterByTherapist?: boolean,
  groupByDate?: string
): string {
  const params: string[] = []
  if (groupByDate) {
    params.push(`group_by_date=${encodeURIComponent(groupByDate)}`)
  }
  if (keyword) {
    params.push(`keyword=${encodeURIComponent(keyword)}`)
  } else {
    params.push(`limit=20&offset=${(currentPage - 1) * 20}`)
  }
  if (filterByTherapist) {
    params.push('filter_by_therapist=true')
  }
  return params.join('&')
}

function parseTreatmentData(data: any): {
  treatments: TreatmentType[]
  total: number
} {
  const raw = Array.isArray(data?.data?.treatments) ? data.data.treatments : []
  const seenIds = new Set<string>()
  const treatments: TreatmentType[] = []

  for (const item of raw) {
    if (item && item.ID) {
      const idKey = String(item.ID)
      if (seenIds.has(idKey)) {
        continue
      }
      seenIds.add(idKey)
    }
    treatments.push(item)
  }

  const total =
    typeof data?.data?.total === 'number' ? data.data.total : treatments.length
  return { treatments, total }
}

async function fetchTreatments(
  query: string,
  maxRetries = 2
): Promise<{
  treatments: TreatmentType[]
  total: number
}> {
  let lastError: any = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await apiFetch(`/treatment?${query}`, { method: 'GET' })

      if (res.status === 401) {
        throw new UnauthorizedFetchError('unauthorized')
      }

      if (!res.ok) {
        if ([502, 503, 504].includes(res.status) && attempt < maxRetries) {
          await new Promise((resolve) =>
            setTimeout(resolve, 800 * Math.pow(1.5, attempt))
          )
          continue
        }
        if (res.status === 502) {
          throw new Error('Server upstream tidak merespons (502 Bad Gateway)')
        }
        if (res.status === 503) {
          throw new Error('Layanan sedang tidak tersedia (503)')
        }
        throw new Error(`HTTP error! Status: ${res.status}`)
      }

      const data = await res.json()
      return parseTreatmentData(data)
    } catch (err: any) {
      lastError = err
      if (err instanceof UnauthorizedFetchError) {
        throw err
      }
      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, 800 * Math.pow(1.5, attempt))
        )
      } else {
        break
      }
    }
  }

  throw lastError || new Error('Gagal mengambil data penanganan')
}
