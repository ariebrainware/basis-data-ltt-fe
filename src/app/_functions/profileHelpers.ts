import { apiFetch } from '@/app/_functions/apiFetch'
import { UnauthorizedAccess } from '@/app/_functions/unauthorized'
import { parseUserSource } from './userHelpers'
import { fetchCurrentUserId } from './fetchCurrentUser'

export function extractMessage(json: any): string {
  if (!json) return ''
  if (typeof json === 'string') return json
  if (json.message) return String(json.message)
  return ''
}

export async function resolveUserId(): Promise<string | null> {
  let userId: string | null = null
  if (typeof window !== 'undefined') {
    userId = localStorage.getItem('user-id')
  }

  if (!userId) {
    const fetched = await fetchCurrentUserId()
    if (fetched) {
      userId = String(fetched)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user-id', userId)
      }
    }
  }

  return userId
}

async function safeJson(resp: Response): Promise<any> {
  return resp.json().catch(() => null)
}

export class UnauthorizedError extends Error {}
export class HttpError extends Error {
  status: number
  constructor(status: number, message?: string) {
    super(message || `HTTP ${status}`)
    this.status = status
  }
}

export async function fetchUserSource(
  endpoint: string,
  userId: string
): Promise<any> {
  const resp = await apiFetch(`${endpoint}/${userId}`)
  if (resp.status === 401) {
    throw new UnauthorizedError('unauthorized')
  }

  if (!resp.ok) {
    throw new HttpError(resp.status)
  }

  const json = await safeJson(resp)
  return parseUserSource(json)
}

function mapProfile(source: any): { name?: string; email?: string } {
  return {
    name: typeof source?.name === 'string' ? source.name : undefined,
    email: typeof source?.email === 'string' ? source.email : undefined,
  }
}

function handleProfileError(
  error: unknown,
  router: any
): { error: string } | { unauthorized: true } {
  if (error instanceof UnauthorizedError) {
    UnauthorizedAccess(router)
    return { unauthorized: true }
  }
  if (error instanceof HttpError) {
    return { error: error.message }
  }
  console.error('fetchUserProfile unexpected error', error)
  return { error: 'Failed to load profile' }
}

export async function getProfileResult(opts: {
  endpoint: string
  router: any
}): Promise<
  { name?: string; email?: string } | { error: string } | { unauthorized: true }
> {
  const { endpoint, router } = opts

  const userId = await resolveUserId()
  if (!userId) return { error: 'Unable to determine current user' }

  try {
    const source = await fetchUserSource(endpoint, userId)
    return mapProfile(source)
  } catch (error) {
    return handleProfileError(error, router)
  }
}
