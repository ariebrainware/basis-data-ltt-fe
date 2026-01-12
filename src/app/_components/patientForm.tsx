import React, { useEffect, useState } from 'react'
import { Card, Input, Textarea } from '@material-tailwind/react'
import { PatientType } from '../_types/patient'
import { DiseaseType } from '../_types/disease'
import { GenderSelect } from './selectGender'
import { DiseaseMultiSelect } from './selectDisease'

interface PatientFormProps extends PatientType {
  onGenderChange?: (value: string) => void
  diseases?: DiseaseType[]
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
  diseases,
}: PatientFormProps) {
  const [selected, setSelected] = useState<string[]>(() => {
    return health_history
      ? health_history
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
  })

  useEffect(() => {
    const initial = health_history
      ? health_history
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []

    // Only update state when parsed array differs from current selected to avoid
    // unnecessary state updates. Use order-insensitive comparison since disease
    // order doesn't matter semantically.
    setSelected((prev) => {
      if (prev.length !== initial.length) return initial

      // Use Set-based comparison for better performance with larger arrays
      const prevSet = new Set(prev)
      const equal = initial.every((id) => prevSet.has(id))

      return equal ? prev : initial
    })
  }, [health_history])

  useEffect(() => {
    const el = document.getElementById(
      'health_history'
    ) as HTMLInputElement | null
    if (el) el.value = selected.join(',')
  }, [selected])
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
              type="number"
              label="Age"
              defaultValue={
                age !== undefined && age !== null ? String(age) : ''
              }
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
            {/* Hidden input keeps existing DOM id used by other scripts */}
            <input
              id="health_history"
              name="health_history"
              type="hidden"
              data-testid="health_history"
              defaultValue={health_history ?? ''}
            />
            <div>
              <label className="text-slate-700 mb-1 block text-sm font-medium">
                Riwayat Penyakit
              </label>
              <DiseaseMultiSelect
                id="health_history_select"
                label="Riwayat Penyakit"
                value={selected}
                onChange={(vals) => setSelected(vals)}
                options={diseases}
              />
            </div>
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
