'use client'
import styles from '../page.module.css'
import DashboardContent from '../_components/dashboardComponent'
import Patient from '../_components/patientRow'
import { useEffect, useState } from 'react'
import Footer from '../_components/footer'

interface PatientType {
  full_name: string
  phone_number: string
  job: string
  age: number
  gender: string
  last_visit: string
  patient_code: string
}

function ListPatients() {
  const [patients, setPatients] = useState<PatientType[]>([])
  const host = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:19091'
  useEffect(() => {
    ;(async () => {
      try {
        const response = await fetch(`${host}/patient`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
            'session-token': localStorage.getItem('session-token') ?? '',
          },
        })
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        const data = await response.json()
        const patientsArray = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.data.patients)
            ? data.patients
            : []
        setPatients(patientsArray)
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          window.location.href = '/login'
        }
        console.error('Error fetching patients:', error)
      }
    })()
  }, [])
  return patients
}
export default function Dashboard() {
  const patients = ListPatients()
  console.log(patients)
  return (
    <div className={styles.main}>
      <DashboardContent>
        <div className="mb-8 flex items-center justify-between gap-8">
          <div>
            <h6 className="font-sans text-base font-bold text-current antialiased md:text-lg lg:text-xl">
              Daftar Pasien
            </h6>
            <p className="mt-1 font-sans text-base text-current antialiased">
              Lihat semua informasi mengenai pasien
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button
              onClick={() =>
                window.open('/register', '_blank', 'noopener,noreferrer')
              }
              className="flex select-none items-center justify-center gap-3 rounded-md border border-slate-800 bg-slate-800 px-3 py-1.5 text-center align-middle font-sans text-sm font-medium text-slate-50 shadow-sm transition-all duration-300 ease-in hover:border-slate-700 hover:bg-slate-700 hover:shadow focus:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none data-[width=full]:w-full data-[shape=pill]:rounded-full"
              data-shape="default"
              data-width="default"
            >
              <svg
                width="1.5em"
                height="1.5em"
                strokeWidth="2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                color="currentColor"
                className="size-4"
              >
                <path
                  d="M17 10H20M23 10H20M20 10V7M20 10V13"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M1 20V19C1 15.134 4.13401 12 8 12V12C11.866 12 15 15.134 15 19V20"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>{' '}
              Add Patient
            </button>
            <button
              onClick={async () => {
                const host =
                  process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:19091'
                try {
                  const response = await fetch(`${host}/logout`, {
                    method: 'DELETE',
                    mode: 'cors',
                    headers: {
                      'Content-Type': 'application/json',
                      Accept: 'application/json',
                      Authorization:
                        'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
                      'session-token':
                        localStorage.getItem('session-token') ?? '',
                    },
                  })
                  if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`)
                  }
                  localStorage.removeItem('session-token')
                  console.log('Logged out successfully')
                  window.location.href = '/login'
                } catch (error) {
                  console.error('Logout error:', error)
                }
              }}
              className="inline-flex select-none items-center justify-center rounded-md border border-slate-200 bg-slate-200 px-3 py-1.5 text-center align-middle font-sans text-sm font-medium text-slate-800 shadow-sm transition-all duration-300 ease-in hover:bg-slate-100 hover:shadow focus:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none data-[width=full]:w-full data-[shape=pill]:rounded-full"
              data-shape="default"
              data-width="default"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div
            className="flex gap-2 data-[orientation=vertical]:flex-row data-[orientation=horizontal]:flex-col"
            data-orientation="horizontal"
          >
            <div
              role="tablist"
              className="relative flex w-full shrink-0 rounded-md bg-slate-100 p-1 data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col md:w-max dark:bg-slate-200"
              aria-orientation="horizontal"
              data-orientation="horizontal"
            >
              <button
                role="tab"
                className="relative z-[2] inline-flex w-full select-none items-center justify-center px-3 py-1.5 text-center align-middle font-sans text-sm font-medium text-slate-800 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-white"
                data-active="true"
                aria-selected="true"
              >
                Semua
              </button>
              <button
                role="tab"
                className="relative z-[2] inline-flex w-full select-none items-center justify-center px-3 py-1.5 text-center align-middle font-sans text-sm font-medium text-slate-800 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-white"
                data-active="false"
                aria-selected="false"
              >
                3 bln
              </button>
              <button
                role="tab"
                className="relative z-[2] inline-flex w-full select-none items-center justify-center px-3 py-1.5 text-center align-middle font-sans text-sm font-medium text-slate-800 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-white"
                data-active="false"
                aria-selected="false"
              >
                6 bln
              </button>
              <span
                style={{
                  width: 0,
                  height: 0,
                  left: 0,
                  top: 0,
                  position: 'absolute',
                  zIndex: 1,
                }}
                className="rounded bg-white shadow-sm shadow-slate-800/10 transition-all duration-300 ease-in"
              ></span>
            </div>
          </div>
          <div className="w-full md:w-72">
            <div className="relative w-full">
              <input
                data-icon-placement="start"
                placeholder="Cari"
                type="text"
                className="data-[error=true]:border-error data-[success=true]:border-success peer w-full select-none rounded-md border border-slate-200 bg-transparent px-2.5 py-2 text-sm text-slate-800 shadow-sm outline-none ring ring-transparent transition-all duration-300 ease-in placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:outline-none focus:ring-slate-800/10 disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[shape=pill]:rounded-full data-[icon-placement=end]:pe-9 data-[icon-placement=start]:ps-9 dark:text-white"
                data-error="false"
                data-success="false"
                data-shape="default"
              />
              <span
                className="pointer-events-none absolute top-1/2 size-5 -translate-y-1/2 overflow-hidden text-slate-600/70 transition-all duration-300 ease-in peer-focus:text-slate-800 data-[placement=end]:right-2.5 data-[placement=start]:left-2.5 dark:peer-hover:text-white dark:peer-focus:text-white"
                data-error="false"
                data-success="false"
                data-placement="start"
              >
                <svg
                  width="1.5em"
                  height="1.5em"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  color="currentColor"
                  className="size-5"
                >
                  <path
                    d="M17 17L21 21"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M3 11C3 15.4183 6.58172 19 11 19C13.213 19 15.2161 18.1015 16.6644 16.6493C18.1077 15.2022 19 13.2053 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 w-full overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-100 text-sm font-medium text-slate-600 dark:bg-slate-900">
              <tr>
                <th className="cursor-pointer px-2.5 py-2 text-start font-medium">
                  <small className="flex items-center justify-between gap-2 font-sans text-sm text-current antialiased opacity-70">
                    Pasien{' '}
                    <svg
                      width="1.5em"
                      height="1.5em"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      color="currentColor"
                      className="size-4"
                    >
                      <path
                        d="M17 8L12 3L7 8"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                      <path
                        d="M17 16L12 21L7 16"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </small>
                </th>
                <th className="cursor-pointer px-2.5 py-2 text-start font-medium">
                  <small className="flex items-center justify-between gap-2 font-sans text-sm text-current antialiased opacity-70">
                    Pekerjaan/Umur{' '}
                    <svg
                      width="1.5em"
                      height="1.5em"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      color="currentColor"
                      className="size-4"
                    >
                      <path
                        d="M17 8L12 3L7 8"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                      <path
                        d="M17 16L12 21L7 16"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </small>
                </th>
                <th className="cursor-pointer px-2.5 py-2 text-start font-medium">
                  <small className="flex items-center justify-between gap-2 font-sans text-sm text-current antialiased opacity-70">
                    Jenis Kelamin{' '}
                    <svg
                      width="1.5em"
                      height="1.5em"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      color="currentColor"
                      className="size-4"
                    >
                      <path
                        d="M17 8L12 3L7 8"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                      <path
                        d="M17 16L12 21L7 16"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </small>
                </th>
                <th className="cursor-pointer px-2.5 py-2 text-start font-medium">
                  <small className="flex items-center justify-between gap-2 font-sans text-sm text-current antialiased opacity-70">
                    Kode Pasien{' '}
                    <svg
                      width="1.5em"
                      height="1.5em"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      color="currentColor"
                      className="size-4"
                    >
                      <path
                        d="M17 8L12 3L7 8"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                      <path
                        d="M17 16L12 21L7 16"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </small>
                </th>
                <th className="cursor-pointer px-2.5 py-2 text-start font-medium">
                  <small className="flex items-center justify-between gap-2 font-sans text-sm text-current antialiased opacity-70">
                    {' '}
                  </small>
                </th>
              </tr>
            </thead>
            <tbody className="group text-sm text-slate-800 dark:text-white">
              {patients.map((patient, index) => {
                return (
                  <Patient
                    key={`${patient.phone_number}-${index}`}
                    name={patient.full_name}
                    phoneNumber={patient.phone_number}
                    job={patient.job}
                    age={patient.age}
                    gender={patient.gender}
                    patientCode={patient.patient_code}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 py-4">
          <small className="font-sans text-sm text-current antialiased">
            Halaman 1 of 10
          </small>
          <div className="flex gap-2">
            <button
              className="inline-flex select-none items-center justify-center rounded-md border border-slate-200 bg-transparent px-3 py-1.5 text-center align-middle font-sans text-sm font-medium text-slate-800 shadow-sm transition-all duration-300 ease-in hover:bg-slate-200 hover:shadow focus:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none data-[width=full]:w-full data-[shape=pill]:rounded-full"
              data-shape="default"
              data-width="default"
            >
              Sebelumnya
            </button>
            <button
              className="inline-flex select-none items-center justify-center rounded-md border border-slate-200 bg-transparent px-3 py-1.5 text-center align-middle font-sans text-sm font-medium text-slate-800 shadow-sm transition-all duration-300 ease-in hover:bg-slate-200 hover:shadow focus:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none data-[width=full]:w-full data-[shape=pill]:rounded-full"
              data-shape="default"
              data-width="default"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </DashboardContent>
      <div className={styles.page}>
        <Footer />
      </div>
    </div>
  )
}
