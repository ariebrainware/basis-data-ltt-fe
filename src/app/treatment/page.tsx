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
import { useRouter } from 'next/navigation'
import Pagination from '../_components/pagination'
import TableTreatment from '../_components/tableTreatment'
import { TreatmentType } from '../_types/treatment'
import { logout } from '../_functions/logout'
import { useUserRole } from '../_functions/userRole'
import { useFetchTreatment } from '../_hooks/useFetchTreatment'

export default function ListTreatment() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [treatment, setTreatment] = useState<TreatmentType[]>([])
  const [keyword, setKeyword] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { data, total } = useFetchTreatment(
    currentPage,
    keyword,
    undefined,
    refreshTrigger
  )
  const userRole = useUserRole()

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }
  useEffect(() => {
    const t = setTimeout(() => setTreatment(data.treatment), 0)
    return () => clearTimeout(t)
  }, [data])

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newKeyword = (e.target as HTMLInputElement).value
      setKeyword(newKeyword)
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
              {userRole === 'super_admin' && (
                <Button
                  className="flex items-center gap-3"
                  size="sm"
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  onClick={() => window.open('/treatment/register', '_blank')}
                  onResize={undefined}
                  onResizeCapture={undefined}
                >
                  <UserPlusIcon strokeWidth={2} className="size-4" /> Tambah
                  Penanganan
                </Button>
              )}
              <Button
                variant="outlined"
                size="sm"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onClick={async () => {
                  await logout()
                  router.replace('/login')
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
          <TableTreatment
            Data={{ treatment: treatment }}
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
          />
        </CardFooter>
      </Card>
    </>
  )
}
