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
  Tabs,
  TabsHeader,
  Tab,
} from '@material-tailwind/react'
import { useEffect, useState } from 'react'
import Pagination from '../_components/pagination'
import TableTherapist from '../_components/tableTherapist'
import { TherapistType } from '../_types/therapist'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import { getApiHost } from '../_functions/apiHost'

interface ListTherapistResponse {
  data: {
    therapist: TherapistType[]
  }
  total: number
}

function useFetchTherapist(
  currentPage: number,
  keyword: string
): ListTherapistResponse {
  const [therapist, setTherapist] = useState<TherapistType[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(
          `${getApiHost()}/therapist?${keyword ? `keyword=${keyword}` : `limit=10&offset=${(currentPage - 1) * 10}`}`,
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
        setTherapist(data.data.therapists)
        // console.log(`therapistArray: `, data.data.therapists)
        setTotal(data.data.total)
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          UnauthorizedAccess()
        }
        console.error('Error fetching therapist:', error)
      }
    })()
  }, [currentPage, keyword])

  return { data: { therapist: therapist }, total }
}

const TABS = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Approved',
    value: 'approved',
  },
  {
    label: 'Unapproved',
    value: 'unapproved',
  },
]

export default function ListTherapist() {
  const [currentPage, setCurrentPage] = useState(1)
  const [therapists, setTherapists] = useState<TherapistType[]>([])
  const [, setTotal] = useState(0)
  const [keyword, setKeyword] = useState('')
  const { data, total } = useFetchTherapist(currentPage, keyword)
  useEffect(() => {
    setTherapists(data.therapist)
  }, [data])

  const handleInputKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      const newKeyword = (e.target as HTMLInputElement).value
      setKeyword(newKeyword)
      try {
        const res = await fetch(
          `${getApiHost()}/therapist?keyword=${newKeyword}`,
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
        const therapistArray = Array.isArray(therapists)
          ? data.data.therapists
          : []
        setTherapists(therapistArray)
        setTotal(data.data.total)
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          UnauthorizedAccess()
        }
        console.error('Error fetching therapist:', error)
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
                Daftar Terapis
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
                Lihat semua informasi mengenai terapis
              </Typography>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button
                className="flex items-center gap-3"
                size="sm"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onClick={() => window.open('/therapist/register', '_blank')}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                <UserPlusIcon strokeWidth={2} className="size-4" /> Tambah
                Terapis
              </Button>
              <Button
                variant="outlined"
                size="sm"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onClick={async () => {
                  try {
                    const response = await fetch(`${getApiHost()}/logout`, {
                      method: 'DELETE',
                      mode: 'cors',
                      headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization:
                          'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
                        'session-token':
                          localStorage.getItem('session-token') ?? '',
                      },
                    })
                    if (!response.ok) {
                      throw new Error(`HTTP error! Status: ${response.status}`)
                    }
                    console.log('Logged out successfully')
                  } catch (error) {
                    console.error('Logout error:', error)
                  }
                  localStorage.removeItem('session-token')
                  window.location.href = '/login'
                }}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                Log Out
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Tabs value="all" className="w-full md:w-max">
              <TabsHeader
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                {TABS.map(({ label, value }) => (
                  <Tab
                    key={value}
                    value={value}
                    placeholder={undefined}
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                    onResize={undefined}
                    onResizeCapture={undefined}
                  >
                    &nbsp;&nbsp;{label}&nbsp;&nbsp;
                  </Tab>
                ))}
              </TabsHeader>
            </Tabs>
            <div className="w-full md:w-72">
              <Input
                label="Cari Terapis"
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
          <TableTherapist Data={{ therapist: therapists }} />
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
