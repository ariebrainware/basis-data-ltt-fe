import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../_functions/apiFetch'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import {
  buildItemQueryParams,
  extractItemList,
  getItemTotal,
} from '../_functions/itemHelpers'
import { ItemType } from '../_types/item'

interface ListItemResponse {
  data: ItemType[]
  total: number
}

export function useFetchItem(
  currentPage: number,
  keyword: string,
  refreshTrigger: number
): ListItemResponse {
  const [items, setItems] = useState<ItemType[]>([])
  const [total, setTotal] = useState(0)
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      try {
        const res = await apiFetch(
          `/item?${buildItemQueryParams(currentPage, keyword)}`,
          { method: 'GET' }
        )

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)

        const responseData = await res.json()
        setItems(extractItemList(responseData))
        setTotal(getItemTotal(responseData))
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          UnauthorizedAccess(router)
        }
        console.error('Error fetching items:', error)
      }
    })()
  }, [currentPage, keyword, refreshTrigger, router])

  return { data: items, total }
}
