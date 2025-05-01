import { Card, Input, Textarea } from '@material-tailwind/react'
import { PatientType } from '../_types/patient'

export function PatientForm({
  full_name,
  job,
  age,
  email,
  address,
  phone_number,
  health_history,
  surgery_history,
}: PatientType) {
  return (
    <Card
      color="transparent"
      shadow={false}
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
    >
      <form className="mb-2 mt-8 w-80 max-w-screen-lg sm:w-96">
        <div className="mb-1 flex w-72 gap-6">
          <div className="flex flex-col items-center gap-4">
            <Input
              id="full_name"
              type="text"
              label="Nama Lengkap"
              defaultValue={full_name}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
            />
            <Input
              id="job"
              type="text"
              label="Pekerjaan"
              defaultValue={job}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
            />
            <Input
              id="age"
              type="number"
              label="Umur"
              defaultValue={age}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
            />
            <Input
              id="email"
              type="email"
              label="Email"
              defaultValue={email}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
            />
            <Input
              id="phone_number"
              type="number"
              label="Nomor Telepon"
              defaultValue={phone_number}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
            />
          </div>
          <div className="flex flex-col items-center gap-4">
            <Textarea
              id="address"
              label="Alamat"
              defaultValue={address}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            />
            <Textarea
              id="health_history"
              label="Riwayat Penyakit"
              defaultValue={health_history}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            />
            <Textarea
              id="surgery_history"
              label="Riwayat Operasi"
              defaultValue={surgery_history}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            />
          </div>
        </div>
      </form>
    </Card>
  )
}
