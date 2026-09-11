import { useSyncExternalStore } from 'react'

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
    const role = localStorage.getItem('user-role')
    if (!role) return null
    const lower = role.toLowerCase().trim()
    if (lower === 'admin') return 'super_admin'
    return lower
  }
  return null
}

const subscribeUserRole = (callback: () => void) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', callback)
    window.addEventListener('user-role-change', callback)
    return () => {
      window.removeEventListener('storage', callback)
      window.removeEventListener('user-role-change', callback)
    }
  }
  return () => {}
}

const getServerSnapshot = () => null

/**
 * Hook to safely access the current user's role without SSR hydration mismatches.
 */
export function useUserRole(): string | null {
  return useSyncExternalStore(subscribeUserRole, getUserRole, getServerSnapshot)
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
