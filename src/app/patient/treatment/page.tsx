'use client'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { UserPlusIcon } from '@heroicons/react/24/solid'
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  CardFooter,
} from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import Pagination from '../../_components/pagination'
import TableTreatment from '../../_components/tableTreatment'
import { TreatmentType } from '../../_types/treatment'
import { UnauthorizedAccess } from '../../_functions/unauthorized'
import { getApiHost } from '../../_functions/apiHost'
import { getSessionToken } from '../../_functions/sessionToken'
import { logout } from '../../_functions/logout'

interface ListTreatmentResponse {
  data: {
    treatment: TreatmentType[]
  }
  total: number
}

function useFetchTreatment(
  currentPage: number,
  keyword: string
): ListTreatmentResponse {
  const [treatment, setTreatment] = useState<TreatmentType[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(
          `${getApiHost()}/patient/treatment?${keyword ? `keyword=${keyword}` : `limit=20&offset=${(currentPage - 1) * 20}`}`,
          {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
              'session-token': getSessionToken(),
            },
          }
        )
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
        const data = await res.json()
        const treatmentArray: TreatmentType[] = Array.isArray(
          data.data.treatments
        )
          ? data.data.treatments
          : []
        setTreatment(treatmentArray)
        console.log(`data: `, data.data.treatments)
        console.log(`treatmentArray: `, treatmentArray)
        setTotal(data.data.total)
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          UnauthorizedAccess()
        }
        console.error('Error fetching treatment:', error)
      }
    })()
  }, [currentPage, keyword])

  return { data: { treatment: treatment }, total }
}

export default function ListTreatment() {
  const [currentPage, setCurrentPage] = useState(1)
  const [treatment, setTreatment] = useState<TreatmentType[]>([])
  const [, setTotal] = useState(0)
  const [keyword, setKeyword] = useState('')
  const { data, total } = useFetchTreatment(currentPage, keyword)
  useEffect(() => {
    setTreatment(data.treatment)
  }, [data])

  const handleInputKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      const newKeyword = (e.target as HTMLInputElement).value
      setKeyword(newKeyword)
      try {
        const res = await fetch(`${getApiHost()}/patient/treatment`, {
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
        const treatmentArray = Array.isArray(data.data.treatments)
          ? data.data.treatments
          : []
        setTreatment(treatmentArray)
        setTotal(data.data.total)
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          UnauthorizedAccess()
        }
        console.error('Error fetching treatment:', error)
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
                Daftar Penanganan
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
                Lihat semua informasi mengenai penanganan yang telah dilakukan
                terhadap pasien
              </Typography>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button
                className="flex items-center gap-3"
                size="sm"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onClick={() =>
                  window.open('/patient/treatment/register', '_blank')
                }
                onResize={undefined}
                onResizeCapture={undefined}
              >
                <UserPlusIcon strokeWidth={2} className="size-4" /> Tambah
                Penanganan
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
                label="Cari Penanganan"
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
          <TableTreatment Data={{ treatment: treatment }} />
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
