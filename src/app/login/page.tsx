import styles from "../page.module.css";

export default function Login() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
      <text className="text-3xl font-bold antialiased">Login Lee Tit Tar</text>
        <div>
          <label htmlFor="username">Username </label>
          <input type="text" id="username" name="username" className="outline-solid rounded-sm m-8" required />
        </div>
        <div>
          <label htmlFor="password">Password </label>
          <input type="password" id="password" name="password" className="outline-solid rounded-sm" required />
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
