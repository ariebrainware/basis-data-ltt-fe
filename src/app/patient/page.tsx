'use client'
import styles from '../page.module.css'
import DashboardContent from '../_components/dashboardComponent'
import { SetStateAction, useEffect, useState } from 'react'
import Footer from '../_components/footer'
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
  dateKeyword?: string
): ListPatientsResponse {
  const [patients, setPatients] = useState<PatientType[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    ;(async () => {
      try {
        const query = dateKeyword
          ? `group_by_date=${dateKeyword}`
          : keyword
            ? `keyword=${keyword}`
            : `limit=100&offset=${(currentPage - 1) * 100}`

        const res = await fetch(`${getApiHost()}/patient?${query}`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
            'session-token': getSessionToken(),
          },
        })
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
        const data = await res.json()
        const patientsArray = Array.isArray(data.data.patients)
          ? data.data.patients
          : []
        setPatients(patientsArray)
        setTotal(data.data.total)
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          UnauthorizedAccess()
        }
        console.error('Error fetching patients:', error)
      }
    })()
  }, [currentPage, keyword, refreshTrigger, dateKeyword])

  return { data: { patients }, total }
}

export default function Patient() {
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [groupingDate, setGroupingDate] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { data, total } = usePatients(
    currentPage,
    keyword,
    refreshTrigger,
    groupingDate
  )

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newKeyword = (e.target as HTMLInputElement).value
      // update keyword only; usePatients will fetch based on keyword
      setKeyword(newKeyword)
      // reset grouping when performing keyword search
      setGroupingDate('')
      // reset to first page
      setCurrentPage(1)
    }
  }

  const handleGroupingByDateFilter = async (
    dateKeyword: string
  ): Promise<void> => {
    // set grouping date filter and reset pagination
    setGroupingDate(dateKeyword)
    setKeyword('')
    setCurrentPage(1)
  }

  return (
    <div className={styles.main}>
      <DashboardContent>
        <Header />
        <SubHeader
          handleInputKeyDown={handleInputKeyDown}
          handleGroupingByDateFilter={(dateKeyword: string) =>
            handleGroupingByDateFilter(dateKeyword)
          }
        />
        <TablePatient
          Data={{
            patients: data.patients,
          }}
          onDataChange={handleRefresh}
        />
        <Pagination
          currentPage={currentPage}
          setCurrentPage={
            setCurrentPage as React.Dispatch<SetStateAction<number>>
          }
          total={total}
          disabled={
            Boolean(keyword && keyword.trim() !== '') &&
            data.patients.length < 100
          }
        />
      </DashboardContent>
      <div className={styles.page}>
        <Footer />
      </div>
    </div>
  )
}
