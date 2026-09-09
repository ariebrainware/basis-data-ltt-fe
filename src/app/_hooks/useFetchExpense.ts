import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../_functions/apiFetch'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import { ExpenseSummary, ExpenseType } from '../_types/expense'

interface ListExpenseResponse {
  data: ExpenseType[]
  summary: ExpenseSummary | null
  total: number
  loading: boolean
}

export function useFetchExpense(
  currentPage: number,
  keyword: string,
  category: string,
  startDate: string,
  endDate: string,
  refreshTrigger: number
): ListExpenseResponse {
  const [expenses, setExpenses] = useState<ExpenseType[]>([])
  const [summary, setSummary] = useState<ExpenseSummary | null>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        setLoading(true)
        const limit = 100
        const offset = (currentPage - 1) * limit
        let params = `limit=${limit}&offset=${offset}`
        if (keyword && keyword.trim() !== '') {
          params += `&search=${encodeURIComponent(keyword.trim())}`
        }
        if (category && category.trim() !== '') {
          params += `&category=${encodeURIComponent(category.trim())}`
        }
        if (startDate && startDate.trim() !== '') {
          params += `&start_date=${encodeURIComponent(startDate.trim())}`
        }
        if (endDate && endDate.trim() !== '') {
          params += `&end_date=${encodeURIComponent(endDate.trim())}`
        }

        const res = await apiFetch(`/expense?${params}`, { method: 'GET' })

        if (res.status === 401) {
          UnauthorizedAccess(router)
          return
        }

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)

        const responseData = await res.json()
        const payload = responseData?.data

        let fetchedExpenses: ExpenseType[] = []
        let fetchedSummary: ExpenseSummary | null = null

        if (payload) {
          if (Array.isArray(payload)) {
            fetchedExpenses = payload
          } else if (Array.isArray(payload.expenses)) {
            fetchedExpenses = payload.expenses
            if (payload.summary) {
              fetchedSummary = payload.summary
            }
          }
        }

        if (isMounted) {
          setExpenses(fetchedExpenses)
          setSummary(fetchedSummary)

          // Calculate total pagination items
          let calculatedTotal =
            (currentPage - 1) * limit + fetchedExpenses.length
          if (fetchedExpenses.length === limit) {
            calculatedTotal = currentPage * limit + 1
          }
          if (
            fetchedSummary &&
            typeof fetchedSummary.total_count === 'number'
          ) {
            calculatedTotal = fetchedSummary.total_count
          }
          setTotal(calculatedTotal)
        }
      } catch (error) {
        console.error('Error fetching expenses:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    })()

    return () => {
      isMounted = false
    }
  }, [
    currentPage,
    keyword,
    category,
    startDate,
    endDate,
    refreshTrigger,
    router,
  ])

  return { data: expenses, summary, total, loading }
}
