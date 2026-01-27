import { getUserId } from './userId'
import { fetchCurrentUserId } from './fetchCurrentUser'
import { verifyPassword } from './verifyPassword'

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
  if (!json) return json
  if (json.data && typeof json.data === 'object') {
    if (json.data.user) return json.data.user
    return json.data
  }
  if (json.user) return json.user
  return json
}

export async function tryVerifyCurrentPassword(currentPassword: string) {
  try {
    const vp = await verifyPassword(currentPassword)
    return {
     
     ,
   
      available: Boolean(vp?.available),
      verified: Boolean(vp?.verified),
    }
  } catch (err) {
    return { available: false }
  }
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
