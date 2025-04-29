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
              type="text"
              label="Nama Lengkap"
              value={full_name}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
            />
            <Input
              type="text"
              label="Pekerjaan"
              value={job}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
            />
            <Input
              type="number"
              label="Umur"
              value={age}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
            />
            <Input
              type="email"
              label="Email"
              value={email}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
            />
            <Input
              type="number"
              label="Nomor Telepon"
              value={phone_number}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
            />
          </div>
          <div className="flex flex-col items-center gap-4">
            <Textarea
              label="Alamat"
              value={address}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            />
            <Textarea
              label="Riwayat Penyakit"
              value={health_history}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            />
            <Textarea
              label="Riwayat Operasi"
              value={surgery_history}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            />
          </div>
        </div>
      </form>
    </Card>
  )
}
