import TransactionRow from './transactionRow'
import { TransactionType } from '../_types/transaction'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'
import { Typography } from '@material-tailwind/react'

interface TableTransactionProps {
  Data: {
    transaction: TransactionType[]
  }
}

const TABLE_HEAD = [
  'Tanggal Transaksi',
  'Tanggal Terapi',
  'Pasien',
  'ID Penanganan',
  'Nominal',
  'Status',
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

const TableBody = ({ transaction }: { transaction: TransactionType[] }) => (
  <tbody className="text-sm text-blue-gray-500">
    {transaction.map((item, index) => (
      <TransactionRow
        key={`${item.ID}-${item.treatment_id}-${item.transaction_date}-${index}`}
        ID={item.ID}
        treatment_id={item.treatment_id}
        patient_name={item.patient_name}
        amount={item.amount}
        payment_status={item.payment_status}
        notes={item.notes}
        transaction_date={item.transaction_date}
        treatment_date={item.treatment_date}
        pricing_name={''}
      />
    ))}
  </tbody>
)

export default function TableTransaction({ Data }: TableTransactionProps) {
  const { transaction } = Data

  return (
    <table className="w-full whitespace-nowrap">
      <TableHeader />
      <TableBody transaction={transaction} />
    </table>
  )
}
