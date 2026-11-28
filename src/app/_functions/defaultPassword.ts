/**
 * Helpers for detecting users that still use the default (shared) password
 * and forcing them to change it before they can use the application.
 */

/** Default password assigned to newly created accounts. */
export const DEFAULT_PASSWORD =
  process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || 'LTT2025'

/** localStorage key flagging that the current user must change password. */
export const MUST_CHANGE_PASSWORD_KEY = 'must-change-password'

/** Route where the user changes their password. */
export const CHANGE_PASSWORD_ROUTE = '/profile'

/** Routes that stay reachable while a password change is pending. */
const ALLOWED_ROUTES = [CHANGE_PASSWORD_ROUTE, '/login']

/** Backend fields that may signal a password change is required. */
const BACKEND_FLAG_KEYS = [
  'must_change_password',
  'mustChangePassword',
  'is_default_password',
  'isDefaultPassword',
  'require_password_change',
  'requirePasswordChange',
] as const

/**
 * Returns true when the given password equals the default password.
 */
export function isDefaultPassword(password: string | null | undefined) {
  if (typeof password !== 'string') return false
  return password === DEFAULT_PASSWORD
}

/**
 * Returns true when the login response explicitly asks for a password change.
 */
export function responseRequiresPasswordChange(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false
  const record = data as Record<string, unknown>
  return BACKEND_FLAG_KEYS.some((key) => record[key] === true)
}

export function setMustChangePassword() {
  try {
    localStorage.setItem(MUST_CHANGE_PASSWORD_KEY, '1')
  } catch {}
}

export function clearMustChangePassword() {
  try {
    localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY)
  } catch {}
}

export function mustChangePassword(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      window.localStorage.getItem(MUST_CHANGE_PASSWORD_KEY) === '1'
    )
  } catch {
    return false
  }
}

/**
 * Returns true when the user must be redirected away from `pathname`
 * to the change-password page.
 */
export function shouldRedirectToChangePassword(
  pathname: string | null | undefined
): boolean {
  if (!mustChangePassword()) return false
  const path = pathname || ''
  return !ALLOWED_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`)
  )
}
