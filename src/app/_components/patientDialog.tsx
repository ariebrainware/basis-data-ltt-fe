import React from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../_functions/apiFetch'
import { PatientForm } from './patientForm'
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
import { isAdmin } from '../_functions/userRole'

type PatientProps = {
  ID: number
  patient_code?: string | null
  full_name?: string
  job?: string
  age?: number | string
  phone_number?: string | string[]
  email?: string
  address?: string
  health_history?: string
  surgery_history?: string
  gender?: string
  onDataChange?: () => void
}

type PatientUpdatePayload = Omit<
  PatientProps & { ID: number },
  'ID' | 'patient_code'
> & {
  patient_code?: string
}

export default function PatientDialog({
  ID,
  patient_code: patientCode,
  full_name: name,
  job,
  age,
  phone_number: phoneNumber,
  email,
  address,
  health_history,
  surgery_history,
  gender,
  onDataChange,
}: PatientProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const [genderValue, setGenderValue] = React.useState<string>(gender || '')
  const [diseases, setDiseases] = React.useState<DiseaseType[]>([])
  const [diseasesFetched, setDiseasesFetched] = React.useState(false)

  const fetchDiseasesIfNeeded = async () => {
    if (diseasesFetched) return
    try {
      const res = await apiFetch('/disease', { method: 'GET' })
      if (res.status === 401) {
        UnauthorizedAccess(router)
        return
      }
      if (res.ok) {
        const data = await res.json()
        const list: DiseaseType[] =
          data && data.data && Array.isArray(data.data.disease)
            ? (data.data.disease as DiseaseType[])
            : Array.isArray(data)
              ? (data as DiseaseType[])
              : []
        setDiseases(list)
      }
    } catch (e) {
      // ignore
    } finally {
      setDiseasesFetched(true)
    }
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

  const handleHealthConditionInput = (input: string): string => {
    if (!input.trim() || input === '-') return '-'
    const items = input
      .split(',')
      .map((it) => it.trim())
      .filter(Boolean)
    const matchedIds = items
      .map((item) => {
        if (/^\d+$/.test(item)) return item
        const match = diseases.find((d) =>
          d.name.toLowerCase().includes(item.toLowerCase())
        )
        return match ? String(match.ID) : null
      })
      .filter(Boolean) as string[]

    if (matchedIds.length === 0) {
      return items.join(',')
    }
    return matchedIds.join(',')
  }

  const normalizePhoneInput = (
    raw?: string | string[] | undefined
  ): string[] => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw.map((p) => p.trim()).filter(Boolean)
    return raw
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
  }

  const getInputValue = (
    selector: string,
    fallback?: string | number | null
  ): string => {
    const val = document.querySelector<HTMLInputElement>(selector)?.value
    if (typeof val === 'string' && val !== '') return val
    if (fallback === undefined || fallback === null) return ''
    return String(fallback)
  }

  const getTextAreaValue = (
    selector: string,
    fallback?: string | undefined
  ): string => {
    const val = document.querySelector<HTMLTextAreaElement>(selector)?.value
    if (typeof val === 'string' && val !== '') return val
    return fallback ?? ''
  }

  const buildUpdatePayload = (): PatientUpdatePayload => {
    const full_name_new_input = getInputValue('#full_name', name)
    const rawPhoneInput = getInputValue(
      '#phone_number',
      Array.isArray(phoneNumber) ? phoneNumber.join(',') : phoneNumber
    )
    const phone_number_new_input_arr: string[] =
      normalizePhoneInput(rawPhoneInput)
    const job_new_input = getInputValue('#job', job)
    const age_new_input = getInputValue('#age', String(age))
    const email_new_input = getInputValue('#email', email)
    const address_new_input = getInputValue('#address', address)
    const health_history_new_input = getTextAreaValue(
      '#health_history',
      health_history || ''
    )
    const surgery_history_new_input = getTextAreaValue(
      '#surgery_history',
      surgery_history
    )
    const gender_new_input = genderValue || gender
    const patient_code_new_input = getInputValue('#patient_code', patientCode)

    const payload: PatientUpdatePayload = {
      full_name: full_name_new_input,
      phone_number: phone_number_new_input_arr,
      gender: gender_new_input,
      job: job_new_input,
      age: Number(age_new_input),
      email: email_new_input,
      address: address_new_input,
      health_history: handleHealthConditionInput(
        health_history_new_input || ''
      ),
      surgery_history: surgery_history_new_input,
    }

    if (isAdmin()) {
      payload.patient_code = patient_code_new_input
    }

    return payload
  }

  const handleUpdatePatientInfo = () => {
    const payload = buildUpdatePayload()
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
      .then(() => {
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

  return (
    <>
      <button
        data-open={open}
        className="text-slate-800 hover:border-slate-600/10 hover:bg-slate-200/10 group inline-grid min-h-[38px] min-w-[38px] select-none place-items-center rounded-md border border-transparent bg-transparent text-center align-middle font-sans text-sm font-medium shadow-none outline-none transition-all duration-300 ease-in hover:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none data-[shape=circular]:rounded-full"
        data-shape="default"
        onClick={() => handleOpen()}
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
            patient_code={patientCode ?? ''}
            full_name={name ?? ''}
            job={job ?? ''}
            age={typeof age === 'string' ? Number(age) : (age ?? 0)}
            phone_number={
              Array.isArray(phoneNumber)
                ? phoneNumber
                : typeof phoneNumber === 'string' && phoneNumber.trim()
                  ? phoneNumber
                      .split(',')
                      .map((p) => p.trim())
                      .filter(Boolean)
                  : []
            }
            email={email ?? ''}
            address={address ?? ''}
            health_history={health_history ?? ''}
            surgery_history={surgery_history ?? ''}
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
    </>
  )
}
