/**
 * Get the current user's role from localStorage
 * @returns The user role ('super_admin', 'therapist', etc.) or null if not found
 * @example
 * ```typescript
 * const role = getUserRole()
 * if (role === 'super_admin') {
 *   // Show admin features
 * }
 * ```
 */
export function getUserRole(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('user-role')
  }
  return null
}

/**
 * Check if the current user has the therapist role
 * @returns true if the user is a therapist, false otherwise
 * @example
 * ```typescript
 * if (isTherapist()) {
 *   // Show therapist-specific UI
 * }
 * ```
 */
export function isTherapist(): boolean {
  return getUserRole() === 'therapist'
}

/**
 * Check if the current user has the admin role
 * @returns true if the user is a super_admin, false otherwise
 * @example
 * ```typescript
 * if (isAdmin()) {
 *   // Show admin-specific features
 * }
 * ```
 */
export function isAdmin(): boolean {
  return getUserRole() === 'super_admin'
}
