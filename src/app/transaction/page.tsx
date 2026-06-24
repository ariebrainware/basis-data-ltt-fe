'use client'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Typography,
} from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Pagination from '../_components/pagination'
import TableTransaction from '../_components/tableTransaction'
import { apiFetch } from '../_functions/apiFetch'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import { TransactionType } from '../_types/transaction'
import { logout } from '../_functions/logout'

interface ListTransactionResponse {
  data: TransactionType[]
  total: number
}

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatDate(value: unknown): string {
  if (value === null || value === undefined || value === '') return ''
  const v = String(value)
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return v
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`
}

function normalizeTransaction(item: any): TransactionType {
  return {
    ID: toNumber(item?.ID ?? item?.id),
    treatment_id: toNumber(item?.treatment_id),
    patient_name: String(item?.patient_name ?? ''),
    pricing_name: String(item?.payment_method ?? item?.pricing_name ?? item?.price_name ?? ''),
    amount: toNumber(item?.amount ?? item?.price),
    payment_status: String(item?.payment_status ?? item?.status ?? ''),
    notes: String(item?.remarks ?? item?.notes ?? item?.remark ?? ''),
    transaction_date: formatDate(
      item?.transaction_date ??
        item?.CreatedAt ??
        item?.created_at ??
        item?.date ??
        ''
    ),
    treatment_date: String(
      item?.treatment_date ?? item?.therapy_date ?? item?.service_date ?? ''
    ),
    items: Array.isArray(item?.items)
      ? item.items.map((i: any) => ({
          item_id: toNumber(i?.item_id ?? i?.ItemID),
          quantity: toNumber(i?.quantity ?? i?.Quantity),
        }))
      : [],
  }
}

function useFetchTransaction(
  currentPage: number,
  keyword: string,
  refreshTrigger: number
): ListTransactionResponse {
  const [transaction, setTransaction] = useState<TransactionType[]>([])
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

        const res = await apiFetch(`/transaction?${params}`, { method: 'GET' })
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
        const responseData = await res.json()

        const rawArray =
          responseData?.data?.transactions ??
          responseData?.data?.transaction ??
          responseData?.data ??
          []

        const transactionArray = Array.isArray(rawArray)
          ? rawArray.map(normalizeTransaction)
          : []

        setTransaction(transactionArray)
        setTotal(responseData?.data?.total ?? responseData?.total ?? 0)
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          UnauthorizedAccess(router)
        }
        console.error('Error fetching transaction:', error)
      }
    })()
  }, [currentPage, keyword, router, refreshTrigger])

  return { data: transaction, total }
}

export default function TransactionPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { data, total } = useFetchTransaction(currentPage, keyword, refreshTrigger)
  const router = useRouter()

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setKeyword((e.target as HTMLInputElement).value)
      setCurrentPage(1)
    }
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
        <div className="mb-8 flex items-center justify-between gap-8">
          <div>
            <Typography
              variant="h5"
              color="blue-gray"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              Daftar Transaksi
            </Typography>
            <Typography
              color="gray"
              className="mt-1 font-normal"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              Transaksi dibuat otomatis dari backend saat penanganan dibuat,
              halaman ini hanya untuk mengubah data transaksi
            </Typography>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button
              variant="outlined"
              size="sm"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onClick={async () => {
                await logout()
                router.push('/login')
              }}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              Log Out
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="w-full md:w-72">
            <Input
              label="Cari Transaksi"
              icon={<MagnifyingGlassIcon className="size-5" />}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onKeyDown={handleInputKeyDown}
              onResize={undefined}
              onResizeCapture={undefined}
            />
          </div>
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
        <TableTransaction Data={{ transaction: data }} onUpdateSuccess={handleRefresh} />
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
          pageSize={100}
        />
      </CardFooter>
    </Card>
  )
}
