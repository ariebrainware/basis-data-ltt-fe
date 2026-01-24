'use client'
import { SetStateAction, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../_functions/apiFetch'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from '@material-tailwind/react'
import Pagination from '../_components/pagination'
import Header from '../_components/header'
import SubHeader from '../_components/subheader'
import TablePatient from '../_components/tablePatient'
import { PatientType } from '../_types/patient'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import { getApiHost } from '../_functions/apiHost'
import { getSessionToken } from '../_functions/sessionToken'

interface ListPatientsResponse {
  data: {
    patients: PatientType[]
  }
  total: number
}

function usePatients(
  currentPage: number,
  keyword: string,
  refreshTrigger: number,
  dateKeyword?: string,
  sortBy?: string,
  sortDir?: string
): ListPatientsResponse {
  const [patients, setPatients] = useState<PatientType[]>([])
  const [total, setTotal] = useState(0)
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      try {
        // Build URL params: always include pagination (limit & offset), add keyword or group_by_date when present
        const limit = 100
        const offset = (currentPage - 1) * limit
        let params = `limit=${limit}&offset=${offset}`
        if (typeof dateKeyword === 'string' && dateKeyword.trim() !== '')
          params += `&group_by_date=${encodeURIComponent(dateKeyword)}`
        else if (keyword && keyword.trim() !== '')
          params += `&keyword=${encodeURIComponent(keyword)}`

        // Add sorting params when provided (backend expects sort_by and sort_dir)
        if (sortBy && sortBy.trim() !== '') {
          params += `&sort_by=${encodeURIComponent(sortBy)}`
          const normalizedSortDir =
            sortDir === 'asc' || sortDir === 'desc' ? sortDir : 'asc'
          params += `&sort_dir=${encodeURIComponent(normalizedSortDir)}`
        }

        const res = await apiFetch(`/patient?${params}`, { method: 'GET' })
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
        const data = await res.json()
        const patientsArray = Array.isArray(data.data.patients)
          ? data.data.patients
          : []
        setPatients(patientsArray)
        setTotal(data.data.total)
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          UnauthorizedAccess(router)
        }
        console.error('Error fetching patients:', error)
      }
    })()
  }, [
    currentPage,
    keyword,
    refreshTrigger,
    dateKeyword,
    sortBy,
    sortDir,
    router,
  ])

  return { data: { patients }, total }
}

export default function Patient() {
  const [currentPage, setCurrentPage] = useState(1)
  const [groupingDate, setGroupingDate] = useState('')
  const [keyword, setKeyword] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [sortBy, setSortBy] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const { data, total } = usePatients(
    currentPage,
    keyword,
    refreshTrigger,
    groupingDate,
    sortBy,
    sortDir
  )

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      // toggle direction
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(newSortBy)
      setSortDir('asc')
    }
    // reset to first page when sorting changes
    setCurrentPage(1)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newKeyword = (e.target as HTMLInputElement).value
      // update keyword only; `usePatients` will fetch based on keyword
      setKeyword(newKeyword)
      // clear grouping when searching by keyword
      setGroupingDate('')
      // reset to first page
      setCurrentPage(1)
    }
  }

  const handleGroupingByDateFilter = (dateKeyword: string) => {
    // set grouping date filter and reset pagination/search
    setGroupingDate(dateKeyword)
    setKeyword('')
    setCurrentPage(1)
  }

  return (
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
        <Header />
        <SubHeader
          handleInputKeyDown={handleInputKeyDown}
          handleGroupingByDateFilter={handleGroupingByDateFilter}
        />
      </CardHeader>
      <CardBody
        className="overflow-scroll px-0"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        <TablePatient
          Data={{
            patients: data.patients,
          }}
          onDataChange={handleRefresh}
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={handleSortChange}
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
          setCurrentPage={
            setCurrentPage as React.Dispatch<SetStateAction<number>>
          }
          total={total}
          pageSize={100}
          disabled={currentPage * 100 >= total}
        />
      </CardFooter>
    </Card>
  )
}
