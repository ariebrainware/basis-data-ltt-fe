'use client'
import styles from '../page.module.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../_functions/apiFetch'
import Footer from '../_components/footer'
import { VariantAlert } from '../_components/alert'
import { getApiHost } from '../_functions/apiHost'
import { fetchCurrentUserId } from '../_functions/fetchCurrentUser'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import {
  getLockedFieldFromResponse,
  getUserIdFromResponse,
  getUserNameFromResponse,
} from '../_functions/loginParsing'
import {
  handleErrorString,
  storeSession,
  showLoginSuccess,
  showAccountLockedModal,
  showGenericLoginError,
} from '../_functions/loginUi'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { LoginResponseData } from '../_types/login'
import { getSessionToken } from '../_functions/sessionToken'

async function tryHandleErrorResponse(responseData: LoginResponseData | null) {
  if (!responseData) {
    await showGenericLoginError('Invalid email or password.')
    return true
  }

  const lockedField = getLockedFieldFromResponse(responseData)
  if (lockedField) {
    await showAccountLockedModal(lockedField)
    return true
  }

  if (await handleErrorString(responseData)) return true

  // For any authentication failure, keep the message generic and safe
  // to prevent user enumeration and avoid leaking backend internals.
  await showGenericLoginError('Invalid email or password.')
  return true
}

async function ensureAndStoreUserId(
  userId: number | string | undefined,
  responseData: LoginResponseData,
  router: AppRouterInstance
) {
  if (userId) {
    localStorage.setItem('user-id', userId.toString())
    if (responseData.data?.therapist_id) {
      localStorage.setItem(
        'therapist-id',
        responseData.data.therapist_id.toString()
      )
    }
    const loginCommission =
      (responseData.data as any)?.commission ??
      (responseData.data as any)?.therapist?.commission
    if (loginCommission !== undefined && loginCommission !== null) {
      localStorage.setItem('therapist-commission', String(loginCommission))
    }
    if (process.env.NODE_ENV !== 'production')
      console.log('[Login] Stored user-id:', userId.toString())
    router.replace('/dashboard')
    return
  }

  if (process.env.NODE_ENV !== 'production')
    console.warn(
      '[Login] No user ID received; attempting fallback fetch',
      Object.keys(responseData?.data ?? {})
    )

  try {
    const fetchedUserId = await fetchCurrentUserId()
    if (fetchedUserId) {
      localStorage.setItem('user-id', fetchedUserId)
      if (process.env.NODE_ENV !== 'production')
        console.log('[Login] Fetched user-id:', fetchedUserId)
    } else {
      console.error('[Login] Failed to fetch user ID')
      await Swal.fire({
        icon: 'info',
        title: 'Partial Login',
        html: 'You are logged in, but we could not load your profile. Some actions may not be available.',
      })
    }
  } catch (err) {
    console.error('[Login] Error fetching user ID:', err)
    await Swal.fire({
      icon: 'info',
      title: 'Partial Login',
      html: 'You are logged in, but we could not load your profile due to a network or server error. Some actions may not be available.',
    })
  } finally {
    router.replace('/dashboard')
  }
}

export default function Login() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showError, setShowVariantAlert] = useState<boolean>(false)
  const [textMessage, setMessage] = useState<string | null>(null)
  const router = useRouter()

  async function sendLoginRequest() {
    const emailVal =
      email ||
      (document.getElementById('email') as HTMLInputElement)?.value ||
      ''
    const passwordVal =
      password ||
      (document.getElementById('password') as HTMLInputElement)?.value ||
      ''

    if (!emailVal.trim() || !passwordVal) {
      const msg = 'Please enter both email and password.'
      setMessage(msg)
      setShowVariantAlert(true)
      await showGenericLoginError(msg)
      return null
    }

    setIsLoading(true)
    setShowVariantAlert(false)
    setMessage(null)

    async function performRequest() {
      const url = `${getApiHost()}/login`
      if (process.env.NODE_ENV !== 'production')
        console.log('[Login] POST', url)
      const response = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email: emailVal.trim(), password: passwordVal }),
      })
      let responseData: LoginResponseData | null = null
      try {
        responseData = await response.json()
      } catch {
        responseData = null
      }
      return { response, responseData }
    }

    try {
      const { response, responseData } = await performRequest()

      if (!response.ok) {
        setMessage('Invalid email or password.')
        setShowVariantAlert(true)
        await tryHandleErrorResponse(responseData)
        return null
      }

      if (!responseData?.data?.token) {
        setMessage('Invalid email or password.')
        setShowVariantAlert(true)
        await showGenericLoginError('Invalid email or password.')
        return null
      }

      await handleSuccessfulLogin(responseData, router)
      return response
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Login] Connection error:', error)
      }
      const safeConnMsg =
        'Unable to connect to the server. Please check your connection and try again.'
      setMessage(safeConnMsg)
      setShowVariantAlert(true)
      await Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: safeConnMsg,
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSuccessfulLogin(
    responseData: LoginResponseData,
    router: AppRouterInstance
  ) {
    const token = responseData.data?.token
    const role = responseData.data?.role
    const userName = getUserNameFromResponse(responseData)
    const userId = getUserIdFromResponse(responseData)

    if (process.env.NODE_ENV !== 'production')
      console.log(
        'token',
        token,
        'userId',
        userId,
        'role',
        role,
        'userName',
        userName
      )

    if (!token) return
    storeSession(token, role, userName)
    await showLoginSuccess(role, userName)
    await ensureAndStoreUserId(userId, responseData, router)
  }

  useEffect(() => {
    if (getSessionToken()) {
      router.replace('/dashboard')
    }
  }, [router])

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
        <form
          className="flex w-72 flex-col items-center space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            sendLoginRequest()
          }}
        >
          <div className="w-full space-y-4">
            {renderInput('Email', 'email', 'text', email, setEmail, isLoading)}
            {renderInput(
              'Password',
              'password',
              'password',
              password,
              setPassword,
              isLoading
            )}
          </div>
          <div id="loginBtn" className={styles.ctas}>
            <a
              role="button"
              className={`${styles.primary} ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
              href="#"
              onClick={(e) => {
                e.preventDefault()
                sendLoginRequest()
              }}
            >
              {isLoading ? 'LOGGING IN...' : 'LOGIN'}
            </a>
            <button
              type="submit"
              className="sr-only"
              tabIndex={-1}
              disabled={isLoading}
              aria-hidden="true"
            >
              LOGIN
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}

function renderInput(
  placeholder: string,
  id: string,
  type: string,
  value: string,
  onChange: (val: string) => void,
  disabled = false
) {
  return (
    <div className="relative w-full">
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
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
