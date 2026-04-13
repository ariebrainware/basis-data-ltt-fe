import PricingRow from './pricingRow'
import { PricingType } from '../_types/pricing'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'
import { Typography } from '@material-tailwind/react'

interface TablePricingProps {
  Data: {
    pricing: PricingType[]
  }
  onDataChange?: () => void
}

const TABLE_HEAD = ['ID', 'Nama Harga', 'Nominal', 'Deskripsi', 'Aksi']

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
  pricing,
  onDataChange,
}: {
  pricing: PricingType[]
  onDataChange?: () => void
}) => (
  <tbody className="text-sm text-blue-gray-500">
    {pricing.map((item) => (
      <PricingRow
        key={item.ID}
        ID={item.ID}
        name={item.name}
        amount={item.amount}
        description={item.description}
        onDataChange={onDataChange}
      />
    ))}
  </tbody>
)

export default function TablePricing({
  Data,
  onDataChange,
}: TablePricingProps) {
  const { pricing } = Data

  return (
    <table className="w-full whitespace-nowrap">
      <TableHeader />
      <TableBody pricing={pricing} onDataChange={onDataChange} />
    </table>
  )
}
