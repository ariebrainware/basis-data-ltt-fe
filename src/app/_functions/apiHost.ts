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

  return `http://${raw}`
}
