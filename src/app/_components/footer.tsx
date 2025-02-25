import Image from 'next/image'
import styles from '../page.module.css'

export default function Footer() {
  return (
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
  )
}
