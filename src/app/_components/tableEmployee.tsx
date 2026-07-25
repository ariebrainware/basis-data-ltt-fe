import { ChevronUpDownIcon } from '@heroicons/react/24/solid'
import { Typography } from '@material-tailwind/react'
import EmployeeRow from './employeeRow'
import { EmployeeType } from '../_types/employee'

interface TableEmployeeProps {
  Data: {
    employees: EmployeeType[]
  }
  onDataChange?: () => void
}

const TABLE_HEAD = [
  'NIK',
  'Nama & Jabatan',
  'Jenis Kelamin',
  'Kontak',
  'Agama',
  'Tanggal Masuk',
  'Gaji & Uang Makan',
  'Aksi',
]

const TableHeader = () => (
  <thead>
    <tr>
      {TABLE_HEAD.map((head, index) => (
        <th
          key={head}
          className="cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50"
        >
          <Typography
            variant="small"
            color="blue-gray"
            className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            {head}{' '}
            {index !== TABLE_HEAD.length - 1 && (
              <ChevronUpDownIcon strokeWidth={2} className="size-4" />
            )}
          </Typography>
        </th>
      ))}
    </tr>
  </thead>
)

const TableBody = ({
  employees,
  onDataChange,
}: {
  employees: EmployeeType[]
  onDataChange?: () => void
}) => (
  <tbody className="text-sm text-blue-gray-500">
    {employees.map((entry) => (
      <EmployeeRow
        key={entry.ID}
        ID={entry.ID}
        nik={entry.nik}
        full_name={entry.full_name}
        gender={entry.gender}
        address={entry.address}
        religion={entry.religion}
        phone_number={entry.phone_number}
        email={entry.email}
        joined_date={entry.joined_date}
        position={entry.position}
        base_salary={entry.base_salary}
        lunch_money={entry.lunch_money}
        onDataChange={onDataChange}
      />
    ))}
  </tbody>
)

export default function TableEmployee({
  Data,
  onDataChange,
}: TableEmployeeProps) {
  const { employees } = Data

  return (
    <table className="w-full whitespace-nowrap">
      <TableHeader />
      <TableBody employees={employees} onDataChange={onDataChange} />
    </table>
  )
}
