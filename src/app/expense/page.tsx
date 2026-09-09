'use client'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'
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
  Select,
  Option,
  Typography,
} from '@material-tailwind/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import Pagination from '../_components/pagination'
import TableExpense from '../_components/tableExpense'
import { apiFetch } from '../_functions/apiFetch'
import { ExpenseForm } from '../_components/expenseForm'
import {
  readExpenseFormValues,
  resetExpenseFormInputs,
  validateExpenseForm,
  formatRupiah,
} from '../_functions/expenseHelpers'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import { logout } from '../_functions/logout'
import { useFetchExpense } from '../_hooks/useFetchExpense'
import { EXPENSE_CATEGORIES } from '../_types/expense'

export default function ExpensePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [openAddDialog, setOpenAddDialog] = useState(false)

  // Form states for Add Dialog
  const [addCategory, setAddCategory] = useState('Operational')
  const [addPaymentMethod, setAddPaymentMethod] = useState('bank_transfer')

  const { data, summary, total, loading } = useFetchExpense(
    currentPage,
    keyword,
    categoryFilter,
    startDateFilter,
    endDateFilter,
    refreshTrigger
  )
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
      resetExpenseFormInputs('add')
      setAddCategory('Operational')
      setAddPaymentMethod('bank_transfer')
    }
    setOpenAddDialog((prev) => !prev)
  }

  const handleAddExpense = async () => {
    const values = readExpenseFormValues('add')
    const validation = validateExpenseForm(
      values,
      addCategory,
      addPaymentMethod
    )

    if (!validation.ok) {
      Swal.fire({
        text: validation.message,
        icon: 'warning',
        confirmButtonText: 'OK',
      })
      return
    }

    try {
      const response = await apiFetch('/expense', {
        method: 'POST',
        body: JSON.stringify(validation.payload),
      })

      if (response.status === 401) {
        UnauthorizedAccess(router)
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData?.message ||
            errorData?.error ||
            'Gagal menambahkan data pengeluaran.'
        )
      }

      setOpenAddDialog(false)
      await Swal.fire({
        text: 'Data pengeluaran berhasil ditambahkan.',
        icon: 'success',
        confirmButtonText: 'OK',
      })
      handleRefresh()
    } catch (error) {
      console.error('Error adding expense:', error)
      Swal.fire({
        text:
          error instanceof Error
            ? error.message
            : 'Gagal menambahkan data pengeluaran.',
        icon: 'error',
        confirmButtonText: 'OK',
      })
    }
  }

  // Calculate total spending from current data or summary
  const totalAmount = summary
    ? summary.total_amount
    : data.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)

  return (
    <>
      {/* Modal Add Expense */}
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
          Tambah Pengeluaran Baru
        </DialogHeader>
        <DialogBody
          className="px-2 md:px-6"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <ExpenseForm
            category={addCategory}
            payment_method={addPaymentMethod}
            onCategoryChange={setAddCategory}
            onPaymentMethodChange={setAddPaymentMethod}
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
            onClick={handleAddExpense}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <span>Simpan</span>
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
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
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
                Daftar Pengeluaran
              </Typography>
              <Typography
                color="gray"
                className="mt-1 text-sm font-normal"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                Kelola data pencatatan pengeluaran operasional dan biaya klinik
              </Typography>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                className="flex items-center gap-2 bg-blue-600"
                size="sm"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onClick={handleOpenAddDialog}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                <PlusIcon strokeWidth={2} className="size-4" /> Tambah
                Pengeluaran
              </Button>
              <Button
                variant="outlined"
                size="sm"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onClick={() => router.push('/dashboard')}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                Dashboard
              </Button>
              <Button
                variant="outlined"
                size="sm"
                color="red"
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

          {/* Metric Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border-slate-200 from-rose-50 rounded-xl border bg-gradient-to-br to-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-rose-600 text-xs font-semibold uppercase tracking-wider">
                  Total Pengeluaran
                </span>
                <span className="bg-rose-100 text-rose-600 rounded-full p-1.5">
                  <CalendarDaysIcon className="size-4" />
                </span>
              </div>
              <p className="text-slate-800 mt-2 text-2xl font-bold">
                {formatRupiah(totalAmount)}
              </p>
              <p className="text-slate-500 mt-0.5 text-xs">
                {startDateFilter || endDateFilter
                  ? 'Berdasarkan filter tanggal'
                  : 'Total keseluruhan pengeluaran'}
              </p>
            </div>

            <div className="border-slate-200 rounded-xl border bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Jumlah Transaksi
                </span>
                <span className="rounded-full bg-blue-100 p-1.5 text-blue-600">
                  <FunnelIcon className="size-4" />
                </span>
              </div>
              <p className="text-slate-800 mt-2 text-2xl font-bold">
                {summary ? summary.total_count : total} Transaksi
              </p>
              <p className="text-slate-500 mt-0.5 text-xs">
                Tercatat di sistem
              </p>
            </div>

            <div className="border-slate-200 from-emerald-50 rounded-xl border bg-gradient-to-br to-white p-4 shadow-sm sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-emerald-600 text-xs font-semibold uppercase tracking-wider">
                  Kategori Terbanyak
                </span>
                <span className="bg-emerald-100 text-emerald-600 rounded-full p-1.5">
                  <FunnelIcon className="size-4" />
                </span>
              </div>
              <p className="text-slate-800 mt-2 truncate text-lg font-bold">
                {summary &&
                summary.category_breakdown &&
                summary.category_breakdown.length > 0
                  ? summary.category_breakdown[0].category
                  : 'Semua Kategori'}
              </p>
              <p className="text-slate-500 mt-0.5 text-xs">
                {summary &&
                summary.category_breakdown &&
                summary.category_breakdown.length > 0
                  ? `${formatRupiah(summary.category_breakdown[0].total_amount)} (${summary.category_breakdown[0].count} data)`
                  : 'Data operasional aktif'}
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <Input
                label="Cari Deskripsi / Catatan"
                icon={<MagnifyingGlassIcon className="size-5" />}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
                onKeyDown={handleInputKeyDown}
                onResize={undefined}
                onResizeCapture={undefined}
              />
            </div>
            <div>
              <Select
                label="Filter Kategori"
                value={categoryFilter}
                onChange={(val) => {
                  setCategoryFilter(val || '')
                  setCurrentPage(1)
                }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                <Option value="">Semua Kategori</Option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <Option key={cat} value={cat}>
                    {cat}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <Input
                type="date"
                label="Dari Tanggal"
                value={startDateFilter}
                onChange={(e) => {
                  setStartDateFilter(e.target.value)
                  setCurrentPage(1)
                }}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              />
            </div>
            <div>
              <Input
                type="date"
                label="Sampai Tanggal"
                value={endDateFilter}
                onChange={(e) => {
                  setEndDateFilter(e.target.value)
                  setCurrentPage(1)
                }}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
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
          {loading ? (
            <div className="text-slate-500 py-12 text-center font-medium">
              Memuat data pengeluaran...
            </div>
          ) : (
            <TableExpense
              Data={{ expenses: data }}
              onDataChange={handleRefresh}
            />
          )}
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
