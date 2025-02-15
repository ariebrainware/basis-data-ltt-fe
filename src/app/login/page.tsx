import styles from "../page.module.css";

export default function Login() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
      <h1 className="text-3x1 font-bold underline">Try your memory</h1>
        <div>
          <label htmlFor="username">Username </label>
          <input type="text" id="username" name="username" required />
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
            LOGIN
            </a>
        </div>
      </main>
    </div>
  );
}
