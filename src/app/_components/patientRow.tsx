import React, { useState } from 'react'
import { PatientType } from '../_types/patient'
import { useDeleteResource } from '../_hooks/useDeleteResource'
import PatientDialog from './patientDialog'
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'

export default function Patient({
  ID,
  full_name: name,
  phone_number: phoneNumber,
  job,
  age,
  date_of_birth,
  email,
  gender,
  address,
  health_history,
  surgery_history,
  patient_code: patientCode,
  signature,
  signature_path,
  attachment_path,
  onDataChange,
}: PatientType) {
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogTab, setDialogTab] = useState<'form' | 'history'>('history')

  const handleDeletePatient = useDeleteResource({
    resourceType: 'patient',
    resourceId: ID,
    resourceName: 'Data Pasien',
    onSuccess: onDataChange,
  })

  const getGenderLabel = (gVal?: string) => {
    const g = (gVal || '').toString().trim().toLowerCase()
    if (g === 'female' || g === 'perempuan') return 'Perempuan'
    if (g === 'male' || g === 'laki-laki' || g === 'laki laki')
      return 'Laki-laki'
    return gVal ? String(g.charAt(0).toUpperCase() + g.slice(1)) : ''
  }

  const genderLabel = getGenderLabel(gender)

  const handleRowClick = () => {
    setDialogTab('history')
    setOpenDialog(true)
  }

  const handleOpenEdit = () => {
    setDialogTab('form')
    setOpenDialog(true)
  }

  const handleOpenHistory = () => {
    setDialogTab('history')
    setOpenDialog(true)
  }

  return (
    <>
      <PatientDialog
        ID={ID}
        patient_code={patientCode}
        full_name={name}
        job={job}
        age={age}
        date_of_birth={date_of_birth}
        phone_number={phoneNumber}
        email={email}
        address={address}
        health_history={health_history}
        surgery_history={surgery_history}
        gender={gender}
        signature={signature}
        signature_path={signature_path}
        attachment_path={attachment_path}
        onDataChange={onDataChange}
        isOpen={openDialog}
        onOpenChange={setOpenDialog}
        initialTab={dialogTab}
        hideTriggerButton={true}
      />

      <tr
        className="border-slate-200 cursor-pointer border-b transition-colors last:border-0 hover:bg-blue-gray-50/50"
        onClick={handleRowClick}
      >
        <td className="p-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <small className="font-sans text-sm font-medium text-current antialiased">
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
        <td className="p-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            {/* View Treatment Records button */}
            <button
              type="button"
              className="text-slate-800 hover:border-slate-600/10 hover:bg-slate-200/10 group inline-grid min-h-[38px] min-w-[38px] select-none place-items-center rounded-md border border-transparent bg-transparent text-center align-middle font-sans text-sm font-medium shadow-none outline-none transition-all duration-300 ease-in hover:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none data-[shape=circular]:rounded-full"
              data-shape="default"
              onClick={handleOpenHistory}
              aria-label="Lihat Riwayat Penanganan"
              title="Lihat Riwayat Penanganan"
            >
              <ClipboardDocumentListIcon className="size-4 text-indigo-600 dark:text-indigo-400" />
            </button>

            {/* Edit Patient button (data-open kept for test selector compatibility) */}
            <button
              data-open={openDialog}
              className="text-slate-800 hover:border-slate-600/10 hover:bg-slate-200/10 group inline-grid min-h-[38px] min-w-[38px] select-none place-items-center rounded-md border border-transparent bg-transparent text-center align-middle font-sans text-sm font-medium shadow-none outline-none transition-all duration-300 ease-in hover:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none data-[shape=circular]:rounded-full"
              data-shape="default"
              onClick={handleOpenEdit}
              aria-label="Edit patient"
              title="Ubah Data Pasien"
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

            {/* Delete patient button */}
            <button
              className="text-slate-800 hover:border-slate-600/10 hover:bg-slate-200/10 group inline-grid min-h-[38px] min-w-[38px] select-none place-items-center rounded-md border border-transparent bg-transparent text-center align-middle font-sans text-sm font-medium shadow-none outline-none transition-all duration-300 ease-in hover:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none data-[shape=circular]:rounded-full"
              data-shape="default"
              onClick={handleDeletePatient}
              aria-label="Delete patient"
              title="Hapus Pasien"
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
          </div>
        </td>
      </tr>
    </>
  )
}
