'use client'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/solid'
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Typography,
} from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import Pagination from '../_components/pagination'
import TableItem from '../_components/tableItem'
import { apiFetch } from '../_functions/apiFetch'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import { ItemType } from '../_types/item'
import { logout } from '../_functions/logout'

interface ListItemResponse {
  data: ItemType[]
  total: number
}

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeItem(item: any): ItemType {
  return {
    ID: toNumber(item?.ID ?? item?.id),
    name: String(item?.name ?? item?.item_name ?? item?.title ?? ''),
    price: toNumber(item?.price ?? item?.amount ?? item?.nominal),
    quantity: toNumber(item?.quantity ?? item?.qty ?? item?.stock),
  }
}

function useFetchItem(
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
        const limit = 100
        const offset = (currentPage - 1) * limit
        let params = `limit=${limit}&offset=${offset}`
        if (keyword && keyword.trim() !== '') {
          params += `&keyword=${encodeURIComponent(keyword)}`
        }

        const res = await apiFetch(`/item?${params}`, { method: 'GET' })
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
        const responseData = await res.json()

        const rawArray =
          responseData?.data?.items ??
          responseData?.data?.item ??
          responseData?.data ??
          []

        const itemArray = Array.isArray(rawArray)
          ? rawArray.map(normalizeItem)
          : []

        setItems(itemArray)
        setTotal(responseData?.data?.total ?? responseData?.total ?? 0)
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

export default function ItemPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const { data, total } = useFetchItem(currentPage, keyword, refreshTrigger)
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

  const handleOpenAddDialog = () => {
    if (!openAddDialog) {
      const nameInput = document.querySelector<HTMLInputElement>('#add_name')
      const priceInput = document.querySelector<HTMLInputElement>('#add_price')
      const quantityInput =
        document.querySelector<HTMLInputElement>('#add_quantity')
      if (nameInput) nameInput.value = ''
      if (priceInput) priceInput.value = ''
      if (quantityInput) quantityInput.value = ''
    }
    setOpenAddDialog((prev) => !prev)
  }

  const handleAddItem = () => {
    const nameInput =
      document.querySelector<HTMLInputElement>('#add_name')?.value || ''
    const priceInput =
      document.querySelector<HTMLInputElement>('#add_price')?.value || '0'
    const quantityInput =
      document.querySelector<HTMLInputElement>('#add_quantity')?.value || '0'

    if (!nameInput.trim()) {
      Swal.fire({
        text: 'Nama item tidak boleh kosong.',
        icon: 'warning',
        confirmButtonText: 'OK',
      })
      return
    }

    apiFetch('/item', {
      method: 'POST',
      body: JSON.stringify({
        name: nameInput.trim(),
        price: Number(priceInput),
        quantity: Number(quantityInput),
      }),
    })
      .then((response) => {
        if (response.status === 401) {
          UnauthorizedAccess(router)
          return Promise.reject(new Error('Unauthorized'))
        }
        if (!response.ok) {
          throw new Error('Failed to add item')
        }
        return response.json()
      })
      .then((dataResponse) => {
        console.log('Item added successfully:', dataResponse)
        setOpenAddDialog(false)
        Swal.fire({
          text: 'Data item berhasil ditambahkan.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          handleRefresh()
        })
      })
      .catch((error) => {
        console.error('Error adding item:', error)
        if (error.message !== 'Unauthorized') {
          Swal.fire({
            text: 'Gagal menambahkan data item.',
            icon: 'error',
            confirmButtonText: 'OK',
          })
        }
      })
  }

  return (
    <>
      <Dialog
        size={'md'}
        handler={handleOpenAddDialog}
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        open={openAddDialog}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        <DialogHeader
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          Tambah Item Baru
        </DialogHeader>
        <DialogBody
          className="px-2 md:px-6"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <div className="flex flex-col gap-4">
            <Input
              id="add_name"
              type="text"
              label="Nama Item"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="add_price"
              type="number"
              label="Harga"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="add_quantity"
              type="number"
              label="Quantity"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
          </div>
        </DialogBody>
        <DialogFooter
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <Button
            variant="text"
            color="red"
            onClick={handleOpenAddDialog}
            className="mr-1"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <span>Cancel</span>
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={handleAddItem}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <span>Tambah</span>
          </Button>
        </DialogFooter>
      </Dialog>

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
                Daftar Item
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
                Kelola data item
              </Typography>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button
                className="flex items-center gap-3"
                size="sm"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onClick={handleOpenAddDialog}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                <PlusIcon strokeWidth={2} className="size-4" /> Tambah Item
              </Button>
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
                label="Cari Item"
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
          <TableItem Data={{ item: data }} onDataChange={handleRefresh} />
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
    </>
  )
}
