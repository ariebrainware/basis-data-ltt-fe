import { apiFetch } from '@/app/_functions/apiFetch'
import { UnauthorizedAccess } from '@/app/_functions/unauthorized'
import { parseUserSource } from './userHelpers'
import { isPasswordError } from './passwordUtils'

function extractMessage(json: any): string {
  if (!json) return ''
  if (typeof json === 'string') return json
  if (json.message) return String(json.message)
  return ''
}

export async function fetchUserProfile(opts: {
  endpoint: string
  router: any
}): Promise<
  { name?: string; email?: string } | { error: string } | { unauthorized: true }
> {
  const { endpoint: USER_ENDPOINT, router } = opts
  try {
    const userIdResp = await apiFetch(`${USER_ENDPOINT}`)
    // The caller should resolve user id; keep this minimal and let higher layers decide
    if (!userIdResp.ok) return { error: `HTTP ${userIdResp.status}` }
    const json = await userIdResp.json().catch(() => null)
    const source = parseUserSource(json)
    return {
      name: typeof source?.name === 'string' ? source.name : undefined,
      email: typeof source?.email === 'string' ? source.email : undefined,
    }
  } catch (err) {
    console.error('fetchUserProfile error', err)
    return { error: 'Failed to load profile' }
  }
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
