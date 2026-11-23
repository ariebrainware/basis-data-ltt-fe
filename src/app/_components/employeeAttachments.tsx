'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import {
  ArrowDownTrayIcon,
  DocumentIcon,
  EyeIcon,
  PhotoIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import {
  EMPLOYEE_ATTACHMENT_CATEGORY_LABELS,
  EmployeeAttachmentCategory,
  EmployeeAttachmentType,
} from '../_types/employee'
import {
  EMPLOYEE_ATTACHMENT_ACCEPT,
  UnauthorizedError,
  deleteEmployeeAttachment,
  employeeAttachmentPath,
  formatFileSize,
  listEmployeeAttachments,
  uploadEmployeeAttachment,
  validateEmployeeAttachmentFile,
} from '../_functions/employeeAttachmentService'
import {
  downloadAttachment,
  viewAttachment,
} from '../_functions/viewAttachment'
import { UnauthorizedAccess } from '../_functions/unauthorized'

const CATEGORIES = Object.entries(EMPLOYEE_ATTACHMENT_CATEGORY_LABELS) as [
  EmployeeAttachmentCategory,
  string,
][]

function formatUploadedAt(value?: string): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const iconButtonClass =
  'inline-grid size-9 place-items-center rounded-md text-slate-700 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50'

export default function EmployeeAttachments({
  employeeId,
}: {
  employeeId: number | string
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = useState<EmployeeAttachmentType[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [category, setCategory] =
    useState<EmployeeAttachmentCategory>('contract')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleError = useCallback(
    (error: unknown, fallback: string) => {
      if (error instanceof UnauthorizedError) {
        UnauthorizedAccess(router)
        return
      }
      Swal.fire({
        text: error instanceof Error ? error.message : fallback,
        icon: 'error',
        confirmButtonText: 'OK',
      })
    },
    [router]
  )

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await listEmployeeAttachments(employeeId)
        if (cancelled) return
        setAttachments(data)
        setLoadError(null)
      } catch (error) {
        if (cancelled) return
        if (error instanceof UnauthorizedError) {
          UnauthorizedAccess(router)
          return
        }
        setLoadError(
          error instanceof Error ? error.message : 'Gagal memuat dokumen.'
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [employeeId, router, reloadKey])

  const reload = () => {
    setLoading(true)
    setLoadError(null)
    setReloadKey((k) => k + 1)
  }

  const resetFileInput = () => {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (!file) {
      setSelectedFile(null)
      return
    }
    const problem = validateEmployeeAttachmentFile(file)
    if (problem) {
      Swal.fire({ text: problem, icon: 'warning', confirmButtonText: 'OK' })
      resetFileInput()
      return
    }
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    try {
      const created = await uploadEmployeeAttachment(
        employeeId,
        selectedFile,
        category
      )
      setAttachments((prev) => [created, ...prev])
      resetFileInput()
    } catch (error) {
      handleError(error, 'Gagal mengunggah dokumen.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (attachment: EmployeeAttachmentType) => {
    const result = await Swal.fire({
      title: 'Hapus dokumen?',
      text: `${attachment.file_name} akan dihapus permanen.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#d33',
    })
    if (!result.isConfirmed) return

    setDeletingId(attachment.ID)
    try {
      await deleteEmployeeAttachment(employeeId, attachment.ID)
      setAttachments((prev) => prev.filter((a) => a.ID !== attachment.ID))
    } catch (error) {
      handleError(error, 'Gagal menghapus dokumen.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section aria-labelledby="employee-documents-heading" className="space-y-4">
      <div>
        <h2
          id="employee-documents-heading"
          className="text-lg font-semibold text-blue-gray-900"
        >
          Dokumen
        </h2>
        <p className="text-sm text-blue-gray-500">
          Kontrak kerja, identitas, dan dokumen lain. PDF, JPG, PNG, atau HEIC,
          maksimal 5MB.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-blue-gray-200 p-4 md:flex-row md:items-end">
        <label className="flex flex-col gap-1 text-sm text-blue-gray-700 md:w-56">
          Jenis dokumen
          <select
            className="rounded-md border border-blue-gray-200 bg-white px-3 py-2 text-sm"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as EmployeeAttachmentCategory)
            }
            disabled={uploading}
          >
            {CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm text-blue-gray-700">
          File
          <input
            ref={fileInputRef}
            type="file"
            accept={EMPLOYEE_ATTACHMENT_ACCEPT}
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-blue-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-gray-50 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-blue-gray-100"
          />
        </label>
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? 'Mengunggah…' : 'Unggah'}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-blue-gray-500">Memuat dokumen…</p>
      ) : loadError ? (
        <div className="flex items-center gap-3 text-sm text-red-600">
          <span>{loadError}</span>
          <button type="button" onClick={reload} className="underline">
            Coba lagi
          </button>
        </div>
      ) : attachments.length === 0 ? (
        <p className="text-sm text-blue-gray-500">
          Belum ada dokumen untuk karyawan ini.
        </p>
      ) : (
        <ul className="divide-y divide-blue-gray-50 rounded-lg border border-blue-gray-100">
          {attachments.map((attachment) => {
            const path = employeeAttachmentPath(employeeId, attachment.ID)
            const isImage = attachment.content_type?.startsWith('image/')
            const Icon = isImage ? PhotoIcon : DocumentIcon
            return (
              <li
                key={attachment.ID}
                className="flex items-center gap-3 px-3 py-2"
              >
                <Icon className="size-6 shrink-0 text-blue-gray-400" />
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-medium text-blue-gray-900"
                    title={attachment.file_name}
                  >
                    {attachment.file_name}
                  </p>
                  <p className="text-xs text-blue-gray-500">
                    {EMPLOYEE_ATTACHMENT_CATEGORY_LABELS[attachment.category] ??
                      attachment.category}{' '}
                    · {formatFileSize(attachment.size)} ·{' '}
                    {formatUploadedAt(attachment.CreatedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center">
                  <button
                    type="button"
                    className={iconButtonClass}
                    aria-label={`Lihat ${attachment.file_name}`}
                    onClick={() =>
                      void viewAttachment(path, attachment.file_name)
                    }
                  >
                    <EyeIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    className={iconButtonClass}
                    aria-label={`Unduh ${attachment.file_name}`}
                    onClick={() =>
                      void downloadAttachment(path, attachment.file_name)
                    }
                  >
                    <ArrowDownTrayIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    className={`${iconButtonClass} text-red-600 hover:bg-red-50`}
                    aria-label={`Hapus ${attachment.file_name}`}
                    disabled={deletingId === attachment.ID}
                    onClick={() => void handleDelete(attachment)}
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
