import Therapist from '../_components/therapistRow'
import { TherapistType } from '../_types/therapist'
import { Typography } from '@material-tailwind/react'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'

interface TableTherapistProps {
  Data: {
    therapist: TherapistType[]
  }
}
const TABLE_HEAD = [
  'Terapis / No HP',
  'Email / Alamat',
  'Tanggal Lahir / NIK',
  'Berat / Tinggi Badan',
  'Role',
  'Status',
  '',
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

const TableBody = ({ therapist }: { therapist: TherapistType[] }) => (
  <tbody className="text-sm text-blue-gray-500">
    {therapist?.map((therapist: TherapistType) => (
      <Therapist
        key={therapist.ID}
        ID={therapist.ID}
        full_name={therapist.full_name}
        email={therapist.email}
        phone_number={therapist.phone_number}
        role={therapist.role}
        is_approved={therapist.is_approved}
        date_of_birth={therapist.date_of_birth}
        nik={therapist.nik}
        weight={therapist.weight}
        height={therapist.height}
        address={therapist.address}
      />
    ))}
  </tbody>
)

export default function TableTherapist({ Data }: TableTherapistProps) {
  const { therapist } = Data
  //   console.log(`therapist`, therapist)
  return (
    <table className="w-full whitespace-nowrap">
      <TableHeader />
      <TableBody therapist={therapist} />
    </table>
  )
}
