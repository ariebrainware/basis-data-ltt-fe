import {
  UnauthorizedError,
  deleteEmployeeAttachment,
  employeeAttachmentPath,
  formatFileSize,
  listEmployeeAttachments,
  uploadEmployeeAttachment,
  validateEmployeeAttachmentFile,
} from '../employeeAttachmentService'
import { apiFetch } from '../apiFetch'

jest.mock('../apiFetch', () => ({ apiFetch: jest.fn() }))
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

function fileOf(name: string, size: number): File {
  const file = new File(['x'], name)
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('employeeAttachmentService', () => {
  beforeEach(() => mockApiFetch.mockReset())

  it('builds attachment paths', () => {
    expect(employeeAttachmentPath(7)).toBe('/employee/7/attachment')
    expect(employeeAttachmentPath('7', 3)).toBe('/employee/7/attachment/3')
  })

  it('validates file type and size', () => {
    expect(validateEmployeeAttachmentFile(fileOf('kontrak.PDF', 10))).toBeNull()
    expect(validateEmployeeAttachmentFile(fileOf('ktp.heic', 10))).toBeNull()
    expect(validateEmployeeAttachmentFile(fileOf('cv.docx', 10))).toMatch(
      /tidak didukung/
    )
    expect(validateEmployeeAttachmentFile(fileOf('noext', 10))).toMatch(
      /tidak didukung/
    )
    expect(validateEmployeeAttachmentFile(fileOf('a.pdf', 0))).toMatch(/kosong/)
    expect(
      validateEmployeeAttachmentFile(fileOf('a.pdf', 5 * 1024 * 1024 + 1))
    ).toMatch(/5MB/)
  })

  it('formats file sizes', () => {
    expect(formatFileSize(0)).toBe('0 B')
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(2048)).toBe('2.0 KB')
    expect(formatFileSize(3 * 1024 * 1024)).toBe('3.0 MB')
  })

  it('lists attachments', async () => {
    mockApiFetch.mockResolvedValue(
      jsonResponse(200, { data: [{ ID: 1, file_name: 'a.pdf' }] })
    )
    await expect(listEmployeeAttachments(4)).resolves.toEqual([
      { ID: 1, file_name: 'a.pdf' },
    ])
    expect(mockApiFetch).toHaveBeenCalledWith('/employee/4/attachment', {
      method: 'GET',
    })
  })

  it('uploads as multipart form data with category', async () => {
    mockApiFetch.mockResolvedValue(jsonResponse(200, { data: { ID: 9 } }))
    const file = fileOf('kontrak.pdf', 10)
    await expect(
      uploadEmployeeAttachment(4, file, 'contract')
    ).resolves.toEqual({ ID: 9 })

    const [path, init] = mockApiFetch.mock.calls[0]
    expect(path).toBe('/employee/4/attachment')
    expect(init?.method).toBe('POST')
    const body = init?.body as FormData
    expect(body).toBeInstanceOf(FormData)
    expect(body.get('category')).toBe('contract')
    expect((body.get('file') as File).name).toBe('kontrak.pdf')
  })

  it('surfaces the API error message', async () => {
    mockApiFetch.mockResolvedValue(
      jsonResponse(400, { msg: 'Invalid file type' })
    )
    await expect(
      uploadEmployeeAttachment(4, fileOf('a.pdf', 1), 'other')
    ).rejects.toThrow('Invalid file type')
  })

  it('throws UnauthorizedError on 401', async () => {
    mockApiFetch.mockResolvedValue(jsonResponse(401, {}))
    await expect(deleteEmployeeAttachment(4, 1)).rejects.toBeInstanceOf(
      UnauthorizedError
    )
    expect(mockApiFetch).toHaveBeenCalledWith('/employee/4/attachment/1', {
      method: 'DELETE',
    })
  })
})
