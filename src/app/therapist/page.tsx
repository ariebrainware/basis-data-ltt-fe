import styles from '../page.module.css'
import Footer from '../_components/footer'
import DatePicker from '../_components/datePicker'
import PhoneInput from '../_components/phoneInput'
import IDCardInput from '../_components/idCardInput'
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
              htmlFor="email"
              className="font-sans text-sm font-semibold text-slate-800 antialiased dark:text-white"
            >
              Nama Lengkap
            </label>
            <div className="relative w-full">
              <input
                id="email"
                placeholder="Agus Salim"
                type="text"
                className="peer w-full rounded-md border border-slate-200 bg-transparent px-2.5 py-2 text-sm text-slate-800 shadow-sm outline-none ring ring-transparent transition-all duration-300 ease-in placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:outline-none focus:ring-slate-800/10 disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-9 data-[icon-placement=start]:ps-9 dark:text-white"
                data-error="false"
                data-success="false"
                data-icon-placement=""
              />
            </div>
          </div>

          <div className="w-72 space-y-1">
            <label
              htmlFor="email"
              className="font-sans text-sm font-semibold text-slate-800 antialiased dark:text-white"
            >
              Email
            </label>
            <div className="relative w-full">
              <input
                id="email"
                placeholder="agussalim@gmail.com"
                type="email"
                className="peer w-full rounded-md border border-slate-200 bg-transparent px-2.5 py-2 text-sm text-slate-800 shadow-sm outline-none ring ring-transparent transition-all duration-300 ease-in placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:outline-none focus:ring-slate-800/10 disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-9 data-[icon-placement=start]:ps-9 dark:text-white"
                data-error="false"
                data-success="false"
                data-icon-placement=""
              />
            </div>
          </div>

          <div className="w-72 space-y-1">
            <label
              htmlFor="email"
              className="font-sans text-sm font-semibold text-slate-800 antialiased dark:text-white"
            >
              Kata Sandi
            </label>
            <div className="relative w-full">
              <input
                id="password"
                placeholder=""
                type="password"
                className="peer w-full rounded-md border border-slate-200 bg-transparent px-2.5 py-2 text-sm text-slate-800 shadow-sm outline-none ring ring-transparent transition-all duration-300 ease-in placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:outline-none focus:ring-slate-800/10 disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-9 data-[icon-placement=start]:ps-9 dark:text-white"
                data-error="false"
                data-success="false"
                data-icon-placement=""
              />
              <div className="flex gap-1.5 text-slate-600">
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
                className="font-sans text-sm font-semibold text-slate-800 antialiased dark:text-white"
              >
                Alamat
              </label>
              <div className="relative w-full">
                <input
                  id="address"
                  placeholder="Jl. Sudirman No. 1"
                  type="text"
                  className="peer w-full rounded-md border border-slate-200 bg-transparent px-2.5 py-2 text-sm text-slate-800 shadow-sm outline-none ring ring-transparent transition-all duration-300 ease-in placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:outline-none focus:ring-slate-800/10 disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-9 data-[icon-placement=start]:ps-9 dark:text-white"
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
              className="font-sans text-sm font-semibold text-slate-800 antialiased dark:text-white"
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
              className="font-sans text-sm font-semibold text-slate-800 antialiased dark:text-white"
            >
              NIK
            </label>
            <IDCardInput />
          </div>

          <div className="w-72 space-y-1">
            <label htmlFor="weight">Weight:</label>
            <input type="number" id="weight" name="weight" required />
          </div>

          <div className="w-72 space-y-1">
            <label htmlFor="height">Height:</label>
            <input type="number" id="height" name="height" required />
          </div>

          <button type="submit">Register</button>
        </form>

        <Footer />
      </main>
    </div>
  )
}
