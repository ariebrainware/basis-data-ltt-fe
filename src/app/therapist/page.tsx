'use client'
import React from 'react'
import { Button } from '@material-tailwind/react'

import styles from '../page.module.css'
import Footer from '../_components/footer'
import DatePicker from '../_components/datePicker'
import PhoneInput from '../_components/phoneInput'
import IDCardInput from '../_components/idCardInput'
import WeightHeightInput from '../_components/weightHeightInput'

const fullNameInput: HTMLInputElement | null = null
const emailInput: HTMLInputElement | null = null
const passwordInput: HTMLInputElement | null = null
const addressInput: HTMLInputElement | null = null
const dateOfBirthInput: HTMLInputElement | null = null
const phoneInput: HTMLInputElement | null = null
const nikInput: HTMLInputElement | null = null
const weightInput: HTMLInputElement | null = null
const heightInput: HTMLInputElement | null = null

async function sendRegisterTherapistRequest() {
  const fullName = fullNameInput ? fullNameInput.value : ''
  const email = emailInput ? emailInput.value : ''
  const password = passwordInput ? passwordInput.value : ''
  const address = addressInput ? addressInput.value : ''
  const dateOfBirth = dateOfBirthInput ? dateOfBirthInput.value : ''
  const phone = phoneInput ? phoneInput.value : ''
  const nik = nikInput ? nikInput.value : ''
  const weight = weightInput ? weightInput.value : ''
  const height = heightInput ? heightInput.value : ''
  const host = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:19091'
  const response = await fetch(`${host}/therapist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
      'session-token': localStorage.getItem('session-token') ?? '',
    },
    body: JSON.stringify({
      fullName: fullName,
      email: email,
      password: password,
      address: address,
      dateOfBirth: dateOfBirth,
      phone: phone,
      nik: nik,
      weight: parseInt(weight, 10),
      height: parseInt(height, 10),
    }),
  })
  if (response.ok) {
    console.log('Therapist registered successfully')
  } else {
    console.error('Failed to register therapist')
  }
}

export default function Therapist() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className="text-3xl font-bold antialiased">
          Form Registrasi Terapis
        </h1>
        <form>
          <div className="w-72 space-y-1">
            <label
              htmlFor="fullName"
              className="text-slate-800 font-sans text-sm font-semibold antialiased dark:text-white"
            >
              Nama Lengkap
            </label>
            <div className="relative w-full">
              <input
                id="fullName"
                placeholder="Agus Salim"
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
              htmlFor="email"
              className="text-slate-800 font-sans text-sm font-semibold antialiased dark:text-white"
            >
              Email
            </label>
            <div className="relative w-full">
              <input
                id="email"
                placeholder="agussalim@gmail.com"
                type="email"
                className="border-slate-200 text-slate-800 placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:ring-slate-800/10 peer w-full rounded-md border bg-transparent px-2.5 py-2 text-sm shadow-sm outline-none ring ring-transparent transition-all duration-300 ease-in focus:outline-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-9 data-[icon-placement=start]:ps-9 dark:text-white"
                data-error="false"
                data-success="false"
                data-icon-placement=""
              />
            </div>
          </div>

          <div className="w-72 space-y-1">
            <label
              htmlFor="email"
              className="text-slate-800 font-sans text-sm font-semibold antialiased dark:text-white"
            >
              Kata Sandi
            </label>
            <div className="relative w-full">
              <input
                id="password"
                placeholder=""
                type="password"
                className="border-slate-200 text-slate-800 placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:ring-slate-800/10 peer w-full rounded-md border bg-transparent px-2.5 py-2 text-sm shadow-sm outline-none ring ring-transparent transition-all duration-300 ease-in focus:outline-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-9 data-[icon-placement=start]:ps-9 dark:text-white"
                data-error="false"
                data-success="false"
                data-icon-placement=""
              />
              <div className="text-slate-600 flex gap-1.5">
                <svg
                  width="1.5em"
                  height="1.5em"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  color="currentColor"
                  className="size-3.5 shrink-0 translate-y-[3px] stroke-2"
                >
                  <path
                    d="M12 11.5V16.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M12 7.51L12.01 7.49889"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
                <small className="font-sans text-sm text-current antialiased">
                  Use at least 8 characters, one uppercase, one lowercase and
                  one number.
                </small>
              </div>
            </div>

            <div className="w-72 space-y-1">
              <label
                htmlFor="email"
                className="text-slate-800 font-sans text-sm font-semibold antialiased dark:text-white"
              >
                Alamat
              </label>
              <div className="relative w-full">
                <input
                  id="address"
                  placeholder="Jl. Sudirman No. 1"
                  type="text"
                  className="border-slate-200 text-slate-800 placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:ring-slate-800/10 peer w-full rounded-md border bg-transparent px-2.5 py-2 text-sm shadow-sm outline-none ring ring-transparent transition-all duration-300 ease-in focus:outline-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-9 data-[icon-placement=start]:ps-9 dark:text-white"
                  data-error="false"
                  data-success="false"
                  data-icon-placement=""
                />
              </div>
            </div>
          </div>

          <div className="w-72 space-y-1">
            <label
              htmlFor="date_of_birth"
              className="text-slate-800 font-sans text-sm font-semibold antialiased dark:text-white"
            >
              Tanggal Lahir
            </label>
            <DatePicker />
          </div>

          <div className="w-72 space-y-1">
            <PhoneInput />
          </div>

          <div className="w-72 space-y-1">
            <label
              htmlFor="NIK"
              className="text-slate-800 font-sans text-sm font-semibold antialiased dark:text-white"
            >
              NIK
            </label>
            <IDCardInput />
          </div>

          <div className="w-72 space-y-1">
            <WeightHeightInput />
          </div>
          <div className={styles.ctas}>
            <Button
              className="mt-4 rounded-full"
              onClick={(e) => {
                e.preventDefault()
                sendRegisterTherapistRequest()
              }}
            >
              DAFTAR
            </Button>
            {/* <a
              className="bg-slate-200 cursor-not-allowed"
              id="registerBtn"
              href="/therapist"
              onClick={(e) => {
                e.preventDefault()
                sendRegisterTherapistRequest()
              }}
            >
              DAFTAR
            </a> */}
          </div>
        </form>

        <Footer />
      </main>
    </div>
  )
}
