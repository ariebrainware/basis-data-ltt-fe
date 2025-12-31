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
    // Try common API endpoints for getting current user info
    // The actual endpoint may vary depending on the backend implementation
    const endpoints = ['/user/me', '/therapist/me', '/me', '/profile']

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${getApiHost()}${endpoint}`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
            'session-token': getSessionToken(),
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log(
            `[fetchCurrentUserId] Successfully fetched user data from ${endpoint}:`,
            data
          )

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
            console.log('[fetchCurrentUserId] Extracted user ID:', userId)
            return String(userId)
          }
        }
      } catch (endpointError) {
        // Try next endpoint
        console.debug(
          `[fetchCurrentUserId] Endpoint ${endpoint} not available:`,
          endpointError
        )
        continue
      }
    }

    console.warn(
      '[fetchCurrentUserId] Could not fetch user ID from any known endpoint'
    )
    return null
  } catch (error) {
    console.error('[fetchCurrentUserId] Error fetching user ID:', error)
    return null
  }
}
