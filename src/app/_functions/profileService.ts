import { apiFetch } from '@/app/_functions/apiFetch'
import { UnauthorizedAccess } from '@/app/_functions/unauthorized'
import { extractMessage, getProfileResult } from './profileHelpers'
import { isPasswordError } from './passwordUtils'

export async function fetchUserProfile(opts: {
  endpoint: string
  router: any
}): Promise<
  { name?: string; email?: string } | { error: string } | { unauthorized: true }
> {
  return getProfileResult(opts)
}

export async function submitProfileUpdate(opts: {
  endpoint: string
  body: Record<string, unknown>
  changingPasswordFlag: boolean
  router: any
}): Promise<
  { success: true } | { success: false; error?: string; pwError?: string }
> {
  const {
    endpoint: UPDATE_PROFILE_ENDPOINT,
    body,
    changingPasswordFlag,
    router,
  } = opts
  try {
    const res = await apiFetch(UPDATE_PROFILE_ENDPOINT, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })

    if (res.status === 401) {
      UnauthorizedAccess(router)
      return { success: false, error: 'unauthorized' }
    }

    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      const serverMsg = extractMessage(j).toLowerCase()
      if (changingPasswordFlag && isPasswordError(serverMsg)) {
        return { success: false, pwError: 'Current password is incorrect' }
      }

      return {
        success: false,
        error: extractMessage(j) || 'Failed to update profile',
      }
    }

    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Network error while updating profile' }
  }
}
