'use client'
import {
  BanknotesIcon,
  CreditCardIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Typography,
} from '@material-tailwind/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Pagination from '../_components/pagination'
import MegaMenuDefault from '../_components/megaMenu'
import TableTransaction from '../_components/tableTransaction'
import { formatRupiah } from '../_functions/expenseHelpers'
import {
  calculatePaymentMethodBreakdown,
  useFetchTransaction,
} from '../_hooks/useFetchTransaction'

export default function TransactionPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const { data, summary, total, loading } = useFetchTransaction(
    currentPage,
    keyword,
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

  // Derive summary metrics from backend summary or fallback to loaded list
  const totalAmount = summary
    ? summary.total_amount
    : data.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)

  const paidCount = summary
    ? summary.payment_status_counts.paid
    : data.filter((t) => t.payment_status?.toLowerCase() === 'paid').length

  const partialCount = summary
    ? summary.payment_status_counts.partial
    : data.filter((t) => t.payment_status?.toLowerCase() === 'partial').length

  const unpaidCount = summary
    ? summary.payment_status_counts.unpaid
    : data.filter((t) => t.payment_status?.toLowerCase() === 'unpaid').length

  const totalTransactionsCount = summary
    ? paidCount + partialCount + unpaidCount
    : total || data.length

  const paymentMethodBreakdown =
    summary?.payment_method_breakdown &&
    summary.payment_method_breakdown.length > 0
      ? summary.payment_method_breakdown
      : calculatePaymentMethodBreakdown(data)

  return (
    <div className="min-h-screen space-y-6 bg-blue-gray-50/20 p-4 md:p-6">
      <MegaMenuDefault />

      <Card
        className="size-full border border-blue-gray-100 shadow-md"
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
                Daftar Transaksi
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
                Transaksi dibuat otomatis dari backend saat penanganan dibuat,
                halaman ini hanya untuk mengubah data transaksi
              </Typography>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Total Transaksi */}
            <div className="border-slate-200 from-emerald-50 rounded-xl border bg-gradient-to-br to-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-emerald-600 text-xs font-semibold uppercase tracking-wider">
                  Total Transaksi
                </span>
                <span className="bg-emerald-100 text-emerald-600 rounded-full p-1.5">
                  <BanknotesIcon className="size-4" />
                </span>
              </div>
              <p className="text-slate-800 mt-2 text-2xl font-bold">
                {formatRupiah(totalAmount)}
              </p>
              <p className="text-slate-500 mt-0.5 text-xs">
                {startDateFilter || endDateFilter
                  ? 'Berdasarkan filter tanggal'
                  : 'Total akumulasi nilai transaksi'}
              </p>
            </div>

            {/* Card 2: Status Pembayaran */}
            <div className="border-slate-200 rounded-xl border bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Status Pembayaran
                </span>
                <span className="rounded-full bg-blue-100 p-1.5 text-blue-600">
                  <FunnelIcon className="size-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-slate-800 text-2xl font-bold">
                  {totalTransactionsCount}
                </p>
                <span className="text-slate-500 text-xs">Transaksi</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-medium">
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-green-700 ring-1 ring-inset ring-green-600/20">
                  Lunas: {paidCount}
                </span>
                <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                  Sebagian: {partialCount}
                </span>
                <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-red-700 ring-1 ring-inset ring-red-600/20">
                  Belum: {unpaidCount}
                </span>
              </div>
            </div>

            {/* Card 3: Metode Pembayaran */}
            <div className="border-slate-200 rounded-xl border bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                  Metode Pembayaran
                </span>
                <span className="rounded-full bg-amber-100 p-1.5 text-amber-700">
                  <CreditCardIcon className="size-4" />
                </span>
              </div>
              {paymentMethodBreakdown.length > 0 ? (
                <div className="mt-2 space-y-1">
                  <div className="max-h-20 space-y-1 overflow-y-auto pr-1">
                    {paymentMethodBreakdown.map((pm, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs"
                      >
                        <span
                          className="text-slate-700 max-w-[110px] truncate font-medium"
                          title={pm.label}
                        >
                          {pm.label} ({pm.count})
                        </span>
                        <span className="text-slate-900 font-semibold">
                          {formatRupiah(pm.total_amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-slate-700 mt-2 text-sm font-semibold">
                    Belum ada data transaksi
                  </p>
                  <p className="text-slate-500 mt-0.5 text-xs">
                    Berdasarkan metode pembayaran
                  </p>
                </>
              )}
            </div>

            {/* Card 4: Pasien per Terapis */}
            <div className="border-slate-200 rounded-xl border bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                  Pasien per Terapis
                </span>
                <span className="rounded-full bg-purple-100 p-1.5 text-purple-600">
                  <UserGroupIcon className="size-4" />
                </span>
              </div>
              {summary &&
              summary.therapist_patient_counts &&
              summary.therapist_patient_counts.length > 0 ? (
                <div className="mt-2 space-y-1">
                  <div className="max-h-20 flex-wrap gap-1.5 space-y-1 overflow-y-auto">
                    {summary.therapist_patient_counts.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10"
                      >
                        {t.therapist_name || 'Tanpa Nama'}: {t.patient_count}{' '}
                        Pasien
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-slate-700 mt-2 text-sm font-semibold">
                    Belum ada data terapis
                  </p>
                  <p className="text-slate-500 mt-0.5 text-xs">
                    Data pasien terhubung ke terapis
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
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
              Memuat data transaksi...
            </div>
          ) : (
            <TableTransaction
              Data={{ transaction: data }}
              onUpdateSuccess={handleRefresh}
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
    </div>
  )
}
