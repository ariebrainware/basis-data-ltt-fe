'use client'
import React from 'react'
import { Card, Input, Textarea } from '@material-tailwind/react'
import { TreatmentType } from '../_types/treatment'
import { isTherapist } from '../_functions/userRole'
import { ControlledSelect } from './selectTherapist'
import { TreatmentConditionMultiSelect } from './selectTreatmentCondition'

interface TreatmentFormProps extends TreatmentType {
  therapistIDState?: string
  setTherapistIDState?: (value: string) => void
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
}: TreatmentFormProps) {
  const isTherapistRole = isTherapist()
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
              disabled={isTherapistRole}
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
              disabled={isTherapistRole}
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
              disabled={isTherapistRole}
              onChange={(value: string) => {
                if (process.env.NODE_ENV !== 'production') {
                  console.log('Therapist selected:', value)
                }
                setTherapistID(value)
              }}
            />
          </div>
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            <Textarea
              id="issues"
              label="Keluhan"
              defaultValue={issues}
              disabled={isTherapistRole}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Textarea
              id="treatment"
              label="Penanganan"
              defaultValue={treatment}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <div>
              <TreatmentConditionMultiSelect
                id="treatmentHistory"
                label="Penanganan"
                value={selectedTreatmentConditions}
                onChange={(items: string[]) =>
                  setSelectedTreatmentConditions(items)
                }
                disabled={false}
              />
            </div>
            <Textarea
              id="remarks"
              label="Keterangan"
              defaultValue={remarks}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Textarea
              id="next_visit"
              label="Kunjungan Selanjutnya"
              defaultValue={nextVisit}
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
