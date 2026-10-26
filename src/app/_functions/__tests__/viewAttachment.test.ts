import {
  viewAttachment,
  downloadAttachment,
  getMimeTypeFromFilename,
  resolveAttachmentFilename,
  isMimeTypeViewable,
} from '../viewAttachment'

describe('viewAttachment helper functions', () => {
  test('getMimeTypeFromFilename returns proper MIME type based on extension', () => {
    expect(getMimeTypeFromFilename('receipt.pdf')).toBe('application/pdf')
    expect(getMimeTypeFromFilename('image.jpeg')).toBe('image/jpeg')
    expect(getMimeTypeFromFilename('image.jpg')).toBe('image/jpeg')
    expect(getMimeTypeFromFilename('IMAGE.PNG')).toBe('image/png')
    expect(getMimeTypeFromFilename('photo.heic')).toBe('image/heic')
    expect(getMimeTypeFromFilename('photo.HEIF')).toBe('image/heif')
    expect(getMimeTypeFromFilename('no_ext')).toBeUndefined()
    expect(getMimeTypeFromFilename('')).toBeUndefined()
    expect(getMimeTypeFromFilename(undefined)).toBeUndefined()
  })

  test('resolveAttachmentFilename preserves or derives proper extension', () => {
    expect(resolveAttachmentFilename('uploads/doc.pdf')).toBe('doc.pdf')
    expect(
      resolveAttachmentFilename('uploads/doc.pdf', 'custom_name.pdf')
    ).toBe('custom_name.pdf')
    // When filename has no extension but content type header is provided
    expect(
      resolveAttachmentFilename(
        'uploads/doc_no_ext',
        undefined,
        'application/pdf'
      )
    ).toBe('doc_no_ext.pdf')
    expect(
      resolveAttachmentFilename(
        'uploads/photo_no_ext',
        undefined,
        'image/jpeg; charset=utf-8'
      )
    ).toBe('photo_no_ext.jpg')
    expect(
      resolveAttachmentFilename('uploads/img_no_ext', undefined, 'image/png')
    ).toBe('img_no_ext.png')
    // Fallback when empty
    expect(resolveAttachmentFilename('', '', null)).toBe('attachment')
  })

  test('isMimeTypeViewable correctly identifies inline browser viewable formats', () => {
    expect(isMimeTypeViewable('application/pdf')).toBe(true)
    expect(isMimeTypeViewable('image/jpeg')).toBe(true)
    expect(isMimeTypeViewable('image/png')).toBe(true)
    expect(isMimeTypeViewable('image/webp')).toBe(true)
    expect(isMimeTypeViewable('image/heic')).toBe(false)
    expect(isMimeTypeViewable('image/heif')).toBe(false)
    expect(isMimeTypeViewable('application/octet-stream')).toBe(false)
    expect(isMimeTypeViewable(undefined)).toBe(false)
  })
})

describe('viewAttachment', () => {
  const originalFetch = global.fetch
  const originalOpen = window.open
  const originalAlert = window.alert
  const originalCreateObjectURL = URL.createObjectURL
  const originalRevokeObjectURL = URL.revokeObjectURL

  beforeEach(() => {
    window.localStorage.clear()
    window.open = jest
      .fn()
      .mockReturnValue({ focus: jest.fn(), document: { title: '' } })
    window.alert = jest.fn()
    URL.createObjectURL = jest
      .fn()
      .mockReturnValue('blob:http://localhost/1234')
    URL.revokeObjectURL = jest.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    window.open = originalOpen
    window.alert = originalAlert
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  test('returns undefined when path is empty or undefined', async () => {
    expect(await viewAttachment()).toBeUndefined()
    expect(await viewAttachment('')).toBeUndefined()
  })

  test('handles data: URLs directly without fetch', async () => {
    const dataUri = 'data:image/png;base64,mockdata'
    const result = await viewAttachment(dataUri)
    expect(result).toBe(dataUri)
    expect(window.open).toHaveBeenCalledWith(
      dataUri,
      '_blank',
      'noopener,noreferrer'
    )
  })

  test('fetches attachment with session-token header and creates blob URL with correct mime and title', async () => {
    window.localStorage.setItem('session-token', 'my-auth-token')

    const mockBlob = new Blob(['sample pdf content'], {
      type: 'application/pdf',
    })
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/pdf' }),
      blob: jest.fn().mockResolvedValue(mockBlob),
    })

    const result = await viewAttachment(
      'uploads/attachments/receipt.pdf',
      'receipt.pdf'
    )

    expect(global.fetch).toHaveBeenCalledWith(
      'https://localhost:19091/uploads/attachments/receipt.pdf',
      {
        method: 'GET',
        headers: {
          'session-token': 'my-auth-token',
          Authorization: 'Bearer my-auth-token',
        },
        credentials: 'include',
      }
    )

    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(window.open).toHaveBeenCalledWith(
      'blob:http://localhost/1234',
      '_blank',
      'noopener,noreferrer'
    )
    expect(result).toBe('blob:http://localhost/1234')
  })

  test('falls back to element click with link.download set to resolved filename when window.open is blocked', async () => {
    window.localStorage.setItem('session-token', 'my-auth-token')
    window.open = jest.fn().mockReturnValue(null) // Popup blocked

    let downloadedFilename = ''
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloadedFilename = this.download
      })

    const mockBlob = new Blob(['content'])
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/pdf' }),
      blob: jest.fn().mockResolvedValue(mockBlob),
    })

    await viewAttachment('uploads/attachments/doc.pdf', 'doc.pdf')

    expect(clickSpy).toHaveBeenCalled()
    expect(downloadedFilename).toBe('doc.pdf')
    clickSpy.mockRestore()
  })

  test('downloads directly with proper extension for non-inline formats like HEIC', async () => {
    window.localStorage.setItem('session-token', 'my-auth-token')

    let downloadedFilename = ''
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloadedFilename = this.download
      })

    const mockBlob = new Blob(['heic image data'])
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/octet-stream' }),
      blob: jest.fn().mockResolvedValue(mockBlob),
    })

    await viewAttachment(
      'storage/attachments/1789804751290697328_IMG_2811.HEIC'
    )

    // Since HEIC cannot be viewed inline, it should download with full extension
    expect(downloadedFilename).toBe('1789804751290697328_IMG_2811.HEIC')
    clickSpy.mockRestore()
  })

  test('resolves filename extension from content-type header when path is missing extension', async () => {
    window.localStorage.setItem('session-token', 'my-auth-token')
    window.open = jest.fn().mockReturnValue(null)

    let downloadedFilename = ''
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloadedFilename = this.download
      })

    const mockBlob = new Blob(['pdf binary content'])
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/pdf' }),
      blob: jest.fn().mockResolvedValue(mockBlob),
    })

    await viewAttachment('storage/attachments/raw_invoice_without_ext')

    expect(downloadedFilename).toBe('raw_invoice_without_ext.pdf')
    clickSpy.mockRestore()
  })

  test('handles HTTP errors gracefully and shows alert', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    })

    const result = await viewAttachment('uploads/attachments/secret.pdf')
    expect(result).toBeUndefined()
    expect(window.alert).toHaveBeenCalledWith(
      'Gagal memuat lampiran. Pastikan sesi Anda aktif.'
    )
  })

  test('revokes object URL after timeout', async () => {
    jest.useFakeTimers()
    const mockBlob = new Blob(['content'])
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/pdf' }),
      blob: jest.fn().mockResolvedValue(mockBlob),
    })

    await viewAttachment('uploads/attachments/test.pdf')
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()

    jest.advanceTimersByTime(60000)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(
      'blob:http://localhost/1234'
    )
  })
})

describe('downloadAttachment', () => {
  const originalFetch = global.fetch
  const originalAlert = window.alert
  const originalCreateObjectURL = URL.createObjectURL
  const originalRevokeObjectURL = URL.revokeObjectURL

  beforeEach(() => {
    window.localStorage.clear()
    window.alert = jest.fn()
    URL.createObjectURL = jest
      .fn()
      .mockReturnValue('blob:http://localhost/download-blob')
    URL.revokeObjectURL = jest.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    window.alert = originalAlert
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    jest.clearAllMocks()
  })

  test('does nothing when path is undefined or empty', async () => {
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click')
    await downloadAttachment()
    await downloadAttachment('')
    expect(clickSpy).not.toHaveBeenCalled()
    clickSpy.mockRestore()
  })

  test('handles data: URLs directly and sets download attribute with extension', async () => {
    let downloadedFilename = ''
    let href = ''
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloadedFilename = this.download
        href = this.href
      })

    const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE='
    await downloadAttachment(dataUri, 'my_receipt')

    expect(clickSpy).toHaveBeenCalled()
    expect(downloadedFilename).toBe('my_receipt.png')
    expect(href).toBe('blob:http://localhost/download-blob')
    expect(URL.createObjectURL).toHaveBeenCalled()
    clickSpy.mockRestore()
  })

  test('downloads remote attachment setting link.download to resolved filename with extension', async () => {
    window.localStorage.setItem('session-token', 'valid-token')

    let downloadedFilename = ''
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloadedFilename = this.download
      })

    const mockBlob = new Blob(['sample receipt content'])
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'image/jpeg' }),
      blob: jest.fn().mockResolvedValue(mockBlob),
    })

    await downloadAttachment('storage/attachments/receipt_2026.jpg')

    expect(global.fetch).toHaveBeenCalledWith(
      'https://localhost:19091/storage/attachments/receipt_2026.jpg',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'session-token': 'valid-token',
          Authorization: 'Bearer valid-token',
        },
      })
    )

    expect(clickSpy).toHaveBeenCalled()
    expect(downloadedFilename).toBe('receipt_2026.jpg')
    clickSpy.mockRestore()
  })

  test('alerts on download error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    await downloadAttachment('storage/attachments/err.pdf')
    expect(window.alert).toHaveBeenCalledWith(
      'Gagal mengunduh lampiran. Pastikan sesi Anda aktif.'
    )
  })
})
