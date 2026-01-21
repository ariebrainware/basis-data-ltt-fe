'use client'
import React, { useState, useEffect, useMemo } from 'react'
import Patient from '../_components/patientRow'
import { PatientType } from '../_types/patient'

interface TablePatientProps {
  Data: {
    patients: PatientType[]
  }
  onDataChange?: () => void
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  onSortChange?: (sortBy: string) => void
}

const SortIcon = ({ dir }: { dir: 'asc' | 'desc' | null }) => {
  if (!dir) return null
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="ml-2"
    >
      {dir === 'asc' ? (
        <path
          d="M6 15l6-6 6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M18 9l-6 6-6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

const TableHeader = ({
  sortBy,
  sortDir,
  onSortChange,
}: {
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  onSortChange?: (s: string) => void
}) => (
  <thead className="border-slate-200 bg-slate-100 text-slate-600 dark:bg-slate-900 border-b text-sm font-medium">
    <tr>
      <th className="px-2.5 py-2 text-start font-medium">
        <button
          type="button"
          onClick={() => onSortChange && onSortChange('full_name')}
          className="flex items-center gap-2 text-sm text-current antialiased opacity-70"
        >
          Pasien/Nomor Telepon
          <SortIcon dir={sortBy === 'full_name' ? (sortDir ?? 'asc') : null} />
        </button>
      </th>
      <th className="px-2.5 py-2 text-start font-medium">
        <small className="flex items-center gap-2 font-sans text-sm text-current antialiased opacity-70">
          Pekerjaan/Umur
        </small>
      </th>
      <th className="px-2.5 py-2 text-start font-medium">
        <small className="flex items-center gap-2 font-sans text-sm text-current antialiased opacity-70">
          Jenis Kelamin
        </small>
      </th>
      <th className="px-2.5 py-2 text-start font-medium">
        <button
          type="button"
          onClick={() => onSortChange && onSortChange('patient_code')}
          className="flex items-center gap-2 text-sm text-current antialiased opacity-70"
        >
          Kode Pasien
          <SortIcon
            dir={sortBy === 'patient_code' ? (sortDir ?? 'asc') : null}
          />
        </button>
      </th>
      <th className="px-2.5 py-2 text-start font-medium">
        <small className="flex items-center justify-between gap-2 font-sans text-sm text-current antialiased opacity-70">
          {' '}
        </small>
      </th>
    </tr>
  </thead>
)

const TableBody = ({
  patients,
  onDataChange,
}: {
  patients: PatientType[]
  onDataChange?: () => void
}) => (
  <tbody className="text-slate-800 group text-sm dark:text-white">
    {patients.map((patient: PatientType) => (
      <Patient
        ID={patient.ID}
        key={patient.ID}
        full_name={patient.full_name}
        phone_number={patient.phone_number}
        job={patient.job}
        age={patient.age}
        gender={patient.gender}
        patient_code={patient.patient_code}
        last_visit={patient.last_visit ?? ''}
        email={patient.email}
        health_history={patient.health_history}
        surgery_history={patient.surgery_history}
        address={patient.address}
        onDataChange={onDataChange}
      />
    ))}
  </tbody>
)
export default function TablePatient({
  Data,
  onDataChange,
  sortBy,
  sortDir,
  onSortChange,
}: TablePatientProps) {
  const { patients } = Data

  // local sorting state (used when parent doesn't control sorting)
  const [localSortBy, setLocalSortBy] = useState<string | undefined>(
    sortBy ?? undefined
  )
  const [localSortDir, setLocalSortDir] = useState<'asc' | 'desc' | undefined>(
    sortDir ?? 'asc'
  )

  // parent-controlled props are used directly via appliedSortBy/appliedSortDir;
  // avoid syncing props into local state inside effects to prevent cascading renders

  const handleSortChange = (col: string) => {
    // notify parent (backwards compatible)
    if (onSortChange) {
      onSortChange(col)
    }

    // determine next direction and update local state so component re-renders
    const currentBy = sortBy ?? localSortBy
    const currentDir = sortDir ?? localSortDir ?? 'asc'
    const nextDir: 'asc' | 'desc' =
      currentBy === col ? (currentDir === 'asc' ? 'desc' : 'asc') : 'asc'
    setLocalSortBy(col)
    setLocalSortDir(nextDir)
  }

  const appliedSortBy = sortBy ?? localSortBy
  const appliedSortDir = sortDir ?? localSortDir ?? 'asc'

  const sortedPatients = useMemo(() => {
    if (!patients) return []
    const arr = [...patients]
    if (!appliedSortBy) return arr
    arr.sort((a: PatientType, b: PatientType) => {
      const aVal = (a as any)[appliedSortBy] ?? ''
      const bVal = (b as any)[appliedSortBy] ?? ''
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return appliedSortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      const aS = String(aVal).toLowerCase()
      const bS = String(bVal).toLowerCase()
      if (aS < bS) return appliedSortDir === 'asc' ? -1 : 1
      if (aS > bS) return appliedSortDir === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [patients, appliedSortBy, appliedSortDir])

  return (
    <table className="w-full whitespace-nowrap">
      <TableHeader
        sortBy={appliedSortBy}
        sortDir={appliedSortDir}
        onSortChange={handleSortChange}
      />
      <TableBody patients={sortedPatients} onDataChange={onDataChange} />
    </table>
  )
}
