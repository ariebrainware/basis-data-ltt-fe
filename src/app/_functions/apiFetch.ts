import { getApiHost } from './apiHost'
import { getSessionToken } from './sessionToken'

const PUBLIC_AUTH_PATHS = new Set(['/login', '/register'])

function isPublicAuthPath(path: string): boolean {
  // Only inspect relative app API paths; absolute URLs may be third-party.
  if (path.startsWith('http://') || path.startsWith('https://')) return false

  const normalized = path.startsWith('/') ? path : `/${path}`
  const pathOnly = normalized.split('?')[0]
  return PUBLIC_AUTH_PATHS.has(pathOnly)
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  const out: Record<string, string> = {}
  if (!headers) return out
  if (headers instanceof Headers) {
    headers.forEach((v, k) => (out[k] = v))
  } else if (Array.isArray(headers)) {
    headers.forEach(([k, v]) => (out[k] = String(v)))
  } else {
    Object.assign(out, headers as Record<string, string>)
  }
  return out
}

export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${getApiHost()}${path}`
  const sessionToken = getSessionToken()
  const allowAuthHeaders = !isPublicAuthPath(path)

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
  }

  if (allowAuthHeaders && sessionToken) {
    defaultHeaders['session-token'] = sessionToken
  }

  const incoming = normalizeHeaders(init.headers)
  const headers: Record<string, string> = { ...defaultHeaders, ...incoming }

  // If body exists and no content-type set, assume JSON
  if (
    init.body &&
    !Object.keys(headers).some((k) => k.toLowerCase() === 'content-type')
  ) {
    headers['Content-Type'] = 'application/json'
  }

  return fetch(url, { ...init, headers })
}
