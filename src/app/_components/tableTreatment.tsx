import Treatment from './treatmentRow'
import { TreatmentType } from '../_types/treatment'
import { Typography } from '@material-tailwind/react'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'

interface TableTreatmentProps {
  Data: {
    treatment: TreatmentType[]
  }
}
const TABLE_HEAD = [
  'Waktu & Tanggal',
  'Nama Pasien',
  'Keluhan',
  'Penanganan',
  'Keterangan',
  'Kunjungan Selanjutnya',
  'Terapis',
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

const TableBody = ({ treatment }: { treatment: TreatmentType[] }) => (
  <tbody className="text-sm text-blue-gray-500">
    {treatment?.map((treatment: TreatmentType) => (
      <Treatment
        key={treatment.ID}
        ID={treatment.ID}
        treatment_date={treatment.treatment_date}
        patient_code={treatment.patient_code}
        patient_name={treatment.patient_name}
        age={treatment.age}
        issues={treatment.issues}
        treatment={treatment.treatment}
        remarks={treatment.remarks}
        therapist_name={treatment.therapist_name}
        therapist_id={treatment.therapist_id}
        next_visit={treatment.next_visit}
      />
    ))}
  </tbody>
)

export default function TableTreatment({ Data }: TableTreatmentProps) {
  const { treatment } = Data
  return (
    <table className="w-full whitespace-nowrap">
      <TableHeader />
      <TableBody treatment={treatment} />
    </table>
  )
}
