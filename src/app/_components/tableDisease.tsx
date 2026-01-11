import Disease from '../_components/diseaseRow'
import { DiseaseType } from '../_types/disease'
import { Typography } from '@material-tailwind/react'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'

interface TableDiseaseProps {
  Data: {
    diseases: DiseaseType[]
  }
  onDataChange?: () => void
}

const TABLE_HEAD = ['ID', 'Nama Penyakit', 'Deskripsi', '']

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
  diseases,
  onDataChange,
}: {
  diseases: DiseaseType[]
  onDataChange?: () => void
}) => (
  <tbody className="text-sm text-blue-gray-500">
    {diseases?.map((disease: DiseaseType) => (
      <Disease
        key={disease.ID}
        ID={disease.ID}
        name={disease.name}
        description={disease.description}
        onDataChange={onDataChange}
      />
    ))}
  </tbody>
)

export default function TableDisease({
  Data,
  onDataChange,
}: TableDiseaseProps) {
  const { diseases } = Data
  return (
    <table className="w-full whitespace-nowrap">
      <TableHeader />
      <TableBody diseases={diseases} onDataChange={onDataChange} />
    </table>
  )
}
