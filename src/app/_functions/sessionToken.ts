/**
 * Get the session token from localStorage
 * @returns The session token from localStorage, or empty string if not found
 * @example
 * ```typescript
 * const response = await fetch(`${getApiHost()}/patient`, {
 *   headers: {
 *     'session-token': getSessionToken(),
 *   }
 * })
 * ```
 */
export function getSessionToken(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return ''
  }

  return window.localStorage.getItem('session-token') ?? ''
}
