'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { TreatmentType } from '../_types/treatment'
import { usePatientTreatments } from '../_hooks/usePatientTreatments'
import { parseAttachmentPaths } from '../_functions/apiHost'
import { viewAttachment } from '../_functions/viewAttachment'
import { getGenderLabel } from '../_functions/normalizeGender'
import {
  CalendarDaysIcon,
  UserIcon,
  PaperClipIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'

export interface PatientTreatmentHistoryProps {
  patientCode?: string | number | null
  patientName?: string | null
  currentTreatmentId?: string | number | null
  initialTreatments?: TreatmentType[]
  onCountChange?: (count: number) => void
  showTitle?: boolean
}

export function PatientTreatmentHistory({
  patientCode,
  patientName,
  currentTreatmentId,
  initialTreatments,
  onCountChange,
  showTitle = true,
}: PatientTreatmentHistoryProps) {
  const {
    treatments: fetchedTreatments,
    loading,
    error,
    refetch,
  } = usePatientTreatments(
    patientCode,
    patientName,
    !initialTreatments // only fetch if initialTreatments not supplied
  )

  const treatments = initialTreatments ?? fetchedTreatments

  useEffect(() => {
    if (onCountChange) {
      onCountChange(treatments.length)
    }
  }, [treatments.length, onCountChange])

  const [searchKeyword, setSearchKeyword] = useState('')
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})

  // Toggle card expansion
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Filter treatments by search keyword
  const filteredTreatments = useMemo(() => {
    if (!searchKeyword.trim()) return treatments
    const kw = searchKeyword.toLowerCase().trim()
    return treatments.filter((t) => {
      const matchDate = t.treatment_date?.toLowerCase().includes(kw)
      const matchTherapist = t.therapist_name?.toLowerCase().includes(kw)
      const matchIssues = t.issues?.toLowerCase().includes(kw)
      const matchTreatment = t.treatment?.toLowerCase().includes(kw)
      const matchRemarks = t.remarks?.toLowerCase().includes(kw)
      const matchNextVisit = t.next_visit?.toLowerCase().includes(kw)
      return (
        matchDate ||
        matchTherapist ||
        matchIssues ||
        matchTreatment ||
        matchRemarks ||
        matchNextVisit
      )
    })
  }, [treatments, searchKeyword])

  // Helper to split treatment strings (e.g. Bekam, Akupunktur)
  const parseConditions = (raw?: string): string[] => {
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim())
    } catch {
      // not JSON
    }
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  return (
    <div className="w-full space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {showTitle && (
          <div>
            <div className="flex items-center gap-2">
              <ClipboardDocumentListIcon className="size-5 text-indigo-600" />
              <h3 className="font-sans text-base font-bold text-blue-gray-900">
                Riwayat Penanganan Pasien
              </h3>
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                {treatments.length} Catatan
              </span>
            </div>
            <p className="mt-0.5 font-sans text-xs text-blue-gray-500">
              {patientName ? (
                <>
                  Daftar seluruh rekam penanganan untuk{' '}
                  <span className="font-semibold text-blue-gray-800">
                    {patientName}
                  </span>
                  {patientCode ? ` (${patientCode})` : ''}
                </>
              ) : (
                'Daftar seluruh riwayat penanganan pasien ini'
              )}
            </p>
          </div>
        )}

        {/* Search bar inside history */}
        {treatments.length > 0 && (
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Cari keluhan, terapis, tanggal..."
              className="w-full rounded-lg border border-blue-gray-200 bg-white py-1.5 pl-9 pr-3 text-xs text-blue-gray-800 placeholder-gray-400 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-3 py-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-blue-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-36 rounded bg-gray-200" />
                <div className="h-4 w-24 rounded bg-gray-200" />
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-3 w-3/4 rounded bg-gray-100" />
                <div className="h-3 w-1/2 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-xs font-semibold text-red-600">{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-2 inline-flex items-center gap-1.5 rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
          >
            <ArrowPathIcon className="size-3.5" />
            Coba Lagi
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && treatments.length === 0 && (
        <div className="rounded-xl border border-dashed border-blue-gray-200 bg-blue-gray-50/40 p-8 text-center">
          <ClipboardDocumentListIcon className="mx-auto size-10 text-blue-gray-300" />
          <h4 className="mt-2 font-sans text-sm font-semibold text-blue-gray-800">
            Belum Ada Riwayat Penanganan
          </h4>
          <p className="mt-1 font-sans text-xs text-blue-gray-500">
            Pasien ini belum memiliki catatan riwayat penanganan lainnya.
          </p>
        </div>
      )}

      {/* No Search Results */}
      {!loading &&
        !error &&
        treatments.length > 0 &&
        filteredTreatments.length === 0 && (
          <div className="rounded-xl border border-dashed border-blue-gray-200 bg-white p-6 text-center">
            <p className="text-xs text-blue-gray-500">
              Tidak ada riwayat yang cocok dengan kata kunci &ldquo;
              {searchKeyword}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => setSearchKeyword('')}
              className="mt-2 text-xs font-medium text-indigo-600 hover:underline"
            >
              Hapus pencarian
            </button>
          </div>
        )}

      {/* List of Treatment History Cards */}
      {!loading && filteredTreatments.length > 0 && (
        <div className="space-y-3">
          {filteredTreatments.map((item, idx) => {
            const isCurrent =
              currentTreatmentId !== null &&
              currentTreatmentId !== undefined &&
              String(item.ID) === String(currentTreatmentId)

            const itemId = String(item.ID || idx)
            // By default, current item or first item is expanded, others can be toggled
            const isExpanded = expandedIds[itemId] ?? (idx === 0 || isCurrent)
            const conditions = parseConditions(item.treatment)
            const attachments = parseAttachmentPaths(item.attachment_path)

            return (
              <div
                key={itemId}
                className={`overflow-hidden rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-indigo-300 bg-indigo-50/20 shadow-sm ring-1 ring-indigo-200'
                    : 'border-blue-gray-100 bg-white shadow-sm hover:border-blue-gray-200'
                }`}
              >
                {/* Header row */}
                <div
                  className="flex cursor-pointer items-center justify-between p-3.5 hover:bg-blue-gray-50/30 sm:p-4"
                  onClick={() => toggleExpand(itemId)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Date Badge */}
                    <div className="flex items-center gap-1.5 rounded-md bg-blue-gray-50 px-2.5 py-1 text-xs font-medium text-blue-gray-700">
                      <CalendarDaysIcon className="size-3.5 text-blue-gray-500" />
                      <span>
                        {item.treatment_date || 'Tanggal tidak dicatat'}
                      </span>
                    </div>

                    {/* Active/Current Treatment indicator */}
                    {isCurrent && (
                      <span className="shadow-xs rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                        Sesi Saat Ini
                      </span>
                    )}

                    {/* Therapist Badge */}
                    <div className="bg-slate-100 text-slate-700 flex items-center gap-1 rounded-md px-2 py-1 text-xs">
                      <UserIcon className="text-slate-500 size-3" />
                      <span>{item.therapist_name || 'Terapis'}</span>
                    </div>

                    {/* Age / Gender */}
                    {((item.age !== undefined &&
                      item.age !== null &&
                      Number(item.age) > 0) ||
                      Boolean(item.gender)) && (
                      <span className="text-[11px] text-gray-500">
                        {[
                          item.age && Number(item.age) > 0
                            ? `${item.age} th`
                            : null,
                          item.gender ? getGenderLabel(item.gender) : null,
                        ]
                          .filter(Boolean)
                          .join(' • ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {isExpanded ? 'Ringkas' : 'Detail'}
                    </span>
                    {isExpanded ? (
                      <ChevronUpIcon className="size-4 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="size-4 text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className="bg-slate-50/40 space-y-3.5 border-t border-blue-gray-50 p-4 text-xs">
                    {/* Issues / Keluhan */}
                    <div>
                      <span className="font-semibold text-blue-gray-700">
                        Keluhan Pasien:
                      </span>
                      <p className="mt-1 rounded-md border border-blue-gray-100/80 bg-white p-2.5 leading-relaxed text-blue-gray-800">
                        {item.issues || '-'}
                      </p>
                    </div>

                    {/* Treatment / Penanganan Provided */}
                    <div>
                      <span className="font-semibold text-blue-gray-700">
                        Tindakan Penanganan:
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {conditions.length > 0 ? (
                          conditions.map((c, i) => (
                            <span
                              key={i}
                              className="bg-emerald-50 text-emerald-800 border-emerald-200 inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium"
                            >
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="italic text-gray-500">
                            {item.treatment || '-'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remarks / Keterangan */}
                    {item.remarks && (
                      <div>
                        <span className="font-semibold text-blue-gray-700">
                          Keterangan / Catatan Tambahan:
                        </span>
                        <p className="mt-1 rounded-md border border-blue-gray-100/80 bg-white p-2.5 leading-relaxed text-blue-gray-800">
                          {item.remarks}
                        </p>
                      </div>
                    )}

                    {/* Next Visit & Attachments Row */}
                    <div className="flex flex-col justify-between gap-3 border-t border-blue-gray-100/60 pt-1 sm:flex-row sm:items-center">
                      {/* Next visit */}
                      <div className="flex items-center gap-1.5 text-blue-gray-600">
                        <ClockIcon className="size-4 text-indigo-600" />
                        <span className="font-medium text-blue-gray-700">
                          Kunjungan Selanjutnya:
                        </span>
                        <span>{item.next_visit || '-'}</span>
                      </div>

                      {/* Attachments */}
                      {attachments.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-blue-gray-700">
                            Lampiran:
                          </span>
                          {attachments.map((path, aIdx) => {
                            const fileName =
                              path.split('/').pop() || `Lampiran ${aIdx + 1}`
                            return (
                              <button
                                key={aIdx}
                                type="button"
                                onClick={() =>
                                  void viewAttachment(path, fileName)
                                }
                                className="inline-flex items-center gap-1 rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                                title="Lihat Lampiran"
                              >
                                <PaperClipIcon className="size-3" />
                                <span className="max-w-[120px] truncate">
                                  {fileName}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
