'use client'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  CardFooter,
} from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../../_functions/apiFetch'
import { UnauthorizedAccess } from '../../_functions/unauthorized'
import TherapistTreatmentHeader from '../../_components/therapistTreatmentHeader'
import Pagination from '../../_components/pagination'
import TableTreatment from '../../_components/tableTreatment'
import { TreatmentType } from '../../_types/treatment'
import { logout } from '../../_functions/logout'

// `useFetchTreatment` moved to `src/app/_hooks/useFetchTreatment.ts`

interface ListTreatmentResponse {
  data: {
    treatment: TreatmentType[]
  }
  total: number
}

function useFetchTreatment(
  currentPage: number,
  keyword: string
): ListTreatmentResponse {
  const [treatment, setTreatment] = useState<TreatmentType[]>([])
  const [total, setTotal] = useState(0)
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      try {
        const baseParams = keyword
          ? `keyword=${keyword}`
          : `limit=20&offset=${(currentPage - 1) * 20}`
        const res = await apiFetch(`/treatment?${baseParams}`, {
          method: 'GET',
        })
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
        const data = await res.json()
        const treatmentArray: TreatmentType[] = Array.isArray(
          data.data.treatments
        )
          ? data.data.treatments
          : []
        setTreatment(treatmentArray)
        setTotal(data.data.total)
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          UnauthorizedAccess(router)
        }
        console.error('Error fetching treatment:', error)
      }
    })()
  }, [currentPage, keyword, router])

  return { data: { treatment: treatment }, total }
}

export default function TherapistTreatmentList() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [treatment, setTreatment] = useState<TreatmentType[]>([])
  const [keyword, setKeyword] = useState('')
  const { data, total } = useFetchTreatment(currentPage, keyword)
  useEffect(() => {
    setTreatment(data.treatment)
  }, [data])

  const handleInputKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      const newKeyword = (e.target as HTMLInputElement).value
      setKeyword(newKeyword)
    }
  }

  return (
    <>
      <Card
        className="size-full"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        <TherapistTreatmentHeader
          onLogout={async () => {
            await logout()
            router.push('/login')
          }}
          onSearchEnter={handleInputKeyDown}
        />
        <CardBody
          className="overflow-scroll px-0"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <TableTreatment Data={{ treatment: treatment }} />
        </CardBody>
        <CardFooter
          className="flex items-center justify-between border-t border-blue-gray-50 p-4"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            total={total}
          />
        </CardFooter>
      </Card>
    </>
  )
}
