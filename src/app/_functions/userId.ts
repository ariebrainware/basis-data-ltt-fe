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
  // Guard against SSR / non-browser environments
  if (typeof window === 'undefined') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[getUserId] Called in a non-browser environment. Returning null user-id.'
      )
    }
    return null
  }

  const userId = localStorage.getItem('user-id')

  // In development, help diagnose issues where user-id is unexpectedly missing
  if (
    (userId === null || userId === '') &&
    process.env.NODE_ENV !== 'production'
  ) {
    console.warn(
      '[getUserId] No user-id found in localStorage. Users may be unable to perform actions that require a user ID (e.g., editing treatments).'
    )
  }

  return userId
}
