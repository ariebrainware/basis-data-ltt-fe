'use client'

import React, { useEffect, useId, useState } from 'react'

type TimePickerProps = {
  id?: string
  label?: string
  value?: string | null // expected "HH:mm" (24h) or "h:mm A" (12h) depending on format
  onChange?: (value: string | null) => void
  step?: number // minutes step
  format?: 12 | 24
  placeholder?: string
  className?: string
  disabled?: boolean
  min?: string | null // optional min time in "HH:mm"
  max?: string | null // optional max time in "HH:mm"
}

export default function TimePicker({
  id,
  label,
  value = null,
  onChange,
  step = 15,
  // keep props for compatibility but not used in this simple version
  placeholder = 'HH:MM',
  className = '',
  disabled = false,
  min = null,
  max = null,
}: TimePickerProps) {
  const generatedId = useId()
  const uid = id ?? generatedId
  const [internal, setInternal] = useState<string | null>(value ?? null)

  useEffect(() => {
    setInternal(value ?? null)
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value // "" or "HH:MM" (browser provides HH:MM for type="time")
    setInternal(v || null)
    onChange?.(v || null)
  }

  return (
    <div className={`relative ${className}`}>
      {label ? (
        <label
          htmlFor={uid}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      ) : null}
      <input
        id={uid}
        type="time"
        value={internal ?? ''}
        onChange={handleChange}
        disabled={disabled}
        min={min ?? undefined}
        max={max ?? undefined}
        step={Math.max(1, step) * 60} // step in seconds for <input type="time">
        placeholder={placeholder}
        className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  )
}
