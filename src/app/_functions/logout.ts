import { getApiHost } from './apiHost'
import { getSessionToken } from './sessionToken'

/**
 * Perform logout by calling the logout API endpoint and cleaning up local storage
 * @returns Promise that resolves when logout is complete
 * @example
 * ```typescript
 * await logout()
 * // User is now logged out and redirected to login page
 * ```
 */
export async function logout(): Promise<void> {
  try {
    const response = await fetch(`${getApiHost()}/logout`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
        'session-token': getSessionToken(),
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    console.log('Logged out successfully')
  } catch (error) {
    console.error('Logout error:', error)
  }

  // Clear local storage
  localStorage.removeItem('session-token')
  localStorage.removeItem('user-role')
  localStorage.removeItem('user-id')
  // Do not perform navigation here; caller should redirect using Next.js router.
}
