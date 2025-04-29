import Patient from '../_components/patientRow'
import { PatientType } from '../_types/patient'

interface TablePatientProps {
  Data: {
    patients: PatientType[]
  }
}
const TableHeader = () => (
  <thead className="border-slate-200 bg-slate-100 text-slate-600 dark:bg-slate-900 border-b text-sm font-medium">
    <tr>
      {renderHeaderCell('Pasien')}
      {renderHeaderCell('Pekerjaan/Umur')}
      {renderHeaderCell('Jenis Kelamin')}
      {renderHeaderCell('Kode Pasien')}
      <th className="cursor-pointer px-2.5 py-2 text-start font-medium">
        <small className="flex items-center justify-between gap-2 font-sans text-sm text-current antialiased opacity-70">
          {' '}
        </small>
      </th>
    </tr>
  </thead>
)

const renderHeaderCell = (label: string) => (
  <th className="cursor-pointer px-2.5 py-2 text-start font-medium">
    <small className="flex items-center justify-between gap-2 font-sans text-sm text-current antialiased opacity-70">
      {label}{' '}
      <svg
        width="1.5em"
        height="1.5em"
        viewBox="0 0 24 24"
        strokeWidth="2"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        color="currentColor"
        className="size-4"
      >
        <path
          d="M17 8L12 3L7 8"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M17 16L12 21L7 16"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </svg>
    </small>
  </th>
)

const TableBody = ({ patients }: { patients: PatientType[] }) => (
  <tbody className="text-slate-800 group text-sm dark:text-white">
    {patients.map((patient: PatientType, index: number) => (
      <Patient
        key={`${patient.patient_code + index}`}
        full_name={patient.full_name}
        phone_number={patient.phone_number}
        job={patient.job}
        age={patient.age}
        gender={patient.gender}
        patient_code={patient.patient_code}
        last_visit={''}
        email={patient.email}
        health_history={patient.health_history}
        surgery_history={patient.surgery_history}
        address={patient.address}
      />
    ))}
  </tbody>
)

export default function TablePatient({ Data }: TablePatientProps) {
  const { patients } = Data
  return (
    <div className="border-slate-200 mt-4 w-full overflow-hidden rounded-lg border">
      <table className="w-full">
        <TableHeader />
        <TableBody patients={patients} />
      </table>
    </div>
  )
}
