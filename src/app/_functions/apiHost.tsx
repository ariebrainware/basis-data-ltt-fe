/**
 * Get the API host URL from environment variable or default
 * @returns The API host URL
 */
export function getApiHost(): string {
  return process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:19091'
}
