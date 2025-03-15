'use client'
import React from 'react'
import { Input } from '@material-tailwind/react'

export default function IDCardInput() {
  const [idCardNumber, setIDCardNumber] = React.useState('')

  return (
    <div className="w-full max-w-sm">
      <Input
        type="text"
        placeholder="1234 5678 9012 3456"
        maxLength={19}
        className="!border-t-blue-gray-200 placeholder:text-blue-gray-300 appearance-none  placeholder:opacity-100 focus:!border-t-gray-900 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        labelProps={{
          className: 'before:content-none after:content-none',
        }}
        containerProps={{
          className: 'min-w-0',
        }}
        value={idCardNumber
          .replace(/\s/g, '')
          .replace(/(\d{4})/g, '$1 ')
          .trim()}
        onChange={(e) => setIDCardNumber(e.target.value)}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        crossOrigin={undefined}
      />
    </div>
  )
}
