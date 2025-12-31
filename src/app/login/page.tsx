'use client'
import styles from '../page.module.css'
import { useEffect, useState } from 'react'
import Footer from '../_components/footer'
import { VariantAlert } from '../_components/alert'
import { getApiHost } from '../_functions/apiHost'

let usernameInput: HTMLInputElement | null = null
let passwordInput: HTMLInputElement | null = null

export default function Login() {
  const [showError, setShowVariantAlert] = useState<boolean>(false)
  const [textMessage, setMessage] = useState<string | null>(null)

  async function sendLoginRequest() {
    const email = usernameInput ? usernameInput.value : ''
    const password = passwordInput ? passwordInput.value : ''
    try {
      const response = await fetch(`${getApiHost()}/login`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
        },
        body: JSON.stringify({ email, password }),
      })
      const responseData = await response.json()

      if (!response.ok) {
        if (responseData.error === 'user not found') {
          setShowVariantAlert(true)
          setMessage('User not found!')
          return
        }
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const token = responseData.data.token
      const role = responseData.data.role
      const userId = responseData.data.id || responseData.data.user_id
      console.log('token', token)
      if (token) {
        setShowVariantAlert(false)
        setMessage('Login Successful!')
        setTimeout(() => {
          localStorage.setItem('session-token', token)
          localStorage.setItem('user-role', role)
          if (userId) {
            localStorage.setItem('user-id', userId.toString())
          }
          window.location.href = '/dashboard'
        }, 1500)
        return
      }
      return response
    } catch (error) {
      console.error('Failed to fetch:', error)
      setMessage('Login failed due to network error!')
      return null
    }
  }

  useEffect(() => {
    if (localStorage.getItem('session-token')) {
      window.location.href = '/dashboard'
      return
    }
    usernameInput = document.getElementById('email') as HTMLInputElement
    passwordInput = document.getElementById('password') as HTMLInputElement
  }, [])

  return (
    <div className={styles.page}>
      {showError && (
        <VariantAlert
          variant="error"
          onClose={() => setShowVariantAlert(false)}
        >
          {textMessage}
        </VariantAlert>
      )}
      <main className={styles.main}>
        <h1 className="text-3xl font-bold antialiased">Login Lee Tit Tar</h1>
        <div className="w-72 space-y-4">
          {renderInput('Email', 'email', 'text')}
          {renderInput('Password', 'password', 'password')}
        </div>
        <div id="loginBtn" className={styles.ctas}>
          <a
            className={styles.primary}
            href="#"
            onClick={(e) => {
              e.preventDefault()
              sendLoginRequest()
            }}
          >
            LOGIN
          </a>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function renderInput(placeholder: string, id: string, type: string) {
  return (
    <div className="relative w-full">
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="border-slate-200 text-slate-800 placeholder:text-slate-600/60 hover:border-slate-800 hover:ring-slate-800/10 focus:border-slate-800 focus:ring-slate-800/10 peer w-full rounded-md border bg-transparent px-2.5 py-2 text-sm shadow-sm outline-none ring ring-transparent transition-all duration-300 ease-in focus:outline-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed data-[error=true]:border-red-500 data-[success=true]:border-green-500 data-[icon-placement=end]:pe-9 data-[icon-placement=start]:ps-9 dark:text-white"
        data-error="false"
        data-success="false"
        data-icon-placement="start"
      />
      <span
        className="text-slate-600/70 peer-focus:text-slate-800 pointer-events-none absolute top-1/2 size-5 -translate-y-1/2 overflow-hidden transition-all duration-300 ease-in data-[placement=end]:right-2.5 data-[placement=start]:left-2.5 dark:peer-hover:text-white dark:peer-focus:text-white"
        data-error="false"
        data-success="false"
        data-placement="start"
      >
        {placeholder === 'Email' ? (
          <svg
            width="1.5em"
            height="1.5em"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            color="currentColor"
            className="size-full"
          >
            <path
              d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M4.271 18.3457C4.271 18.3457 6.50002 15.5 12 15.5C17.5 15.5 19.7291 18.3457 19.7291 18.3457"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        ) : (
          <svg
            width="1.5em"
            height="1.5em"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            color="currentColor"
            className="size-full"
          >
            <path
              d="M16 12H17.4C17.7314 12 18 12.2686 18 12.6V19.4C18 19.7314 17.7314 20 17.4 20H6.6C6.26863 20 6 19.7314 6 19.4V12.6C6 12.2686 6.26863 12 6.6 12H8M16 12V8C16 6.66667 15.2 4 12 4C8.8 4 8 6.66667 8 8V12M16 12H8"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        )}
      </span>
    </div>
  )
}
