import { Card, Input, Textarea } from '@material-tailwind/react'
import { PatientType } from '../_types/patient'
import { GenderSelect } from './selectGender'

interface PatientFormProps extends PatientType {
  onGenderChange?: (value: string) => void
}

export function PatientForm({
  ID,
  full_name,
  phone_number,
  job,
  age,
  email,
  gender,
  address,
  health_history,
  surgery_history,
  patient_code,
  onGenderChange,
}: PatientFormProps) {
  return (
    <Card
      color="transparent"
      shadow={false}
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
      onResize={undefined}
      onResizeCapture={undefined}
    >
      <form className="mb-2 mt-4 w-full px-2 md:mt-8 md:px-0">
        <div className="mb-1 flex w-full flex-col gap-4 md:flex-row md:gap-6">
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            <Input
              id="ID"
              type="text"
              label="ID"
              disabled
              defaultValue={ID}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="patient_code"
              type="text"
              label="Kode Pasien"
              disabled
              defaultValue={patient_code}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="full_name"
              type="text"
              label="Nama Lengkap"
              defaultValue={full_name}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Textarea
              id="phone_number"
              label="Nomor Telepon"
              defaultValue={phone_number}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="job"
              type="text"
              label="Pekerjaan"
              defaultValue={job}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="age"
              type="email"
              label="Age"
              defaultValue={age}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="email"
              type="text"
              label="Email"
              defaultValue={email}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
          </div>
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            <GenderSelect
              id="gender"
              label="Jenis Kelamin"
              value={gender}
              onChange={onGenderChange}
            />

            <Textarea
              id="address"
              label="Alamat"
              defaultValue={address}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Textarea
              id="health_history"
              label="Riwayat Penyakit"
              defaultValue={health_history}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Textarea
              id="surgery_history"
              label="Riwayat Operasi"
              defaultValue={surgery_history}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
          </div>
        </div>
      </form>
    </Card>
  )
}
