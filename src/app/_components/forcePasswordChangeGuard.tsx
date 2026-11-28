'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  CHANGE_PASSWORD_ROUTE,
  clearMustChangePassword,
  mustChangePassword,
  shouldRedirectToChangePassword,
} from '../_functions/defaultPassword'
import { getSessionToken } from '../_functions/sessionToken'

/**
 * Keeps users that still use the default password on the change-password
 * page until they set a new password.
 */
export default function ForcePasswordChangeGuard() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!mustChangePassword()) return
    if (!getSessionToken()) {
      // Stale flag without a session: nothing to enforce.
      clearMustChangePassword()
      return
    }
    if (shouldRedirectToChangePassword(pathname)) {
      router.replace(CHANGE_PASSWORD_ROUTE)
    }
  }, [pathname, router])

  return null
}
