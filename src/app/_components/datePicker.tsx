'use client'
import { useState } from 'react'
import Datepicker, { type DateValueType } from 'react-tailwindcss-datepicker'

interface DatePickerProps {
  id?: string
  name?: string
  value?: DateValueType | null
  onChange?: (value: DateValueType | null) => void
  placeholder?: string
  disabled?: boolean
}

const DatePicker = ({
  id,
  name,
  value,
  onChange,
  placeholder = 'TTTT-BB-HH',
  disabled,
}: DatePickerProps) => {
  const [internalValue, setInternalValue] = useState<DateValueType | null>(null)
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  return (
    <Datepicker
      inputId={id}
      inputName={name}
      placeholder={placeholder}
      useRange={false}
      asSingle={true}
      value={currentValue}
      disabled={disabled}
      onChange={(newValue) => {
        if (!isControlled) {
          setInternalValue(newValue)
        }
        onChange?.(newValue)
      }}
    />
  )
}

export default DatePicker
