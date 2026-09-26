import Treatment from './treatmentRow'
import { TreatmentType } from '../_types/treatment'
import { Typography } from '@material-tailwind/react'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'

interface TableTreatmentProps {
  Data: {
    treatment: TreatmentType[]
  }
  onDataChange?: () => void
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyMessage?: string
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

const TableBody = ({
  treatment,
  onDataChange,
  loading,
  error,
  onRetry,
  emptyMessage = 'Tidak ada data penanganan',
}: {
  treatment: TreatmentType[]
  onDataChange?: () => void
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyMessage?: string
}) => {
  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={TABLE_HEAD.length} className="p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="size-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
              <p className="text-xs text-gray-500">
                Memuat data penanganan...
              </p>
            </div>
          </td>
        </tr>
      </tbody>
    )
  }

  if (error) {
    return (
      <tbody>
        <tr>
          <td colSpan={TABLE_HEAD.length} className="p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-2">
              <p className="text-xs font-semibold text-red-500">{error}</p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="rounded bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
                >
                  Coba Lagi
                </button>
              )}
            </div>
          </td>
        </tr>
      </tbody>
    )
  }

  if (!treatment || treatment.length === 0) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={TABLE_HEAD.length}
            className="p-8 text-center text-xs italic text-gray-500"
          >
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody className="text-sm text-blue-gray-500">
      {treatment.map((item: TreatmentType) => (
        <Treatment
          key={item.ID}
          ID={item.ID}
          treatment_date={item.treatment_date}
          patient_code={item.patient_code}
          patient_name={item.patient_name}
          age={item.age}
          issues={item.issues}
          treatment={item.treatment}
          remarks={item.remarks}
          therapist_name={item.therapist_name}
          therapist_id={item.therapist_id}
          next_visit={item.next_visit}
          health_history={item.health_history}
          surgery_history={item.surgery_history}
          attachment_path={item.attachment_path}
          onDataChange={onDataChange}
        />
      ))}
    </tbody>
  )
}

export default function TableTreatment({
  Data,
  onDataChange,
  loading,
  error,
  onRetry,
  emptyMessage,
}: TableTreatmentProps) {
  const { treatment } = Data
  return (
    <table className="w-full whitespace-nowrap">
      <TableHeader />
      <TableBody
        treatment={treatment}
        onDataChange={onDataChange}
        loading={loading}
        error={error}
        onRetry={onRetry}
        emptyMessage={emptyMessage}
      />
    </table>
  )
}
