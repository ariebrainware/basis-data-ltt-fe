import { Card, Input, Textarea } from '@material-tailwind/react'
import { PatientType } from '../_types/patient'

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
}: PatientType) {
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
      <form className="mb-2 mt-8 w-80 max-w-screen-lg sm:w-96">
        <div className="mb-1 flex w-72 gap-6">
          <div className="flex flex-col items-center gap-4">
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
          <div className="flex flex-col items-center gap-4">
            <select
              id="gender"
              name="gender"
              defaultValue={
                ['l', 'm', 'male', 'laki-laki', 'laki'].includes(
                  String(gender ?? '').toLowerCase()
                )
                  ? 'male'
                  : ['p', 'f', 'female', 'perempuan'].includes(
                        String(gender ?? '').toLowerCase()
                      )
                    ? 'female'
                    : gender
                      ? 'other'
                      : ''
              }
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
              <option value="other">Lainnya</option>
            </select>

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
