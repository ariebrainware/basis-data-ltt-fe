'use client'
import React from 'react'
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
}) => {
  const patientNameSortDir = sortBy === 'full_name' ? (sortDir ?? 'asc') : null
  const patientCodeSortDir =
    sortBy === 'patient_code' ? (sortDir ?? 'asc') : null

  const patientNameAriaSort =
    patientNameSortDir === 'desc'
      ? 'descending'
      : patientNameSortDir === 'asc'
        ? 'ascending'
        : 'none'

  const patientCodeAriaSort =
    patientCodeSortDir === 'desc'
      ? 'descending'
      : patientCodeSortDir === 'asc'
        ? 'ascending'
        : 'none'

  const patientNameButtonAriaLabel =
    patientNameSortDir === null
      ? 'Sort by patient name and phone number'
      : `Sort by patient name and phone number, currently sorted ${
          patientNameSortDir === 'desc' ? 'descending' : 'ascending'
        }`

  const patientCodeButtonAriaLabel =
    patientCodeSortDir === null
      ? 'Sort by patient code'
      : `Sort by patient code, currently sorted ${
          patientCodeSortDir === 'desc' ? 'descending' : 'ascending'
        }`

  return (
    <thead className="border-slate-200 bg-slate-100 text-slate-600 dark:bg-slate-900 border-b text-sm font-medium">
      <tr>
        <th
          className="px-2.5 py-2 text-start font-medium"
          aria-sort={patientNameAriaSort}
        >
          <button
            type="button"
            onClick={() => onSortChange && onSortChange('full_name')}
            className="flex items-center gap-2 text-sm text-current antialiased opacity-70"
            aria-label={patientNameButtonAriaLabel}
          >
            Pasien/Nomor Telepon
            <SortIcon dir={patientNameSortDir} />
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
        <th
          className="px-2.5 py-2 text-start font-medium"
          aria-sort={patientCodeAriaSort}
        >
          <button
            type="button"
            onClick={() => onSortChange && onSortChange('patient_code')}
            className="flex items-center gap-2 text-sm text-current antialiased opacity-70"
            aria-label={patientCodeButtonAriaLabel}
          >
            Kode Pasien
            <SortIcon dir={patientCodeSortDir} />
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
}

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

  return (
    <table className="w-full whitespace-nowrap">
      <TableHeader
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={onSortChange}
      />
      <TableBody patients={patients} onDataChange={onDataChange} />
    </table>
  )
}
