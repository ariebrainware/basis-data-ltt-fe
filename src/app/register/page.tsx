'use client'
import styles from '../page.module.css'
import { useEffect, useState } from 'react'
import Footer from '../_components/footer'
import { Checkbox, Radio } from '@material-tailwind/react'
import { HealthConditionOptions } from '../_types/healthcondition'
import { useRef } from 'react'

let fullnameInput: HTMLInputElement | null = null
let ageInput: HTMLInputElement | null = null
let jobInput: HTMLInputElement | null = null
let addressInput: HTMLInputElement | null = null
let phoneNumber: string[] = []
let healthHistory: string[] = []
let surgeryHistory: HTMLInputElement | null = null

if (typeof window !== 'undefined') {
  const updatePhoneNumbers = () => {
    phoneNumber = []
    const mainPhone = document.getElementById(
      'phoneNumber'
    ) as HTMLInputElement | null
    if (mainPhone && mainPhone.value.trim()) {
      phoneNumber.push(mainPhone.value.trim())
    }
    const optional1 = document.getElementById(
      'phoneNumberOptional-1'
    ) as HTMLInputElement | null
    if (optional1 && optional1.value.trim()) {
      phoneNumber.push(optional1.value.trim())
    }
    const optional2 = document.getElementById(
      'phoneNumberOptional-2'
    ) as HTMLInputElement | null
    if (optional2 && optional2.value.trim()) {
      phoneNumber.push(optional2.value.trim())
    }
  }
  window.addEventListener('input', updatePhoneNumbers)
}

function MultipleCheckboxes() {
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  useEffect(() => {
    healthHistory = checkedItems
  }, [checkedItems])
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target
    setCheckedItems((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    )
  }

  useEffect(() => {
    const healthHistoryInputElement = document.getElementById(
      'healthHistory'
    ) as HTMLInputElement | null
    if (healthHistoryInputElement) {
      healthHistoryInputElement.value = checkedItems.join(', ')
    }
  }, [checkedItems])
  return (
    <div className="flex flex-col space-y-4">
      <p className="text-base font-normal antialiased">Riwayat Penyakit</p>
      {HealthConditionOptions.map((option) => (
        <div key={option.id} className="inline-flex items-center gap-2">
          <label
            className="relative flex cursor-pointer items-center"
            htmlFor={option.id}
          >
            <Checkbox
              id={option.id}
              name={option.id}
              checked={checkedItems.includes(option.id)}
              onChange={handleChange}
              crossOrigin={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
              <svg
                fill="none"
                width="18px"
                height="18px"
                strokeWidth="2"
                color="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 13L9 17L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </span>
          </label>
          <label
            htmlFor={option.id}
            className="text-slate-600 ml-2 cursor-pointer font-normal antialiased"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  )
}
async function sendRegisterRequest(
  patientCodeRef?: React.RefObject<HTMLInputElement | null>
) {
  const genderInput =
    (document.querySelector('input[name="gender"]:checked') as HTMLInputElement)
      ?.value || ''
  const full_name = fullnameInput ? fullnameInput.value : ''
  const age = ageInput ? ageInput.value : ''
  const job = jobInput ? jobInput.value : ''
  const address = addressInput ? addressInput.value : ''
  const surgery_history = surgeryHistory ? surgeryHistory.value : ''
  // Always try to get the value from the patientCode input field if it exists in the DOM
  let patient_code = ''
  if (patientCodeRef && patientCodeRef.current) {
    patient_code = patientCodeRef.current.value
  } else {
    const patientCodeInputEl = document.getElementById(
      'patientCode'
    ) as HTMLInputElement | null
    if (patientCodeInputEl) {
      patient_code = patientCodeInputEl.value
    }
  }
  const host = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:19091'
  console.log(`patient_code_ref_value:: `, patient_code)
  console.log(`full_name`, full_name)
  const data = await fetch(`${host}/patient`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
    },
    body: JSON.stringify({
      full_name,
      gender: genderInput,
      age: parseInt(age, 10),
      job,
      address,
      health_history: healthHistory,
      surgery_history,
      phone_number: phoneNumber,
      patient_code,
    }),
  })
  const responseData = await data.json()
  console.log(`responseData`, responseData)

  // Import SweetAlert2 once for both success and error cases
  const Swal = (await import('sweetalert2')).default

  if (data.ok) {
    await Swal.fire({
      title: 'Sukses',
      text: 'Registrasi berhasil',
      icon: 'success',
      confirmButtonText: 'OK',
    })
    window.location.href = '/login'
  } else {
    const errorMessage =
      (responseData &&
        typeof responseData === 'object' &&
        typeof (responseData as any).message === 'string' &&
        (responseData as any).message.trim() !== '')
        ? (responseData as any).message
        : (responseData &&
           typeof responseData === 'object' &&
           typeof (responseData as any).error === 'string' &&
           (responseData as any).error.trim() !== '')
        ? (responseData as any).error
        : 'Registrasi gagal'
    await Swal.fire({
      title: 'Gagal',
      text: errorMessage,
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
  return responseData
}

function renderInput(id: string, type: string, placeHolder: string) {
  if (id === 'phoneNumber') {
    if (typeof window !== 'undefined') {
      const phoneInput = document.getElementById(
        'phoneNumber'
      ) as HTMLInputElement | null
      phoneInput?.addEventListener('input', () => {
        phoneInput.value = phoneInput.value.replace(/[^+\d-]/g, '')
      })
    }
  }
  return (
    <div className="relative w-full">
      <input
        required
        type={type}
        id={id}
        name={id}
        className="border-slate-200 text-slate-800 placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:ring-slate-800/10 peer w-full rounded-lg border bg-transparent p-3 text-base shadow-sm outline-none ring-4 ring-transparent transition-all duration-300 ease-in focus:outline-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[shape=pill]:rounded-full data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-11 data-[icon-placement=start]:ps-11 dark:text-white"
        data-error="false"
        data-success="false"
        data-icon-placement=""
        placeholder={placeHolder}
      />
      {id === 'phoneNumber' && (
        <div id="phoneNumberContainer">
          <div id="optional-inputs"></div>
          <button
            type="button"
            onClick={(e) => {
              // Update click count stored in the button's dataset
              const btn = e.currentTarget as HTMLButtonElement
              let count = parseInt(
                btn.getAttribute('data-click-count') || '0',
                10
              )
              count++
              btn.setAttribute('data-click-count', count.toString())
              if (count === 2) {
                btn.style.display = 'none'
              }
              // Get the container that holds the optional inputs and the button
              const container =
                document.getElementById('optional-inputs')?.parentElement
              if (container) {
                // Create a new input element with the same attributes as the phone number input
                const newInput = document.createElement('input')
                newInput.required = true
                newInput.type = 'text'
                const existingOptionalInputs = container.querySelectorAll(
                  'input[id^="phoneNumberOptional"]'
                ).length
                newInput.id = `phoneNumberOptional-${existingOptionalInputs + 1}`
                newInput.name = `phoneNumberOptional-${existingOptionalInputs + 1}`
                newInput.placeholder = 'Nomor Telepon (Opsional)'
                newInput.className =
                  'peer w-full rounded-lg border border-slate-200 bg-transparent p-3 my-2 text-base text-slate-800 shadow-sm outline-none ring-4 ring-transparent transition-all duration-300 ease-in placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:outline-none focus:ring-slate-800/10 disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[shape=pill]:rounded-full data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement:end]:pe-11 data-[icon-placement:start]:ps-11 dark:text-white'
                // Always insert the new input right after the optional-inputs div so it stays below it
                const optionalInputsDiv =
                  document.getElementById('optional-inputs')
                if (optionalInputsDiv) {
                  container.insertBefore(
                    newInput,
                    optionalInputsDiv.nextSibling
                  )
                }
              }
            }}
            className="mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Tambah Nomor Telepon
          </button>
        </div>
      )}
    </div>
  )
}
export default function Register() {
  const [showPatientCode, setShowPatientCode] = useState(false)
  const patientCodeRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    fullnameInput = document.getElementById('fullName') as HTMLInputElement
    ageInput = document.getElementById('age') as HTMLInputElement
    jobInput = document.getElementById('job') as HTMLInputElement
    addressInput = document.getElementById('address') as HTMLInputElement
    surgeryHistory = document.getElementById(
      'surgeryHistory'
    ) as HTMLInputElement
    // patientCodeInput is now handled by ref
  }, [])

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className="text-3xl font-bold antialiased">
          Form Registrasi Pasien
        </h1>
        {renderInput('fullName', 'text', 'Nama Lengkap')}
        <div
          className="flex gap-2 data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=horizontal]:items-center"
          data-value=""
          data-orientation="vertical"
        >
          <div className="flex items-center gap-2">
            <Radio
              id="gender_male"
              name="gender"
              value="male"
              crossOrigin={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <span className="pointer-events-none absolute left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4 scale-75 text-current opacity-0 transition-all duration-200 ease-in group-data-[checked=true]:scale-100 group-data-[checked=true]:opacity-100">
              <svg
                width="10px"
                height="10px"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M11 0.25C5.06294 0.25 0.25 5.06294 0.25 11C0.25 16.9371 5.06294 21.75 11 21.75C16.9371 21.75 21.75 16.9371 21.75 11C21.75 5.06294 16.9371 0.25 11 0.25Z"
                  fill="currentColor"
                ></path>
              </svg>
            </span>

            <label
              htmlFor="gender_male"
              className="text-slate-600 font-sans text-base antialiased"
            >
              Pria
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Radio
              id="gender_female"
              name="gender"
              value="female"
              crossOrigin={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <span className="pointer-events-none absolute left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4 scale-75 text-current opacity-0 transition-all duration-200 ease-in group-data-[checked=true]:scale-100 group-data-[checked=true]:opacity-100">
              <svg
                width="10px"
                height="10px"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M11 0.25C5.06294 0.25 0.25 5.06294 0.25 11C0.25 16.9371 5.06294 21.75 11 21.75C16.9371 21.75 21.75 16.9371 21.75 11C21.75 5.06294 16.9371 0.25 11 0.25Z"
                  fill="currentColor"
                ></path>
              </svg>
            </span>
            <label
              htmlFor="gender_female"
              className="text-slate-600 font-sans text-base antialiased"
            >
              Wanita
            </label>
          </div>
        </div>
        {renderInput('age', 'number', 'Umur')}
        {renderInput('job', 'text', 'Pekerjaan')}
        <div>
          <textarea
            rows={8}
            id="address"
            name="address"
            placeholder="Alamat"
            className="border-slate-200 text-slate-800 placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:ring-slate-800/10 peer block w-full resize-none rounded-lg border bg-transparent p-3.5 text-base leading-none outline-none ring-4 ring-transparent transition-all duration-300 ease-in focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white"
          ></textarea>
        </div>
        {MultipleCheckboxes()}
        <div>
          <textarea
            rows={8}
            id="surgeryHistory"
            name="surgeryHistory"
            placeholder="Riwayat Operasi / Penyakit Tambahan (Jika ada)"
            className="border-slate-200 text-slate-800 placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:ring-slate-800/10 peer block w-full resize-none rounded-lg border bg-transparent p-3.5 text-base leading-none outline-none ring-4 ring-transparent transition-all duration-300 ease-in focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white"
          ></textarea>
        </div>
        {renderInput('phoneNumber', 'phoneNumber', 'Nomor Telepon')}
        <div>
          <Checkbox
            label="Data Pasien Lama (Opsional)"
            id="legacyPatientCodeCheckbox"
            crossOrigin={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            checked={showPatientCode}
            onChange={() => setShowPatientCode((prev) => !prev)}
            onResize={undefined}
            onResizeCapture={undefined}
          />
          {showPatientCode && (
            <div className="relative w-full">
              <input
                required
                type="text"
                id="patientCode"
                name="patientCode"
                className="border-slate-200 text-slate-800 placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:ring-slate-800/10 peer w-full rounded-lg border bg-transparent p-3 text-base shadow-sm outline-none ring-4 ring-transparent transition-all duration-300 ease-in focus:outline-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[shape=pill]:rounded-full data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-11 data-[icon-placement=start]:ps-11 dark:text-white"
                data-error="false"
                data-success="false"
                data-icon-placement=""
                placeholder="Kode Pasien"
                ref={patientCodeRef}
              />
            </div>
          )}
        </div>
        <div className={styles.ctas}>
          <a
            className="bg-slate-200 cursor-not-allowed"
            id="registerBtn"
            href="/login"
            onClick={(e) => {
              e.preventDefault()
              const termCheckbox = document.getElementById(
                'termConditionCheckbox'
              ) as HTMLInputElement | null
              if (!termCheckbox?.checked) return
              sendRegisterRequest(patientCodeRef)
            }}
          >
            DAFTAR
          </a>
        </div>

        <div className="flex items-center gap-2">
          <label
            className="relative flex cursor-pointer items-center"
            htmlFor="termConditionCheckbox"
          >
            <Checkbox
              id="termConditionCheckbox"
              onClick={() => {
                if (
                  (
                    document.getElementById(
                      'termConditionCheckbox'
                    ) as HTMLInputElement
                  ).checked
                ) {
                  document.getElementById('registerBtn')!.className =
                    styles.primary
                } else {
                  document.getElementById('registerBtn')!.className =
                    'bg-slate-200 cursor-default'
                }
              }}
              crossOrigin={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
              <svg
                fill="none"
                width="18px"
                height="18px"
                strokeWidth="2"
                color="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 13L9 17L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </span>
          </label>
          <label
            className="text-slate-600 cursor-pointer antialiased"
            htmlFor="termConditionCheckbox"
          >
            Saya setuju dengan{' '}
            <a
              href="/termcondition"
              target="_blank"
              rel="noreferrer"
              className="text-slate-800 underline"
            >
              syarat dan ketentuan
            </a>
          </label>
        </div>
      </main>
      <Footer />
    </div>
  )
}
