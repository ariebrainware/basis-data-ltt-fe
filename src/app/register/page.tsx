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
            type="text"
            className="peer w-full rounded-lg border border-slate-200 bg-transparent p-3 text-base text-slate-800 shadow-sm outline-none ring-4 ring-transparent transition-all duration-300 ease-in placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:outline-none focus:ring-slate-800/10 disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[shape=pill]:rounded-full data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-11 data-[icon-placement=start]:ps-11 dark:text-white"
            data-error="false"
            data-success="false"
            data-icon-placement=""
            placeholder="Nama Lengkap"
          />
        </div>
        <div>
          <label htmlFor="gender">Jenis Kelamin </label>
          <input type="text" id="gender" name="gender" required />
        </div>
        <div>
          <label htmlFor="age">Umur </label>
          <input type="text" id="age" name="age" required />
        </div>
        <div>
          <label htmlFor="job">Pekerjaan </label>
          <input type="text" id="job" name="job" required />
        </div>
        <div>
          <label htmlFor="address">Alamat </label>
          <input type="text" id="address" name="address" required />
        </div>
        <div>
          <label htmlFor="gender">Riwayat Penyakit </label>
          <div className="">
            <label>
              <input type="checkbox" name="healthHistory" value="diabetes" />
              Sakit Jantung
            </label>
            <label>
              <input type="checkbox" name="healthHistory" value="hipertensi" />
              Kanker
            </label>
            <label>
              <input type="checkbox" name="healthHistory" value="jantung" />
              Diabetes
            </label>
            <label>
              <input type="checkbox" name="healthHistory" value="asma" />
              Pengapuran
            </label>
            <label>
              <input type="checkbox" name="healthHistory" value="lainnya" />
              Darah Rendah/Tinggi
            </label>
          </div>
        </div>
        <div>
          <label htmlFor="phone_number">Nomor HP </label>
          <input type="text" id="phone_number" name="phone_number" required />
        </div>
        <div>
          <label htmlFor="gender">Umur </label>
          <input type="text" id="gender" name="gender" required />
        </div>
        <div className={styles.ctas}>
          <a className={styles.primary} href="/login">
            DAFTAR
          </a>
        </div>
      </main>
    </div>
  )
}
