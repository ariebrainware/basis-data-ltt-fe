import Image from 'next/image'
import styles from './page.module.css'

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
            2. <code>REGISTER</code> sebagai user(pasien) baru
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
      <footer className={styles.footer}>
        <a href="#" target="_blank" rel="noopener noreferrer">
          © Copyright 2025-3025 All Right Reserved
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer">
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Made with Love by IT guy
        </a>
        <a
          href="https://wa.me/6285133690700"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Konsultasi via WhatsApp
        </a>
      </footer>
    </div>
  )
}
