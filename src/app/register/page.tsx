import styles from "../page.module.css";

export default function Register() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className="text-3x1 font-bold underline">Register</h1>
        <div>
          <label htmlFor="username">Username </label>
          <input type="text" id="username" name="username" className="p-8" required />
        </div>
        <div>
          <label htmlFor="password">Password </label>
          <input type="password" id="password" name="password" required />
        </div>
        <div className={styles.ctas}>
            <a
            className={styles.primary}
            href="/login"
            >
            REGISTER
            </a>
        </div>
      </main>
    </div>
  );
}