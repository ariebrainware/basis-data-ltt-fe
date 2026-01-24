import { getApiHost } from './apiHost'
import { getSessionToken } from './sessionToken'

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

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
    Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
    'session-token': getSessionToken(),
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
