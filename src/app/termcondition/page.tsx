import styles from '../page.module.css'

export default function TermAndCondition() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className="text-3xl font-bold antialiased">Syarat dan Ketentuan</h1>
        <p className="text-lg font-normal antialiased">
          Dengan saya mengisi form data diri klien dan menandatangani form data
          diri klien, maka bersama ini saya menyatakan: <br />
        </p>
        <ul className="flex min-w-60 flex-col gap-0.5">
          <li className="dark:bg/70 text-slate-600 hover:bg-slate-200 hover:text-slate-800 focus:bg-slate-200 focus:text-slate-800 data-[selected=true]:bg-slate-200 flex cursor-pointer select-none items-center rounded-md bg-transparent px-2.5 py-1.5 align-middle font-sans transition-all duration-300 ease-in aria-disabled:pointer-events-none data-[selected=true]:text-black dark:hover:text-white dark:focus:text-white dark:data-[selected=true]:text-white">
            1. Bahwa saya secara sadar dan atas kemauan sendiri untuk terapi
            fisik di LEE TIT TAR sebagai klien LEE TIT TAR{' '}
          </li>
          <li className="dark:bg/70 text-slate-600 hover:bg-slate-200 hover:text-slate-800 focus:bg-slate-200 focus:text-slate-800 data-[selected=true]:bg-slate-200 flex cursor-pointer select-none items-center rounded-md bg-transparent px-2.5 py-1.5 align-middle font-sans transition-all duration-300 ease-in aria-disabled:pointer-events-none data-[selected=true]:text-black dark:hover:text-white dark:focus:text-white dark:data-[selected=true]:text-white">
            2. Bahwa saya memahami dan bersedia untuk menerima segala tindakan
            terapi fisik yang dilakukan LEE TIT TAR atas diri saya selaku klien
            LEE TIT TAR
          </li>
          <li className="dark:bg/70 text-slate-600 hover:bg-slate-200 hover:text-slate-800 focus:bg-slate-200 focus:text-slate-800 data-[selected=true]:bg-slate-200 flex cursor-pointer select-none items-center rounded-md bg-transparent px-2.5 py-1.5 align-middle font-sans transition-all duration-300 ease-in aria-disabled:pointer-events-none data-[selected=true]:text-black dark:hover:text-white dark:focus:text-white dark:data-[selected=true]:text-white">
            3. Bahwa Saya secara sadar dan menerima segala bentuk kemungkinan
            resiko yang terjadi dalam proses atau setelah tindakan terapi fisik
            yang dilakukan sesuai prosedur LEE TIT TAR dan tidak akan menuntut
            LEE TIT TAR dalam bentuk apapun atas segala kemungkinan resiko
            tersebut.
          </li>{' '}
          <br />
          <p className="text-lg font-normal antialiased">
            Demikian surat pernyataan ini saya buat secara sadar dan tanpa ada
            paksaan atau tekanan dari pihak manapun juga.
            <br />
          </p>
        </ul>
      </main>
    </div>
  )
}
