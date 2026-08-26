import React, { useEffect, useState } from 'react'
import { isAdmin } from '../_functions/userRole'
import { Card, Input, Textarea } from '@material-tailwind/react'
import { PatientType } from '../_types/patient'
import { DiseaseType } from '../_types/disease'
import { GenderSelect } from './selectGender'
import { DiseaseMultiSelect } from './selectDisease'
import { SignaturePad } from './signaturePad'
import { getApiHost, getAttachmentUrl } from '../_functions/apiHost'
import { apiFetch } from '../_functions/apiFetch'

function getSignatureUrl(path?: string): string {
  if (!path) return ''
  if (
    path.startsWith('data:') ||
    path.startsWith('http://') ||
    path.startsWith('https://')
  ) {
    return path
  }
  const host = getApiHost()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${host}${cleanPath}`
}

interface PatientFormProps extends PatientType {
  onGenderChange?: (value: string) => void
  diseases?: DiseaseType[]
}

export function PatientForm({
  ID,
  full_name,
  phone_number,
  job,
  age,
  email,
  gender,
  address,
  health_history,
  surgery_history,
  patient_code,
  signature,
  signature_path,
  attachment_path,
  onGenderChange,
  diseases,
}: PatientFormProps) {
  const [admin, setAdmin] = useState(isAdmin())
  const [selected, setSelected] = useState<string[]>(() => {
    return health_history
      ? health_history
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
  })
  const [signatureVal, setSignatureVal] = useState(
    signature_path || signature || ''
  )
  console.log('PatientForm attachment_path prop:', attachment_path)
  const [attachmentPaths, setAttachmentPaths] = useState<string[]>(() => {
    return attachment_path
      ? attachment_path.split(/,(?=\/?uploads\/|https?:\/\/)/).filter(Boolean)
      : []
  })
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAttachmentPaths(
      attachment_path
        ? attachment_path.split(/,(?=\/?uploads\/|https?:\/\/)/).filter(Boolean)
        : []
    )
  }, [attachment_path])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 10MB')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    const sanitizedName = file.name.replace(/,/g, '_')
    formData.append('file', file, sanitizedName)

    try {
      const res = await apiFetch('/patient/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        throw new Error('Upload failed')
      }
      const data = await res.json()
      setAttachmentPaths((prev) => [...prev, data.data.file_path])
    } catch (err) {
      console.error(err)
      alert('Gagal mengunggah file')
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSignatureVal(signature_path || signature || '')
  }, [signature, signature_path])

  useEffect(() => {
    const initial = health_history
      ? health_history
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
    // Schedule state update asynchronously to avoid synchronous setState
    // inside the effect body which can trigger cascading renders.
    const t = setTimeout(() => {
      setSelected((prev) => {
        if (prev.length !== initial.length) return initial

        const prevSet = new Set(prev)
        const equal = initial.every((id) => prevSet.has(id))

        return equal ? prev : initial
      })
    }, 0)

    return () => clearTimeout(t)
  }, [health_history])

  useEffect(() => {
    const el = document.getElementById(
      'health_history'
    ) as HTMLInputElement | null
    if (el) el.value = selected.join(',')
  }, [selected])
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
      <form className="mb-2 mt-4 w-full px-2 md:mt-8 md:px-0">
        <div className="mb-1 flex w-full flex-col gap-4 md:flex-row md:gap-6">
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            <Input
              id="ID"
              type="text"
              label="ID"
              disabled
              defaultValue={ID}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="patient_code"
              type="text"
              label="Kode Pasien"
              disabled={!admin}
              defaultValue={patient_code}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="full_name"
              type="text"
              label="Nama Lengkap"
              defaultValue={full_name}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Textarea
              id="phone_number"
              label="Nomor Telepon"
              defaultValue={
                Array.isArray(phone_number)
                  ? phone_number.join(', ')
                  : (phone_number ?? '')
              }
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="job"
              type="text"
              label="Pekerjaan"
              defaultValue={job}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="age"
              type="number"
              label="Age"
              defaultValue={
                age !== undefined && age !== null ? String(age) : ''
              }
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="email"
              type="text"
              label="Email"
              defaultValue={email}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
          </div>
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            <GenderSelect
              id="gender"
              label="Jenis Kelamin"
              value={gender}
              onChange={onGenderChange}
            />

            <Textarea
              id="address"
              label="Alamat"
              defaultValue={address}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            {/* Hidden input keeps existing DOM id used by other scripts */}
            <input
              id="health_history"
              name="health_history"
              type="hidden"
              data-testid="health_history"
              defaultValue={health_history ?? ''}
            />
            <div>
              <DiseaseMultiSelect
                id="health_history_select"
                label="Riwayat Penyakit"
                value={selected}
                onChange={(vals) => setSelected(vals)}
                options={diseases}
              />
            </div>
            <Textarea
              id="surgery_history"
              label="Riwayat Operasi"
              defaultValue={surgery_history}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <input
              id="attachment_path"
              name="attachment_path"
              type="hidden"
              value={attachmentPaths.join(',')}
            />
            <div className="mt-2 w-full">
              <label className="text-slate-800 mb-1 block font-sans text-sm font-semibold antialiased dark:text-white">
                Lampiran
              </label>
              <div className="space-y-2">
                {attachmentPaths.map((path, index) => (
                  <div
                    key={index}
                    className="border-slate-200 dark:bg-slate-900/50 flex items-center justify-between gap-4 rounded-md border bg-white/50 p-2 backdrop-blur-sm"
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
                        <a
                          href={getAttachmentUrl(path)}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-600 hover:underline dark:text-blue-400"
                        >
                          Lihat Lampiran
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachmentPaths((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-1 hover:text-red-500"
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
                  <label className="border-slate-350 hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-900/80 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed p-3 transition-all">
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
                    <span className="text-slate-600 dark:text-slate-400 font-sans text-xs font-medium">
                      {isUploading
                        ? 'Mengunggah...'
                        : 'Pilih File (PDF, DOC, Gambar, dsb.)'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
            {/* Hidden signature field collected by form builders */}
            <input
              id="signature"
              name="signature"
              type="hidden"
              data-testid="signature"
              value={signatureVal}
            />
            <div className="mt-2 w-full">
              {signatureVal ? (
                <div className="border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/50 relative overflow-hidden rounded-xl border bg-white/50 p-4 shadow-sm backdrop-blur-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold">
                      <span className="bg-emerald-500 h-1.5 w-1.5 animate-pulse rounded-full" />
                      Tanda Tangan Terdaftar
                    </span>
                    <button
                      type="button"
                      onClick={() => setSignatureVal('')}
                      className="text-xs font-semibold text-red-600 transition-all hover:text-red-700 hover:underline dark:text-red-400"
                    >
                      Ubah Tanda Tangan
                    </button>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 flex justify-center rounded-lg border p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getSignatureUrl(signatureVal)}
                      alt="Tanda Tangan Pasien"
                      className="max-h-[100px] object-contain dark:invert"
                    />
                  </div>
                </div>
              ) : (
                <div className="border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/50 rounded-xl border bg-white/50 p-4 shadow-sm backdrop-blur-sm">
                  <div className="mb-2">
                    <span className="dark:bg-amber-950/30 flex w-fit items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:border-amber-900/30 dark:text-amber-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                      Belum Ada Tanda Tangan
                    </span>
                  </div>
                  <SignaturePad onChange={(val) => setSignatureVal(val)} />
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </Card>
  )
}
