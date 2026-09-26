'use client'
import React, { useState, useMemo } from 'react'
import Treatment from './treatmentRow'
import { TreatmentType } from '../_types/treatment'
import { Typography } from '@material-tailwind/react'
import {
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid'

export interface ColumnConfig {
  key?: keyof TreatmentType
  label: string
  sortable?: boolean
}

export const TABLE_COLUMNS: ColumnConfig[] = [
  { label: 'Waktu & Tanggal', key: 'treatment_date', sortable: true },
  { label: 'Nama Pasien', key: 'patient_name', sortable: true },
  { label: 'Keluhan', key: 'issues', sortable: true },
  { label: 'Penanganan', key: 'treatment', sortable: true },
  { label: 'Keterangan', key: 'remarks', sortable: true },
  { label: 'Kunjungan Selanjutnya', key: 'next_visit', sortable: true },
  { label: 'Terapis', key: 'therapist_name', sortable: true },
  { label: '', sortable: false },
]

interface TableTreatmentProps {
  Data: {
    treatment: TreatmentType[]
  }
  onDataChange?: () => void
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyMessage?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  onSortChange?: (sortKey: string) => void
}

const sortTreatments = (
  items: TreatmentType[],
  sortKey: keyof TreatmentType | string,
  sortDir: 'asc' | 'desc'
): TreatmentType[] => {
  return [...items].sort((a, b) => {
    const valA = a[sortKey as keyof TreatmentType]
    const valB = b[sortKey as keyof TreatmentType]

    if (valA === undefined || valA === null || valA === '') {
      if (valB === undefined || valB === null || valB === '') return 0
      return 1
    }
    if (valB === undefined || valB === null || valB === '') {
      return -1
    }

    // Date comparison
    if (sortKey === 'treatment_date' || sortKey === 'next_visit') {
      const timeA = Date.parse(String(valA))
      const timeB = Date.parse(String(valB))
      if (!isNaN(timeA) && !isNaN(timeB)) {
        return sortDir === 'asc' ? timeA - timeB : timeB - timeA
      }
    }

    // Numeric comparison
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDir === 'asc' ? valA - valB : valB - valA
    }

    // String natural comparison
    const strA = String(valA)
    const strB = String(valB)
    const comp = strA.localeCompare(strB, undefined, {
      numeric: true,
      sensitivity: 'base',
    })

    return sortDir === 'asc' ? comp : -comp
  })
}

const TableHeader = ({
  sortBy,
  sortDir,
  onSort,
}: {
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: keyof TreatmentType) => void
}) => (
  <thead>
    <tr>
      {TABLE_COLUMNS.map((col, index) => {
        const isSortable = col.sortable && col.key
        const isCurrentSort = isSortable && sortBy === col.key

        const ariaSortValue = isCurrentSort
          ? sortDir === 'desc'
            ? 'descending'
            : 'ascending'
          : 'none'

        return (
          <th
            key={col.label || index}
            aria-sort={isSortable ? ariaSortValue : undefined}
            className={`border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors ${
              isSortable
                ? 'cursor-pointer select-none hover:bg-blue-gray-100/60'
                : ''
            }`}
            onClick={isSortable && onSort ? () => onSort(col.key!) : undefined}
          >
            <Typography
              variant="small"
              color="blue-gray"
              className={`flex items-center justify-between gap-2 font-normal leading-none transition-colors ${
                isCurrentSort
                  ? 'font-semibold text-indigo-700 opacity-100'
                  : 'opacity-70 hover:opacity-100'
              }`}
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              <span>{col.label}</span>
              {isSortable &&
                (isCurrentSort ? (
                  sortDir === 'asc' ? (
                    <ChevronUpIcon
                      strokeWidth={2.5}
                      className="size-4 text-indigo-600"
                    />
                  ) : (
                    <ChevronDownIcon
                      strokeWidth={2.5}
                      className="size-4 text-indigo-600"
                    />
                  )
                ) : (
                  <ChevronUpDownIcon
                    strokeWidth={2}
                    className="size-4 opacity-40 group-hover:opacity-100"
                  />
                ))}
            </Typography>
          </th>
        )
      })}
    </tr>
  </thead>
)

const TableBody = ({
  treatment,
  onDataChange,
  loading,
  error,
  onRetry,
  emptyMessage = 'Tidak ada data penanganan',
}: {
  treatment: TreatmentType[]
  onDataChange?: () => void
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyMessage?: string
}) => {
  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={TABLE_COLUMNS.length} className="p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="size-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
              <p className="text-xs text-gray-500">Memuat data penanganan...</p>
            </div>
          </td>
        </tr>
      </tbody>
    )
  }

  if (error) {
    return (
      <tbody>
        <tr>
          <td colSpan={TABLE_COLUMNS.length} className="p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-2">
              <p className="text-xs font-semibold text-red-500">{error}</p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="rounded bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
                >
                  Coba Lagi
                </button>
              )}
            </div>
          </td>
        </tr>
      </tbody>
    )
  }

  if (!treatment || treatment.length === 0) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={TABLE_COLUMNS.length}
            className="p-8 text-center text-xs italic text-gray-500"
          >
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody className="text-sm text-blue-gray-500">
      {treatment.map((item: TreatmentType) => (
        <Treatment
          key={item.ID}
          ID={item.ID}
          treatment_date={item.treatment_date}
          patient_code={item.patient_code}
          patient_name={item.patient_name}
          age={item.age}
          issues={item.issues}
          treatment={item.treatment}
          remarks={item.remarks}
          therapist_name={item.therapist_name}
          therapist_id={item.therapist_id}
          next_visit={item.next_visit}
          health_history={item.health_history}
          surgery_history={item.surgery_history}
          attachment_path={item.attachment_path}
          onDataChange={onDataChange}
        />
      ))}
    </tbody>
  )
}

export default function TableTreatment({
  Data,
  onDataChange,
  loading,
  error,
  onRetry,
  emptyMessage,
  sortBy: externalSortBy,
  sortDir: externalSortDir,
  onSortChange,
}: TableTreatmentProps) {
  const { treatment } = Data
  const [internalSortBy, setInternalSortBy] = useState<string | undefined>()
  const [internalSortDir, setInternalSortDir] = useState<'asc' | 'desc'>('asc')

  const isControlled = externalSortBy !== undefined
  const currentSortBy = isControlled ? externalSortBy : internalSortBy
  const currentSortDir = isControlled ? externalSortDir : internalSortDir

  const handleSort = (key: keyof TreatmentType) => {
    if (isControlled && onSortChange) {
      onSortChange(key)
    } else {
      if (internalSortBy === key) {
        setInternalSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      } else {
        setInternalSortBy(key)
        setInternalSortDir('asc')
      }
    }
  }

  const sortedTreatment = useMemo(() => {
    if (!treatment || treatment.length === 0 || !currentSortBy) {
      return treatment || []
    }
    return sortTreatments(treatment, currentSortBy, currentSortDir ?? 'asc')
  }, [treatment, currentSortBy, currentSortDir])

  return (
    <table className="w-full whitespace-nowrap">
      <TableHeader
        sortBy={currentSortBy}
        sortDir={currentSortDir}
        onSort={handleSort}
      />
      <TableBody
        treatment={sortedTreatment}
        onDataChange={onDataChange}
        loading={loading}
        error={error}
        onRetry={onRetry}
        emptyMessage={emptyMessage}
      />
    </table>
  )
}
