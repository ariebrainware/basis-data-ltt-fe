'use client'
import styles from '../page.module.css'
import { useEffect, useState } from 'react'

var fullnameInput: HTMLInputElement | null = null
var genderInput: HTMLInputElement | null = null
var ageInput: HTMLInputElement | null = null
var jobInput: HTMLInputElement | null = null
var addressInput: HTMLInputElement | null = null
var healthHistoryInput: HTMLInputElement | null = null
var phoneNumberInput: HTMLInputElement | null = null

const options = [
  { id: 'heartDecease', label: 'Sakit Jantung' },
  { id: 'cancer', label: 'Kanker' },
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'osteoporosis', label: 'Pengapuran' },
  { id: 'highBloodPressure', label: 'Darah Rendah/Tinggi' },
]

function MultipleCheckboxes() {
  const [checkedItems, setCheckedItems] = useState<string[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target
    setCheckedItems((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    )
  }

  return (
    <div className="space-y-4 flex flex-col">
      <p className="font-normal text-base antialiased">Riwayat Penyakit</p>
      {options.map((option) => (
        <div key={option.id} className="inline-flex items-center gap-2">
          <label
            className="flex items-center cursor-pointer relative"
            htmlFor={option.id}
          >
            <input
              type="checkbox"
              id={option.id}
              name={option.id}
              checked={checkedItems.includes(option.id)}
              onChange={handleChange}
              className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow-sm  border border-slate-200 checked:bg-slate-800 checked:border-slate-800"
            />
            <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
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
            className="cursor-pointer ml-2 text-slate-600 font-normal antialiased"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  )
}

async function sendRegisterRequest() {
  const full_name = fullnameInput ? fullnameInput.value : ''
  const gender = genderInput ? genderInput.value : ''
  const age = ageInput ? ageInput.value : ''
  const job = jobInput ? jobInput.value : ''
  const address = addressInput ? addressInput.value : ''
  const health_history = healthHistoryInput ? healthHistoryInput.value : ''
  const phone_number = phoneNumberInput ? phoneNumberInput.value : ''
  const payload = {
    full_name,
    gender,
    age,
    job,
    address,
    health_history,
    phone_number,
  }
  console.log(payload)
  debugger
  const data = await fetch('http://localhost:19091/patient', {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      payload,
    }),
  })

  const responseData = await data.json()
  console.log(`responseData`, responseData)
  return responseData
}

function renderInput(id: string, type: string, placeHolder: string) {
  {
    id === 'phoneNumber' &&
      (() => {
        if (typeof window !== 'undefined') {
          const phoneInput = document.getElementById(
            'phoneNumber'
          ) as HTMLInputElement | null
          // phoneInput?.addEventListener('blur', () => {
          //   let value = phoneInput.value.replace(/\D/g, '')
          //   if (value.startsWith('0')) {
          //     phoneInput.value = '+62' + value.slice(1)
          //   } else if (value && !value.startsWith('+62')) {
          //     phoneInput.value = '+62' + value
          //   }
          // })
          phoneInput?.addEventListener('input', () => {
            phoneInput.value = phoneInput.value.replace(/[^+\d-]/g, '')
          })
        }
        return null
      })()
  }
  return (
    <div className="relative w-full">
      <input
        required
        type={type}
        id={id}
        name={id}
        className="peer w-full rounded-lg border border-slate-200 bg-transparent p-3 text-base text-slate-800 shadow-sm outline-none ring-4 ring-transparent transition-all duration-300 ease-in placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:outline-none focus:ring-slate-800/10 disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[shape=pill]:rounded-full data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-11 data-[icon-placement=start]:ps-11 dark:text-white"
        data-error="false"
        data-success="false"
        data-icon-placement=""
        placeholder={placeHolder}
      />
    </div>
  )
}

export default function Register() {
  useEffect(() => {
    fullnameInput = document.getElementById('fullName') as HTMLInputElement
    genderInput = document.getElementById('gender') as HTMLInputElement
    ageInput = document.getElementById('age') as HTMLInputElement
    jobInput = document.getElementById('job') as HTMLInputElement
    addressInput = document.getElementById('address') as HTMLInputElement
    healthHistoryInput = document.getElementById(
      'healthHistory'
    ) as HTMLInputElement
    phoneNumberInput = document.getElementById(
      'phoneNumber'
    ) as HTMLInputElement
  }, [])

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className="text-3xl font-bold antialiased">
          Form Registrasi Pasien
        </h1>
        {renderInput('fullName', 'text', 'Nama Lengkap')}
        <div
          className="flex gap-2 data-[orientation=horizontal]:items-center data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start"
          data-value=""
          data-orientation="vertical"
        >
          <div className="flex items-center gap-2">
            <label
              className="group block cursor-pointer shadow-sm shadow-slate-950/5 relative h-5 w-5 shrink-0 rounded-full bg-transparent border border-slate-200 transition-all duration-200 ease-in aria-disabled:opacity-50 aria-disabled:pointer-events-none hover:shadow-md data-[checked=true]:bg-slate-800 data-[checked=true]:border-slate-800 text-slate-50"
              data-value="male"
              onClick={(e) => {
                const target = e.currentTarget
                const isChecked = target.getAttribute('data-checked') === 'true'
                target.setAttribute(
                  'data-checked',
                  isChecked ? 'false' : 'true'
                )
                if (target.getAttribute('data-checked') === 'true') {
                  const femaleLabel = document.querySelector(
                    '[data-value="female"]'
                  )
                  if (femaleLabel) {
                    femaleLabel.setAttribute('data-checked', 'false')
                  }
                }
              }}
              htmlFor="html"
            >
              <input
                id="male"
                name="gender"
                type="radio"
                style={{ display: 'none' }}
                value="male"
              />
              <span className="pointer-events-none absolute left-2/4 top-2/4 text-current -translate-x-2/4 -translate-y-2/4 scale-75 opacity-0 transition-all duration-200 ease-in group-data-[checked=true]:scale-100 group-data-[checked=true]:opacity-100">
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
            </label>
            <label
              htmlFor="html"
              className="font-sans antialiased text-base text-slate-600"
            >
              Pria
            </label>
          </div>
          <div className="flex items-center gap-2">
            <label
              className="group block cursor-pointer shadow-sm shadow-slate-950/5 relative h-5 w-5 shrink-0 rounded-full bg-transparent border border-slate-200 transition-all duration-200 ease-in aria-disabled:opacity-50 aria-disabled:pointer-events-none hover:shadow-md data-[checked=true]:bg-slate-800 data-[checked=true]:border-slate-800 text-slate-50"
              data-value="female"
              onClick={(e) => {
                const target = e.currentTarget
                const isChecked = target.getAttribute('data-checked') === 'true'
                target.setAttribute(
                  'data-checked',
                  isChecked ? 'false' : 'true'
                )
                if (target.getAttribute('data-checked') === 'true') {
                  const maleLabel = document.querySelector(
                    '[data-value="male"]'
                  )
                  if (maleLabel) {
                    maleLabel.setAttribute('data-checked', 'false')
                  }
                }
              }}
              htmlFor="react"
            >
              <input
                id="female"
                name="gender"
                type="radio"
                style={{ display: 'none' }}
                value="female"
              />
              <span className="pointer-events-none absolute left-2/4 top-2/4 text-current -translate-x-2/4 -translate-y-2/4 scale-75 opacity-0 transition-all duration-200 ease-in group-data-[checked=true]:scale-100 group-data-[checked=true]:opacity-100">
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
            </label>
            <label
              htmlFor="react"
              className="font-sans antialiased text-base text-slate-600"
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
            className="peer block w-full resize-none rounded-lg border border-slate-200 bg-transparent p-3.5 text-base leading-none text-slate-800 outline-none ring-4 ring-transparent transition-all duration-300 ease-in placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:outline-none focus:ring-slate-800/10 disabled:pointer-events-none disabled:opacity-50 dark:text-white"
          ></textarea>
        </div>
        {MultipleCheckboxes()}
        {renderInput('phoneNumber', 'phoneNumber', 'Nomor Telepon')}

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
              sendRegisterRequest()
            }}
          >
            DAFTAR
          </a>
        </div>

        <div className="flex items-center gap-2">
          <label
            className="flex items-center cursor-pointer relative"
            htmlFor="termConditionCheckbox"
          >
            <input
              id="termConditionCheckbox"
              type="checkbox"
              className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow-sm  border border-slate-200 checked:bg-slate-800 checked:border-slate-800"
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
            />
            <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
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
            className="cursor-pointer text-slate-600 antialiased"
            htmlFor="termcondition"
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
    </div>
  )
}
