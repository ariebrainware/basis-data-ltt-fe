'use client'
import { useState } from 'react'
import Datepicker, { type DateValueType } from 'react-tailwindcss-datepicker'

interface DatePickerProps {
  id?: string
}

const DatePicker = ({ id }: DatePickerProps) => {
  const [value, setValue] = useState<DateValueType | null>(null)

  return (
    <Datepicker
      inputId={id}
      placeholder="TTTT-BB-HH"
      useRange={false}
      asSingle={true}
      value={value}
      onChange={(newValue, e) => setValue(newValue)}
    />
  )
}

export default DatePicker
