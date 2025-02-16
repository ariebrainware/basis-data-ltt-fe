import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
      <div className={styles.page}>
        <main className={styles.main}>
          <h1> Lee Tit Tar One Solution Web</h1>
          <ol>
            <li>
              <code>LOGIN</code> sebagai user(pasien) yang telah terdaftar atau admin, anda akan diarahkan ke dashboard utama
            </li>
            <li>
              <code>REGISTER</code> sebagai user(pasien) baru
            </li>
            <li> Pilih salah satu cuy! </li>
          </ol>

          <div className={styles.ctas}>
            <a className={styles.primary} href="/login">
              LOGIN
            </a>
            <a
              href="/register"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondary}
            >
              DAFTAR
            </a>
          </div>
        </main>
        <footer className={styles.footer}>
          <a
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/file.svg"
              alt="File icon"
              width={16}
              height={16}
            />
            Copyright 2025-3025 All Right Reserved
          </a>
          <a
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
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
            href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
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
  );
}
