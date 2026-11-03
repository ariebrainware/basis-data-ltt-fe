'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@material-tailwind/react'
import { useRouter } from 'next/navigation'
import { getUserRole } from '../../_functions/userRole'
import { format } from 'date-fns'
import type { DateValueType } from 'react-tailwindcss-datepicker'

import DatePicker from '../../_components/datePicker'
import styles from '../../page.module.css'
import Footer from '../../_components/footer'
import { ControlledSelect } from '../../_components/selectTherapist'
import { TreatmentConditionMultiSelect } from '@/app/_components/selectTreatmentCondition'
import TimePicker from '@/app/_components/timepicker'
import { apiFetch } from '@/app/_functions/apiFetch'
import Swal from 'sweetalert2'

let treatmentDateInput: HTMLInputElement | null = null
let treatmentTimeInput: HTMLInputElement | null = null
let patientCodeInput: HTMLInputElement | null = null
let treatmentHistoryInput: string[] | string = []
let issuesInput: HTMLInputElement | null = null
let remarksInput: HTMLInputElement | null = null
let nextVisitInput: HTMLInputElement | null = null

function parseDateQueryParam(rawDate: string | null): Date | null {
  if (!rawDate || !/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return null
  }

  const [year, month, day] = rawDate.split('-').map(Number)
  const parsedDate = new Date(year, month - 1, day)

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null
  }

  return parsedDate
}

export default function RegisterTreatment() {
  const router = useRouter()

  useEffect(() => {
    const role = getUserRole()
    if (role !== 'super_admin') {
      router.replace('/dashboard')
    }
  }, [router])

  const [therapistID, setTherapistID] = useState<string>('')
  const [treatmentDateValue, setTreatmentDateValue] =
    useState<DateValueType | null>(null)
  const [selectedTreatmentConditions, setSelectedTreatmentConditions] =
    useState<string[]>([])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const parsedDate = parseDateQueryParam(params.get('date'))
    if (parsedDate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTreatmentDateValue({ startDate: parsedDate, endDate: parsedDate })
    }
  }, [])

  // Keep the module-scoped `treatmentHistoryInput` in sync for legacy code paths
  React.useEffect(() => {
    treatmentHistoryInput = selectedTreatmentConditions
  }, [selectedTreatmentConditions])

  const showSwal = async (
    title: string,
    text: string,
    icon: 'error' | 'success'
  ) => Swal.fire({ title, text, icon, confirmButtonText: 'OK' })

  const ensureTherapistId = async (): Promise<number | null> => {
    if (!therapistID) {
      await showSwal('Gagal', 'Silakan pilih terapis terlebih dahulu', 'error')
      return null
    }

    const therapistIdNumber = Number(therapistID)
    if (isNaN(therapistIdNumber) || therapistIdNumber <= 0) {
      await showSwal('Gagal', 'ID terapis tidak valid', 'error')
      return null
    }

    return therapistIdNumber
  }

  const getFormValues = () => {
    let treatmentDate = treatmentDateInput ? treatmentDateInput.value : ''
    if (!treatmentDate && treatmentDateValue?.startDate) {
      treatmentDate =
        typeof treatmentDateValue.startDate === 'string'
          ? treatmentDateValue.startDate
          : format(treatmentDateValue.startDate, 'yyyy-MM-dd')
    }
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

    return {
      treatmentDate,
      treatmentTime,
      patientCode,
      issues,
      remarks,
      nextVisit,
      treatmentHistory,
    }
  }

  const clearFormFields = () => {
    if (treatmentDateInput) treatmentDateInput.value = ''
    setTreatmentDateValue(null)
    if (treatmentTimeInput) treatmentTimeInput.value = ''
    if (patientCodeInput) patientCodeInput.value = ''
    setTherapistID('')
    if (issuesInput) issuesInput.value = ''
    setSelectedTreatmentConditions([])
    if (remarksInput) remarksInput.value = ''
    if (nextVisitInput) nextVisitInput.value = ''
  }

  const handleApiResponse = async (response: Response) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(getFormValues().treatmentDate)
    }

    if (!response.ok) {
      let errorMessage = 'Gagal mendaftarkan penanganan'

      try {
        const data = await response.json()
        if (data && typeof data === 'object') {
          const apiMessage =
            (data as { message?: string }).message ||
            (data as { error?: string }).error ||
            (data as { detail?: string }).detail

          if (apiMessage && typeof apiMessage === 'string') {
            errorMessage = `Gagal mendaftarkan penanganan: ${apiMessage}`
          }
        }
      } catch {
        // ignore
      }

      await showSwal('Gagal', errorMessage, 'error')
      return false
    }

    await showSwal('Sukses', 'Penanganan berhasil didaftarkan', 'success')
    clearFormFields()
    return true
  }

  async function sendRegisterTreatmentRequest() {
    const therapistIdNumber = await ensureTherapistId()
    if (!therapistIdNumber) return

    const {
      treatmentDate,
      treatmentTime,
      patientCode,
      issues,
      remarks,
      nextVisit,
      treatmentHistory,
    } = getFormValues()

    const response = await apiFetch('/treatment', {
      method: 'POST',
      body: JSON.stringify({
        treatment_date: `${treatmentDate} ${treatmentTime}`,
        patient_code: patientCode,
        therapist_id: therapistIdNumber,
        issues: issues,
        treatment: treatmentHistory,
        remarks: remarks,
        next_visit: nextVisit,
      }),
    })

    await handleApiResponse(response)
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
    issuesInput = document.getElementById('issues') as HTMLInputElement
    remarksInput = document.getElementById('remarks') as HTMLInputElement
    nextVisitInput = document.getElementById('nextVisit') as HTMLInputElement

    if (treatmentDateInput) {
      treatmentDateInput.value = treatmentDateValue?.startDate
        ? typeof treatmentDateValue.startDate === 'string'
          ? treatmentDateValue.startDate
          : format(treatmentDateValue.startDate, 'yyyy-MM-dd')
        : ''
    }
  }, [treatmentDateValue])

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
            <DatePicker
              id="treatmentDate"
              value={treatmentDateValue}
              onChange={setTreatmentDateValue}
            />
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
            <div className="relative w-full">
              <TreatmentConditionMultiSelect
                id="treatment"
                label="Penanganan"
                value={selectedTreatmentConditions}
                onChange={(items: string[]) =>
                  setSelectedTreatmentConditions(items)
                }
              />
            </div>
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
