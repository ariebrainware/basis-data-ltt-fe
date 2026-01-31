/**
 * Get the API host URL from environment variable or default
 * @returns The API host URL from NEXT_PUBLIC_API_HOST environment variable, defaults to 'https://localhost:19091'
 * @example
 * ```typescript
 * const response = await fetch(`${getApiHost()}/patient/${id}`)
 * ```
 */
export function getApiHost(): string {
  const raw = process.env.NEXT_PUBLIC_API_HOST || 'https://localhost:19091'

  // Ensure the returned host includes a scheme so fetch() builds a valid URL
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw
  }

  // For localhost/127.0.0.1, default to HTTP for easier local development
  // (most developers don't have self-signed certificates set up)
  const isLocalhost =
    raw.toLowerCase().startsWith('localhost') ||
    raw.startsWith('127.0.0.1') ||
    raw.startsWith('[::1]')

  if (isLocalhost) {
    return `http://${raw}`
  }

  // For all other domains, default to HTTPS for security
  return `https://${raw}`
}
