import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { format as formatDate } from 'date-fns'
import { extractDateStringFromText } from './loginParsing'
import { LoginResponseData } from '../_types/login'

/**
 * Displays a modal dialog informing the user that their account is locked
 * @param lockedField - The locked date/time value as a string
 * @returns Promise that resolves when the modal is closed
 * @example
 * ```typescript
 * await showAccountLockedModal('2024-01-01T12:00:00')
 * // Shows modal: "Your account is locked until 2024/01/01 12:00"
 * ```
 */
export async function showAccountLockedModal(lockedField: string) {
  let lockedDate: Date | null = null
  try {
    lockedDate = new Date(lockedField)
  } catch (e) {
    lockedDate = null
  }
  const formatted = lockedDate
    ? formatDate(lockedDate, 'yyyy/MM/dd HH:mm')
    : String(lockedField)

  await Swal.fire({
    icon: 'warning',
    title: 'Account Locked',
    html: `Your account is locked until <strong>${formatted}</strong>.`,
  })
}

/**
 * Handles the "user not found" error from login response
 * @param responseData - The API response data from login endpoint
 * @returns Promise<boolean> - true if the error was handled, false otherwise
 * @example
 * ```typescript
 * const response = { error: 'user not found' }
 * const handled = await handleUserNotFound(response)
 * // handled: true, shows "User not found!" modal
 * ```
 */
export async function handleUserNotFound(responseData: LoginResponseData) {
  if (responseData?.error === 'user not found') {
    await Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: 'User not found!',
    })
    return true
  }
  return false
}

/**
 * Handles error responses that contain date strings (typically account lock messages)
 * @param responseData - The API response data from login endpoint
 * @returns Promise<boolean> - true if an error with date was handled, false otherwise
 * @example
 * ```typescript
 * const response = { error: 'Account locked until 2024-01-01 12:00:00' }
 * const handled = await handleErrorString(response)
 * // handled: true, shows account locked modal with formatted date
 * ```
 */
export async function handleErrorString(responseData: LoginResponseData) {
  // Guard against null/undefined responseData
  if (!responseData || typeof responseData.error !== 'string') return false

  const dateStr = extractDateStringFromText(responseData.error)
  if (!dateStr) return false
  const parsed = new Date(dateStr)
  const formatted = isNaN(parsed.getTime())
    ? dateStr
    : formatDate(parsed, 'yyyy/MM/dd HH:mm')
  await Swal.fire({
    icon: 'warning',
    title: 'Account Locked',
    html: `Your account is locked until <strong>${formatted}</strong>.`,
  })
  return true
}

/**
 * Stores the user's session token and role in localStorage
 * @param tokenVal - The session token to store
 * @param roleVal - The user's role (e.g., 'super_admin', 'therapist')
 * @returns void - No return value; exits early if token is invalid
 * @example
 * ```typescript
 * storeSession('abc123token', 'therapist')
 * // Sets localStorage['session-token'] = 'abc123token'
 * // Sets localStorage['user-role'] = 'therapist'
 * ```
 */
export function storeSession(
  tokenVal: string,
  roleVal?: string,
  nameVal?: string
) {
  // Guard against storing invalid or empty tokens
  if (typeof tokenVal !== 'string' || tokenVal.trim() === '') {
    return
  }
  localStorage.setItem('session-token', tokenVal)
  if (roleVal) localStorage.setItem('user-role', roleVal)
  if (nameVal && nameVal.trim()) {
    localStorage.setItem('user-name', nameVal.trim())
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('user-name-change'))
    }
  }
}

/**
 * Displays a success modal after successful login with greeting
 * @param roleVal - Optional user role to display in the greeting
 * @param nameVal - Optional user name to display in the greeting
 * @returns Promise that resolves when the modal timer expires (1400ms)
 * @example
 * ```typescript
 * await showLoginSuccess('super_admin', 'Budi')
 * // Shows "Selamat Datang, Budi!" modal with role info
 * ```
 */
export async function showLoginSuccess(roleVal?: string, nameVal?: string) {
  const roleLabel =
    roleVal === 'super_admin'
      ? 'Super Admin'
      : roleVal === 'therapist'
        ? 'Terapis'
        : roleVal
          ? roleVal.charAt(0).toUpperCase() + roleVal.slice(1)
          : null

  const titleText = nameVal?.trim()
    ? `Selamat Datang, ${nameVal.trim()}!`
    : 'Selamat Datang!'

  await Swal.fire({
    icon: 'success',
    title: titleText,
    html: roleLabel
      ? `Login berhasil sebagai <strong>${roleLabel}</strong>.<br/><span style="font-size: 0.875rem; color: #64748b;">Mengalihkan ke dashboard...</span>`
      : 'Login berhasil! Mengalihkan ke dashboard...',
    timer: 1400,
    showConfirmButton: false,
  })
}
