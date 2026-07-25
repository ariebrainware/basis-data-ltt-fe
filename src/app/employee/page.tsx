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
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import Pagination from '../_components/pagination'
import TableEmployee from '../_components/tableEmployee'
import { apiFetch } from '../_functions/apiFetch'
import { EmployeeForm } from '../_components/employeeForm'
import {
  readEmployeeFormValues,
  resetEmployeeFormInputs,
  validateEmployeeForm,
} from '../_functions/employeeHelpers'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import { logout } from '../_functions/logout'
import { useFetchEmployee } from '../_hooks/useFetchEmployee'

export default function EmployeePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [genderValue, setGenderValue] = useState('')
  const { data, total } = useFetchEmployee(currentPage, keyword, refreshTrigger)
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
      resetEmployeeFormInputs()
      setGenderValue('')
    }
    setOpenAddDialog((prev) => !prev)
  }

  const handleAddEmployee = async () => {
    const values = readEmployeeFormValues()
    const validation = validateEmployeeForm(values, genderValue)

    if (!validation.ok) {
      Swal.fire({
        text: validation.message,
        icon: 'warning',
        confirmButtonText: 'OK',
      })
      return
    }

    try {
      const response = await apiFetch('/employee', {
        method: 'POST',
        body: JSON.stringify(validation.payload),
      })

      if (response.status === 401) {
        UnauthorizedAccess(router)
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error || 'Gagal menambahkan data karyawan.')
      }

      setOpenAddDialog(false)
      await Swal.fire({
        text: 'Data karyawan berhasil ditambahkan.',
        icon: 'success',
        confirmButtonText: 'OK',
      })
      handleRefresh()
    } catch (error) {
      console.error('Error adding employee:', error)
      Swal.fire({
        text:
          error instanceof Error
            ? error.message
            : 'Gagal menambahkan data karyawan.',
        icon: 'error',
        confirmButtonText: 'OK',
      })
    }
  }

  return (
    <>
      <Dialog
        size={'xl'}
        className="max-h-[90vh] overflow-y-auto"
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
          Tambah Karyawan Baru
        </DialogHeader>
        <DialogBody
          className="px-2 md:px-6"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <EmployeeForm
            onGenderChange={setGenderValue}
            gender={genderValue}
            isEdit={false}
          />
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
            <span>Batal</span>
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={handleAddEmployee}
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
                Daftar Karyawan
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
                Kelola data karyawan
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
                <PlusIcon strokeWidth={2} className="size-4" /> Tambah Karyawan
              </Button>
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
                label="Cari Karyawan"
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
          <TableEmployee
            Data={{ employees: data }}
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
          />
        </CardFooter>
      </Card>
    </>
  )
}
