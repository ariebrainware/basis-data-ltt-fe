import React from 'react'
import { getSessionToken } from '../_functions/sessionToken'
import { TreatmentType } from '../_types/treatment'
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@material-tailwind/react'
import { TreatmentForm } from './treatmentForm'
import Swal from 'sweetalert2'
import { getApiHost } from '../_functions/apiHost'
import { useDeleteResource } from '../_hooks/useDeleteResource'
import { isTherapist } from '../_functions/userRole'
import { getUserId } from '../_functions/userId'

export default function Treatment({
  ID,
  treatment_date: treatmentDate,
  patient_code: patientCode,
  patient_name: patientName,
  therapist_name: therapistName,
  therapist_id: therapistId,
  age: age,
  issues,
  treatment,
  remarks,
  next_visit: nextVisit,
}: TreatmentType) {
  const [open, setOpen] = React.useState(false)
  const [therapistIDState, setTherapistIDState] = React.useState<string>(
    therapistId?.toString() ?? ''
  )
  const isTherapistRole = isTherapist()
  const currentUserId = getUserId()
  const normalizedTherapistId =
    therapistId !== null && therapistId !== undefined
      ? String(therapistId)
      : null
  const normalizedCurrentUserId =
    currentUserId !== null && currentUserId !== undefined
      ? String(currentUserId)
      : null

  // Check if current user can edit this treatment
  // Therapists can only edit treatments assigned to them
  // Non-therapists (admins) can edit all treatments
  const canEdit =
    !isTherapistRole ||
    (normalizedTherapistId !== null &&
      normalizedCurrentUserId !== null &&
      normalizedTherapistId === normalizedCurrentUserId)

  // Helper function to determine why edit is denied
  const getEditDenialReason = React.useCallback((): string => {
    if (normalizedCurrentUserId === null) {
      return 'User ID not found in localStorage'
    }
    if (normalizedTherapistId === null) {
      return 'Treatment has no therapist assigned'
    }
    if (normalizedTherapistId !== normalizedCurrentUserId) {
      return 'Treatment is assigned to a different therapist'
    }
    return 'Unknown reason'
  }, [normalizedCurrentUserId, normalizedTherapistId])

  // Debug logging to help diagnose edit permission issues
  // Only log when there's a potential issue (therapist can't edit their own treatment)
  // Run this as an effect so it doesn't execute on every render
  React.useEffect(() => {
    // Check NODE_ENV first to avoid unnecessary evaluations in production
    if (process.env.NODE_ENV !== 'production') {
      if (isTherapistRole && !canEdit) {
        console.warn('[TreatmentRow] Therapist cannot edit this treatment:', {
          treatmentId: ID,
          therapistId,
          normalizedTherapistId,
          currentUserId,
          normalizedCurrentUserId,
          reason: getEditDenialReason(),
        })
      }
    }
  }, [
    isTherapistRole,
    canEdit,
    ID,
    therapistId,
    normalizedTherapistId,
    currentUserId,
    normalizedCurrentUserId,
    getEditDenialReason,
  ])

  const handleOpen = () => setOpen(!open)

  const handleDeleteTreatment = useDeleteResource({
    resourceType: 'treatment',
    resourceId: Number(ID),
    resourceName: 'Data Penanganan',
  })

  const handleUpdateTreatment = () => {
    const treatment_date_new_input =
      document.querySelector<HTMLInputElement>('#treatment_date')?.value ||
      treatmentDate
    const patient_code_new_input =
      document.querySelector<HTMLTextAreaElement>('#patient_code')?.value ||
      patientCode
    const patient_name_new_input =
      document.querySelector<HTMLTextAreaElement>('#patient_name')?.value ||
      patientName
    const therapist_id_new_input = therapistIDState || therapistId
    const issues_new_input =
      document.querySelector<HTMLTextAreaElement>('#issues')?.value || issues
    const treatment_new_input =
      document.querySelector<HTMLTextAreaElement>('#treatment')?.value ||
      treatment
    const remarks_new_input =
      document.querySelector<HTMLTextAreaElement>('#remarks')?.value || remarks
    const next_visit_new_input =
      document.querySelector<HTMLTextAreaElement>('#next_visit')?.value ||
      nextVisit
    fetch(`${getApiHost()}/treatment/${ID}`, {
      method: 'PATCH',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
        'session-token': getSessionToken(),
      },
      body: JSON.stringify({
        treatment_date: treatment_date_new_input,
        patient_code: patient_code_new_input,
        patient_name: patient_name_new_input,
        therapist_id: Number(therapist_id_new_input), // Convert to uint
        issues: issues_new_input,
        treatment: treatment_new_input,
        remarks: remarks_new_input,
        next_visit: next_visit_new_input,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update patient information')
        }
        return response.json()
      })
      .then((data) => {
        console.log('Patient information updated successfully:', data)
      })
      .catch((error) => {
        console.error('Error updating patient information:', error)
      })
    Swal.fire({
      text: 'Data penanganan pasien berhasil diperbarui.',
      icon: 'success',
      confirmButtonText: 'OK',
    }).then(() => {
      // Reload the page after user clicks "OK"
      if (typeof window !== 'undefined') window.location.reload()
    })

    setOpen(!open)
  }

  return (
    <>
      <Dialog
        size={'xl'}
        handler={handleOpen}
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        open={open}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        <DialogHeader
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          {isTherapistRole
            ? 'Lengkapi Data Penanganan Pasien'
            : 'Ubah Data Penanganan Pasien'}
        </DialogHeader>
        <DialogBody
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <TreatmentForm
            ID={ID}
            treatment_date={treatmentDate}
            patient_code={patientCode}
            patient_name={patientName}
            therapist_name={therapistName}
            therapist_id={therapistId}
            issues={issues}
            age={age}
            treatment={treatment}
            remarks={remarks}
            next_visit={nextVisit}
            therapistIDState={therapistIDState}
            setTherapistIDState={setTherapistIDState}
          />
        </DialogBody>
        <DialogFooter
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <Button
            variant="text"
            color="red"
            onClick={() => handleOpen()}
            className="mr-1"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <span>Cancel</span>
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={() => handleUpdateTreatment()}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>

      <tr className="border-slate-200 border-b last:border-0">
        <td className="p-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <small className="font-sans text-sm text-current antialiased">
                {treatmentDate}
              </small>
            </div>
          </div>
        </td>
        <td className="p-3">
          <div className="flex flex-col">
            <small className="font-sans text-sm text-current antialiased opacity-70">
              {patientName} ({patientCode})
            </small>
          </div>
        </td>
        <td className="p-3">
          <div className="flex flex-col">
            <small className="font-sans text-sm text-current antialiased">
              {issues}
            </small>
          </div>
        </td>
        <td className="p-3">
          <div className="flex flex-col">
            <small className="font-sans text-sm text-current antialiased opacity-70">
              {treatment}
            </small>
          </div>
        </td>

        <td className="p-3">
          <div className="flex flex-col">
            <small className="font-sans text-sm text-current antialiased">
              {remarks}
            </small>
          </div>
        </td>
        <td className="p-3">
          <div className="flex flex-col">
            <small className="font-sans text-sm text-current antialiased">
              {nextVisit}
            </small>
          </div>
        </td>
        <td className="p-3">
          <div className="flex flex-col">
            <small className="font-sans text-sm text-current antialiased">
              {therapistName} ({therapistId})
            </small>
          </div>
        </td>
        <td className="p-3">
          <button
            data-open={open}
            className="text-slate-800 hover:border-slate-600/10 hover:bg-slate-200/10 group inline-grid min-h-[38px] min-w-[38px] select-none place-items-center rounded-md border border-transparent bg-transparent text-center align-middle font-sans text-sm font-medium shadow-none outline-none transition-all duration-300 ease-in hover:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none data-[shape=circular]:rounded-full"
            data-shape="default"
            onClick={() => handleOpen()}
            disabled={!canEdit}
            aria-disabled={!canEdit}
            aria-label={
              !canEdit
                ? 'Edit treatment (disabled - you can only edit treatments assigned to you)'
                : 'Edit treatment'
            }
            title={
              !canEdit
                ? 'You can only edit treatments assigned to you'
                : 'Edit treatment'
            }
          >
            <svg
              width="1.5em"
              height="1.5em"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              color="currentColor"
              className="text-slate-800 size-4 dark:text-white"
            >
              <path
                d="M14.3632 5.65156L15.8431 4.17157C16.6242 3.39052 17.8905 3.39052 18.6716 4.17157L20.0858 5.58579C20.8668 6.36683 20.8668 7.63316 20.0858 8.41421L18.6058 9.8942M14.3632 5.65156L4.74749 15.2672C4.41542 15.5993 4.21079 16.0376 4.16947 16.5054L3.92738 19.2459C3.87261 19.8659 4.39148 20.3848 5.0115 20.33L7.75191 20.0879C8.21972 20.0466 8.65806 19.8419 8.99013 19.5099L18.6058 9.8942M14.3632 5.65156L18.6058 9.8942"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </button>
          {/* Delete button is only available to admins (not therapists)
              This is intentionally different from edit permissions where therapists
              can edit their own treatments. Deletion requires admin privileges to
              prevent accidental data loss and maintain data integrity. */}
          {!isTherapistRole && (
            <button
              className="text-slate-800 hover:border-slate-600/10 hover:bg-slate-200/10 group inline-grid min-h-[38px] min-w-[38px] select-none place-items-center rounded-md border border-transparent bg-transparent text-center align-middle font-sans text-sm font-medium shadow-none outline-none transition-all duration-300 ease-in hover:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none data-[shape=circular]:rounded-full"
              data-shape="default"
              onClick={handleDeleteTreatment}
            >
              <svg
                width="1.5em"
                height="1.5em"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                color="currentColor"
                className="text-slate-800 size-4 dark:text-white"
              >
                <path
                  d="M19.5 6H16.5M19.5 6H4.5M19.5 6V19.5C19.5 20.2956 18.8284 21 18 21H6C5.17157 21 4.5 20.2956 4.5 19.5V6M9 10.5V16.5M15 10.5V16.5M9 6V4.5C9 3.67157 9.67157 3 10.5 3H13.5C14.3284 3 15 3.67157 15 4.5V6"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </button>
          )}
        </td>
      </tr>
    </>
  )
}
