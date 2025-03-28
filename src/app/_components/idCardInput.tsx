'use client'
import React from 'react'
import { Input } from '@material-tailwind/react'

interface IDCardInputProps {
  id?: string
  onChange: (value: string) => void
  value: string
}
export default function IDCardInput({
  value,
  onChange,
  id = 'idCardNumber',
}: IDCardInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any spaces, then add a space after every 4 digits.
    const rawValue = e.target.value.replace(/\s/g, '')
    const formattedValue = rawValue.replace(/(\d{4})/g, '$1 ').trim()
    onChange(formattedValue)
  }

  return (
    <div className="w-full max-w-sm">
      <Input
        id={id}
        type="text"
        placeholder="1234 5678 9012 3456"
        maxLength={19}
        className="appearance-none !border-t-blue-gray-200 placeholder:text-blue-gray-300  placeholder:opacity-100 focus:!border-t-gray-900 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        labelProps={{
          className: 'before:content-none after:content-none',
        }}
        containerProps={{
          className: 'min-w-0',
        }}
        value={value}
        onChange={handleChange}
        crossOrigin={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      />
    </div>
  )
}
