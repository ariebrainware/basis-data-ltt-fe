/**
 * Get the API host URL from environment variable or default
 * @returns The API host URL from NEXT_PUBLIC_API_HOST environment variable, defaults to 'http://localhost:19091'
 * @example
 * ```typescript
 * const response = await fetch(`${getApiHost()}/patient/${id}`)
 * ```
 */
export function getApiHost(): string {
  return process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:19091'
}
