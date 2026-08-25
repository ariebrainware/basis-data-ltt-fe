'use client'
import React from 'react'
import { Card, Input, Textarea } from '@material-tailwind/react'
import { TreatmentType } from '../_types/treatment'
import { isTherapist } from '../_functions/userRole'
import { ControlledSelect } from './selectTherapist'
import { TreatmentConditionMultiSelect } from './selectTreatmentCondition'
import { DiseaseMultiSelect } from './selectDisease'

interface TreatmentFormProps extends TreatmentType {
  therapistIDState?: string
  setTherapistIDState?: (value: string) => void
  disabled?: boolean
}

export function TreatmentForm({
  ID,
  treatment_date: treatmentDate,
  patient_code: patientCode,
  patient_name: patientName,
  therapist_name: therapistName,
  therapist_id: therapistIdProp,
  issues: issues,
  treatment: treatment,
  remarks: remarks,
  next_visit: nextVisit,
  therapistIDState,
  setTherapistIDState,
  disabled = false,
  health_history,
  surgery_history,
}: TreatmentFormProps) {
  const isTherapistRole = isTherapist()
  // The backend may return treatment data in either JSON array format or comma-separated string format.
  // This function handles both formats to ensure compatibility with different API versions or data states.
  const parseTreatmentToArray = (raw: string | undefined): string[] => {
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.map((v) => String(v))
    } catch {
      // not json
    }
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  const [selectedTreatmentConditions, setSelectedTreatmentConditions] =
    React.useState<string[]>(() => parseTreatmentToArray(treatment))

  React.useEffect(() => {
    // keep textarea in sync when multi-select changes
    const el = document.getElementById(
      'treatment'
    ) as HTMLTextAreaElement | null
    if (el) el.value = selectedTreatmentConditions.join(',')
  }, [selectedTreatmentConditions])
  const [localTherapistID, setLocalTherapistID] = React.useState<string>(
    therapistIdProp?.toString() ?? ''
  )

  // Use either the passed state or local state
  const therapistID = therapistIDState ?? localTherapistID
  const setTherapistID = setTherapistIDState ?? setLocalTherapistID

  const [selectedHealthHistory, setSelectedHealthHistory] = React.useState<string[]>(() => {
    return health_history
      ? health_history
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
  })

  React.useEffect(() => {
    const initial = health_history
      ? health_history
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
    const t = setTimeout(() => {
      setSelectedHealthHistory((prev) => {
        if (prev.length !== initial.length) return initial

        const prevSet = new Set(prev)
        const equal = initial.every((id) => prevSet.has(id))

        return equal ? prev : initial
      })
    }, 0)

    return () => clearTimeout(t)
  }, [health_history])

  React.useEffect(() => {
    const el = document.getElementById(
      'health_history'
    ) as HTMLInputElement | null
    if (el) el.value = selectedHealthHistory.join(',')
  }, [selectedHealthHistory])
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
              id="treatment_date"
              type="text"
              label="Waktu & Tanggal"
              defaultValue={treatmentDate}
              disabled={disabled || isTherapistRole}
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
              defaultValue={patientCode}
              disabled={disabled || isTherapistRole}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="patient_name"
              type="text"
              label="Nama Pasien"
              defaultValue={patientName}
              disabled
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="therapist_name"
              type="text"
              label="Nama Terapis"
              defaultValue={therapistName}
              disabled
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <ControlledSelect
              id="therapist_id"
              label="Pilih Terapis"
              value={therapistID}
              disabled={disabled || isTherapistRole}
              onChange={(value: string) => {
                if (process.env.NODE_ENV !== 'production') {
                  console.log('Therapist selected:', value)
                }
                setTherapistID(value)
              }}
            />
            <input
              id="health_history"
              name="health_history"
              type="hidden"
              data-testid="health_history"
              defaultValue={health_history ?? ''}
              disabled={disabled}
            />
            <div>
              <DiseaseMultiSelect
                id="health_history_select"
                label="Riwayat Penyakit"
                value={selectedHealthHistory}
                onChange={setSelectedHealthHistory}
                disabled={disabled}
              />
            </div>
            <Textarea
              id="surgery_history"
              label="Riwayat Operasi/Penyakit Tambahan (Jika Ada)"
              defaultValue={surgery_history ?? ''}
              disabled={disabled}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
          </div>
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            <Textarea
              id="issues"
              label="Keluhan"
              defaultValue={issues}
              disabled={disabled || isTherapistRole}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Textarea
              id="treatment"
              label="Penanganan"
              defaultValue={treatment}
              disabled={disabled}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <div>
              {/* Treatment selection should remain editable for all roles,
                  including therapists, per business requirements. */}
              <TreatmentConditionMultiSelect
                id="treatmentHistory"
                label="Penanganan"
                value={selectedTreatmentConditions}
                onChange={(items: string[]) =>
                  setSelectedTreatmentConditions(items)
                }
                disabled={disabled}
              />
            </div>
            <Textarea
              id="remarks"
              label="Keterangan"
              defaultValue={remarks}
              disabled={disabled}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Textarea
              id="next_visit"
              label="Kunjungan Selanjutnya"
              defaultValue={nextVisit}
              disabled={disabled}
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
