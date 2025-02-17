import styles from '../page.module.css'

export default function Register() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className="text-3xl font-bold antialiased">
          Form Registrasi Pasien
        </h1>
        <div className="relative w-full">
          <input
            required
            type="text"
            id="name"
            name="name"
            className="peer w-full rounded-lg border border-slate-200 bg-transparent p-3 text-base text-slate-800 shadow-sm outline-none ring-4 ring-transparent transition-all duration-300 ease-in placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:outline-none focus:ring-slate-800/10 disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[shape=pill]:rounded-full data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-11 data-[icon-placement=start]:ps-11 dark:text-white"
            data-error="false"
            data-success="false"
            data-icon-placement=""
            placeholder="Nama Lengkap"
          />
        </div>
        <div>
          <input
            required
            type="text"
            id="gender"
            name="gender"
            className="peer w-full rounded-lg border border-slate-200 bg-transparent p-3 text-base text-slate-800 shadow-sm outline-none ring-4 ring-transparent transition-all duration-300 ease-in placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:outline-none focus:ring-slate-800/10 disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[shape=pill]:rounded-full data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-11 data-[icon-placement=start]:ps-11 dark:text-white"
            data-error="false"
            data-success="false"
            data-icon-placement=""
            placeholder="Jenis Kelamin (Pria/Wanita)"
          />
        </div>
        <div>
          <input
            required
            type="number"
            id="age"
            name="age"
            className="peer w-full rounded-lg border border-slate-200 bg-transparent p-3 text-base text-slate-800 shadow-sm outline-none ring-4 ring-transparent transition-all duration-300 ease-in placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:outline-none focus:ring-slate-800/10 disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[shape=pill]:rounded-full data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-11 data-[icon-placement=start]:ps-11 dark:text-white"
            data-error="false"
            data-success="false"
            data-icon-placement=""
            placeholder="Umur"
          />
        </div>
        <div>
          <input
            required
            type="text"
            id="job"
            name="job"
            className="peer w-full rounded-lg border border-slate-200 bg-transparent p-3 text-base text-slate-800 shadow-sm outline-none ring-4 ring-transparent transition-all duration-300 ease-in placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:outline-none focus:ring-slate-800/10 disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[shape=pill]:rounded-full data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-11 data-[icon-placement=start]:ps-11 dark:text-white"
            data-error="false"
            data-success="false"
            data-icon-placement=""
            placeholder="Pekerjaan"
          />
        </div>
        <div>
          <textarea
            rows={8}
            id="address"
            name="address"
            placeholder="Alamat"
            className="peer block w-full resize-none rounded-lg border border-slate-200 bg-transparent p-3.5 text-base leading-none text-slate-800 outline-none ring-4 ring-transparent transition-all duration-300 ease-in placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:outline-none focus:ring-slate-800/10 disabled:pointer-events-none disabled:opacity-50 dark:text-white"
          ></textarea>
        </div>
        <div className="space-y-4 flex flex-col">
          <p className="font-normal text-base antialiased">Riwayat Penyakit</p>
          <div className="inline-flex items-center">
            <label
              className="flex items-center cursor-pointer relative"
              htmlFor="default-checkbox"
            >
              <input
                type="checkbox"
                className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow-sm  border border-slate-200 checked:bg-slate-800 checked:border-slate-800"
                id="default-checkbox"
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
              className="cursor-pointer ml-2 text-slate-600 font-normal antialiased"
              htmlFor="default-checkbox"
            >
              Sakit Jantung
            </label>
          </div>
          <div className="inline-flex items-center">
            <label
              className="flex items-center cursor-pointer relative"
              htmlFor="checked-checkbox"
            >
              <input
                type="checkbox"
                className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow-sm  border border-slate-200 checked:bg-slate-800 checked:border-slate-800"
                id="kanker"
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
              className="cursor-pointer ml-2 text-slate-600 font-normal antialiased"
              htmlFor="checkbox"
            >
              Kanker
            </label>
          </div>
          <div className="inline-flex items-center">
            <label
              className="flex items-center cursor-pointer relative"
              htmlFor="checked-checkbox"
            >
              <input
                type="checkbox"
                className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow-sm  border border-slate-200 checked:bg-slate-800 checked:border-slate-800"
                id="kanker"
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
              className="cursor-pointer ml-2 text-slate-600 font-normal antialiased"
              htmlFor="checkbox"
            >
              Diabetes
            </label>
          </div>
          <div className="inline-flex items-center">
            <label
              className="flex items-center cursor-pointer relative"
              htmlFor="checked-checkbox"
            >
              <input
                type="checkbox"
                className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow-sm  border border-slate-200 checked:bg-slate-800 checked:border-slate-800"
                id="kanker"
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
              className="cursor-pointer ml-2 text-slate-600 font-normal antialiased"
              htmlFor="checkbox"
            >
              Pengapuran
            </label>
          </div>
          <div className="inline-flex items-center">
            <label
              className="flex items-center cursor-pointer relative"
              htmlFor="checked-checkbox"
            >
              <input
                type="checkbox"
                className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow-sm  border border-slate-200 checked:bg-slate-800 checked:border-slate-800"
                id="kanker"
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
              className="cursor-pointer ml-2 text-slate-600 font-normal antialiased"
              htmlFor="checkbox"
            >
              Darah Rendah/Tinggi
            </label>
          </div>
        </div>
        <div>
          <input
            required
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            className="peer w-full rounded-lg border border-slate-200 bg-transparent p-3 text-base text-slate-800 shadow-sm outline-none ring-4 ring-transparent transition-all duration-300 ease-in placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:outline-none focus:ring-slate-800/10 disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[shape=pill]:rounded-full data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-11 data-[icon-placement=start]:ps-11 dark:text-white"
            data-error="false"
            data-success="false"
            data-icon-placement=""
            placeholder="Nomor Telepon"
          />
        </div>
        <div className={styles.ctas}>
          <a className={styles.primary} href="/login">
            DAFTAR
          </a>
        </div>

        <div className="flex items-center gap-2">
          <label
            className="flex items-center cursor-pointer relative"
            htmlFor="checkbox-with-link"
          >
            <input
              type="checkbox"
              className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow-sm  border border-slate-200 checked:bg-slate-800 checked:border-slate-800"
              id="checkbox-with-link"
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
            htmlFor="checkbox-with-link"
          >
            Saya setuju dengan{' '}
            <a
              href="/termcondition"
              target="_blank"
              rel="noreferrer"
              className="text-slate-800"
            >
              syarat dan ketentuan
            </a>
          </label>
        </div>
      </main>
    </div>
  )
}
