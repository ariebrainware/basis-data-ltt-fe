'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeftIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { Card, CardBody } from '@material-tailwind/react'
import MegaMenuDefault from '../../_components/megaMenu'
import EmployeeAttachments from '../../_components/employeeAttachments'
import EmployeeEditDialog from '../../_components/employeeEditDialog'
import { EmployeeType } from '../../_types/employee'
import {
  UnauthorizedError,
  fetchEmployee,
} from '../../_functions/employeeAttachmentService'
import { UnauthorizedAccess } from '../../_functions/unauthorized'

function genderLabel(value?: string): string {
  const g = (value || '').trim().toLowerCase()
  if (g === 'female' || g === 'perempuan') return 'Perempuan'
  if (g === 'male' || g === 'laki-laki' || g === 'laki laki') return 'Laki-laki'
  return value || '-'
}

function rupiah(value?: number): string {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`
}

const cardProps = {
  placeholder: undefined,
  onPointerEnterCapture: undefined,
  onPointerLeaveCapture: undefined,
  onResize: undefined,
  onResizeCapture: undefined,
}

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>()
  const employeeId = params?.id ?? ''
  const router = useRouter()
  const [employee, setEmployee] = useState<EmployeeType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!employeeId) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchEmployee(employeeId)
        if (cancelled) return
        setEmployee(data)
        setError(null)
      } catch (err) {
        if (cancelled) return
        if (err instanceof UnauthorizedError) {
          UnauthorizedAccess(router)
          return
        }
        setError(err instanceof Error ? err.message : 'Gagal memuat karyawan.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [employeeId, router, reloadKey])

  const details: [string, string][] = employee
    ? [
        ['NIK', employee.nik],
        ['Tempat, Tanggal Lahir', employee.birth_date ?? ''],
        ['Jenis Kelamin', genderLabel(employee.gender)],
        ['Agama', employee.religion],
        ['Telepon', employee.phone_number],
        ['Email', employee.email],
        ['Tanggal Masuk', employee.joined_date],
        ['Gaji Pokok', rupiah(employee.base_salary)],
        ['Uang Makan', rupiah(employee.lunch_money)],
        ['Alamat', employee.address],
      ]
    : []

  return (
    <div className="min-h-screen space-y-6 bg-blue-gray-50/20 p-4 md:p-6">
      <MegaMenuDefault />

      <Link
        href="/employee"
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-gray-600 hover:text-blue-gray-900"
      >
        <ArrowLeftIcon className="size-4" /> Kembali ke Daftar Karyawan
      </Link>

      {error ? (
        <Card {...cardProps}>
          <CardBody {...cardProps}>
            <p className="text-red-600">{error}</p>
          </CardBody>
        </Card>
      ) : !employee ? (
        <p className="text-sm text-blue-gray-500">Memuat data karyawan…</p>
      ) : (
        <>
          <EmployeeEditDialog
            {...employee}
            open={editOpen}
            setOpen={setEditOpen}
            onDataChange={() => setReloadKey((k) => k + 1)}
          />

          <Card {...cardProps}>
            <CardBody className="space-y-6" {...cardProps}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-blue-gray-900">
                    {employee.full_name}
                  </h1>
                  <p className="text-blue-gray-500">{employee.position}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-gray-200 px-3 py-2 text-sm font-medium text-blue-gray-800 hover:bg-blue-gray-50"
                >
                  <PencilSquareIcon className="size-4" /> Ubah Data
                </button>
              </div>

              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {details.map(([label, value]) => (
                  <div
                    key={label}
                    className={label === 'Alamat' ? 'sm:col-span-2' : ''}
                  >
                    <dt className="text-xs uppercase tracking-wide text-blue-gray-400">
                      {label}
                    </dt>
                    <dd className="mt-0.5 break-words text-sm text-blue-gray-900">
                      {value || '-'}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>

          <Card {...cardProps}>
            <CardBody {...cardProps}>
              <EmployeeAttachments employeeId={employee.ID} />
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
