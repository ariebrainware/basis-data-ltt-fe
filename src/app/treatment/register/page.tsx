'use client'
import React, { useEffect, useState } from 'react'
import { Button, Checkbox } from '@material-tailwind/react'

import DatePicker from '../../_components/datePicker'
import styles from '../../page.module.css'
import Footer from '../../_components/footer'
import { ControlledSelect } from '../../_components/selectTherapist'

import { TreatmentConditionOptions } from '@/app/_types/treatmentConditionOptions'
import TimePicker from '@/app/_components/timepicker'
import { getApiHost } from '@/app/_functions/apiHost'
import { getSessionToken } from '@/app/_functions/sessionToken'
import Swal from 'sweetalert2'

let treatmentDateInput: HTMLInputElement | null = null
let treatmentTimeInput: HTMLInputElement | null = null
let patientCodeInput: HTMLInputElement | null = null
let treatmentHistoryInput: string[] | string = []
let issuesInput: HTMLInputElement | null = null
let remarksInput: HTMLInputElement | null = null
let nextVisitInput: HTMLInputElement | null = null

function MultipleCheckboxes() {
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  useEffect(() => {
    treatmentHistoryInput = checkedItems
  }, [checkedItems])
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target
    setCheckedItems((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    )
  }

  useEffect(() => {
    const treatmentHistoryInputElement = document.getElementById(
      'treatmentHistory'
    ) as HTMLInputElement | null
    if (treatmentHistoryInputElement) {
      treatmentHistoryInputElement.value = checkedItems.join(',')
    }
  }, [checkedItems])
  return (
    <div className="flex flex-col">
      {TreatmentConditionOptions.map((option) => (
        <div key={option.id} className="mb-2 flex items-center">
          <Checkbox
            id={option.id}
            name={option.id}
            checked={checkedItems.includes(option.id)}
            onChange={handleChange}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            crossOrigin={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          />
          <label
            htmlFor={option.id}
            className="text-slate-800 ml-2 font-sans text-sm font-semibold antialiased dark:text-white"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  )
}

export default function RegisterTreatment() {
  const [therapistID, setTherapistID] = useState<string>('')

  async function sendRegisterTreatmentRequest() {
    // Validate that a therapist has been selected
    if (!therapistID) {
      await Swal.fire({
        title: 'Gagal',
        text: 'Silakan pilih terapis terlebih dahulu',
        icon: 'error',
        confirmButtonText: 'OK',
      })
      return
    }

    const treatmentDate = treatmentDateInput ? treatmentDateInput.value : ''
    const treatmentTime = treatmentTimeInput ? treatmentTimeInput.value : ''
    const patientCode = patientCodeInput ? patientCodeInput.value : ''
    const issues = issuesInput ? issuesInput.value : ''
    const remarks = remarksInput ? remarksInput.value : ''
    const nextVisit = nextVisitInput ? nextVisitInput.value : ''
    const treatmentHistory = Array.isArray(treatmentHistoryInput)
      ? treatmentHistoryInput
      : typeof treatmentHistoryInput === 'string'
        ? treatmentHistoryInput
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : []

    const response = await fetch(`${getApiHost()}/treatment`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
        'session-token': getSessionToken(),
      },
      body: JSON.stringify({
        treatment_date: `${treatmentDate} ${treatmentTime}`,
        patient_code: patientCode,
        therapist_id: Number(therapistID),
        issues: issues,
        treatment: treatmentHistory,
        remarks: remarks,
        next_visit: nextVisit,
      }),
    })

    if (process.env.NODE_ENV !== 'production') {
      console.log(treatmentDate)
    }
    if (!response.ok) {
      await Swal.fire({
        title: 'Gagal',
        text: 'Gagal mendaftarkan penanganan',
        icon: 'error',
        confirmButtonText: 'OK',
      })
    } else {
      await Swal.fire({
        title: 'Sukses',
        text: 'Penanganan berhasil didaftarkan',
        icon: 'success',
        confirmButtonText: 'OK',
      })

      // Clear form fields after successful registration
      if (treatmentDateInput) treatmentDateInput.value = ''
      if (treatmentTimeInput) treatmentTimeInput.value = ''
      if (patientCodeInput) patientCodeInput.value = ''
      setTherapistID('')
      if (issuesInput) issuesInput.value = ''
      if (treatmentHistoryInput) treatmentHistoryInput = []
      if (remarksInput) remarksInput.value = ''
      if (nextVisitInput) nextVisitInput.value = ''
    }
  }

  useEffect(() => {
    treatmentDateInput = document.getElementById(
      'treatmentDate'
    ) as HTMLInputElement
    patientCodeInput = document.getElementById(
      'patientCode'
    ) as HTMLInputElement
    treatmentTimeInput = document.getElementById(
      'treatmentTime'
    ) as HTMLInputElement | null
    if (treatmentDateInput && treatmentTimeInput) {
      treatmentDateInput.value = `${treatmentDateInput.value}T${treatmentTimeInput.value}:00`
    }
    issuesInput = document.getElementById('issues') as HTMLInputElement
    remarksInput = document.getElementById('remarks') as HTMLInputElement
    nextVisitInput = document.getElementById('nextVisit') as HTMLInputElement
  }, [])

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className="text-3xl font-bold antialiased">Form Penanganan</h1>
        <form>
          <div className="w-72 space-y-1">
            <label
              htmlFor="treatmentDate"
              className="text-slate-800 font-sans text-sm font-semibold antialiased dark:text-white"
            >
              Waktu & Tanggal
            </label>
            <DatePicker id="treatmentDate" />
            <TimePicker id="treatmentTime" />
          </div>
          <div className="w-72 space-y-1">
            <label
              htmlFor="patientCode"
              className="text-slate-800 font-sans text-sm font-semibold antialiased dark:text-white"
            >
              Kode Pasien
            </label>
            <div className="relative w-full">
              <input
                id="patientCode"
                placeholder="A111"
                type="text"
                className="border-slate-200 text-slate-800 placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:ring-slate-800/10 peer w-full rounded-md border bg-transparent px-2.5 py-2 text-sm shadow-sm outline-none ring ring-transparent transition-all duration-300 ease-in focus:outline-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-9 data-[icon-placement=start]:ps-9 dark:text-white"
                data-error="false"
                data-success="false"
                data-icon-placement=""
              />
            </div>
          </div>

          <div className="w-72 space-y-1">
            <label
              htmlFor="issues"
              className="text-slate-800 font-sans text-sm font-semibold antialiased dark:text-white"
            >
              Keluhan
            </label>
            <div className="relative w-full">
              <textarea
                id="issues"
                placeholder="Saat melipat lutut terasa nyeri"
                className="border-slate-200 text-slate-800 placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:ring-slate-800/10 peer w-full rounded-md border bg-transparent px-2.5 py-2 text-sm shadow-sm outline-none ring ring-transparent transition-all duration-300 ease-in focus:outline-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-9 data-[icon-placement=start]:ps-9 dark:text-white"
                data-error="false"
                data-success="false"
                data-icon-placement=""
              />
            </div>
          </div>

          <div className="w-72 space-y-1">
            <label
              htmlFor="issues"
              className="text-slate-800 font-sans text-sm font-semibold antialiased dark:text-white"
            >
              Penanganan
            </label>
            <div className="relative w-full">{MultipleCheckboxes()}</div>
            <div className="w-72 space-y-1">
              <label
                htmlFor="issues"
                className="text-slate-800 font-sans text-sm font-semibold antialiased dark:text-white"
              >
                Remarks
              </label>
              <div className="relative w-full">
                <textarea
                  id="remarks"
                  placeholder="Lutut 80% membaik. Saran: HS 3x2"
                  className="border-slate-200 text-slate-800 placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:ring-slate-800/10 peer w-full rounded-md border bg-transparent px-2.5 py-2 text-sm shadow-sm outline-none ring ring-transparent transition-all duration-300 ease-in focus:outline-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-9 data-[icon-placement=start]:ps-9 dark:text-white"
                  data-error="false"
                  data-success="false"
                  data-icon-placement=""
                />
              </div>
            </div>
            <div className="w-72 space-y-1">
              <label
                htmlFor="nextVisit"
                className="text-slate-800 font-sans text-sm font-semibold antialiased dark:text-white"
              >
                Kunjungan Selanjutnya
              </label>
              <div className="relative w-full">
                <input
                  id="nextVisit"
                  placeholder="7-14 hari"
                  type="text"
                  className="border-slate-200 text-slate-800 placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:ring-slate-800/10 peer w-full rounded-md border bg-transparent px-2.5 py-2 text-sm shadow-sm outline-none ring ring-transparent transition-all duration-300 ease-in focus:outline-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-9 data-[icon-placement=start]:ps-9 dark:text-white"
                  data-error="false"
                  data-success="false"
                  data-icon-placement=""
                />
              </div>
            </div>
          </div>

          <div className="mt-4 w-72 space-y-1">
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

          <div className={styles.ctas}>
            <Button
              id="registerTreatmentButton"
              className="mt-4 rounded-full"
              onClick={() => {
                if (process.env.NODE_ENV !== 'production') {
                  console.log('Current therapistID:', therapistID)
                }
                sendRegisterTreatmentRequest()
              }}
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              DAFTAR
            </Button>
          </div>
        </form>

        <Footer />
      </main>
    </div>
  )
}
