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
import MegaMenuDefault from '../../_components/megaMenu'
import Pagination from '../../_components/pagination'
import TableTreatment from '../../_components/tableTreatment'
import { TreatmentType } from '../../_types/treatment'
import { useFetchTreatment } from '../../_hooks/useFetchTreatment'

// `useFetchTreatment` moved to `src/app/_hooks/useFetchTreatment.ts`
export default function TherapistTreatmentList() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [treatment, setTreatment] = useState<TreatmentType[]>([])
  const [keyword, setKeyword] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { data, total } = useFetchTreatment(
    currentPage,
    keyword,
    undefined,
    refreshTrigger
  )
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }
  useEffect(() => {
    const t = setTimeout(() => setTreatment(data.treatment), 0)
    return () => clearTimeout(t)
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
    <div className="min-h-screen space-y-6 bg-blue-gray-50/20 p-4 md:p-6">
      <MegaMenuDefault />

      <Card
        className="size-full border border-blue-gray-100 shadow-md"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        <TherapistTreatmentHeader onSearchEnter={handleInputKeyDown} />
        <CardBody
          className="overflow-scroll px-0"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <TableTreatment
            Data={{ treatment: treatment }}
            onDataChange={handleRefresh}
          />
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
    </div>
  )
}
