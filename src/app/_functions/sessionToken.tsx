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
  return localStorage.getItem('session-token') ?? ''
}
