'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
  Input,
} from '@material-tailwind/react'
import {
  CalendarDaysIcon,
  TableCellsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CalendarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { useFetchTreatment } from '../_hooks/useFetchTreatment'
import TableTreatment from './tableTreatment'
import Pagination from './pagination'
import { apiFetch } from '../_functions/apiFetch'

export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

export const INDONESIAN_DAYS_SHORT = [
  'Sen',
  'Sel',
  'Rab',
  'Kam',
  'Jum',
  'Sab',
  'Min',
]

export const INDONESIAN_DAYS_FULL = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
]

export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const day = parseInt(parts[2], 10)
  const d = new Date(year, month, day)
  if (isNaN(d.getTime())) return dateStr

  const dayName = INDONESIAN_DAYS_FULL[d.getDay()]
  const monthName = INDONESIAN_MONTHS[month]
  return `${dayName}, ${day} ${monthName} ${year}`
}

interface CalendarTreatmentProps {
  userRole?: string | null
}

export default function CalendarTreatment({
  userRole,
}: CalendarTreatmentProps) {
  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])

  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar')
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [keyword, setKeyword] = useState<string>('')
  const [searchInput, setSearchInput] = useState<string>('')
  const [filterAllDates, setFilterAllDates] = useState<boolean>(false)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)
  const [monthCounts, setMonthCounts] = useState<Record<string, number>>({})

  // Determine active query date
  const activeGroupByDate =
    viewMode === 'table' && filterAllDates ? undefined : selectedDate

  // Fetch treatments for selected date or all
  const {
    data,
    total,
    loading: treatmentLoading,
    error: treatmentError,
    refetch: refetchTreatmentData,
  } = useFetchTreatment(
    currentPage,
    keyword,
    undefined,
    refreshTrigger,
    activeGroupByDate
  )
  const treatment = data.treatment

  // Fetch monthly scheduled treatment counts to show badges on calendar days
  const fetchMonthTreatmentCounts = useCallback(async () => {
    try {
      const res = await apiFetch('/treatment?limit=300')
      if (!res.ok) return
      const json = await res.json()
      const list = Array.isArray(json?.data?.treatments)
        ? json.data.treatments
        : Array.isArray(json?.data)
          ? json.data
          : []
      const counts: Record<string, number> = {}
      list.forEach((item: any) => {
        if (item?.treatment_date) {
          const dStr = String(item.treatment_date).trim().slice(0, 10)
          if (dStr && /^\d{4}-\d{2}-\d{2}$/.test(dStr)) {
            counts[dStr] = (counts[dStr] || 0) + 1
          }
        }
      })
      setMonthCounts(counts)
    } catch {
      // Non-critical background count
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMonthTreatmentCounts()
  }, [fetchMonthTreatmentCounts, refreshTrigger])

  const refetchTreatment = () => {
    setRefreshTrigger((prev) => prev + 1)
    refetchTreatmentData()
  }

  // Month grid calculations
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [currentMonth])

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1))
  }

  const handleSelectDate = (date: Date) => {
    const formatted = format(date, 'yyyy-MM-dd')
    setSelectedDate(formatted)
    setCurrentPage(1)
    if (!isSameMonth(date, currentMonth)) {
      setCurrentMonth(date)
    }
  }

  const handleJumpToToday = () => {
    const now = new Date()
    setSelectedDate(todayStr)
    setCurrentMonth(now)
    setCurrentPage(1)
  }

  const handleQuickJump = (offsetDays: number) => {
    const target = new Date()
    target.setDate(target.getDate() + offsetDays)
    const formatted = format(target, 'yyyy-MM-dd')
    setSelectedDate(formatted)
    setCurrentMonth(target)
    setCurrentPage(1)
  }

  const handleAddTreatment = (targetDate: string = selectedDate) => {
    if (typeof window !== 'undefined') {
      window.open(`/treatment/register?date=${targetDate}`, '_blank')
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setKeyword(searchInput.trim())
      setCurrentPage(1)
    }
  }

  // Relative status for selected date
  const dateCategory = useMemo(() => {
    if (selectedDate === todayStr) return 'today'
    if (selectedDate > todayStr) return 'future'
    return 'past'
  }, [selectedDate, todayStr])

  const monthTitle = `${INDONESIAN_MONTHS[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`

  return (
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
        className="m-0 rounded-none border-b border-blue-gray-50 p-4 md:p-6"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="size-6 text-indigo-600" />
              <Typography
                variant="h5"
                color="blue-gray"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
                className="font-bold tracking-tight"
              >
                Jadwal Penanganan
              </Typography>
            </div>
            <Typography
              variant="small"
              className="mt-1 font-normal text-blue-gray-500"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              Pantau riwayat penanganan, kelola jadwal hari ini, serta atur
              jadwal penanganan masa depan.
            </Typography>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-blue-gray-100 bg-blue-gray-50/50 p-1">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-blue-gray-600 hover:text-blue-gray-900'
                }`}
              >
                <CalendarDaysIcon className="size-4" />
                Kalender
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-blue-gray-600 hover:text-blue-gray-900'
                }`}
              >
                <TableCellsIcon className="size-4" />
                Tabel
              </button>
            </div>

            {/* Jump to Today Button */}
            <Button
              variant="outlined"
              size="sm"
              color="indigo"
              className="flex items-center gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
              onClick={handleJumpToToday}
            >
              <CalendarIcon className="size-4" />
              Hari Ini
            </Button>

            {/* Action: Add Treatment (super_admin) */}
            {userRole === 'super_admin' && (
              <Button
                className="flex items-center gap-2 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                size="sm"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
                onClick={() => handleAddTreatment(selectedDate)}
              >
                <PlusCircleIcon strokeWidth={2} className="size-4 text-white" />
                Tambah Penanganan
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardBody
        className="p-4 md:p-6"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        {viewMode === 'calendar' ? (
          <div className="space-y-6">
            {/* Calendar Controls & Month Bar */}
            <div className="bg-slate-50/50 flex flex-col justify-between gap-4 rounded-xl border border-blue-gray-100 p-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="text"
                  className="rounded-lg p-2 text-blue-gray-700 hover:bg-blue-gray-100"
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  onResize={undefined}
                  onResizeCapture={undefined}
                  onClick={handlePrevMonth}
                  aria-label="Bulan Sebelumnya"
                >
                  <ChevronLeftIcon className="size-5" />
                </Button>
                <div className="min-w-[170px] text-center">
                  <Typography
                    variant="h6"
                    color="blue-gray"
                    placeholder={undefined}
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                    onResize={undefined}
                    onResizeCapture={undefined}
                    className="font-bold capitalize"
                  >
                    {monthTitle}
                  </Typography>
                </div>
                <Button
                  size="sm"
                  variant="text"
                  className="rounded-lg p-2 text-blue-gray-700 hover:bg-blue-gray-100"
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  onResize={undefined}
                  onResizeCapture={undefined}
                  onClick={handleNextMonth}
                  aria-label="Bulan Berikutnya"
                >
                  <ChevronRightIcon className="size-5" />
                </Button>
              </div>

              {/* Quick Jump Shortcuts & Date Selector */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickJump(-1)}
                    className="shadow-2xs rounded border border-gray-200 bg-white px-2 py-1 text-xs text-blue-gray-700 hover:bg-gray-50"
                  >
                    Kemarin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickJump(0)}
                    className="shadow-2xs rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-gray-50"
                  >
                    Hari Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickJump(1)}
                    className="shadow-2xs rounded border border-gray-200 bg-white px-2 py-1 text-xs text-blue-gray-700 hover:bg-gray-50"
                  >
                    Besok
                  </button>
                </div>

                <div className="flex items-center gap-1.5 border-l border-blue-gray-200 pl-2">
                  <span className="text-xs text-blue-gray-500">Pilih:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val) {
                        setSelectedDate(val)
                        const parts = val.split('-')
                        if (parts.length === 3) {
                          setCurrentMonth(
                            new Date(
                              parseInt(parts[0], 10),
                              parseInt(parts[1], 10) - 1,
                              parseInt(parts[2], 10)
                            )
                          )
                        }
                        setCurrentPage(1)
                      }
                    }}
                    className="shadow-2xs focus:outline-hidden rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-blue-gray-800 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Calendar Grid View */}
            <div className="shadow-2xs overflow-hidden rounded-xl border border-blue-gray-100 bg-white">
              {/* Day Headers: Sen - Min */}
              <div className="bg-slate-50 grid grid-cols-7 border-b border-blue-gray-100 text-center text-xs font-bold text-blue-gray-600">
                {INDONESIAN_DAYS_SHORT.map((dayName, idx) => (
                  <div
                    key={dayName}
                    className={`py-2.5 ${idx >= 5 ? 'text-rose-500' : ''}`}
                  >
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Month Day Cells */}
              <div className="grid grid-cols-7 divide-x divide-y divide-blue-gray-100 bg-blue-gray-50/20 text-xs">
                {calendarDays.map((day) => {
                  const dayDateStr = format(day, 'yyyy-MM-dd')
                  const isCurrentMonthDay = isSameMonth(day, currentMonth)
                  const isCurrentSelected = dayDateStr === selectedDate
                  const isDayToday = dayDateStr === todayStr
                  const isFutureDay = dayDateStr > todayStr
                  const isPastDay = dayDateStr < todayStr
                  const treatmentCount = monthCounts[dayDateStr] || 0

                  return (
                    <div
                      key={dayDateStr}
                      role="button"
                      tabIndex={0}
                      aria-label={formatIndonesianDate(dayDateStr)}
                      onClick={() => handleSelectDate(day)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleSelectDate(day)
                        }
                      }}
                      className={`group relative flex min-h-[75px] cursor-pointer flex-col justify-between p-1.5 transition-colors md:min-h-[90px] md:p-2 ${
                        isCurrentSelected
                          ? 'shadow-xs border-2 border-indigo-600 bg-indigo-50/80'
                          : isCurrentMonthDay
                            ? 'hover:bg-slate-50 bg-white'
                            : 'bg-slate-50/40 hover:bg-slate-100/50 text-blue-gray-300'
                      }`}
                    >
                      {/* Top Row: Date Number & Badges */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                            isCurrentSelected
                              ? 'bg-indigo-600 text-white'
                              : isDayToday
                                ? 'bg-teal-500 font-bold text-white'
                                : isCurrentMonthDay
                                  ? 'text-blue-gray-800'
                                  : 'text-blue-gray-300'
                          }`}
                        >
                          {day.getDate()}
                        </span>

                        <div className="flex items-center gap-1">
                          {isDayToday && !isCurrentSelected && (
                            <span className="hidden rounded bg-teal-50 px-1 py-0.5 text-[9px] font-bold text-teal-700 md:inline-block">
                              Hari Ini
                            </span>
                          )}

                          {/* Quick Add Button in cell for super_admin */}
                          {userRole === 'super_admin' && (
                            <button
                              type="button"
                              title={`Jadwalkan penanganan pada ${formatIndonesianDate(dayDateStr)}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAddTreatment(dayDateStr)
                              }}
                              className="hidden rounded p-0.5 text-blue-gray-400 opacity-0 transition-opacity hover:bg-indigo-100 hover:text-indigo-700 group-hover:inline-block group-hover:opacity-100"
                            >
                              <PlusCircleIcon className="size-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Middle/Bottom: Scheduled Treatments Indicator */}
                      <div className="mt-1 space-y-1">
                        {treatmentCount > 0 ? (
                          <div className="inline-flex w-full items-center justify-between rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                            <span className="truncate">
                              {treatmentCount} Jadwal
                            </span>
                            <span className="size-1.5 rounded-full bg-indigo-600" />
                          </div>
                        ) : isFutureDay && isCurrentMonthDay ? (
                          <div className="text-[10px] text-blue-gray-300 opacity-0 transition-opacity group-hover:opacity-100">
                            + Jadwalkan
                          </div>
                        ) : null}

                        {/* Subtle relative label on hover */}
                        <div className="text-right text-[9px] text-blue-gray-300">
                          {isPastDay && isCurrentMonthDay && (
                            <span className="opacity-0 group-hover:opacity-60">
                              Lampau
                            </span>
                          )}
                          {isFutureDay && isCurrentMonthDay && (
                            <span className="opacity-0 group-hover:opacity-60">
                              Mendatang
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Selected Date Details & Schedule Panel */}
            <div className="rounded-xl border border-blue-gray-100 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-4 border-b border-blue-gray-50 p-4 md:flex-row md:items-center">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Typography
                      variant="h6"
                      color="blue-gray"
                      placeholder={undefined}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                      onResize={undefined}
                      onResizeCapture={undefined}
                      className="font-bold"
                    >
                      Jadwal Penanganan: {formatIndonesianDate(selectedDate)}
                    </Typography>

                    {/* Status Pill */}
                    {dateCategory === 'today' && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800">
                        <span className="size-1.5 rounded-full bg-teal-600" />
                        Hari Ini
                      </span>
                    )}
                    {dateCategory === 'future' && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                        <ClockIcon className="size-3 text-indigo-600" />
                        Jadwal Mendatang (Masa Depan)
                      </span>
                    )}
                    {dateCategory === 'past' && (
                      <span className="border-slate-200 bg-slate-100 text-slate-700 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium">
                        Riwayat Lampau
                      </span>
                    )}
                  </div>

                  <Typography
                    variant="small"
                    className="text-xs text-blue-gray-500"
                    placeholder={undefined}
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                    onResize={undefined}
                    onResizeCapture={undefined}
                  >
                    {total} penanganan tercatat untuk tanggal ini
                  </Typography>
                </div>

                <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row md:w-auto">
                  <div className="w-full sm:w-64">
                    <Input
                      label="Cari Pasien / Keluhan"
                      icon={<MagnifyingGlassIcon className="size-5" />}
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      crossOrigin={undefined}
                      placeholder={undefined}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                      onResize={undefined}
                      onResizeCapture={undefined}
                    />
                  </div>

                  {userRole === 'super_admin' && (
                    <Button
                      size="sm"
                      className="flex items-center justify-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700"
                      placeholder={undefined}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                      onResize={undefined}
                      onResizeCapture={undefined}
                      onClick={() => handleAddTreatment(selectedDate)}
                    >
                      <PlusCircleIcon className="size-4" />
                      Jadwalkan pada Tanggal Ini
                    </Button>
                  )}
                </div>
              </div>

              {/* Day Treatments List */}
              <div className="overflow-x-auto">
                <TableTreatment
                  Data={{ treatment }}
                  onDataChange={refetchTreatment}
                  loading={treatmentLoading}
                  error={treatmentError}
                  onRetry={refetchTreatment}
                  emptyMessage={
                    dateCategory === 'future'
                      ? `Belum ada jadwal penanganan pada tanggal ${formatIndonesianDate(selectedDate)}. Anda dapat menjadwalkan penanganan pasien untuk tanggal ini.`
                      : dateCategory === 'past'
                        ? `Tidak ada riwayat penanganan tercatat pada tanggal ${formatIndonesianDate(selectedDate)}.`
                        : 'Tidak ada jadwal penanganan hari ini.'
                  }
                />
              </div>

              <div className="border-t border-blue-gray-50 p-4">
                <Pagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  total={total}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Table View */
          <div className="space-y-4">
            <div className="bg-slate-50/50 flex flex-col justify-between gap-4 rounded-xl border border-blue-gray-100 p-4 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-gray-700">
                    Filter Tanggal:
                  </span>
                  <input
                    type="date"
                    disabled={filterAllDates}
                    value={selectedDate}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value) {
                        setSelectedDate(value)
                        const [year, month, day] = value.split('-').map(Number)
                        setCurrentMonth(new Date(year, month - 1, day))
                        setCurrentPage(1)
                      }
                    }}
                    className="shadow-2xs focus:outline-hidden rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-blue-gray-800 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-blue-gray-600">
                  <input
                    type="checkbox"
                    checked={filterAllDates}
                    onChange={(e) => {
                      setFilterAllDates(e.target.checked)
                      setCurrentPage(1)
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Tampilkan Semua Tanggal (Riwayat & Mendatang)
                </label>
              </div>

              <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
                <div className="w-full sm:w-64">
                  <Input
                    label="Search"
                    icon={<MagnifyingGlassIcon className="size-5" />}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    crossOrigin={undefined}
                    placeholder={undefined}
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                    onResize={undefined}
                    onResizeCapture={undefined}
                  />
                </div>

                <Button
                  size="sm"
                  variant="outlined"
                  className="flex items-center justify-center gap-1 border-blue-gray-200 text-blue-gray-700 hover:bg-blue-gray-50"
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  onResize={undefined}
                  onResizeCapture={undefined}
                  onClick={refetchTreatment}
                >
                  <ArrowPathIcon className="size-4" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <TableTreatment
                Data={{ treatment }}
                onDataChange={refetchTreatment}
                loading={treatmentLoading}
                error={treatmentError}
                onRetry={refetchTreatment}
                emptyMessage={
                  filterAllDates
                    ? 'Tidak ada data penanganan yang ditemukan'
                    : `Tidak ada jadwal penanganan pada tanggal ${formatIndonesianDate(selectedDate)}`
                }
              />
            </div>

            <div className="border-t border-blue-gray-50 pt-2">
              <Pagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                total={total}
              />
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
