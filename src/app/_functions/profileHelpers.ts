import { getUserId } from './userId'
import { fetchCurrentUserId } from './fetchCurrentUser'
import { verifyPassword } from './verifyPassword'
import { apiFetch } from '@/app/_functions/apiFetch'
import { UnauthorizedAccess } from '@/app/_functions/unauthorized'

export async function resolveUserId(): Promise<string | null> {
  let userId = getUserId()

  if (!userId) {
    const fetched = await fetchCurrentUserId()
    if (fetched) {
      userId = fetched
      try {
        localStorage.setItem('user-id', String(fetched))
      } catch {}
    }
  }

  return userId ?? null
}

export function parseUserSource(json: any) {
  return json?.data?.user ?? json?.data ?? json?.user ?? json
}

export function isPasswordError(serverMsg: string) {
  const m = serverMsg || ''
  return m.includes('current') || m.includes('incorrect')
}

export async function tryVerifyCurrentPassword(
  currentPassword: string
): Promise<{ available: boolean; verified?: boolean }> {
  try {
    const vp = await verifyPassword(currentPassword)
    return { available: Boolean(vp.available), verified: Boolean(vp.verified) }
  } catch (err) {
    return { available: false }
  }
}

export function validatePasswordFields(
  changingPassword: boolean,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): { ok: boolean; error?: string } {
  if (!changingPassword) return { ok: true }

  if (!currentPassword || !newPassword || !confirmPassword) {
    return {
      ok: false,
      error:
        'To change your password, fill all password fields or leave them all empty',
    }
  }

  if (newPassword.length < 8) {
    return { ok: false, error: 'New password must be at least 8 characters' }
  }

  if (newPassword !== confirmPassword) {
    return { ok: false, error: 'New password and confirmation do not match' }
  }

  const strongPwd = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/
  if (!strongPwd.test(newPassword)) {
    return {
      ok: false,
      error:
        'Password must include uppercase, lowercase, number, and special character',
    }
  }

  return { ok: true }
}

export function navigateAfterSuccess(router: any) {
  try {
    const isE2E =
      typeof window !== 'undefined' &&
      window.localStorage.getItem('__E2E_TEST__') === '1'
    if (!isE2E) {
      router.push('/dashboard')
    }
  } catch (err) {
    if (typeof window !== 'undefined') window.location.href = '/dashboard'
  }
}

export async function fetchUserProfile(
  USER_ENDPOINT: string,
  router: any
): Promise<
  { name?: string; email?: string } | { error: string } | { unauthorized: true }
> {
  try {
    const userId = await resolveUserId()
    if (!userId) return { error: 'Unable to determine current user' }

    const res = await apiFetch(`${USER_ENDPOINT}/${userId}`)

    if (res.status === 401) {
      UnauthorizedAccess(router)
      return { unauthorized: true }
    }

    if (!res.ok) {
      return { error: `HTTP ${res.status}` }
    }

    const json = await res.json()
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

export async function submitProfileUpdate(
  UPDATE_PROFILE_ENDPOINT: string,
  body: Record<string, unknown>,
  changingPasswordFlag: boolean,
  router: any
): Promise<
  { success: true } | { success: false; error?: string; pwError?: string }
> {
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
      const serverMsg = (j?.message || '').toString().toLowerCase()
      if (changingPasswordFlag && isPasswordError(serverMsg)) {
        return { success: false, pwError: 'Current password is incorrect' }
      }

      return { success: false, error: j?.message || 'Failed to update profile' }
    }

    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Network error while updating profile' }
  }
}
