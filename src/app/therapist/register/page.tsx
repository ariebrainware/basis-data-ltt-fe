'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@material-tailwind/react'

import styles from '../../page.module.css'
import Footer from '../../_components/footer'
import DatePicker from '../../_components/datePicker'
import PhoneInput from '../../_components/phoneInput'
import IDCardInput from '../../_components/idCardInput'
import WeightHeightInput from '../../_components/weightHeightInput'
import { VariantAlert } from '../../_components/alert'

let fullNameInput: HTMLInputElement | null = null
let emailInput: HTMLInputElement | null = null
let passwordInput: HTMLInputElement | null = null
let confirmPasswordInput: HTMLInputElement | null = null
let addressInput: HTMLInputElement | null = null
let dateOfBirthInput: HTMLInputElement | null = null
let phoneInput: HTMLInputElement | null = null
let weightInput: HTMLInputElement | null = null
let heightInput: HTMLInputElement | null = null

export default function RegisterTherapist() {
  const [showAlert, setShowVariantAlert] = useState<boolean>(false)
  const [alertVariant, setAlertVariant] = useState<'error' | 'success'>('error')
  const [textMessage, setMessage] = useState<string | null>(null)
  const [role, setRole] = useState<string>('therapist')
  const [nik, setNik] = useState<string>('')
  const [weight, setWeight] = useState<string>('')
  const [height, setHeight] = useState<string>('')

  async function sendRegisterTherapistRequest() {
    const fullName = fullNameInput ? fullNameInput.value : ''
    const email = emailInput ? emailInput.value : ''
    const address = addressInput ? addressInput.value : ''
    const dateOfBirth = dateOfBirthInput ? dateOfBirthInput.value : ''
    const phone = phoneInput ? phoneInput.value : ''
    const weight = weightInput ? weightInput.value : ''
    const height = heightInput ? heightInput.value : ''
    const password = passwordInput ? passwordInput.value : ''
    const host = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:19091'
    const response = await fetch(`${host}/therapist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
        'session-token': localStorage.getItem('session-token') ?? '',
      },
      credentials: 'include',
      redirect: 'follow',
      body: JSON.stringify({
        full_name: fullName,
        email: email,
        password: password,
        address: address,
        date_of_birth: dateOfBirth,
        phone_number: `62${phone}`, // Assuming phone is in the format '81234567890'
        nik: nik,
        weight: parseInt(weight, 10),
        height: parseInt(height, 10),
        role: role,
      }),
    })

    if (!response.ok) {
      setShowVariantAlert(true)
      setAlertVariant('error')
      setMessage('Gagal mendaftarkan terapis')
      console.error('Gagal mendaftarkan terapis')
    } else {
      setShowVariantAlert(true)
      setAlertVariant('success')
      setMessage('Terapis berhasil didaftarkan')
      console.log('Terapis berhasil didaftarkan')

      // Clear form fields after successful registration
      if (fullNameInput) fullNameInput.value = ''
      if (emailInput) emailInput.value = ''
      if (passwordInput) passwordInput.value = ''
      if (confirmPasswordInput) confirmPasswordInput.value = ''
      if (addressInput) addressInput.value = ''
      if (dateOfBirthInput) dateOfBirthInput.value = ''
      if (phoneInput) phoneInput.value = ''
      setNik('')
      setWeight('')
      setHeight('')
      // Clear the ControlledSelect state (role)
      setRole('')
    }
  }

  useEffect(() => {
    fullNameInput = document.getElementById('fullName') as HTMLInputElement
    emailInput = document.getElementById('email') as HTMLInputElement
    passwordInput = document.getElementById('password') as HTMLInputElement
    confirmPasswordInput = document.getElementById(
      'confirm_password'
    ) as HTMLInputElement
    addressInput = document.getElementById('address') as HTMLInputElement
    dateOfBirthInput = document.getElementById(
      'date_of_birth'
    ) as HTMLInputElement
    phoneInput = document.getElementById('phone') as HTMLInputElement
    weightInput = document.getElementById('weight') as HTMLInputElement
    heightInput = document.getElementById('height') as HTMLInputElement
  }, [])

  return (
    <div className={styles.page}>
      {showAlert && textMessage && (
        <VariantAlert
          variant={alertVariant}
          onClose={() => setShowVariantAlert(false)}
        >
          {textMessage}
        </VariantAlert>
      )}
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
                placeholder="Kata sandi"
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
                  Kata sandi minimal 8 karakter, kombinasi huruf besar, kecil,
                  angka, dan karakter.
                </small>
              </div>
            </div>

            <label
              htmlFor="email"
              className="text-slate-800 font-sans text-sm font-semibold antialiased dark:text-white"
            >
              Konfirmasi Kata Sandi
            </label>
            <div className="relative w-full">
              <input
                id="confirm_password"
                placeholder="Konfirmasi Kata Sandi"
                type="password"
                onChange={() => {
                  document
                    .getElementById('registerTherapistButton')
                    ?.removeAttribute('disabled')
                  const confirmPassword = (
                    document.getElementById(
                      'confirm_password'
                    ) as HTMLInputElement
                  ).value
                  const password = (
                    document.getElementById('password') as HTMLInputElement
                  ).value
                  if (confirmPassword !== password) {
                    // alert('Kata sandi tidak sesuai')
                    setShowVariantAlert(true)
                    setAlertVariant('error')
                    setMessage('Kata sandi tidak sesuai')
                    document
                      .getElementById('registerTherapistButton')
                      ?.setAttribute('disabled', 'true')
                  } else {
                    console.log('Passwords match')
                  }
                }}
                className="border-slate-200 text-slate-800 placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:ring-slate-800/10 peer w-full rounded-md border bg-transparent px-2.5 py-2 text-sm shadow-sm outline-none ring ring-transparent transition-all duration-300 ease-in focus:outline-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-9 data-[icon-placement=start]:ps-9 dark:text-white"
                data-error="false"
                data-success="false"
                data-icon-placement=""
              />
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
            <DatePicker id="date_of_birth" />
          </div>

          <div className="w-72 space-y-1">
            <PhoneInput id="phone" />
          </div>

          <div className="w-72 space-y-1">
            <label
              htmlFor="idCardNumber"
              className="text-slate-800 font-sans text-sm font-semibold antialiased dark:text-white"
            >
              NIK
            </label>
            <IDCardInput id="idCardNumber" onChange={setNik} value={nik} />
          </div>

          <div className="w-72 space-y-1">
            <WeightHeightInput
              idWeight="weight"
              idHeight="height"
              weight={weight}
              height={height}
              onWeightChange={setWeight}
              onHeightChange={setHeight}
            />
          </div>

          <div className="mt-4 w-72 space-y-1">
            <label
              htmlFor="therapistRole"
              className="text-slate-800 font-sans text-sm font-semibold antialiased dark:text-white"
            >
              Tingkat Kelas Terapis
            </label>
            {(() => {
              const roleOptions = [
                { value: 'therapist-senior', label: 'Terapis Senior' },
                { value: 'therapist-master', label: 'Terapis Master' },
              ]
              return (
                <div className="relative w-full">
                  <select
                    id="therapistRole"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="border-slate-200 text-slate-800 placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:ring-slate-800/10 peer w-full rounded-md border bg-transparent px-2.5 py-2 text-sm shadow-sm outline-none ring ring-transparent transition-all duration-300 ease-in focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white"
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )
            })()}
          </div>

          <div className={styles.ctas}>
            <Button
              id="registerTherapistButton"
              className="mt-4 rounded-full"
              onClick={() => {
                // e.preventDefault()
                sendRegisterTherapistRequest()
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
