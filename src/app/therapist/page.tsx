'use client'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { UserPlusIcon } from '@heroicons/react/24/solid'
import {
  Card,
  CardHeader,
  Input,
  CardBody,
  CardFooter,
} from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../_functions/apiFetch'
import Pagination from '../_components/pagination'
import TableTherapist from '../_components/tableTherapist'
import { TherapistType } from '../_types/therapist'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import { logout } from '../_functions/logout'
import { useFetchTherapist } from '@/app/_hooks/useFetchTherapist'
import TherapistHeader from '@/app/_components/therapistHeader'
const TABS = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Approved',
    value: 'approved',
  },
  {
    label: 'Unapproved',
    value: 'unapproved',
  },
]

export default function ListTherapist() {
  const [currentPage, setCurrentPage] = useState(1)
  const [therapists, setTherapists] = useState<TherapistType[]>([])
  const [, setTotal] = useState(0)
  const [keyword, setKeyword] = useState('')
  const router = useRouter()
  const { data, total } = useFetchTherapist(currentPage, keyword)
  useEffect(() => {
    setTherapists(data.therapist)
  }, [data])

  const handleInputKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      const newKeyword = (e.target as HTMLInputElement).value
      setKeyword(newKeyword)
      try {
        const res = await apiFetch(`/therapist?keyword=${newKeyword}`, {
          method: 'GET',
        })
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
        const data = await res.json()
        const therapistArray = Array.isArray(therapists)
          ? data.data.therapists
          : []
        setTherapists(therapistArray)
        setTotal(data.data.total)
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          UnauthorizedAccess(router)
        }
        console.error('Error fetching therapist:', error)
      }
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
        <CardHeader
          floated={false}
          shadow={false}
          className="rounded-none"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <div className="mb-8 flex items-center justify-between gap-8">
            <TherapistHeader
              tabs={TABS}
              onAddClick={() => window.open('/therapist/register', '_blank')}
              onLogoutClick={async () => {
                await logout()
                router.push('/login')
              }}
              onSearchEnter={handleInputKeyDown}
            />
          </div>
        </CardHeader>
        <CardBody
          className="overflow-scroll px-0"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <TableTherapist Data={{ therapist: therapists }} />
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
