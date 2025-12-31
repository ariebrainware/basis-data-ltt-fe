import { getApiHost } from './apiHost'
import { getSessionToken } from './sessionToken'

/**
 * Fallback function to fetch current user's ID from the backend
 * This should be called if the login response doesn't include the user ID
 *
 * @returns Promise<string | null> - The user ID or null if fetch fails
 * @example
 * ```typescript
 * const userId = await fetchCurrentUserId()
 * if (userId) {
 *   localStorage.setItem('user-id', userId)
 * }
 * ```
 */
export async function fetchCurrentUserId(): Promise<string | null> {
  try {
    /**
     * Endpoint for fetching the current authenticated user's profile.
     *
     * Configure via NEXT_PUBLIC_CURRENT_USER_ENDPOINT to match the backend,
     * e.g. "/user/me", "/therapist/me", or "/me".
     *
     * Default: "/user/me"
     */
    const CURRENT_USER_ENDPOINT =
      process.env.NEXT_PUBLIC_CURRENT_USER_ENDPOINT || '/user/me'

    // Validate that session token is available before making the request
    const sessionToken = getSessionToken()
    if (!sessionToken) {
      console.error(
        '[fetchCurrentUserId] No session token available. Cannot fetch user ID.'
      )
      return null
    }

    const response = await fetch(`${getApiHost()}${CURRENT_USER_ENDPOINT}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
        'session-token': sessionToken,
      },
    })

    if (!response.ok) {
      console.warn(
        `[fetchCurrentUserId] Failed to fetch user data from ${CURRENT_USER_ENDPOINT}, status:`,
        response.status
      )
      return null
    }

    const data = await response.json()
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `[fetchCurrentUserId] Successfully fetched user data from ${CURRENT_USER_ENDPOINT}:`,
        data
      )
    }

    // Try to extract ID from various possible field names
    const userId =
      data.data?.id ||
      data.data?.ID ||
      data.data?.user_id ||
      data.data?.therapist_id ||
      data.data?.therapist?.ID ||
      data.data?.therapist?.id ||
      data.data?.user?.ID ||
      data.data?.user?.id ||
      data.id ||
      data.ID ||
      data.user_id ||
      data.therapist_id

    if (userId) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[fetchCurrentUserId] Extracted user ID:', userId)
      }
      return String(userId)
    }

    console.warn(
      '[fetchCurrentUserId] Could not extract user ID from response payload'
    )
    return null
  } catch (error) {
    console.error('[fetchCurrentUserId] Error fetching user ID:', error)
    return null
  }
}
