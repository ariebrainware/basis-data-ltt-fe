import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../_functions/apiFetch'
import { PatientForm } from './patientForm'
import { PatientType } from '../_types/patient'
import { DiseaseType } from '../_types/disease'
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@material-tailwind/react'
import Swal from 'sweetalert2'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import { useDeleteResource } from '../_hooks/useDeleteResource'
import PatientDialog from './patientDialog'
import {
  buildPatientUpdatePayload,
  fetchDiseaseList,
  PatientUpdatePayload,
} from '../_functions/patientRowHelpers'

export default function Patient({
  ID,
  full_name: name,
  phone_number: phoneNumber,
  job,
  age,
  email,
  gender,
  address,
  health_history,
  surgery_history,
  patient_code: patientCode,
  onDataChange,
}: PatientType) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const [genderValue, setGenderValue] = React.useState<string>(gender || '')
  const [diseases, setDiseases] = useState<DiseaseType[]>([])
  const [diseasesFetched, setDiseasesFetched] = useState(false)

  // Helper: fetch diseases once when needed
  const fetchDiseasesIfNeeded = async () => {
    if (diseasesFetched) return
    const list = await fetchDiseaseList(router)
    setDiseases(list)
    setDiseasesFetched(true)
  }

  const handleOpen = async () => {
    if (!open) {
      setGenderValue(gender || '')
      await fetchDiseasesIfNeeded()
      setOpen(true)
    } else {
      setOpen(false)
    }
  }

  const handleUpdatePatientInfo = () => {
    const payload: PatientUpdatePayload = buildPatientUpdatePayload({
      name,
      phoneNumber,
      job,
      age,
      email,
      address,
      healthHistory: health_history,
      surgeryHistory: surgery_history,
      genderValue,
      gender,
      patientCode,
      diseases,
    })
    apiFetch(`/patient/${ID}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.status === 401) {
          UnauthorizedAccess(router)
          return Promise.reject(new Error('Unauthorized'))
        }
        if (!response.ok) {
          throw new Error('Failed to update patient information')
        }
        return response.json()
      })
      .then((data) => {
        setOpen(false)
        Swal.fire({
          text: 'Data pasien berhasil diperbarui.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          if (onDataChange) onDataChange()
        })
      })
      .catch((error) => {
        if (error.message !== 'Unauthorized') {
          Swal.fire({
            text: 'Gagal memperbarui data pasien.',
            icon: 'error',
            confirmButtonText: 'OK',
          })
        }
      })
  }

  const handleDeletePatient = useDeleteResource({
    resourceType: 'patient',
    resourceId: ID,
    resourceName: 'Data Pasien',
  })
  const getGenderLabel = (gVal?: string) => {
    const g = (gVal || '').toString().trim().toLowerCase()
    if (g === 'female' || g === 'perempuan') return 'Perempuan'
    if (g === 'male' || g === 'laki-laki' || g === 'laki laki')
      return 'Laki-laki'
    return gVal ? String(g.charAt(0).toUpperCase() + g.slice(1)) : ''
  }

  const genderLabel = getGenderLabel(gender)
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
          Ubah Data Pasien
        </DialogHeader>
        <DialogBody
          className="px-2 md:px-6"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <PatientForm
            ID={ID}
            patient_code={patientCode}
            full_name={name}
            job={job}
            age={age}
            phone_number={phoneNumber}
            email={email}
            address={address}
            health_history={health_history}
            surgery_history={surgery_history}
            gender={genderValue}
            last_visit={''}
            onGenderChange={setGenderValue}
            diseases={diseases}
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
            onClick={() => handleUpdatePatientInfo()}
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
                {name}
              </small>
              <small className="font-sans text-sm text-current antialiased opacity-70">
                {Array.isArray(phoneNumber)
                  ? phoneNumber.join(', ')
                  : phoneNumber}
              </small>
            </div>
          </div>
        </td>
        <td className="p-3">
          <div className="flex flex-col">
            <small className="font-sans text-sm text-current antialiased">
              {job}
            </small>
            <small className="font-sans text-sm text-current antialiased opacity-70">
              {age}
            </small>
          </div>
        </td>
        <td className="p-3">
          <div className="w-max">
            <span className="font-sans text-sm text-current antialiased">
              {genderLabel}
            </span>
          </div>
        </td>
        <td className="p-3">
          <small className="font-sans text-sm text-current antialiased">
            {patientCode}
          </small>
        </td>
        <td className="p-3">
          <PatientDialog
            ID={ID}
            patient_code={patientCode}
            full_name={name}
            job={job}
            age={age}
            phone_number={phoneNumber}
            email={email}
            address={address}
            health_history={health_history}
            surgery_history={surgery_history}
            gender={gender}
            onDataChange={onDataChange}
          />
          <button
            className="text-slate-800 hover:border-slate-600/10 hover:bg-slate-200/10 group inline-grid min-h-[38px] min-w-[38px] select-none place-items-center rounded-md border border-transparent bg-transparent text-center align-middle font-sans text-sm font-medium shadow-none outline-none transition-all duration-300 ease-in hover:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none data-[shape=circular]:rounded-full"
            data-shape="default"
            onClick={() => handleDeletePatient()}
            aria-label="Delete patient"
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
        </td>
      </tr>
    </>
  )
}
