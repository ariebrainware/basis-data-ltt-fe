'use client'
import { useRouter } from 'next/navigation'
import { logout } from '../_functions/logout'

export default function Header() {
  const router = useRouter()
  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
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
        <a
          href="/register"
          target="_blank"
          rel="noopener noreferrer"
          className="border-slate-800 bg-slate-800 text-slate-50 hover:border-slate-700 hover:bg-slate-700 flex select-none items-center justify-center gap-3 rounded-md border px-3 py-1.5 text-center align-middle font-sans text-sm font-medium shadow-sm transition-all duration-300 ease-in hover:shadow focus:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none data-[width=full]:w-full data-[shape=pill]:rounded-full"
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
          Tambah Pasien
        </a>
        <button
          onClick={handleLogout}
          className="border-slate-200 bg-slate-200 text-slate-800 hover:bg-slate-100 inline-flex select-none items-center justify-center rounded-md border px-3 py-1.5 text-center align-middle font-sans text-sm font-medium shadow-sm transition-all duration-300 ease-in hover:shadow focus:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none data-[width=full]:w-full data-[shape=pill]:rounded-full"
          data-shape="default"
          data-width="default"
        >
          Logout
        </button>
        <button
          onClick={() => router.push('/profile')}
          className="inline-flex select-none items-center justify-center rounded-md border border-blue-600 bg-blue-600 px-3 py-1.5 text-center align-middle font-sans text-sm font-medium text-white shadow-sm transition-all duration-300 ease-in hover:border-blue-500 hover:bg-blue-500 hover:shadow focus:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none data-[width=full]:w-full data-[shape=pill]:rounded-full"
          data-shape="default"
          data-width="default"
        >
          Profile
        </button>
      </div>
    </div>
  )
}
