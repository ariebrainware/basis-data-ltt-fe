'use client'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/solid'
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  CardFooter,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import Pagination from '../_components/pagination'
import TableDisease from '../_components/tableDisease'
import { DiseaseType } from '../_types/disease'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import { getApiHost } from '../_functions/apiHost'
import { getSessionToken } from '../_functions/sessionToken'
import { logout } from '../_functions/logout'
import Swal from 'sweetalert2'

interface ListDiseaseResponse {
  data: {
    diseases: DiseaseType[]
  }
  total: number
}

function useFetchDisease(
  currentPage: number,
  keyword: string,
  refreshTrigger: number
): ListDiseaseResponse {
  const [diseases, setDiseases] = useState<DiseaseType[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    ;(async () => {
      try {
        const limit = 100
        const offset = (currentPage - 1) * limit
        let params = `limit=${limit}&offset=${offset}`
        if (keyword && keyword.trim() !== '')
          params += `&keyword=${encodeURIComponent(keyword)}`

        const res = await fetch(`${getApiHost()}/disease?${params}`, {
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
        const diseasesArray = Array.isArray(data.data)
          ? data.data
          : []
        setDiseases(diseasesArray)
        setTotal(data.total || 0)
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          UnauthorizedAccess()
        }
        console.error('Error fetching diseases:', error)
      }
    })()
  }, [currentPage, keyword, refreshTrigger])

  return { data: { diseases }, total }
}

export default function Disease() {
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const { data, total } = useFetchDisease(currentPage, keyword, refreshTrigger)

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newKeyword = (e.target as HTMLInputElement).value
      setKeyword(newKeyword)
      setCurrentPage(1)
    }
  }

  const handleOpenAddDialog = () => setOpenAddDialog(!openAddDialog)

  const handleAddDisease = () => {
    const name_input =
      document.querySelector<HTMLInputElement>('#add_name')?.value || ''
    const description_input =
      document.querySelector<HTMLTextAreaElement>('#add_description')?.value ||
      ''

    if (!name_input.trim()) {
      Swal.fire({
        text: 'Nama penyakit tidak boleh kosong.',
        icon: 'warning',
        confirmButtonText: 'OK',
      })
      return
    }

    fetch(`${getApiHost()}/disease`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
        'session-token': getSessionToken(),
      },
      body: JSON.stringify({
        name: name_input,
        description: description_input,
      }),
    })
      .then((response) => {
        if (response.status === 401) {
          UnauthorizedAccess()
          return Promise.reject(new Error('Unauthorized'))
        }
        if (!response.ok) {
          throw new Error('Failed to add disease')
        }
        return response.json()
      })
      .then((data) => {
        console.log('Disease added successfully:', data)
        setOpenAddDialog(false)
        Swal.fire({
          text: 'Data penyakit berhasil ditambahkan.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          handleRefresh()
        })
      })
      .catch((error) => {
        console.error('Error adding disease:', error)
        if (error.message !== 'Unauthorized') {
          Swal.fire({
            text: 'Gagal menambahkan data penyakit.',
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
          Tambah Penyakit Baru
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
              label="Nama Penyakit"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <textarea
              id="add_description"
              placeholder="Deskripsi"
              className="border-slate-200 text-slate-800 placeholder:text-slate-600/60 hover:border-slate-800 focus:border-slate-800 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-all"
              rows={4}
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
            onClick={handleAddDisease}
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
                Daftar Penyakit
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
                Lihat semua informasi mengenai penyakit
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
                <PlusIcon strokeWidth={2} className="size-4" /> Tambah Penyakit
              </Button>
              <Button
                variant="outlined"
                size="sm"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onClick={logout}
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
                label="Cari Penyakit"
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
          <TableDisease
            Data={{
              diseases: data.diseases,
            }}
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
            pageSize={100}
            disabled={currentPage * 100 >= total}
          />
        </CardFooter>
      </Card>
    </>
  )
}
