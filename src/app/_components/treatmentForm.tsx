import { Card, Input, Textarea } from '@material-tailwind/react'
import { TreatmentType } from '../_types/treatment'
import { isTherapist } from '../_functions/userRole'

export function TreatmentForm({
  ID,
  treatment_date: treatmentDate,
  patient_code: patientCode,
  patient_name: patientName,
  therapist_name: therapistName,
  therapist_id: therapistID,
  issues: issues,
  treatment: treatment,
  remarks: remarks,
  next_visit: nextVisit,
}: TreatmentType) {
  const isTherapistRole = isTherapist()
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
            <Input
              id="therapist_name"
              type="text"
              label="Therapist Name"
              defaultValue={therapistName}
              disabled={isTherapistRole}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="therapist_id"
              type="text"
              label="Therapist ID"
              defaultValue={therapistID}
              disabled={isTherapistRole}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
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
