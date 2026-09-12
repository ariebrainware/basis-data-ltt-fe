import { viewAttachment } from '../viewAttachment'

describe('viewAttachment', () => {
  const originalFetch = global.fetch
  const originalOpen = window.open
  const originalAlert = window.alert
  const originalCreateObjectURL = URL.createObjectURL
  const originalRevokeObjectURL = URL.revokeObjectURL

  beforeEach(() => {
    window.localStorage.clear()
    window.open = jest.fn().mockReturnValue({ focus: jest.fn() })
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

  test('fetches attachment with session-token header and creates blob URL', async () => {
    window.localStorage.setItem('session-token', 'my-auth-token')

    const mockBlob = new Blob(['sample pdf content'], {
      type: 'application/pdf',
    })
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
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

    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob)
    expect(window.open).toHaveBeenCalledWith(
      'blob:http://localhost/1234',
      '_blank',
      'noopener,noreferrer'
    )
    expect(result).toBe('blob:http://localhost/1234')
  })

  test('falls back to element click when window.open is blocked', async () => {
    window.localStorage.setItem('session-token', 'my-auth-token')
    window.open = jest.fn().mockReturnValue(null) // Popup blocked

    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click')
    const mockBlob = new Blob(['content'])
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: jest.fn().mockResolvedValue(mockBlob),
    })

    await viewAttachment('uploads/attachments/doc.pdf', 'doc.pdf')

    expect(clickSpy).toHaveBeenCalled()
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
