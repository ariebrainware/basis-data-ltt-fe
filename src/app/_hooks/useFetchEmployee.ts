import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../_functions/apiFetch'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import { EmployeeType } from '../_types/employee'

interface ListEmployeeResponse {
  data: EmployeeType[]
  total: number
}

export function useFetchEmployee(
  currentPage: number,
  keyword: string,
  refreshTrigger: number
): ListEmployeeResponse {
  const [employees, setEmployees] = useState<EmployeeType[]>([])
  const [total, setTotal] = useState(0)
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      try {
        const limit = 100
        const offset = (currentPage - 1) * limit
        let params = `limit=${limit}&offset=${offset}`
        if (keyword && keyword.trim() !== '') {
          params += `&keyword=${encodeURIComponent(keyword)}`
        }

        const res = await apiFetch(`/employee?${params}`, { method: 'GET' })

        if (res.status === 401) {
          UnauthorizedAccess(router)
          return
        }

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)

        const responseData = await res.json()
        const rawArray = responseData?.data ?? []
        const fetchedEmployees = Array.isArray(rawArray) ? rawArray : []

        setEmployees(fetchedEmployees)

        // Dynamic pagination total calculation
        let calculatedTotal =
          (currentPage - 1) * limit + fetchedEmployees.length
        if (fetchedEmployees.length === limit) {
          calculatedTotal = currentPage * limit + 1
        }
        setTotal(calculatedTotal)
      } catch (error) {
        console.error('Error fetching employees:', error)
      }
    })()
  }, [currentPage, keyword, refreshTrigger, router])

  return { data: employees, total }
}
