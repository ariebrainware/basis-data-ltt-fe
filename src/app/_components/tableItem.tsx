import { ChevronUpDownIcon } from '@heroicons/react/24/solid'
import { Typography } from '@material-tailwind/react'
import ItemRow from './itemRow'
import { ItemType } from '../_types/item'

interface TableItemProps {
  Data: {
    item: ItemType[]
  }
  onDataChange?: () => void
}

const TABLE_HEAD = ['ID Item', 'Nama Item', 'Harga', 'Quantity', 'Aksi']

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
  item,
  onDataChange,
}: {
  item: ItemType[]
  onDataChange?: () => void
}) => (
  <tbody className="text-sm text-blue-gray-500">
    {item.map((entry) => (
      <ItemRow
        key={entry.ID}
        ID={entry.ID}
        name={entry.name}
        price={entry.price}
        quantity={entry.quantity}
        onDataChange={onDataChange}
      />
    ))}
  </tbody>
)

export default function TableItem({ Data, onDataChange }: TableItemProps) {
  const { item } = Data

  return (
    <table className="w-full whitespace-nowrap">
      <TableHeader />
      <TableBody item={item} onDataChange={onDataChange} />
    </table>
  )
}
