import styles from './page.module.css'
import Footer from './_components/footer'

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className="text-3xl font-bold antialiased">
          {' '}
          Lee Tit Tar One Solution Web
        </h1>
        <ol>
          <li>
            1. <code>LOGIN</code> sebagai user(pasien) yang telah terdaftar atau
            admin, anda akan diarahkan ke dashboard utama
          </li>
          <li>
            2. <code>DAFTAR</code> sebagai user(pasien) baru
          </li>
          <li>3. Pilih salah satu cuy!</li>
        </ol>

        <div className={styles.ctas}>
          <a className={styles.primary} href="/login">
            LOGIN
          </a>
          <a href="/register" className={styles.secondary}>
            DAFTAR
          </a>
        </div>
      </main>
      <Footer />
    </div>
  )
}
