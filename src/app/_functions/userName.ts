import { useSyncExternalStore } from 'react'

/**
 * Get the current user's name from localStorage
 * @returns The user name string or null if not found
 * @example
 * ```typescript
 * const name = getUserName()
 * ```
 */
export function getUserName(): string | null {
  if (typeof window !== 'undefined') {
    const name = localStorage.getItem('user-name')
    if (!name) return null
    return name.trim()
  }
  return null
}

/**
 * Set or clear the current user's name in localStorage and notify listeners
 * @param name - The user name to store, or null/undefined to clear
 */
export function setUserName(name: string | null | undefined): void {
  if (typeof window === 'undefined') return
  if (name && name.trim()) {
    localStorage.setItem('user-name', name.trim())
  } else {
    localStorage.removeItem('user-name')
  }
  window.dispatchEvent(new Event('user-name-change'))
  window.dispatchEvent(new Event('storage'))
}

const subscribeUserName = (callback: () => void) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', callback)
    window.addEventListener('user-name-change', callback)
    return () => {
      window.removeEventListener('storage', callback)
      window.removeEventListener('user-name-change', callback)
    }
  }
  return () => {}
}

const getServerSnapshot = () => null

/**
 * React hook to reactively subscribe to the logged-in user's name.
 */
export function useUserName(): string | null {
  return useSyncExternalStore(subscribeUserName, getUserName, getServerSnapshot)
}
