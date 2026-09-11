'use client'
import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import MegaMenuDefault from '../_components/megaMenu'
import {
  MagnifyingGlassIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline'

import {
  Card,
  CardHeader,
  Typography,
  Button,
  CardBody,
  CardFooter,
  Input,
} from '@material-tailwind/react'
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns'
import { TreatmentType } from '../_types/treatment'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import { apiFetch } from '../_functions/apiFetch'
import { useRouter } from 'next/navigation'
import { getUserRole, useUserRole } from '../_functions/userRole'
import Pagination from '../_components/pagination'
import { getApiHost } from '../_functions/apiHost'
import { useFetchTreatment } from '../_hooks/useFetchTreatment'

const TABLE_HEAD = [
  'Nama Pasien (K. Pasien)',
  'Umur',
  'Tanggal/Waktu',
  'Terapis (ID)',
  'Keluhan',
]
interface TherapistSummary {
  therapistId: number
  therapistName: string
  visitCount: number
  totalIncome: number
  paidIncome: number
}

interface PeriodSummaryData {
  totalGross: number
  totalNet: number
  transactionCount: number
  therapists: TherapistSummary[]
  loading: boolean
  error: string | null
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val)
}

const processTransactions = (
  rawTransactions: any[]
): Omit<PeriodSummaryData, 'loading' | 'error'> => {
  let totalGross = 0
  let totalNet = 0
  const therapistMap: Record<
    number,
    {
      therapistName: string
      visitCount: number
      totalIncome: number
      paidIncome: number
    }
  > = {}
  let nextTempTherapistId = -1
  const tempTherapistIds: Record<string, number> = {}

  rawTransactions.forEach((tx) => {
    const amount = Number(tx.amount || 0)
    totalGross += amount
    const isPaid = tx.payment_status === 'paid'
    const isPartial = tx.payment_status === 'partial'
    if (isPaid || isPartial) totalNet += amount

    let therapistId = Number(tx.therapist_id || 0)
    const therapistName = String(
      tx.therapist_name ||
        (tx.therapist_id ? `Terapis ID: ${tx.therapist_id}` : 'Unknown')
    )
    if (!therapistId && therapistName && therapistName !== 'Unknown') {
      therapistId =
        tempTherapistIds[therapistName] ??
        (tempTherapistIds[therapistName] = nextTempTherapistId--)
    }
    if (!therapistMap[therapistId]) {
      therapistMap[therapistId] = {
        therapistName,
        visitCount: 0,
        totalIncome: 0,
        paidIncome: 0,
      }
    }

    therapistMap[therapistId].visitCount += 1
    therapistMap[therapistId].totalIncome += amount
    if (isPaid || isPartial) {
      therapistMap[therapistId].paidIncome += amount
    }
  })

  const therapists: TherapistSummary[] = Object.entries(therapistMap)
    .map(([id, val]) => ({
      therapistId: Number(id),
      therapistName: val.therapistName,
      visitCount: val.visitCount,
      totalIncome: val.totalIncome,
      paidIncome: val.paidIncome,
    }))
    .sort((a, b) => b.totalIncome - a.totalIncome)

  return {
    totalGross,
    totalNet,
    transactionCount: rawTransactions.length,
    therapists,
  }
}

const fetchPeriodData = async (
  start: string,
  end: string,
  maxRetries = 2
): Promise<Omit<PeriodSummaryData, 'loading' | 'error'>> => {
  const url = `/transaction?start_date=${start}&end_date=${end}&limit=1000`
  let lastError: any = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await apiFetch(url, { method: 'GET' })
      if (!res.ok) {
        if ([502, 503, 504].includes(res.status) && attempt < maxRetries) {
          await new Promise((resolve) =>
            setTimeout(resolve, 800 * Math.pow(1.5, attempt))
          )
          continue
        }
        if (res.status === 502) {
          throw new Error('Server upstream tidak merespons (502 Bad Gateway)')
        }
        if (res.status === 503) {
          throw new Error('Layanan sedang tidak tersedia (503)')
        }
        throw new Error(`HTTP error! Status: ${res.status}`)
      }
      const jsonData = await res.json()
      const rawArray =
        jsonData?.data?.transactions ??
        jsonData?.data?.transaction ??
        jsonData?.data ??
        []
      return processTransactions(Array.isArray(rawArray) ? rawArray : [])
    } catch (err: any) {
      lastError = err
      if (
        attempt < maxRetries &&
        (!err?.message || !err.message.includes('401'))
      ) {
        await new Promise((resolve) =>
          setTimeout(resolve, 800 * Math.pow(1.5, attempt))
        )
      } else {
        break
      }
    }
  }
  throw lastError || new Error('Gagal mengambil data transaksi')
}

interface SummaryCardProps {
  title: string
  dateLabel: string
  data: PeriodSummaryData
  colorClass?: string
  customHeader?: React.ReactNode
  onRetry?: () => void
}

function SummaryCard({
  title,
  dateLabel,
  data,
  colorClass = 'from-blue-600 to-indigo-700',
  customHeader,
  onRetry,
}: SummaryCardProps) {
  return (
    <Card
      className="flex min-h-[380px] flex-col overflow-hidden rounded-xl border border-blue-gray-100 bg-white shadow-lg"
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
      onResize={undefined}
      onResizeCapture={undefined}
    >
      <div className={`bg-gradient-to-r p-4 ${colorClass} text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h6 className="text-xs font-bold uppercase tracking-wide text-white">
              {title}
            </h6>
            <p className="text-xs font-normal text-white/80">{dateLabel}</p>
          </div>
          {customHeader}
        </div>
      </div>
      <CardBody
        className="flex flex-1 flex-col justify-between p-4"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        {data.loading ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-3 py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="animate-pulse text-xs text-gray-500">
              Loading data...
            </p>
          </div>
        ) : data.error ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-2 p-4 text-center">
            <p className="text-xs font-semibold text-red-500">{data.error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-1 rounded bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
              >
                Coba Lagi
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-between space-y-4">
            {/* Income Display */}
            <div>
              <div className="mb-2">
                <p className="text-xs font-medium text-blue-gray-400">
                  Total Pendapatan (Gross)
                </p>
                <h4 className="animate-fade-in text-2xl font-extrabold leading-none tracking-tight text-blue-gray-800">
                  {formatCurrency(data.totalGross)}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 animate-ping rounded-full bg-green-500" />
                <p className="text-xs font-semibold text-green-700">
                  Terbayar (Net): {formatCurrency(data.totalNet)}
                </p>
              </div>
              <p className="mt-0.5 text-[10px] text-blue-gray-400">
                Total Transaksi: {data.transactionCount}
              </p>
            </div>

            <hr className="border-blue-gray-50" />

            {/* Therapist Breakdown */}
            <div className="flex flex-1 flex-col">
              <p className="mb-2 text-xs font-semibold text-blue-gray-600">
                Kontribusi Terapis
              </p>
              {data.therapists.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg bg-gray-50/50 py-4">
                  <p className="text-xs italic text-gray-500">
                    Tidak ada data transaksi
                  </p>
                </div>
              ) : (
                <div className="max-h-[160px] space-y-2.5 overflow-y-auto pr-1">
                  {data.therapists.map((therapist) => {
                    const pct =
                      data.totalGross > 0
                        ? Math.round(
                            (therapist.totalIncome / data.totalGross) * 100
                          )
                        : 0
                    return (
                      <div key={therapist.therapistId} className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="max-w-[130px] truncate text-xs font-medium text-blue-gray-800">
                            {therapist.therapistName}
                          </span>
                          <span className="text-xs font-semibold text-blue-gray-800">
                            {formatCurrency(therapist.totalIncome)}{' '}
                            <span className="text-[10px] font-normal text-blue-gray-400">
                              ({therapist.visitCount})
                            </span>
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-gray-50">
                          <div
                            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const {
    data,
    total,
    loading: treatmentLoading,
    error: treatmentError,
    refetch: refetchTreatment,
  } = useFetchTreatment(currentPage, keyword, undefined, undefined, todayStr)
  const treatment = data.treatment
  const router = useRouter()
  const userRole = useUserRole()

  // Summaries states
  const [dailyData, setDailyData] = useState<PeriodSummaryData>({
    totalGross: 0,
    totalNet: 0,
    transactionCount: 0,
    therapists: [],
    loading: true,
    error: null,
  })
  const [weeklyData, setWeeklyData] = useState<PeriodSummaryData>({
    totalGross: 0,
    totalNet: 0,
    transactionCount: 0,
    therapists: [],
    loading: true,
    error: null,
  })
  const [monthlyData, setMonthlyData] = useState<PeriodSummaryData>({
    totalGross: 0,
    totalNet: 0,
    transactionCount: 0,
    therapists: [],
    loading: true,
    error: null,
  })

  const [customStart, setCustomStart] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7) // default to last 7 days
    return format(d, 'yyyy-MM-dd')
  })
  const [customEnd, setCustomEnd] = useState<string>(() =>
    format(new Date(), 'yyyy-MM-dd')
  )

  const [customData, setCustomData] = useState<PeriodSummaryData>({
    totalGross: 0,
    totalNet: 0,
    transactionCount: 0,
    therapists: [],
    loading: true,
    error: null,
  })

  // Date ranges calculation
  const getTodayRange = () => {
    const d = new Date()
    const todayStr = format(d, 'yyyy-MM-dd')
    return { start: todayStr, end: todayStr }
  }

  const getWeeklyRange = () => {
    const now = new Date()
    const monday = startOfWeek(now, { weekStartsOn: 1 })
    const sunday = endOfWeek(now, { weekStartsOn: 1 })
    return {
      start: format(monday, 'yyyy-MM-dd'),
      end: format(sunday, 'yyyy-MM-dd'),
    }
  }

  const getMonthlyRange = () => {
    const now = new Date()
    const first = startOfMonth(now)
    const last = endOfMonth(now)
    return {
      start: format(first, 'yyyy-MM-dd'),
      end: format(last, 'yyyy-MM-dd'),
    }
  }

  const getTodayLabel = () => format(new Date(), 'dd MMM yyyy')
  const getWeeklyLabel = () => {
    const now = new Date()
    const monday = startOfWeek(now, { weekStartsOn: 1 })
    const sunday = endOfWeek(now, { weekStartsOn: 1 })
    return `${format(monday, 'dd MMM')} - ${format(sunday, 'dd MMM yyyy')}`
  }
  const getMonthlyLabel = () => format(new Date(), 'MMMM yyyy')

  const fetchDaily = useCallback(() => {
    setDailyData((prev) => ({ ...prev, loading: true, error: null }))
    const dailyRange = getTodayRange()
    fetchPeriodData(dailyRange.start, dailyRange.end)
      .then((resData) =>
        setDailyData({ ...resData, loading: false, error: null })
      )
      .catch((err) => {
        if (err instanceof Error && err.message.includes('401')) {
          UnauthorizedAccess(router)
          return
        }
        setDailyData((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        }))
      })
  }, [router])

  const fetchWeekly = useCallback(() => {
    setWeeklyData((prev) => ({ ...prev, loading: true, error: null }))
    const weeklyRange = getWeeklyRange()
    fetchPeriodData(weeklyRange.start, weeklyRange.end)
      .then((resData) =>
        setWeeklyData({ ...resData, loading: false, error: null })
      )
      .catch((err) => {
        if (err instanceof Error && err.message.includes('401')) {
          UnauthorizedAccess(router)
          return
        }
        setWeeklyData((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        }))
      })
  }, [router])

  const fetchMonthly = useCallback(() => {
    setMonthlyData((prev) => ({ ...prev, loading: true, error: null }))
    const monthlyRange = getMonthlyRange()
    fetchPeriodData(monthlyRange.start, monthlyRange.end)
      .then((resData) =>
        setMonthlyData({ ...resData, loading: false, error: null })
      )
      .catch((err) => {
        if (err instanceof Error && err.message.includes('401')) {
          UnauthorizedAccess(router)
          return
        }
        setMonthlyData((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        }))
      })
  }, [router])

  const fetchCustom = useCallback(() => {
    if (!customStart || !customEnd || customStart > customEnd) return
    setCustomData((prev) => ({ ...prev, loading: true, error: null }))
    fetchPeriodData(customStart, customEnd)
      .then((resData) =>
        setCustomData({ ...resData, loading: false, error: null })
      )
      .catch((err) => {
        if (err instanceof Error && err.message.includes('401')) {
          UnauthorizedAccess(router)
          return
        }
        setCustomData((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        }))
      })
  }, [customStart, customEnd, router])

  useEffect(() => {
    if (userRole === null) return
    if (userRole !== 'super_admin') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDailyData((prev) => ({ ...prev, loading: false }))
      setWeeklyData((prev) => ({ ...prev, loading: false }))
      setMonthlyData((prev) => ({ ...prev, loading: false }))
      return
    }

    fetchDaily()
    fetchWeekly()
    fetchMonthly()
  }, [userRole, fetchDaily, fetchWeekly, fetchMonthly])

  const handleCustomStartChange = (val: string) => {
    setCustomStart(val)
    if (val && customEnd) {
      if (val > customEnd) {
        setCustomData((prev) => ({
          ...prev,
          loading: false,
          error: 'Rentang tanggal tidak valid (mulai > akhir)',
        }))
      } else {
        setCustomData((prev) => ({ ...prev, loading: true, error: null }))
      }
    }
  }

  const handleCustomEndChange = (val: string) => {
    setCustomEnd(val)
    if (customStart && val) {
      if (customStart > val) {
        setCustomData((prev) => ({
          ...prev,
          loading: false,
          error: 'Rentang tanggal tidak valid (mulai > akhir)',
        }))
      } else {
        setCustomData((prev) => ({ ...prev, loading: true, error: null }))
      }
    }
  }

  useEffect(() => {
    if (!customStart || !customEnd) return
    if (customStart > customEnd) return
    if (userRole === null) return
    if (userRole !== 'super_admin') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCustomData((prev) => ({ ...prev, loading: false }))
      return
    }

    fetchCustom()
  }, [customStart, customEnd, userRole, fetchCustom])

  return (
    <div className="min-h-screen space-y-6 bg-blue-gray-50/20 p-4 md:p-6">
      <MegaMenuDefault />

      {/* Grid of Summaries */}
      {userRole === 'super_admin' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Ringkasan Harian"
            dateLabel={getTodayLabel()}
            data={dailyData}
            colorClass="from-teal-500 to-emerald-700"
            onRetry={fetchDaily}
          />
          <SummaryCard
            title="Ringkasan Mingguan"
            dateLabel={getWeeklyLabel()}
            data={weeklyData}
            colorClass="from-blue-500 to-indigo-700"
            onRetry={fetchWeekly}
          />
          <SummaryCard
            title="Ringkasan Bulanan"
            dateLabel={getMonthlyLabel()}
            data={monthlyData}
            colorClass="from-purple-500 to-indigo-800"
            onRetry={fetchMonthly}
          />
          <SummaryCard
            title="Kustom Tanggal"
            dateLabel={`${customStart} s/d ${customEnd}`}
            data={customData}
            colorClass="from-blue-gray-600 to-blue-gray-800"
            onRetry={fetchCustom}
            customHeader={
              <div className="flex items-center gap-2 text-black">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => handleCustomStartChange(e.target.value)}
                  className="max-w-[85px] rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] focus:outline-none"
                />
                <span className="self-center text-xs text-white">s/d</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => handleCustomEndChange(e.target.value)}
                  className="max-w-[85px] rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] focus:outline-none"
                />
              </div>
            }
          />
        </div>
      )}

      <Card
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
        className="border border-blue-gray-100 shadow-md"
      >
        <CardHeader
          floated={false}
          shadow={false}
          className="m-0 rounded-none p-4 pb-0"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <Typography
                variant="h5"
                color="blue-gray"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
                className="font-bold"
              >
                Jadwal Penanganan Hari Ini
              </Typography>
            </div>
            <div className="flex w-full shrink-0 gap-2 md:w-max">
              <div className="w-full md:w-72">
                <Input
                  label="Search"
                  icon={<MagnifyingGlassIcon className="size-5" />}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  crossOrigin={undefined}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      const newKeyword = (e.target as HTMLInputElement).value
                      setKeyword(newKeyword)
                      setCurrentPage(1)
                    }
                  }}
                  onResize={undefined}
                  onResizeCapture={undefined}
                />
              </div>
              {userRole === 'super_admin' && (
                <Button
                  className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
                  size="sm"
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  onResize={undefined}
                  onResizeCapture={undefined}
                  onClick={() => window.open('/treatment/register', '_blank')}
                >
                  <PlusCircleIcon
                    strokeWidth={2}
                    className="size-4 text-white"
                  />{' '}
                  Tambah Penanganan
                </Button>
              )}
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
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-bold leading-none opacity-80"
                      placeholder={undefined}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                      onResize={undefined}
                      onResizeCapture={undefined}
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {treatmentLoading ? (
                <tr>
                  <td colSpan={TABLE_HEAD.length} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="size-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                      <p className="text-xs text-gray-500">
                        Memuat jadwal penanganan...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : treatmentError ? (
                <tr>
                  <td colSpan={TABLE_HEAD.length} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <p className="text-xs font-semibold text-red-500">
                        {treatmentError}
                      </p>
                      <button
                        type="button"
                        onClick={refetchTreatment}
                        className="rounded bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
                      >
                        Coba Lagi
                      </button>
                    </div>
                  </td>
                </tr>
              ) : treatment.length === 0 ? (
                <tr>
                  <td
                    colSpan={TABLE_HEAD.length}
                    className="p-8 text-center text-xs italic text-gray-500"
                  >
                    Tidak ada jadwal penanganan hari ini
                  </td>
                </tr>
              ) : (
                treatment.map(
                  (
                    {
                      ID,
                      patient_name,
                      patient_code,
                      age,
                      treatment_date,
                      therapist_name,
                      therapist_id,
                      issues,
                    },
                    index
                  ) => {
                    const isLast = index === treatment.length - 1
                    const classes = isLast
                      ? 'p-4'
                      : 'p-4 border-b border-blue-gray-50'

                    return (
                      <tr
                        key={ID || `${patient_code}-${index}`}
                        className="transition-colors hover:bg-blue-gray-50/20"
                      >
                        <td className={classes}>
                          <div className="flex items-center gap-3">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold"
                              placeholder={undefined}
                              onPointerEnterCapture={undefined}
                              onPointerLeaveCapture={undefined}
                              onResize={undefined}
                              onResizeCapture={undefined}
                            >
                              {patient_name} ({patient_code})
                            </Typography>
                          </div>
                        </td>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            placeholder={undefined}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                            onResize={undefined}
                            onResizeCapture={undefined}
                          >
                            {age} Tahun
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            placeholder={undefined}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                            onResize={undefined}
                            onResizeCapture={undefined}
                          >
                            {treatment_date}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            placeholder={undefined}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                            onResize={undefined}
                            onResizeCapture={undefined}
                          >
                            {therapist_name} ({therapist_id})
                          </Typography>
                        </td>
                        <td className={classes}>
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal opacity-70"
                                placeholder={undefined}
                                onPointerEnterCapture={undefined}
                                onPointerLeaveCapture={undefined}
                                onResize={undefined}
                                onResizeCapture={undefined}
                              >
                                {issues}
                              </Typography>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  }
                )
              )}
            </tbody>
          </table>
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
    </div>
  )
}
