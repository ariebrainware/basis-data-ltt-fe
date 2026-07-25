import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from '@material-tailwind/react'
import Swal from 'sweetalert2'
import { EmployeeForm } from './employeeForm'
import { EmployeeType } from '../_types/employee'
import { apiFetch } from '../_functions/apiFetch'
import { UnauthorizedAccess } from '../_functions/unauthorized'

export interface EmployeeEditDialogProps extends EmployeeType {
  open: boolean
  setOpen: (v: boolean) => void
  onDataChange?: () => void
}

export default function EmployeeEditDialog({
  ID,
  nik,
  full_name,
  gender,
  address,
  religion,
  phone_number,
  email,
  joined_date,
  position,
  base_salary,
  lunch_money,
  open,
  setOpen,
  onDataChange,
}: EmployeeEditDialogProps) {
  const router = useRouter()
  const [genderValue, setGenderValue] = React.useState<string>(gender || '')

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setGenderValue(gender || ''), 0)
      return () => clearTimeout(t)
    }
  }, [open, gender])

  const handleConfirm = async () => {
    const nikVal =
      document.querySelector<HTMLInputElement>('#nik')?.value || nik
    const fullNameVal =
      document.querySelector<HTMLInputElement>('#full_name')?.value || full_name
    const religionVal =
      document.querySelector<HTMLInputElement>('#religion')?.value || religion
    const phoneVal =
      document.querySelector<HTMLInputElement>('#phone_number')?.value ||
      phone_number
    const emailVal =
      document.querySelector<HTMLInputElement>('#email')?.value || email
    const joinedDateVal =
      document.querySelector<HTMLInputElement>('#joined_date')?.value ||
      joined_date
    const positionVal =
      document.querySelector<HTMLInputElement>('#position')?.value || position
    const salaryVal = Number(
      document.querySelector<HTMLInputElement>('#base_salary')?.value ||
        base_salary
    )
    const lunchMoneyVal = Number(
      document.querySelector<HTMLInputElement>('#lunch_money')?.value ||
        lunch_money
    )
    const addressVal =
      document.querySelector<HTMLTextAreaElement>('#address')?.value || address

    if (!nikVal.trim()) {
      Swal.fire({ text: 'NIK tidak boleh kosong.', icon: 'warning' })
      return
    }
    if (!fullNameVal.trim()) {
      Swal.fire({ text: 'Nama lengkap tidak boleh kosong.', icon: 'warning' })
      return
    }
    if (!genderValue) {
      Swal.fire({ text: 'Jenis kelamin harus dipilih.', icon: 'warning' })
      return
    }
    if (!religionVal.trim()) {
      Swal.fire({ text: 'Agama tidak boleh kosong.', icon: 'warning' })
      return
    }
    if (!phoneVal.trim()) {
      Swal.fire({ text: 'Nomor telepon tidak boleh kosong.', icon: 'warning' })
      return
    }
    if (!emailVal.trim()) {
      Swal.fire({ text: 'Email tidak boleh kosong.', icon: 'warning' })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailVal.trim())) {
      Swal.fire({ text: 'Format email tidak valid.', icon: 'warning' })
      return
    }

    if (!joinedDateVal.trim()) {
      Swal.fire({ text: 'Tanggal masuk tidak boleh kosong.', icon: 'warning' })
      return
    }
    if (!positionVal.trim()) {
      Swal.fire({ text: 'Jabatan tidak boleh kosong.', icon: 'warning' })
      return
    }
    if (!addressVal.trim()) {
      Swal.fire({ text: 'Alamat tidak boleh kosong.', icon: 'warning' })
      return
    }

    const payload = {
      nik: nikVal.trim(),
      full_name: fullNameVal.trim(),
      gender: genderValue.toLowerCase() === 'female' ? 'Female' : 'Male',
      address: addressVal.trim(),
      religion: religionVal.trim(),
      phone_number: phoneVal.trim(),
      email: emailVal.trim(),
      joined_date: joinedDateVal.trim(),
      position: positionVal.trim(),
      base_salary: salaryVal,
      lunch_money: lunchMoneyVal,
    }

    try {
      const response = await apiFetch(`/employee/${ID}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      if (response.status === 401) {
        UnauthorizedAccess(router)
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error || 'Gagal memperbarui data karyawan.')
      }

      setOpen(false)
      await Swal.fire({
        text: 'Data karyawan berhasil diperbarui.',
        icon: 'success',
        confirmButtonText: 'OK',
      })

      if (onDataChange) onDataChange()
      else router.refresh()
    } catch (error) {
      console.error('Error updating employee:', error)
      Swal.fire({
        text:
          error instanceof Error
            ? error.message
            : 'Gagal memperbarui data karyawan.',
        icon: 'error',
        confirmButtonText: 'OK',
      })
    }
  }

  return (
    <Dialog
      size={'xl'}
      className="max-h-[90vh] overflow-y-auto"
      handler={() => setOpen(!open)}
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
      open={open}
      onResize={undefined}
      onResizeCapture={undefined}
    >
      <DialogHeader
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        Ubah Data Karyawan
      </DialogHeader>
      <DialogBody
        className="px-2 md:px-6"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        <EmployeeForm
          ID={ID}
          nik={nik}
          full_name={full_name}
          gender={genderValue}
          address={address}
          religion={religion}
          phone_number={phone_number}
          email={email}
          joined_date={joined_date}
          position={position}
          base_salary={base_salary}
          lunch_money={lunch_money}
          onGenderChange={setGenderValue}
          isEdit={true}
        />
      </DialogBody>
      <DialogFooter
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        <Button
          variant="text"
          color="red"
          onClick={() => setOpen(false)}
          className="mr-1"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <span>Batal</span>
        </Button>
        <Button
          variant="gradient"
          color="green"
          onClick={handleConfirm}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <span>Konfirmasi</span>
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
