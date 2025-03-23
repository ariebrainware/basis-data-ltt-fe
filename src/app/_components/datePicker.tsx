/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState } from 'react'
import Datepicker from 'react-tailwindcss-datepicker'

interface DatePickerProps {
  id?: string
}

const DatePicker = ({ id }: DatePickerProps) => {
  const [value, setValue] = useState<any>({
    startDate: null,
    endDate: null,
  })

  return (
    <Datepicker
      inputId={id}
      placeholder="TTTT-BB-HH"
      useRange={false}
      asSingle={true}
      value={value}
      onChange={(newValue) => setValue(newValue)}
    />
  )
}

export default DatePicker
