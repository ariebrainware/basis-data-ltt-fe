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

interface ListPatientsResponse {
  data: {
    patients: PatientType[]
  }
  total: number
}

function usePatients(
  currentPage: number,
  keyword: string
): ListPatientsResponse {
  const [patients, setPatients] = useState<PatientType[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(
          `${getApiHost()}/patient?${keyword ? `keyword=${keyword}` : `limit=100&offset=${(currentPage - 1) * 100}`}`,
          {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
              'session-token': localStorage.getItem('session-token') ?? '',
            },
          }
        )
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
        const data = await res.json()
        const patientsArray = Array.isArray(data.data.patients)
          ? data.data.patients
          : []
        setPatients(patientsArray)
        setTotal(data.data.total)
        console.log(data.data.total)
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          UnauthorizedAccess()
        }
        console.error('Error fetching patients:', error)
      }
    })()
  }, [currentPage, host, keyword])

  return { data: { patients }, total }
}

export default function Patient() {
  const [currentPage, setCurrentPage] = useState(1)
  const [patients, setPatients] = useState<PatientType[]>([])
  const [, setTotal] = useState(0)
  const [keyword, setKeyword] = useState('')
  const { data, total } = usePatients(currentPage, keyword)

  const handleInputKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      const newKeyword = (e.target as HTMLInputElement).value
      setKeyword(newKeyword)
      try {
        const res = await fetch(`${getApiHost()}/patient?keyword=${newKeyword}`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
            'session-token': localStorage.getItem('session-token') ?? '',
          },
        })
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
        const data = await res.json()
        const patientsArray = Array.isArray(patients) ? data.data.patients : []
        setPatients(patientsArray)
        setTotal(data.data.total)
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          UnauthorizedAccess()
        }
        console.error('Error fetching patients:', error)
      }
    }
  }

  const handleGroupingByDateFilter = async (dateKeyword: string) => {
    try {
      const res = await fetch(`${getApiHost()}/patient?group_by_date=${dateKeyword}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
          'session-token': localStorage.getItem('session-token') ?? '',
        },
      })
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
      const data = await res.json()
      const patientsArray = Array.isArray(patients) ? data.data.patients : []
      setPatients(patientsArray)
      setTotal(data.data.total)
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        UnauthorizedAccess()
      }
      console.error('Error fetching patients:', error)
    }
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
        />
        <Pagination
          currentPage={currentPage}
          setCurrentPage={
            setCurrentPage as React.Dispatch<SetStateAction<number>>
          }
          total={total / 10}
        />
      </DashboardContent>
      <div className={styles.page}>
        <Footer />
      </div>
    </div>
  )
}
