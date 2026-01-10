'use client'
import { useState } from 'react'
import Datepicker from 'react-tailwindcss-datepicker'

interface DatePickerProps {
  id?: string
}

interface DateValueType {
  startDate: Date | string | null
  endDate: Date | string | null
}

const DatePicker = ({ id }: DatePickerProps) => {
  const [value, setValue] = useState<DateValueType>({
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
