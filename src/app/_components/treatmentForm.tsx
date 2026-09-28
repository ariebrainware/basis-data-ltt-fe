'use client'
import React from 'react'
import { Card, Input, Textarea } from '@material-tailwind/react'
import { TreatmentType } from '../_types/treatment'
import { isTherapist } from '../_functions/userRole'
import { ControlledSelect } from './selectTherapist'
import { TreatmentConditionMultiSelect } from './selectTreatmentCondition'
import { DiseaseMultiSelect } from './selectDisease'
import { parseAttachmentPaths } from '../_functions/apiHost'
import { viewAttachment } from '../_functions/viewAttachment'
import { apiFetch } from '../_functions/apiFetch'

interface TreatmentFormProps extends TreatmentType {
  therapistIDState?: string
  setTherapistIDState?: (value: string) => void
  disabled?: boolean
  onAttachmentChange?: (value: string) => void
}

export function TreatmentForm({
  ID,
  treatment_date: treatmentDate,
  patient_code: patientCode,
  patient_name: patientName,
  therapist_name: therapistName,
  therapist_id: therapistIdProp,
  issues: issues,
  treatment: treatment,
  remarks: remarks,
  next_visit: nextVisit,
  therapistIDState,
  setTherapistIDState,
  disabled = false,
  health_history,
  surgery_history,
  attachment_path,
  onAttachmentChange,
}: TreatmentFormProps) {
  const isTherapistRole = isTherapist()
  // The backend may return treatment data in either JSON array format or comma-separated string format.
  // This function handles both formats to ensure compatibility with different API versions or data states.
  const parseTreatmentToArray = (raw: string | undefined): string[] => {
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.map((v) => String(v))
    } catch {
      // not json
    }
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  const [selectedTreatmentConditions, setSelectedTreatmentConditions] =
    React.useState<string[]>(() => parseTreatmentToArray(treatment))

  React.useEffect(() => {
    // keep textarea in sync when multi-select changes
    const el = document.getElementById(
      'treatment'
    ) as HTMLTextAreaElement | null
    if (el) el.value = selectedTreatmentConditions.join(',')
  }, [selectedTreatmentConditions])
  const [localTherapistID, setLocalTherapistID] = React.useState<string>(
    therapistIdProp?.toString() ?? ''
  )

  // Use either the passed state or local state
  const therapistID = therapistIDState ?? localTherapistID
  const setTherapistID = setTherapistIDState ?? setLocalTherapistID

  const [selectedHealthHistory, setSelectedHealthHistory] = React.useState<
    string[]
  >(() => {
    return health_history
      ? health_history
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
  })

  React.useEffect(() => {
    const initial = health_history
      ? health_history
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
    const t = setTimeout(() => {
      setSelectedHealthHistory((prev) => {
        if (prev.length !== initial.length) return initial

        const prevSet = new Set(prev)
        const equal = initial.every((id) => prevSet.has(id))

        return equal ? prev : initial
      })
    }, 0)

    return () => clearTimeout(t)
  }, [health_history])

  React.useEffect(() => {
    const el = document.getElementById(
      'health_history'
    ) as HTMLInputElement | null
    if (el) el.value = selectedHealthHistory.join(',')
  }, [selectedHealthHistory])

  const [prevAttachmentPath, setPrevAttachmentPath] =
    React.useState(attachment_path)
  const [attachmentPaths, setAttachmentPaths] = React.useState<string[]>(() => {
    return parseAttachmentPaths(attachment_path)
  })
  const [isUploading, setIsUploading] = React.useState(false)

  if (attachment_path !== prevAttachmentPath) {
    setPrevAttachmentPath(attachment_path)
    if (attachment_path !== undefined) {
      const incoming = parseAttachmentPaths(attachment_path)
      setAttachmentPaths((prev) => {
        const combined = Array.from(new Set([...prev, ...incoming]))
        return combined
      })
    }
  }

  // Fetch patient attachments by patient_code to ensure patient attachments appear in treatment data
  React.useEffect(() => {
    let mounted = true
    if (process.env.NODE_ENV === 'test' || !patientCode) return

    const fetchPatientAttachments = async () => {
      try {
        const res = await apiFetch(
          `/patient?keyword=${encodeURIComponent(patientCode)}`
        )
        if (res.ok) {
          const resData = await res.json()
          const patients = Array.isArray(resData?.data?.patients)
            ? resData.data.patients
            : Array.isArray(resData?.data)
              ? resData.data
              : []
          const found =
            patients.find(
              (p: any) =>
                String(p.patient_code) === String(patientCode) ||
                String(p.ID) === String(patientCode)
            ) || patients[0]

          if (found?.attachment_path && mounted) {
            const parsed = parseAttachmentPaths(found.attachment_path)
            if (parsed.length > 0) {
              setAttachmentPaths((prev) =>
                Array.from(new Set([...prev, ...parsed]))
              )
            }
          }
        }
      } catch (err) {
        // ignore error fetching patient attachments
      }
    }

    void fetchPatientAttachments()

    return () => {
      mounted = false
    }
  }, [patientCode])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 10MB')
      e.target.value = ''
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    const sanitizedName = file.name.replace(/,/g, '_')
    formData.append('file', file, sanitizedName)

    try {
      let uploadedPath: string | undefined
      const res = await apiFetch('/patient/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const fallbackRes = await apiFetch('/treatment/upload', {
          method: 'POST',
          body: formData,
        }).catch(() => null)
        if (!fallbackRes || !fallbackRes.ok) {
          throw new Error('Gagal mengunggah file')
        }
        const fbData = await fallbackRes.json()
        uploadedPath =
          fbData?.data?.file_path ||
          fbData?.data?.attachment_path ||
          fbData?.file_path ||
          fbData?.attachment_path
      } else {
        const data = await res.json()
        uploadedPath =
          data?.data?.file_path ||
          data?.data?.attachment_path ||
          data?.file_path ||
          data?.attachment_path
      }

      if (uploadedPath) {
        const parsed = parseAttachmentPaths(uploadedPath)
        const toAdd = parsed.length ? parsed : [uploadedPath]
        const nextPaths = Array.from(new Set([...attachmentPaths, ...toAdd]))
        setAttachmentPaths(nextPaths)
        const joined = nextPaths.join(',')
        if (onAttachmentChange) {
          onAttachmentChange(joined)
        }

        // Auto-save attachment to treatment record
        if (ID && ID !== '0' && process.env.NODE_ENV !== 'test') {
          void apiFetch(`/treatment/${ID}`, {
            method: 'PATCH',
            body: JSON.stringify({
              attachment_path: joined,
            }),
          }).catch(() => {})
        }

        // Auto-save attachment to patient record if patient code is available
        if (patientCode && process.env.NODE_ENV !== 'test') {
          void (async () => {
            try {
              const pRes = await apiFetch(
                `/patient?keyword=${encodeURIComponent(patientCode)}`
              )
              if (pRes.ok) {
                const pData = await pRes.json()
                const patients = Array.isArray(pData?.data?.patients)
                  ? pData.data.patients
                  : Array.isArray(pData?.data)
                    ? pData.data
                    : []
                const found =
                  patients.find(
                    (p: any) =>
                      String(p.patient_code) === String(patientCode) ||
                      String(p.ID) === String(patientCode)
                  ) || patients[0]
                if (found?.ID) {
                  const existingPatientAttachments = parseAttachmentPaths(
                    found.attachment_path
                  )
                  const allPatientAttachments = Array.from(
                    new Set([...existingPatientAttachments, ...nextPaths])
                  )
                  await apiFetch(`/patient/${found.ID}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                      attachment_path: allPatientAttachments,
                    }),
                  })
                }
              }
            } catch (err) {
              // ignore error
            }
          })()
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
              id="treatment_date"
              type="text"
              label="Waktu & Tanggal"
              defaultValue={treatmentDate}
              disabled={disabled || isTherapistRole}
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
              defaultValue={patientCode}
              disabled={disabled || isTherapistRole}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="patient_name"
              type="text"
              label="Nama Pasien"
              defaultValue={patientName}
              disabled
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id="therapist_name"
              type="text"
              label="Nama Terapis"
              defaultValue={therapistName}
              disabled
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <ControlledSelect
              id="therapist_id"
              label="Pilih Terapis"
              value={therapistID}
              disabled={disabled || isTherapistRole}
              onChange={(value: string) => {
                if (process.env.NODE_ENV !== 'production') {
                  console.log('Therapist selected:', value)
                }
                setTherapistID(value)
              }}
            />
            <input
              id="health_history"
              name="health_history"
              type="hidden"
              data-testid="health_history"
              defaultValue={health_history ?? ''}
              disabled={disabled}
            />
            <div>
              <DiseaseMultiSelect
                id="health_history_select"
                label="Riwayat Penyakit"
                value={selectedHealthHistory}
                onChange={setSelectedHealthHistory}
                disabled={disabled}
              />
            </div>
            <Textarea
              id="surgery_history"
              label="Riwayat Operasi/Penyakit Tambahan (Jika Ada)"
              defaultValue={surgery_history ?? ''}
              disabled={disabled}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            {/* Hidden input for attachment paths */}
            <input
              id="attachment_path"
              name="attachment_path"
              type="hidden"
              data-testid="attachment_path"
              value={attachmentPaths.join(',')}
            />
            {/* Lampiran UI */}
            <div className="mt-2 w-full">
              <label className="text-slate-800 mb-1 block font-sans text-sm font-semibold antialiased dark:text-white">
                Lampiran
              </label>
              <div className="space-y-2">
                {attachmentPaths.length === 0 ? (
                  <p className="text-xs italic text-gray-500">
                    Tidak ada lampiran
                  </p>
                ) : (
                  attachmentPaths.map((path, index) => (
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
                          <button
                            type="button"
                            onClick={() =>
                              void viewAttachment(path, path.split('/').pop())
                            }
                            className="cursor-pointer text-left text-[10px] text-blue-600 hover:underline dark:text-blue-400"
                          >
                            Lihat Lampiran
                          </button>
                        </div>
                      </div>
                      {/* Note: No delete button rendered here to restrict to view and append-only access */}
                    </div>
                  ))
                )}

                {!disabled && (
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
                          : 'Tambah Lampiran (PDF, DOC, Gambar, dsb.)'}
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
                )}
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            <Textarea
              id="issues"
              label="Keluhan"
              defaultValue={issues}
              disabled={disabled || isTherapistRole}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Textarea
              id="treatment"
              label="Penanganan"
              defaultValue={treatment}
              disabled={disabled}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <div>
              {/* Treatment selection should remain editable for all roles,
                  including therapists, per business requirements. */}
              <TreatmentConditionMultiSelect
                id="treatmentHistory"
                label="Penanganan"
                value={selectedTreatmentConditions}
                onChange={(items: string[]) =>
                  setSelectedTreatmentConditions(items)
                }
                disabled={disabled}
              />
            </div>
            <Textarea
              id="remarks"
              label="Keterangan"
              defaultValue={remarks}
              disabled={disabled}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Textarea
              id="next_visit"
              label="Kunjungan Selanjutnya"
              defaultValue={nextVisit}
              disabled={disabled}
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
