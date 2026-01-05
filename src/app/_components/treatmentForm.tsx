'use client'
import React from 'react'
import { Card, Input, Textarea } from '@material-tailwind/react'
import { TreatmentType } from '../_types/treatment'
import { isTherapist } from '../_functions/userRole'
import { ControlledSelect } from './selectTherapist'

interface TreatmentFormProps extends TreatmentType {
  therapistIDState?: string
  setTherapistIDState?: (value: string) => void
}

export function TreatmentForm({
  ID,
  treatment_date: treatmentDate,
  patient_code: patientCode,
  patient_name: patientName,
  therapist_id: therapistIdProp,
  issues: issues,
  treatment: treatment,
  remarks: remarks,
  next_visit: nextVisit,
  therapistIDState,
  setTherapistIDState,
}: TreatmentFormProps) {
  const isTherapistRole = isTherapist()
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
              id="treatment_date"
              type="text"
              label="Treatment Date"
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
              label="Patient Code"
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
              label="Patient Name"
              defaultValue={patientName}
              disabled={isTherapistRole}
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
              onChange={(value: string) => {
                if (process.env.NODE_ENV !== 'production') {
                  console.log('Therapist selected:', value)
                }
                setTherapistID(value)
              }}
            />
          </div>
          <div className="flex flex-col items-center gap-4">
            <Textarea
              id="issues"
              label="Issues"
              defaultValue={issues}
              disabled={isTherapistRole}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Textarea
              id="treatment"
              label="Treatment"
              defaultValue={treatment}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Textarea
              id="remarks"
              label="Remarks"
              defaultValue={remarks}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Textarea
              id="next_visit"
              label="Next Visit"
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
