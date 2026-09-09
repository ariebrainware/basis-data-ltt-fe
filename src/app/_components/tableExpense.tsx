import { ChevronUpDownIcon } from '@heroicons/react/24/solid'
import { Typography } from '@material-tailwind/react'
import ExpenseRow from './expenseRow'
import { ExpenseType } from '../_types/expense'

interface TableExpenseProps {
  Data: {
    expenses: ExpenseType[]
  }
  onDataChange?: () => void
}

const TABLE_HEAD = [
  'ID',
  'Tanggal',
  'Kategori',
  'Deskripsi',
  'Metode',
  'Nominal',
  'Bukti',
  'Catatan',
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
  expenses,
  onDataChange,
}: {
  expenses: ExpenseType[]
  onDataChange?: () => void
}) => {
  if (expenses.length === 0) {
    return (
      <tbody className="text-sm text-blue-gray-500">
        <tr>
          <td
            colSpan={TABLE_HEAD.length}
            className="text-slate-500 p-8 text-center"
          >
            Tidak ada data pengeluaran ditemukan.
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody className="text-sm text-blue-gray-500">
      {expenses.map((entry) => (
        <ExpenseRow
          key={entry.ID}
          ID={entry.ID}
          expense_date={entry.expense_date}
          category={entry.category}
          amount={entry.amount}
          description={entry.description}
          payment_method={entry.payment_method}
          receipt_url={entry.receipt_url}
          notes={entry.notes}
          onDataChange={onDataChange}
        />
      ))}
    </tbody>
  )
}

export default function TableExpense({
  Data,
  onDataChange,
}: TableExpenseProps) {
  const { expenses } = Data

  return (
    <table className="w-full whitespace-nowrap">
      <TableHeader />
      <TableBody expenses={expenses} onDataChange={onDataChange} />
    </table>
  )
}
