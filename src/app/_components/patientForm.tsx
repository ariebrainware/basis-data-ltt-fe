import React, { useEffect, useState } from 'react'
import { isAdmin } from '../_functions/userRole'
import { Card, Input, Textarea } from '@material-tailwind/react'
import { PatientType } from '../_types/patient'
import { DiseaseType } from '../_types/disease'
import { GenderSelect } from './selectGender'
import { DiseaseMultiSelect } from './selectDisease'
import { SignaturePad } from './signaturePad'
import { getApiHost } from '../_functions/apiHost'

function getSignatureUrl(path?: string): string {
  if (!path) return ''
  if (
    path.startsWith('data:') ||
    path.startsWith('http://') ||
    path.startsWith('https://')
  ) {
    return path
  }
  const host = getApiHost()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${host}${cleanPath}`
}

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
  signature,
  signature_path,
  onGenderChange,
  diseases,
}: PatientFormProps) {
  const [admin, setAdmin] = useState(isAdmin())
  const [selected, setSelected] = useState<string[]>(() => {
    return health_history
      ? health_history
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
  })
  const [signatureVal, setSignatureVal] = useState(
    signature_path || signature || ''
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSignatureVal(signature_path || signature || '')
  }, [signature, signature_path])

  useEffect(() => {
    const initial = health_history
      ? health_history
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
    // Schedule state update asynchronously to avoid synchronous setState
    // inside the effect body which can trigger cascading renders.
    const t = setTimeout(() => {
      setSelected((prev) => {
        if (prev.length !== initial.length) return initial

        const prevSet = new Set(prev)
        const equal = initial.every((id) => prevSet.has(id))

        return equal ? prev : initial
      })
    }, 0)

    return () => clearTimeout(t)
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
              disabled={!admin}
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
              defaultValue={
                Array.isArray(phone_number)
                  ? phone_number.join(', ')
                  : (phone_number ?? '')
              }
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
            {/* Hidden signature field collected by form builders */}
            <input
              id="signature"
              name="signature"
              type="hidden"
              data-testid="signature"
              value={signatureVal}
            />
            <div className="mt-2 w-full">
              {signatureVal ? (
                <div className="border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/50 relative overflow-hidden rounded-xl border bg-white/50 p-4 shadow-sm backdrop-blur-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold">
                      <span className="bg-emerald-500 h-1.5 w-1.5 animate-pulse rounded-full" />
                      Tanda Tangan Terdaftar
                    </span>
                    <button
                      type="button"
                      onClick={() => setSignatureVal('')}
                      className="text-xs font-semibold text-red-600 transition-all hover:text-red-700 hover:underline dark:text-red-400"
                    >
                      Ubah Tanda Tangan
                    </button>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 flex justify-center rounded-lg border p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getSignatureUrl(signatureVal)}
                      alt="Tanda Tangan Pasien"
                      className="max-h-[100px] object-contain dark:invert"
                    />
                  </div>
                </div>
              ) : (
                <div className="border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/50 rounded-xl border bg-white/50 p-4 shadow-sm backdrop-blur-sm">
                  <div className="mb-2">
                    <span className="dark:bg-amber-950/30 flex w-fit items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:border-amber-900/30 dark:text-amber-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                      Belum Ada Tanda Tangan
                    </span>
                  </div>
                  <SignaturePad onChange={(val) => setSignatureVal(val)} />
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </Card>
  )
}
