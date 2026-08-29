import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../_functions/apiFetch'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import { TreatmentType } from '../_types/treatment'

interface ListTreatmentResponse {
  data: {
    treatment: TreatmentType[]
  }
  total: number
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
  const router = useRouter()

  const updateState = (payload: {
    treatments: TreatmentType[]
    total: number
  }) => {
    setTreatment(payload.treatments)
    setTotal(payload.total)
  }

  useEffect(() => {
    let cancelled = false

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
      } catch (error) {
        if (error instanceof UnauthorizedFetchError) {
          UnauthorizedAccess(router)
          return
        }
        console.error('Error fetching treatment:', error)
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
    groupByDate,
    router,
  ])

  return { data: { treatment }, total }
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

async function fetchTreatments(query: string): Promise<{
  treatments: TreatmentType[]
  total: number
}> {
  const res = await apiFetch(`/treatment?${query}`, { method: 'GET' })

  if (res.status === 401) {
    throw new UnauthorizedFetchError('unauthorized')
  }

  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`)
  }

  const data = await res.json()
  return parseTreatmentData(data)
}
