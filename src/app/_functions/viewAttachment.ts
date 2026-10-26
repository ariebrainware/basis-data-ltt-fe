import { getAttachmentUrl } from './apiHost'
import { getSessionToken } from './sessionToken'

const EXTENSION_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  heic: 'image/heic',
  heif: 'image/heif',
  txt: 'text/plain',
  csv: 'text/csv',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

const MIME_TO_EXTENSION: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'text/plain': 'txt',
  'text/csv': 'csv',
}

// MIME types that standard web browsers can render inline in a tab
const INLINE_VIEWABLE_MIMES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'text/plain',
])

/**
 * Derives a MIME type from a given filename based on its extension.
 */
export function getMimeTypeFromFilename(filename?: string): string | undefined {
  if (!filename) return undefined
  const parts = filename.split('.')
  if (parts.length <= 1) return undefined
  const ext = parts.pop()?.toLowerCase()
  return ext ? EXTENSION_TO_MIME[ext] : undefined
}

/**
 * Resolves the final attachment filename, ensuring it retains or acquires
 * the proper file extension derived from the path, provided filename, or response content type.
 */
export function resolveAttachmentFilename(
  path?: string,
  filename?: string,
  contentType?: string | null
): string {
  let name = (filename || path?.split('/').pop() || 'attachment').trim()
  if (!name) name = 'attachment'

  const hasExt =
    name.includes('.') &&
    name.lastIndexOf('.') > 0 &&
    name.lastIndexOf('.') < name.length - 1

  if (!hasExt && contentType) {
    const cleanContentType = contentType.split(';')[0].trim().toLowerCase()
    const ext = MIME_TO_EXTENSION[cleanContentType]
    if (ext) {
      name = `${name}.${ext}`
    }
  }

  return name
}

/**
 * Checks if a MIME type can be previewed/rendered inline in modern web browsers.
 */
export function isMimeTypeViewable(mimeType?: string): boolean {
  if (!mimeType) return false
  const clean = mimeType.split(';')[0].trim().toLowerCase()
  return INLINE_VIEWABLE_MIMES.has(clean)
}

/**
 * Fetches an attachment using authenticated HTTP headers and opens it via Blob URL.
 * Preserves the file extension and proper MIME type so browsers render it inline
 * or save it with the correct extension.
 *
 * @param path Relative or absolute path to the attachment
 * @param filename Optional filename for download fallback and title
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
    const contentType =
      typeof response.headers?.get === 'function'
        ? response.headers.get('content-type')
        : null
    const resolvedFilename = resolveAttachmentFilename(
      path,
      filename,
      contentType
    )
    const mimeType =
      getMimeTypeFromFilename(resolvedFilename) ||
      (blob.type && blob.type !== 'application/octet-stream'
        ? blob.type
        : '') ||
      'application/octet-stream'

    let fileBlob: Blob
    try {
      fileBlob =
        typeof File !== 'undefined'
          ? new File([blob], resolvedFilename, { type: mimeType })
          : new Blob([blob], { type: mimeType })
    } catch {
      fileBlob =
        blob.type === mimeType ? blob : new Blob([blob], { type: mimeType })
    }

    const blobUrl = URL.createObjectURL(fileBlob)

    if (typeof window !== 'undefined') {
      const isInline = isMimeTypeViewable(mimeType)
      let opened: Window | null = null

      if (isInline && window.open) {
        opened = window.open(blobUrl, '_blank', 'noopener,noreferrer')
        if (opened && typeof opened === 'object') {
          try {
            opened.document.title = resolvedFilename
          } catch {
            // Ignore potential cross-origin / iframe restrictions
          }
        }
      }

      // If opening in tab failed/blocked, or format cannot be displayed inline (e.g. HEIC, docx), download with extension
      if (!opened) {
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = resolvedFilename
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

/**
 * Converts a data URL to a Blob object.
 */
function dataUriToBlob(dataUri: string): { blob: Blob; mimeType?: string } {
  const [header, base64Data] = dataUri.split(',')
  const mimeMatch = header?.match(/^data:([^;,]+)/)
  const mimeType = mimeMatch ? mimeMatch[1] : undefined

  if (base64Data !== undefined) {
    const isBase64 = header.includes(';base64')
    const byteString = isBase64
      ? atob(base64Data)
      : decodeURIComponent(base64Data)
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    return {
      blob: new Blob([ia], { type: mimeType || 'application/octet-stream' }),
      mimeType,
    }
  }

  return {
    blob: new Blob([], { type: mimeType || 'application/octet-stream' }),
    mimeType,
  }
}

/**
 * Fetches an attachment using authenticated HTTP headers and triggers a direct browser download,
 * guaranteeing the file is saved with its proper name and file extension.
 *
 * @param path Relative or absolute path to the attachment
 * @param filename Optional filename for the downloaded file
 */
export async function downloadAttachment(
  path?: string,
  filename?: string
): Promise<void> {
  if (!path) return

  try {
    // Handle data URLs directly by converting to Blob URL (avoids DOM XSS / HTML reinterpretation)
    if (path.startsWith('data:')) {
      if (typeof window === 'undefined') return
      const { blob, mimeType } = dataUriToBlob(path)
      const resolvedFilename = resolveAttachmentFilename(
        undefined,
        filename,
        mimeType
      )

      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = resolvedFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
      }, 60000)
      return
    }

    const url = getAttachmentUrl(path)
    if (!url) {
      throw new Error('Invalid attachment URL')
    }

    const token = getSessionToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['session-token'] = token
      headers['Authorization'] = `Bearer ${token}`
    }

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
    const contentType =
      typeof response.headers?.get === 'function'
        ? response.headers.get('content-type')
        : null
    const resolvedFilename = resolveAttachmentFilename(
      path,
      filename,
      contentType
    )
    const mimeType =
      getMimeTypeFromFilename(resolvedFilename) ||
      (blob.type && blob.type !== 'application/octet-stream'
        ? blob.type
        : '') ||
      'application/octet-stream'

    let fileBlob: Blob
    try {
      fileBlob =
        typeof File !== 'undefined'
          ? new File([blob], resolvedFilename, { type: mimeType })
          : new Blob([blob], { type: mimeType })
    } catch {
      fileBlob =
        blob.type === mimeType ? blob : new Blob([blob], { type: mimeType })
    }

    const blobUrl = URL.createObjectURL(fileBlob)

    if (typeof window !== 'undefined') {
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = resolvedFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
      }, 60000)
    }
  } catch (error) {
    console.error('Failed to download attachment:', error)
    if (typeof window !== 'undefined' && window.alert) {
      window.alert('Gagal mengunduh lampiran. Pastikan sesi Anda aktif.')
    }
  }
}
