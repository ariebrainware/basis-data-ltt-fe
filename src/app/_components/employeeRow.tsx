import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EmployeeType } from '../_types/employee'
import EmployeeRowActions from './employeeRowActions'

export default function EmployeeRow({
  ID,
  nik,
  full_name,
  gender,
  address,
  religion,
  phone_number,
  email,
  joined_date,
  position,
  base_salary,
  lunch_money,
  onDataChange,
}: EmployeeType & { onDataChange?: () => void }) {
  const router = useRouter()
  const getGenderLabel = (gVal?: string) => {
    const g = (gVal || '').toString().trim().toLowerCase()
    if (g === 'female' || g === 'perempuan') return 'Perempuan'
    if (g === 'male' || g === 'laki-laki' || g === 'laki laki')
      return 'Laki-laki'
    return gVal ? String(g.charAt(0).toUpperCase() + g.slice(1)) : ''
  }

  const detailHref = `/employee/${ID}`

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    // Let real links/buttons handle their own clicks
    if ((e.target as HTMLElement).closest('a, button, input, select, textarea'))
      return
    // Don't navigate when the user is selecting text to copy
    if (window.getSelection()?.toString()) return
    if (e.metaKey || e.ctrlKey) {
      window.open(detailHref, '_blank', 'noopener,noreferrer')
      return
    }
    router.push(detailHref)
  }

  return (
    <tr
      className="border-slate-200 cursor-pointer border-b transition-colors last:border-0 hover:bg-blue-gray-50/50"
      onClick={handleRowClick}
      data-testid={`employee-row-${ID}`}
    >
      <td className="p-3">
        <small className="font-sans text-sm text-current antialiased">
          {nik}
        </small>
      </td>
      <td className="p-3">
        <div className="flex flex-col">
          <Link
            href={detailHref}
            className="font-sans text-sm font-medium text-current antialiased hover:text-blue-600 hover:underline"
          >
            {full_name}
          </Link>
          <small className="font-sans text-xs text-blue-gray-400">
            {position}
          </small>
        </div>
      </td>
      <td className="p-3">
        <small className="font-sans text-sm text-current antialiased">
          {getGenderLabel(gender)}
        </small>
      </td>
      <td className="p-3">
        <div className="flex flex-col">
          <small className="font-sans text-sm text-current antialiased">
            {phone_number}
          </small>
          <small className="font-sans text-xs text-blue-gray-400">
            {email}
          </small>
        </div>
      </td>
      <td className="p-3">
        <small className="font-sans text-sm text-current antialiased">
          {religion}
        </small>
      </td>
      <td className="p-3">
        <small className="font-sans text-sm text-current antialiased">
          {joined_date}
        </small>
      </td>
      <td className="p-3">
        <div className="flex flex-col">
          <small className="font-sans text-sm text-current antialiased">
            Rp {Number(base_salary || 0).toLocaleString('id-ID')}
          </small>
          <small className="font-sans text-xs text-blue-gray-400">
            U.M: Rp {Number(lunch_money || 0).toLocaleString('id-ID')}
          </small>
        </div>
      </td>
      {/* Clicks here (incl. the edit dialog rendered in a portal) must not open the detail page */}
      <td className="cursor-default p-3" onClick={(e) => e.stopPropagation()}>
        <EmployeeRowActions
          ID={ID}
          nik={nik}
          full_name={full_name}
          gender={gender}
          address={address}
          religion={religion}
          phone_number={phone_number}
          email={email}
          joined_date={joined_date}
          position={position}
          base_salary={base_salary}
          lunch_money={lunch_money}
          onDataChange={onDataChange}
        />
      </td>
    </tr>
  )
}
