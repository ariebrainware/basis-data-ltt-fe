import { getApiHost } from './apiHost'
import { getSessionToken } from './sessionToken'
import { UnauthorizedAccess } from './unauthorized'

export async function verifyPassword(password: string): Promise<{
  available: boolean
  verified?: boolean
  status: number
  message?: string
}> {
  try {
    const endpoint =
      process.env.NEXT_PUBLIC_VERIFY_PASSWORD_ENDPOINT || '/verify-password'
    const params = new URLSearchParams({ password })
    const res = await fetch(`${getApiHost()}${endpoint}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
        'session-token': getSessionToken(),
      },
    })

    if (res.status === 401) {
      UnauthorizedAccess()
      return { available: false, status: 401 }
    }

    if (res.status === 404) {
      return { available: false, status: 404 }
    }

    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      return { available: false, status: res.status, message: j?.message }
    }

    const j = await res.json().catch(() => ({}))
    const verified =
      typeof j?.verified === 'boolean'
        ? j.verified
        : (j?.data?.verified ?? true)

    return { available: true, verified, status: res.status }
  } catch (err) {
    return { available: false, status: 0, message: (err as Error).message }
  }
}
