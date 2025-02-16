import styles from "../page.module.css";

export default function Register() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className="text-3x1 font-bold underline">Form Registrasi Pasien</h1>
        <div>
          <label htmlFor="fullname">Nama </label>
          <input type="text" id="fullname" name="fullname" className="p-8" required />
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
            <a
            className={styles.primary}
            href="/login"
            >
            DAFTAR
            </a>
        </div>
      </main>
    </div>
  );
}