import { apiFetch } from './apiFetch'
import {
  EmployeeAttachmentCategory,
  EmployeeAttachmentType,
  EmployeeType,
} from '../_types/employee'

export const EMPLOYEE_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024
export const EMPLOYEE_ATTACHMENT_EXTENSIONS = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.heic',
]
export const EMPLOYEE_ATTACHMENT_ACCEPT =
  EMPLOYEE_ATTACHMENT_EXTENSIONS.join(',')

/** Thrown when the API responds 401 so callers can redirect to login. */
export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json()
    return body?.msg || body?.error || fallback
  } catch {
    return fallback
  }
}

async function ensureOk(res: Response, fallback: string): Promise<void> {
  if (res.status === 401) throw new UnauthorizedError()
  if (!res.ok) throw new Error(await readError(res, fallback))
}

export function employeeAttachmentPath(
  employeeId: number | string,
  attachmentId?: number
): string {
  const base = `/employee/${encodeURIComponent(String(employeeId))}/attachment`
  return attachmentId === undefined ? base : `${base}/${attachmentId}`
}

/** Returns an Indonesian error message, or null when the file is acceptable. */
export function validateEmployeeAttachmentFile(file: File): string | null {
  const name = file.name.toLowerCase()
  const dot = name.lastIndexOf('.')
  const ext = dot >= 0 ? name.slice(dot) : ''
  if (!EMPLOYEE_ATTACHMENT_EXTENSIONS.includes(ext)) {
    return 'Format file tidak didukung. Gunakan PDF, JPG, PNG, atau HEIC.'
  }
  if (file.size === 0) {
    return 'File kosong tidak dapat diunggah.'
  }
  if (file.size > EMPLOYEE_ATTACHMENT_MAX_BYTES) {
    return 'Ukuran file melebihi batas 5MB.'
  }
  return null
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export async function fetchEmployee(
  employeeId: number | string
): Promise<EmployeeType> {
  const res = await apiFetch(
    `/employee/${encodeURIComponent(String(employeeId))}`,
    { method: 'GET' }
  )
  await ensureOk(res, 'Gagal memuat data karyawan.')
  const body = await res.json()
  return body?.data as EmployeeType
}

export async function listEmployeeAttachments(
  employeeId: number | string
): Promise<EmployeeAttachmentType[]> {
  const res = await apiFetch(employeeAttachmentPath(employeeId), {
    method: 'GET',
  })
  await ensureOk(res, 'Gagal memuat dokumen karyawan.')
  const body = await res.json()
  return Array.isArray(body?.data) ? body.data : []
}

export async function uploadEmployeeAttachment(
  employeeId: number | string,
  file: File,
  category: EmployeeAttachmentCategory
): Promise<EmployeeAttachmentType> {
  const form = new FormData()
  form.append('file', file, file.name)
  form.append('category', category)
  const res = await apiFetch(employeeAttachmentPath(employeeId), {
    method: 'POST',
    body: form,
  })
  await ensureOk(res, 'Gagal mengunggah dokumen.')
  const body = await res.json()
  return body?.data as EmployeeAttachmentType
}

export async function deleteEmployeeAttachment(
  employeeId: number | string,
  attachmentId: number
): Promise<void> {
  const res = await apiFetch(employeeAttachmentPath(employeeId, attachmentId), {
    method: 'DELETE',
  })
  await ensureOk(res, 'Gagal menghapus dokumen.')
}
