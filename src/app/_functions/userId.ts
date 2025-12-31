/**
 * Get the current user's ID from localStorage
 * @returns The user ID as a string or null if not found
 * @example
 * ```typescript
 * const userId = getUserId()
 * if (userId) {
 *   // Use user ID for API calls
 * }
 * ```
 */
export function getUserId(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('user-id')
  }
  return null
}
