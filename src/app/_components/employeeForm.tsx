import React from 'react'
import { Card, Input, Textarea } from '@material-tailwind/react'
import { EmployeeType } from '../_types/employee'
import { GenderSelect } from './selectGender'

interface EmployeeFormProps {
  ID?: number
  nik?: string
  full_name?: string
  gender?: string
  address?: string
  religion?: string
  phone_number?: string
  email?: string
  joined_date?: string
  position?: string
  base_salary?: number
  lunch_money?: number
  onGenderChange?: (value: string) => void
  isEdit?: boolean
}

export function EmployeeForm({
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
  onGenderChange,
  isEdit = false,
}: EmployeeFormProps) {
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
          {/* Left Column */}
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            {isEdit && (
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
            )}
            <Input
              id={isEdit ? 'nik' : 'add_nik'}
              type="text"
              label="NIK"
              defaultValue={nik}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id={isEdit ? 'full_name' : 'add_full_name'}
              type="text"
              label="Nama Lengkap"
              defaultValue={full_name}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <GenderSelect
              id={isEdit ? 'gender' : 'add_gender'}
              label="Jenis Kelamin"
              value={gender}
              onChange={onGenderChange}
            />
            <Input
              id={isEdit ? 'religion' : 'add_religion'}
              type="text"
              label="Agama"
              defaultValue={religion}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id={isEdit ? 'phone_number' : 'add_phone_number'}
              type="text"
              label="Nomor Telepon"
              defaultValue={phone_number}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
          </div>

          {/* Right Column */}
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            <Input
              id={isEdit ? 'email' : 'add_email'}
              type="text"
              label="Email"
              defaultValue={email}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id={isEdit ? 'joined_date' : 'add_joined_date'}
              type="date"
              label="Tanggal Masuk"
              defaultValue={joined_date}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id={isEdit ? 'position' : 'add_position'}
              type="text"
              label="Jabatan"
              defaultValue={position}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id={isEdit ? 'base_salary' : 'add_base_salary'}
              type="number"
              label="Gaji Pokok"
              defaultValue={base_salary}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id={isEdit ? 'lunch_money' : 'add_lunch_money'}
              type="number"
              label="Uang Makan"
              defaultValue={lunch_money}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Textarea
              id={isEdit ? 'address' : 'add_address'}
              label="Alamat"
              defaultValue={address}
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
