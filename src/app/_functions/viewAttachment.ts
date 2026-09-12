import { getAttachmentUrl } from './apiHost'
import { getSessionToken } from './sessionToken'

/**
 * Fetches an attachment using authenticated HTTP headers and opens it via Blob URL.
 * This ensures no session tokens are leaked in the URL query string, logs, or browser history.
 *
 * @param path Relative or absolute path to the attachment
 * @param filename Optional filename for download fallback
 * @returns The generated Blob URL if successful
 */
export async function viewAttachment(
  path?: string,
  filename?: string
): Promise<string | undefined> {
  if (!path) return undefined

  // For data URLs (e.g. preview before upload), open directly
  if (path.startsWith('data:')) {
    if (typeof window !== 'undefined' && window.open) {
      window.open(path, '_blank', 'noopener,noreferrer')
    }
    return path
  }

  const url = getAttachmentUrl(path)
  const token = getSessionToken()
  const headers: Record<string, string> = {}
  if (token) {
    headers['session-token'] = token
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(
        `Failed to fetch attachment: ${response.status} ${response.statusText}`
      )
    }

    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    if (typeof window !== 'undefined') {
      const opened = window.open
        ? window.open(blobUrl, '_blank', 'noopener,noreferrer')
        : null
      if (!opened) {
        const link = document.createElement('a')
        link.href = blobUrl
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      // Revoke the object URL after 60s to free memory
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
      }, 60000)
    }

    return blobUrl
  } catch (error) {
    console.error('Failed to view attachment:', error)
    if (typeof window !== 'undefined' && window.alert) {
      window.alert('Gagal memuat lampiran. Pastikan sesi Anda aktif.')
    }
    return undefined
  }
}
