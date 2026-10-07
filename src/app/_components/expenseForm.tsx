import React, { useState, useEffect, useRef } from 'react'
import { Card, Input, Textarea, Select, Option } from '@material-tailwind/react'
import { useRouter } from 'next/navigation'
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../_types/expense'
import { apiFetch } from '../_functions/apiFetch'
import { parseAttachmentPaths } from '../_functions/apiHost'
import { viewAttachment } from '../_functions/viewAttachment'
import { UnauthorizedAccess } from '../_functions/unauthorized'

interface ExpenseFormProps {
  ID?: number
  expense_date?: string
  category?: string
  amount?: number
  description?: string
  payment_method?: string
  receipt_url?: string
  notes?: string
  onCategoryChange?: (value: string) => void
  onPaymentMethodChange?: (value: string) => void
  onUploadingChange?: (isUploading: boolean) => void
  isEdit?: boolean
}

export function ExpenseForm({
  ID,
  expense_date,
  category = 'Operational',
  amount,
  description,
  payment_method = 'bank_transfer',
  receipt_url,
  notes,
  onCategoryChange,
  onPaymentMethodChange,
  onUploadingChange,
  isEdit = false,
}: ExpenseFormProps) {
  const router = useRouter()
  const prefix = isEdit ? 'edit' : 'add'
  const today = new Date().toISOString().split('T')[0]

  const isAttachmentDirtyRef = useRef(false)
  const prevIdRef = useRef(ID)
  const [attachmentPaths, setAttachmentPaths] = useState<string[]>(() => {
    return parseAttachmentPaths(receipt_url)
  })
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    onUploadingChange?.(isUploading)
  }, [isUploading, onUploadingChange])

  useEffect(() => {
    if (prevIdRef.current !== ID) {
      prevIdRef.current = ID
      isAttachmentDirtyRef.current = false
    }
  }, [ID])

  useEffect(() => {
    if (receipt_url !== undefined && !isAttachmentDirtyRef.current) {
      setAttachmentPaths(parseAttachmentPaths(receipt_url))
    }
  }, [receipt_url])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 5MB')
      e.target.value = ''
      return
    }

    isAttachmentDirtyRef.current = true
    setIsUploading(true)
    const formData = new FormData()
    const sanitizedName = file.name.replace(/,/g, '_')
    formData.append('file', file, sanitizedName)

    try {
      let uploadedPath: string | undefined
      const res = await apiFetch('/expense/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.status === 401) {
        UnauthorizedAccess(router)
        return
      }

      if (!res.ok) {
        // Fallback to /transaction/upload or /patient/upload
        const fallbackRes = await apiFetch('/transaction/upload', {
          method: 'POST',
          body: formData,
        })
        if (fallbackRes.status === 401) {
          UnauthorizedAccess(router)
          return
        }
        if (!fallbackRes.ok) {
          const patientRes = await apiFetch('/patient/upload', {
            method: 'POST',
            body: formData,
          })
          if (patientRes.status === 401) {
            UnauthorizedAccess(router)
            return
          }
          if (!patientRes.ok) {
            const errorData = await patientRes.json().catch(() => null)
            throw new Error(
              errorData?.message ||
                errorData?.error ||
                `Gagal mengunggah file (${res.status})`
            )
          }
          const data = await patientRes.json()
          uploadedPath =
            data?.data?.file_path ||
            data?.data?.attachment_path ||
            data?.file_path ||
            data?.attachment_path
        } else {
          const data = await fallbackRes.json()
          uploadedPath =
            data?.data?.file_path ||
            data?.data?.attachment_path ||
            data?.data?.receipt_url ||
            data?.file_path ||
            data?.attachment_path ||
            data?.receipt_url
        }
      } else {
        const data = await res.json()
        uploadedPath =
          data?.data?.file_path ||
          data?.data?.attachment_path ||
          data?.data?.receipt_url ||
          data?.file_path ||
          data?.attachment_path ||
          data?.receipt_url
      }

      if (uploadedPath) {
        isAttachmentDirtyRef.current = true
        const parsed = parseAttachmentPaths(uploadedPath)
        if (parsed.length > 0) {
          setAttachmentPaths((prev) => [...prev, ...parsed])
        } else if (typeof uploadedPath === 'string') {
          setAttachmentPaths((prev) => [...prev, uploadedPath])
        }
      }
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Gagal mengunggah file')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleRemoveAttachment = (indexToRemove: number) => {
    isAttachmentDirtyRef.current = true
    setAttachmentPaths((prev) => prev.filter((_, i) => i !== indexToRemove))
  }

  return (
    <Card
      color="transparent"
      shadow={false}
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
      onResize={undefined}
      onResizeCapture={undefined}
    >
      <form className="mb-2 mt-4 w-full px-2 md:mt-6 md:px-0">
        <div className="flex w-full flex-col gap-4 md:flex-row md:gap-6">
          {/* Left Column */}
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            {isEdit && (
              <Input
                id={`${prefix}_ID`}
                type="text"
                label="ID Pengeluaran"
                disabled
                defaultValue={ID}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              />
            )}
            <Input
              id={`${prefix}_expense_date`}
              type="date"
              label="Tanggal Pengeluaran"
              defaultValue={expense_date || today}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <div className="w-full">
              <Select
                id={`${prefix}_category`}
                data-testid={`${prefix}_category`}
                label="Kategori Pengeluaran"
                value={category}
                onChange={(val) =>
                  onCategoryChange && onCategoryChange(val || '')
                }
                selected={(element) =>
                  React.isValidElement<{ children?: React.ReactNode }>(element)
                    ? element.props.children
                    : category || ''
                }
                menuProps={{
                  className:
                    'z-[9999] max-h-72 shadow-xl border border-blue-gray-100',
                }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <Option key={cat} value={cat}>
                    {cat}
                  </Option>
                ))}
              </Select>
            </div>
            <Input
              shrink
              id={`${prefix}_amount`}
              type="number"
              label="Nominal (Rp)"
              defaultValue={amount !== undefined ? amount : ''}
              placeholder="Contoh: 150000"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <div className="w-full">
              <Select
                id={`${prefix}_payment_method`}
                data-testid={`${prefix}_payment_method`}
                label="Metode Pembayaran"
                value={payment_method}
                onChange={(val) =>
                  onPaymentMethodChange && onPaymentMethodChange(val || '')
                }
                selected={(element) =>
                  React.isValidElement<{ children?: React.ReactNode }>(element)
                    ? element.props.children
                    : PAYMENT_METHODS.find((m) => m.value === payment_method)
                        ?.label ||
                      payment_method ||
                      ''
                }
                menuProps={{
                  className:
                    'z-[9999] max-h-72 shadow-xl border border-blue-gray-100',
                }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                {PAYMENT_METHODS.map((method) => (
                  <Option key={method.value} value={method.value}>
                    {method.label}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            <Textarea
              shrink
              id={`${prefix}_description`}
              label="Deskripsi / Keperluan"
              rows={3}
              defaultValue={description}
              placeholder="Contoh: Pembayaran tagihan listrik klinik bulan Januari, pembelian obat, perlengkapan medis..."
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />

            {/* Payment Receipt Attachment */}
            <div className="w-full">
              <label
                htmlFor={`${prefix}_file_upload`}
                className="text-slate-800 mb-1 block font-sans text-sm font-semibold antialiased dark:text-white"
              >
                Bukti Pembayaran / Kwitansi
              </label>

              {/* Hidden input storing the joined receipt path(s) */}
              <input
                id={`${prefix}_receipt_url`}
                name="receipt_url"
                type="hidden"
                value={attachmentPaths.join(',')}
              />

              <div className="space-y-2">
                {attachmentPaths.map((path, index) => (
                  <div
                    key={index}
                    className="border-slate-200 dark:bg-slate-900/50 flex items-center justify-between gap-3 rounded-lg border bg-white/70 p-2.5 shadow-sm backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="dark:bg-blue-950/40 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:text-blue-400">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                      </span>
                      <div className="flex flex-col overflow-hidden text-xs">
                        <span className="text-slate-800 dark:text-slate-200 truncate font-semibold">
                          {path.split('/').pop()}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            void viewAttachment(path, path.split('/').pop())
                          }
                          className="cursor-pointer text-left text-[11px] font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          Lihat Bukti Lampiran
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-1.5 transition-colors hover:text-red-500"
                      aria-label={`Hapus bukti ${index + 1}`}
                      title="Hapus bukti lampiran"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}

                <div>
                  <label
                    htmlFor={`${prefix}_file_upload`}
                    className="border-slate-300 dark:bg-slate-900/50 dark:hover:bg-slate-900/80 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-3 transition-all hover:border-blue-500 hover:bg-blue-50/30"
                  >
                    {isUploading ? (
                      <svg
                        className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-slate-500"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    )}
                    <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                      {isUploading
                        ? 'Mengunggah bukti pembayaran...'
                        : 'Unggah Bukti / Kwitansi (PDF, PNG, JPG, maks 5MB)'}
                    </span>
                    <input
                      id={`${prefix}_file_upload`}
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isUploading}
                      accept=".pdf,.jpeg,.jpg,.png,.heic,.heif,image/*,application/pdf"
                    />
                  </label>
                </div>
              </div>
            </div>

            <Textarea
              shrink
              id={`${prefix}_notes`}
              label="Catatan Tambahan (Opsional)"
              rows={2}
              defaultValue={notes}
              placeholder="Catatan tambahan..."
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
          </div>
        </div>
      </form>
    </Card>
  )
}
