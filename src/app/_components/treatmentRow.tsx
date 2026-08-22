'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
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
import { apiFetch } from '../_functions/apiFetch'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import { useDeleteResource } from '../_hooks/useDeleteResource'
import { isTherapist, isAdmin, getUserRole } from '../_functions/userRole'
import { getUserId, getTherapistId } from '../_functions/userId'

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
  onDataChange,
}: TreatmentType & { onDataChange?: () => void }) {
  const [open, setOpen] = React.useState(false)
  const [therapistIDState, setTherapistIDState] = React.useState<string>(
    therapistId?.toString() ?? ''
  )
  const isTherapistRole = isTherapist()
  const currentUserId = getUserId()
  const [currentTherapistIdState, setCurrentTherapistIdState] = React.useState<
    string | null
  >(() => getTherapistId())
  const router = useRouter()
  const normalizedTherapistId =
    therapistId !== null && therapistId !== undefined
      ? String(therapistId)
      : null
  const normalizedCurrentUserId =
    currentUserId !== null && currentUserId !== undefined
      ? String(currentUserId)
      : null
  const normalizedCurrentTherapistId =
    currentTherapistIdState !== null && currentTherapistIdState !== undefined
      ? String(currentTherapistIdState)
      : null

  // Dynamically fetch and set therapist-id in localStorage and component state if missing
  React.useEffect(() => {
    const fetchTherapistIdFallback = async () => {
      if (isTherapistRole && currentUserId && !currentTherapistIdState) {
        try {
          const resp = await apiFetch(`/user/${currentUserId}`)
          if (resp.status === 401) {
            UnauthorizedAccess(router)
            return
          }
          if (!resp.ok) return

          const json = await resp.json()
          const fetchedId =
            json.data?.therapist_id || json.data?.user?.therapist_id
          if (fetchedId) {
            const strId = String(fetchedId)
            localStorage.setItem('therapist-id', strId)
            setCurrentTherapistIdState(strId)
          }
        } catch (err) {
          console.error(
            '[TreatmentRow] Failed to fetch therapist ID fallback:',
            err
          )
        }
      }
    }
    fetchTherapistIdFallback()
  }, [isTherapistRole, currentUserId, currentTherapistIdState, router])

  // Check if current user can edit this treatment
  // Admins can edit all treatments
  // Therapists can only edit treatments assigned to them
  // Normal users cannot edit treatments at all
  const isAdminRole = isAdmin()
  const canEdit =
    isAdminRole ||
    (isTherapistRole &&
      normalizedTherapistId !== null &&
      normalizedTherapistId === normalizedCurrentTherapistId)

  // Helper function to determine why edit is denied
  const getEditDenialReason = React.useCallback((): string => {
    const role = getUserRole()
    if (role === 'user') {
      return 'Normal users do not have permissions to edit treatments'
    }
    if (isTherapistRole && normalizedCurrentTherapistId === null) {
      return 'Therapist ID not found in localStorage'
    }
    if (normalizedTherapistId === null) {
      return 'Treatment has no therapist assigned'
    }
    if (
      isTherapistRole &&
      normalizedTherapistId !== normalizedCurrentTherapistId
    ) {
      return 'Treatment is assigned to a different therapist'
    }
    if (!isAdminRole && !isTherapistRole) {
      return 'Insufficient permissions'
    }
    return 'Unknown reason'
  }, [
    isAdminRole,
    isTherapistRole,
    normalizedCurrentTherapistId,
    normalizedTherapistId,
  ])

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
          currentTherapistIdState,
          normalizedCurrentTherapistId,
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
    currentTherapistIdState,
    normalizedCurrentTherapistId,
    getEditDenialReason,
  ])

  const handleOpen = () => {
    if (!open) {
      // When opening the dialog, ensure therapistIDState is synced with current therapistId
      setTherapistIDState(therapistId?.toString() ?? '')
    }
    setOpen(!open)
  }

  const handleDeleteTreatment = useDeleteResource({
    resourceType: 'treatment',
    resourceId: Number(ID),
    resourceName: 'Data Penanganan',
    onSuccess: onDataChange,
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
    apiFetch(`/treatment/${ID}`, {
      method: 'PATCH',
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
        if (response.status === 401) {
          UnauthorizedAccess(router)
          return Promise.reject(new Error('Unauthorized'))
        }
        if (!response.ok) {
          throw new Error('Failed to update treatment information')
        }
        return response.json()
      })
      .then((data) => {
        console.log('Treatment information updated successfully:', data)
        // Close modal and show success message
        setOpen(false)
        Swal.fire({
          text: 'Data penanganan pasien berhasil diperbarui.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          if (onDataChange) onDataChange()
        })
      })
      .catch((error) => {
        console.error('Error updating treatment information:', error)
        // Don't show error for unauthorized access since UnauthorizedAccess handles it
        if (error.message !== 'Unauthorized') {
          Swal.fire({
            text: 'Gagal memperbarui data penanganan.',
            icon: 'error',
            confirmButtonText: 'OK',
          })
        }
      })
  }

  return (
    <>
      <Dialog
        size={'xl'}
        className="max-h-[90vh] overflow-y-auto"
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
          {canEdit
            ? isTherapistRole
              ? 'Lengkapi Data Penanganan Pasien'
              : 'Ubah Data Penanganan Pasien'
            : 'Detail Data Penanganan Pasien'}
        </DialogHeader>
        <DialogBody
          className="px-2 md:px-6"
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
            disabled={!canEdit}
          />
        </DialogBody>
        <DialogFooter
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          {canEdit ? (
            <>
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
            </>
          ) : (
            <Button
              variant="gradient"
              color="blue"
              onClick={() => handleOpen()}
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              <span>Close</span>
            </Button>
          )}
        </DialogFooter>
      </Dialog>

      <tr
        className="border-slate-200 border-b last:border-0 hover:bg-blue-gray-50/50 cursor-pointer"
        onClick={() => handleOpen()}
      >
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
        <td className="p-3" onClick={(e) => e.stopPropagation()}>
          <button
            data-open={open}
            className="text-slate-800 hover:border-slate-600/10 hover:bg-slate-200/10 group inline-grid min-h-[38px] min-w-[38px] select-none place-items-center rounded-md border border-transparent bg-transparent text-center align-middle font-sans text-sm font-medium shadow-none outline-none transition-all duration-300 ease-in hover:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none data-[shape=circular]:rounded-full"
            data-shape="default"
            onClick={() => handleOpen()}
            aria-label={canEdit ? 'Edit treatment' : 'View treatment'}
            title={canEdit ? 'Edit treatment' : 'View treatment'}
          >
            {canEdit ? (
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
            ) : (
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
                  d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          {/* Delete button is only available to admins (not therapists or normal users)
              This is intentionally different from edit permissions where therapists
              can edit their own treatments. Deletion requires admin privileges to
              prevent accidental data loss and maintain data integrity. */}
          {isAdminRole && (
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
