import { LoginResponseData } from '../_types/login'

const LOCKED_FIELD_KEYS = [
  'locked_until',
  'lockedUntil',
  'lock_expires_at',
  'locked_at',
] as const

/**
 * Extracts the locked field value from a login response
 * @param responseData - The API response data from login endpoint
 * @returns The value of the first found locked field, or undefined if not found
 * @example
 * ```typescript
 * const response = { data: { locked_until: '2024-01-01T12:00:00' } }
 * const lockedField = getLockedFieldFromResponse(response)
 * // lockedField: '2024-01-01T12:00:00'
 * ```
 */
export function getLockedFieldFromResponse(responseData: LoginResponseData) {
  const data = responseData?.data
  if (!data) return undefined
  for (const key of LOCKED_FIELD_KEYS) {
    const value = data?.[key]
    if (value) return value
  }
  return undefined
}

/**
 * Extracts a date string from text using regex pattern matching
 * @param text - The text containing a date string
 * @returns The extracted date string in format 'YYYY-MM-DD HH:mm:ss' or 'YYYY-MM-DD HH:mm', or null if not found
 * @example
 * ```typescript
 * const text = 'Account locked until 2024-01-01 12:00:00'
 * const dateStr = extractDateStringFromText(text)
 * // dateStr: '2024-01-01 12:00:00'
 * ```
 */
export function extractDateStringFromText(text: string) {
  if (!text) return null
  const dateMatch = text.match(
    /(\d{4}[-\/]\d{2}[-\/]\d{2}[ T]\d{2}:\d{2}(:\d{2})?)/
  )
  return dateMatch ? dateMatch[1] : null
}

const USER_ID_ACCESSORS = [
  (data: LoginResponseData['data']) => data?.id,
  (data: LoginResponseData['data']) => data?.user_id,
  (data: LoginResponseData['data']) => data?.therapist_id,
  (data: LoginResponseData['data']) => data?.ID,
  (data: LoginResponseData['data']) => data?.therapist?.ID,
  (data: LoginResponseData['data']) => data?.therapist?.id,
  (data: LoginResponseData['data']) => data?.user?.ID,
  (data: LoginResponseData['data']) => data?.user?.id,
]

/**
 * Extracts user ID from various possible locations in the login response
 * @param responseData - The API response data from login endpoint
 * @returns The user ID as a number, or undefined if not found
 * @example
 * ```typescript
 * const response = { data: { id: 123 } }
 * const userId = getUserIdFromResponse(response)
 * // userId: 123
 *
 * const response2 = { data: { therapist: { ID: 456 } } }
 * const userId2 = getUserIdFromResponse(response2)
 * // userId2: 456
 * ```
 */
export function getUserIdFromResponse(responseData: LoginResponseData) {
  const data = responseData?.data
  if (!data) return undefined
  for (const getValue of USER_ID_ACCESSORS) {
    const value = getValue(data)
    if (value) return value
  }
  return undefined
}
