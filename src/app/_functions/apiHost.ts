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

/**
 * Safely parses an attachment path value (which could be an array, comma-separated string,
 * or JSON array string) into a list of cleaned file paths.
 * @param raw The raw attachment path value
 * @returns Array of individual attachment file paths
 */
export function parseAttachmentPaths(raw?: string | string[] | null): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw
      .map((s) => (typeof s === 'string' ? s.trim() : String(s).trim()))
      .filter(Boolean)
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return []
    // Handle JSON string format e.g. '["path1", "path2"]'
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          return parsed
            .map((s) => (typeof s === 'string' ? s.trim() : String(s).trim()))
            .filter(Boolean)
        }
      } catch {
        // fallback
      }
    }
    // Handle comma-separated paths: split on commas supporting various path formats
    return trimmed
      .split(
        /,(?=\/?(?:uploads|storage|private_uploads)\/|https?:\/\/|[A-Za-z0-9_-]+\.[a-zA-Z0-9]+)/
      )
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

/**
 * Resolves the full URL for an attachment path.
 * @param path The relative or absolute attachment path (e.g. 'uploads/attachments/xyz.pdf', 'storage/attachments/xyz.pdf')
 * @returns The resolved URL or empty string.
 */
export function getAttachmentUrl(path?: string): string {
  if (!path) return ''
  const trimmed = path.trim()
  if (!trimmed) return ''

  // Data URLs: return directly
  if (trimmed.startsWith('data:')) {
    return trimmed
  }

  // Absolute URL: only allow HTTP(S)
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    try {
      const parsed = new URL(trimmed)
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString()
      }
      return ''
    } catch {
      return ''
    }
  }

  // Relative path: resolve against API host
  const host = getApiHost()
  let cleanPath = trimmed.replace(/^\.\//, '')
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`
  }
  try {
    return new URL(cleanPath, host).toString()
  } catch {
    return `${host}${cleanPath}`
  }
}
