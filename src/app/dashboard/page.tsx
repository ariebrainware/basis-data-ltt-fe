'use client'
import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import MegaMenuDefault from '../_components/megaMenu'
import GreetingBanner from '../_components/greetingBanner'

import { Card, CardBody } from '@material-tailwind/react'
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import { apiFetch } from '../_functions/apiFetch'
import { useRouter } from 'next/navigation'
import { useUserRole } from '../_functions/userRole'
import { getTherapistId, getUserId } from '../_functions/userId'
import CalendarTreatment from '../_components/calendarTreatment'
import {
  PeriodSummaryData,
  TherapistCommissionInfo,
  filterTransactionsForTherapist,
  formatCurrency,
  parseCommission,
  processTransactions,
  processTreatmentsFallback,
} from '../_functions/commissionHelpers'

const INITIAL_PERIOD_DATA: PeriodSummaryData = {
  totalGross: 0,
  totalNet: 0,
  totalEstimatedCommission: 0,
  totalEstimatedPaidCommission: 0,
  transactionCount: 0,
  therapists: [],
  loading: true,
  error: null,
}

class ForbiddenError extends Error {}

const fetchTherapistCommissions = async (): Promise<
  TherapistCommissionInfo[]
> => {
  try {
    const res = await apiFetch('/therapist?limit=1000', { method: 'GET' })
    if (!res.ok) return []
    const jsonData = await res.json()
    const rawList =
      jsonData?.data?.therapists ??
      jsonData?.data?.therapist ??
      (Array.isArray(jsonData?.data) ? jsonData.data : [])
    if (!Array.isArray(rawList)) return []

    return rawList.map((t: any) => ({
      id: Number(t?.ID ?? t?.id ?? 0),
      name: String(t?.full_name ?? t?.name ?? ''),
      commission:
        t?.commission !== undefined && t?.commission !== null
          ? String(t.commission)
          : undefined,
    }))
  } catch {
    return []
  }
}

const extractCommissionFromObject = (obj: any): string | undefined => {
  if (!obj || typeof obj !== 'object') return undefined
  const raw =
    obj.commission ??
    obj.commision ??
    obj.therapist_commission ??
    obj.therapist?.commission ??
    obj.therapist?.commision ??
    obj.user?.commission ??
    obj.user?.commision
  if (raw === undefined || raw === null) return undefined
  const str = String(raw).trim()
  return str || undefined
}

const resolveCurrentTherapistIdentity = async (): Promise<{
  therapistId: number | null
  therapistName: string
  commission?: string
}> => {
  let therapistIdStr = getTherapistId()
  let therapistName =
    typeof window !== 'undefined' ? localStorage.getItem('user-name') || '' : ''
  let commission: string | undefined =
    typeof window !== 'undefined'
      ? localStorage.getItem('therapist-commission') || undefined
      : undefined

  if (!therapistIdStr || commission === undefined) {
    const userId = getUserId()
    if (userId) {
      try {
        const res = await apiFetch(`/user/${userId}`, { method: 'GET' })
        if (res.ok) {
          const json = await res.json()
          const foundId =
            json?.data?.therapist_id ??
            json?.data?.user?.therapist_id ??
            json?.data?.therapist?.ID ??
            json?.data?.therapist?.id
          if (foundId) {
            therapistIdStr = String(foundId)
            if (typeof window !== 'undefined') {
              localStorage.setItem('therapist-id', therapistIdStr)
            }
          }
          const foundName =
            json?.data?.full_name ??
            json?.data?.name ??
            json?.data?.therapist?.full_name ??
            json?.data?.user?.name
          if (foundName && !therapistName) {
            therapistName = String(foundName)
          }
          const foundCommission = extractCommissionFromObject(
            json?.data ?? json
          )
          if (foundCommission !== undefined) {
            commission = foundCommission
            if (typeof window !== 'undefined') {
              localStorage.setItem('therapist-commission', commission)
            }
          }
        }
      } catch {
        // Ignore non-critical fallback error
      }
    }
  }

  const numericTherapistId = therapistIdStr ? Number(therapistIdStr) : null

  if (
    commission === undefined &&
    numericTherapistId &&
    numericTherapistId > 0
  ) {
    try {
      const res = await apiFetch(`/therapist/${numericTherapistId}`, {
        method: 'GET',
      })
      if (res.ok) {
        const json = await res.json()
        const tData = json?.data?.therapist ?? json?.data ?? json
        if ((tData?.full_name || tData?.name) && !therapistName) {
          therapistName = String(tData.full_name ?? tData.name)
        }
        const foundCommission = extractCommissionFromObject(tData)
        if (foundCommission !== undefined) {
          commission = foundCommission
          if (typeof window !== 'undefined') {
            localStorage.setItem('therapist-commission', commission)
          }
        }
      }
    } catch {
      // Ignore 401/403 or network errors for therapist endpoint
    }
  }

  if (commission === undefined && (numericTherapistId || therapistName)) {
    try {
      const res = await apiFetch('/pricing?limit=100&offset=0', {
        method: 'GET',
      })
      if (res.ok) {
        const json = await res.json()
        const list = Array.isArray(json?.data?.pricings)
          ? json.data.pricings
          : Array.isArray(json?.data?.pricing)
            ? json.data.pricing
            : Array.isArray(json?.data)
              ? json.data
              : []
        const matched = list.find((item: any) => {
          const itemTherapistId = Number(item?.therapist_id || 0)
          if (
            numericTherapistId &&
            itemTherapistId > 0 &&
            itemTherapistId === numericTherapistId
          ) {
            return true
          }
          const itemName = String(item?.therapist_name ?? item?.name ?? '')
            .trim()
            .toLowerCase()
          return (
            Boolean(therapistName) &&
            itemName === therapistName.trim().toLowerCase()
          )
        })
        const foundCommission = extractCommissionFromObject(matched)
        if (foundCommission !== undefined) {
          commission = foundCommission
          if (typeof window !== 'undefined') {
            localStorage.setItem('therapist-commission', commission)
          }
        }
      }
    } catch {
      // Ignore 401/403 or network errors for pricing endpoint
    }
  }

  return {
    therapistId: numericTherapistId,
    therapistName,
    commission,
  }
}

const fetchTreatmentsForPeriod = async (
  start: string,
  end: string,
  therapistId: number | null,
  therapistName: string,
  commission?: string
): Promise<Omit<PeriodSummaryData, 'loading' | 'error'>> => {
  const allTreatments: any[] = []
  const limit = 300
  let offset = 0
  let totalItems: number | null = null

  while (totalItems === null || allTreatments.length < totalItems) {
    const res = await apiFetch(
      `/treatment?limit=${limit}&offset=${offset}&filter_by_therapist=true`,
      { method: 'GET' }
    )
    if (res.status === 401) {
      throw new Error('401 Unauthorized')
    }
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`)
    }
    const json = await res.json()
    const list = Array.isArray(json?.data?.treatments)
      ? json.data.treatments
      : Array.isArray(json?.data)
        ? json.data
        : []

    if (typeof json?.data?.total === 'number') {
      totalItems = json.data.total
    } else if (typeof json?.total === 'number') {
      totalItems = json.total
    }

    if (list.length === 0) break
    allTreatments.push(...list)
    offset += limit
    if (list.length < limit && totalItems === null) break
  }

  return processTreatmentsFallback({
    rawTreatments: allTreatments,
    startDate: start,
    endDate: end,
    therapistId,
    therapistName,
    commission,
  })
}

const fetchPeriodData = async (
  start: string,
  end: string,
  options: {
    therapistInfos: TherapistCommissionInfo[]
    isTherapistView?: boolean
    currentTherapistId?: number | null
    currentTherapistName?: string
    currentTherapistCommission?: string
  },
  maxRetries = 2
): Promise<Omit<PeriodSummaryData, 'loading' | 'error'>> => {
  const url = `/transaction?start_date=${start}&end_date=${end}&limit=1000`
  let lastError: any = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await apiFetch(url, { method: 'GET' })
      if (
        (res.status === 401 || res.status === 403) &&
        options.isTherapistView
      ) {
        throw new ForbiddenError(`${res.status} Forbidden`)
      }
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
      const txList = Array.isArray(rawArray) ? rawArray : []

      if (options.isTherapistView) {
        const filteredTx = filterTransactionsForTherapist(
          txList,
          options.currentTherapistId,
          options.currentTherapistName
        )
        const therapistList: TherapistCommissionInfo[] =
          options.currentTherapistId || options.currentTherapistName
            ? [
                {
                  id: options.currentTherapistId ?? 0,
                  name: options.currentTherapistName || '',
                  commission: options.currentTherapistCommission,
                },
                ...options.therapistInfos,
              ]
            : options.therapistInfos

        return processTransactions(filteredTx, therapistList)
      }

      return processTransactions(txList, options.therapistInfos)
    } catch (err: any) {
      if (err instanceof ForbiddenError && options.isTherapistView) {
        return fetchTreatmentsForPeriod(
          start,
          end,
          options.currentTherapistId ?? null,
          options.currentTherapistName ?? '',
          options.currentTherapistCommission
        )
      }
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
  isTherapistView?: boolean
  commissionLabel?: string
}

function SummaryCard({
  title,
  dateLabel,
  data,
  colorClass = 'from-blue-600 to-indigo-700',
  customHeader,
  onRetry,
  isTherapistView = false,
  commissionLabel,
}: SummaryCardProps) {
  return (
    <Card
      className="flex min-h-[400px] flex-col overflow-hidden rounded-xl border border-blue-gray-100 bg-white shadow-lg"
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
      onResize={undefined}
      onResizeCapture={undefined}
    >
      <div className={`bg-gradient-to-r p-4 ${colorClass} text-white`}>
        <div className="flex items-center justify-between gap-2">
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
        ) : isTherapistView ? (
          <div className="flex flex-1 flex-col justify-between space-y-4">
            <div>
              <div className="mb-2">
                <p className="text-xs font-medium text-blue-gray-400">
                  Estimasi Pendapatan
                </p>
                <h4 className="animate-fade-in text-2xl font-extrabold leading-none tracking-tight text-indigo-700">
                  {formatCurrency(data.totalEstimatedCommission)}
                </h4>
              </div>

              {!data.isEstimateFromTreatmentsOnly && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
                    <p className="text-xs font-semibold text-green-700">
                      Est. Terbayar:{' '}
                      {formatCurrency(data.totalEstimatedPaidCommission)}
                    </p>
                  </div>
                  <p className="text-xs text-blue-gray-600">
                    Total Transaksi Pasien: {formatCurrency(data.totalGross)}
                  </p>
                </div>
              )}

              <p className="mt-1 text-xs text-blue-gray-500">
                Jumlah Kunjungan: {data.transactionCount}
              </p>
            </div>

            <hr className="border-blue-gray-50" />

            <div className="rounded-lg bg-indigo-50/60 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-gray-600">
                  Basis Komisi
                </span>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-semibold text-indigo-700">
                  {commissionLabel || 'Belum diatur'}
                </span>
              </div>
              {data.isEstimateFromTreatmentsOnly && (
                <p className="mt-2 text-[11px] text-blue-gray-500">
                  Dihitung dari jadwal penanganan Anda.
                </p>
              )}
              {data.transactionCount === 0 && (
                <p className="mt-2 text-[11px] italic text-gray-500">
                  Belum ada kunjungan pada periode ini.
                </p>
              )}
            </div>
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
              <p className="mt-1 text-xs font-semibold text-indigo-700">
                Total Est. Komisi Terapis:{' '}
                {formatCurrency(data.totalEstimatedCommission)}
              </p>
              <p className="mt-0.5 text-[10px] text-blue-gray-400">
                Total Transaksi: {data.transactionCount}
              </p>
            </div>

            <hr className="border-blue-gray-50" />

            {/* Therapist Breakdown & Commission Estimation */}
            <div className="flex flex-1 flex-col">
              <p className="mb-2 text-xs font-semibold text-blue-gray-600">
                Kontribusi &amp; Estimasi Komisi Terapis
              </p>
              {data.therapists.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg bg-gray-50/50 py-4">
                  <p className="text-xs italic text-gray-500">
                    Tidak ada data transaksi
                  </p>
                </div>
              ) : (
                <div className="max-h-[200px] space-y-3 overflow-y-auto pr-1">
                  {data.therapists.map((therapist) => {
                    const pct =
                      data.totalGross > 0
                        ? Math.round(
                            (therapist.totalIncome / data.totalGross) * 100
                          )
                        : 0
                    return (
                      <div key={therapist.therapistId} className="space-y-1">
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
                        {/* Commission Estimation */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-blue-gray-500">
                            Est. Komisi ({therapist.commissionLabel})
                          </span>
                          <span className="text-emerald-700 font-semibold">
                            {formatCurrency(therapist.estimatedIncome)}
                          </span>
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
  const router = useRouter()
  const userRole = useUserRole()

  const isAdmin = userRole === 'super_admin'
  const isTherapist = userRole === 'therapist'
  const canViewSummary = isAdmin || isTherapist

  const [therapistInfos, setTherapistInfos] = useState<
    TherapistCommissionInfo[]
  >([])
  const [currentTherapist, setCurrentTherapist] = useState<{
    therapistId: number | null
    therapistName: string
    commission?: string
    ready: boolean
  }>({
    therapistId: null,
    therapistName: '',
    commission: undefined,
    ready: false,
  })

  // Summaries states
  const [dailyData, setDailyData] = useState<PeriodSummaryData>({
    ...INITIAL_PERIOD_DATA,
  })
  const [weeklyData, setWeeklyData] = useState<PeriodSummaryData>({
    ...INITIAL_PERIOD_DATA,
  })
  const [monthlyData, setMonthlyData] = useState<PeriodSummaryData>({
    ...INITIAL_PERIOD_DATA,
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
    ...INITIAL_PERIOD_DATA,
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

  // Load therapist commission metadata once role is known
  useEffect(() => {
    if (!canViewSummary) return

    let cancelled = false
    const loadMetadata = async () => {
      if (isAdmin) {
        const list = await fetchTherapistCommissions()
        if (!cancelled) {
          setTherapistInfos(list)
          setCurrentTherapist((prev) => ({ ...prev, ready: true }))
        }
      } else if (isTherapist) {
        const identity = await resolveCurrentTherapistIdentity()
        if (!cancelled) {
          setCurrentTherapist({
            therapistId: identity.therapistId,
            therapistName: identity.therapistName,
            commission: identity.commission,
            ready: true,
          })
        }
      }
    }

    void loadMetadata()
    return () => {
      cancelled = true
    }
  }, [canViewSummary, isAdmin, isTherapist])

  const fetchOptions = React.useMemo(
    () => ({
      therapistInfos,
      isTherapistView: isTherapist,
      currentTherapistId: currentTherapist.therapistId,
      currentTherapistName: currentTherapist.therapistName,
      currentTherapistCommission: currentTherapist.commission,
    }),
    [therapistInfos, isTherapist, currentTherapist]
  )

  const fetchDaily = useCallback(() => {
    setDailyData((prev) => ({ ...prev, loading: true, error: null }))
    const dailyRange = getTodayRange()
    fetchPeriodData(dailyRange.start, dailyRange.end, fetchOptions)
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
  }, [router, fetchOptions])

  const fetchWeekly = useCallback(() => {
    setWeeklyData((prev) => ({ ...prev, loading: true, error: null }))
    const weeklyRange = getWeeklyRange()
    fetchPeriodData(weeklyRange.start, weeklyRange.end, fetchOptions)
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
  }, [router, fetchOptions])

  const fetchMonthly = useCallback(() => {
    setMonthlyData((prev) => ({ ...prev, loading: true, error: null }))
    const monthlyRange = getMonthlyRange()
    fetchPeriodData(monthlyRange.start, monthlyRange.end, fetchOptions)
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
  }, [router, fetchOptions])

  const fetchCustom = useCallback(() => {
    if (!customStart || !customEnd || customStart > customEnd) return
    setCustomData((prev) => ({ ...prev, loading: true, error: null }))
    fetchPeriodData(customStart, customEnd, fetchOptions)
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
  }, [customStart, customEnd, router, fetchOptions])

  useEffect(() => {
    if (userRole === null) return
    if (!canViewSummary) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDailyData((prev) => ({ ...prev, loading: false }))
      setWeeklyData((prev) => ({ ...prev, loading: false }))
      setMonthlyData((prev) => ({ ...prev, loading: false }))
      return
    }
    if (!currentTherapist.ready) return

    fetchDaily()
    fetchWeekly()
    fetchMonthly()
  }, [
    userRole,
    canViewSummary,
    currentTherapist.ready,
    fetchDaily,
    fetchWeekly,
    fetchMonthly,
  ])

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
    if (!canViewSummary) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCustomData((prev) => ({ ...prev, loading: false }))
      return
    }
    if (!currentTherapist.ready) return

    fetchCustom()
  }, [
    customStart,
    customEnd,
    userRole,
    canViewSummary,
    currentTherapist.ready,
    fetchCustom,
  ])

  const currentTherapistCommissionLabel = parseCommission(
    currentTherapist.commission
  ).displayLabel

  return (
    <div className="min-h-screen space-y-6 bg-blue-gray-50/20 p-4 md:p-6">
      <MegaMenuDefault />

      <GreetingBanner />

      {isTherapist && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-100 bg-white px-4 py-3 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-blue-gray-800">
              Estimasi Pendapatan Saya
              {currentTherapist.therapistName
                ? ` — ${currentTherapist.therapistName}`
                : ''}
            </h2>
            <p className="text-xs text-blue-gray-500">
              Dihitung berdasarkan komisi Anda untuk setiap periode
            </p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Komisi: {currentTherapistCommissionLabel}
          </span>
        </div>
      )}

      {/* Grid of Summaries */}
      {canViewSummary && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Ringkasan Harian"
            dateLabel={getTodayLabel()}
            data={dailyData}
            colorClass="from-teal-500 to-emerald-700"
            onRetry={fetchDaily}
            isTherapistView={isTherapist}
            commissionLabel={currentTherapistCommissionLabel}
          />
          <SummaryCard
            title="Ringkasan Mingguan"
            dateLabel={getWeeklyLabel()}
            data={weeklyData}
            colorClass="from-blue-500 to-indigo-700"
            onRetry={fetchWeekly}
            isTherapistView={isTherapist}
            commissionLabel={currentTherapistCommissionLabel}
          />
          <SummaryCard
            title="Ringkasan Bulanan"
            dateLabel={getMonthlyLabel()}
            data={monthlyData}
            colorClass="from-purple-500 to-indigo-800"
            onRetry={fetchMonthly}
            isTherapistView={isTherapist}
            commissionLabel={currentTherapistCommissionLabel}
          />
          <SummaryCard
            title="Kustom Tanggal"
            dateLabel={`${customStart} s/d ${customEnd}`}
            data={customData}
            colorClass="from-blue-gray-600 to-blue-gray-800"
            onRetry={fetchCustom}
            isTherapistView={isTherapist}
            commissionLabel={currentTherapistCommissionLabel}
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

      <CalendarTreatment userRole={userRole} />
    </div>
  )
}
