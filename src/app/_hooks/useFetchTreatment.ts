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

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      try {
        const baseParams = keyword
          ? `keyword=${encodeURIComponent(keyword)}`
          : `limit=20&offset=${(currentPage - 1) * 20}`

        const res = await apiFetch(`/treatment?${baseParams}`, {
          method: 'GET',
        })

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`)
        }

        const data = await res.json()
        const arr: TreatmentType[] = Array.isArray(data?.data?.treatments)
          ? data.data.treatments
          : []

        if (!cancelled) {
          setTreatment(arr)
          setTotal(typeof data?.data?.total === 'number' ? data.data.total : 0)
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          UnauthorizedAccess(router)
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
