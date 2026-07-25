import React from 'react'
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
  const getGenderLabel = (gVal?: string) => {
    const g = (gVal || '').toString().trim().toLowerCase()
    if (g === 'female' || g === 'perempuan') return 'Perempuan'
    if (g === 'male' || g === 'laki-laki' || g === 'laki laki')
      return 'Laki-laki'
    return gVal ? String(g.charAt(0).toUpperCase() + g.slice(1)) : ''
  }

  return (
    <tr className="border-slate-200 border-b last:border-0">
      <td className="p-3">
        <small className="font-sans text-sm text-current antialiased">
          {nik}
        </small>
      </td>
      <td className="p-3">
        <div className="flex flex-col">
          <small className="font-sans text-sm font-medium text-current antialiased">
            {full_name}
          </small>
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
      <td className="p-3">
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
