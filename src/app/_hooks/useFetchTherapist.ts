import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/app/_functions/apiFetch'
import { UnauthorizedAccess } from '@/app/_functions/unauthorized'
import { TherapistType } from '@/app/_types/therapist'

interface ListTherapistResponse {
  data: {
    therapist: TherapistType[]
  }
  total: number
}

export function useFetchTherapist(
  currentPage: number,
  keyword: string
): ListTherapistResponse {
  const [therapist, setTherapist] = useState<TherapistType[]>([])
  const [total, setTotal] = useState(0)
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      try {
        const res = await apiFetch(
          `/therapist?${keyword ? `keyword=${keyword}` : `limit=10&offset=${(currentPage - 1) * 10}`}`,
          { method: 'GET' }
        )
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
        const data = await res.json()
        setTherapist(data.data.therapists)
        setTotal(data.data.total)
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          UnauthorizedAccess(router)
        }
        console.error('Error fetching therapist:', error)
      }
    })()
  }, [currentPage, keyword, router])

  return { data: { therapist: therapist }, total }
}
