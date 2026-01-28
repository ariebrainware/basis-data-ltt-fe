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
  keyword: string
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
        const baseParams = buildTreatmentQuery(keyword, currentPage)
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
  }, [currentPage, keyword, router])

  return { data: { treatment }, total }
}

class UnauthorizedFetchError extends Error {}

function buildTreatmentQuery(keyword: string, currentPage: number): string {
  return keyword
    ? `keyword=${encodeURIComponent(keyword)}`
    : `limit=20&offset=${(currentPage - 1) * 20}`
}

function parseTreatmentData(data: any): {
  treatments: TreatmentType[]
  total: number
} {
  const treatments = Array.isArray(data?.data?.treatments)
    ? data.data.treatments
    : []
  const total = typeof data?.data?.total === 'number' ? data.data.total : 0
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
