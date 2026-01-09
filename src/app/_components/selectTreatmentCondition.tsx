'use client'
import React from 'react'
import { TreatmentConditionOptions } from '../_types/treatmentConditionOptions'

interface MultiSelectProps {
  id?: string
  label?: string
  value?: string[]
  onChange: (values: string[]) => void
  disabled?: boolean
}

export function TreatmentConditionMultiSelect({
  id,
  label,
  value: propValue,
  onChange,
  disabled,
}: MultiSelectProps) {
  const [selected, setSelected] = React.useState<string[]>(propValue ?? [])

  React.useEffect(() => {
    setSelected(propValue ?? [])
  }, [propValue])

  const handleNativeSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const options = Array.from(e.target.options)
    const values = options.filter((o) => o.selected).map((o) => o.value)
    setSelected(values)
    onChange(values)
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id: optionId, checked } = e.target
    const next = checked
      ? [...selected, optionId]
      : selected.filter((s) => s !== optionId)
    setSelected(next)
    onChange(next)
  }

  // Prefer a native <select multiple> for a compact UI, fall back to checkboxes
  // so tests and non-browser environments continue to work.
  const isBrowser = typeof window !== 'undefined'

  if (isBrowser) {
    return (
      <div className="w-full">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <select
          id={id}
          data-testid={id}
          multiple
          value={selected}
          onChange={handleNativeSelectChange}
          disabled={disabled}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          {TreatmentConditionOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  // Non-browser or extremely constrained environment: render checkboxes
  return (
    <div className="flex flex-col">
      {TreatmentConditionOptions.map((option) => (
        <div key={option.id} className="mb-2 flex items-center">
          <input
            id={option.id}
            name={option.id}
            type="checkbox"
            checked={selected.includes(option.id)}
            onChange={handleCheckboxChange}
            disabled={disabled}
          />
          <label htmlFor={option.id} className="ml-2 text-sm font-semibold">
            {option.label}
          </label>
        </div>
      ))}
    </div>
  )
}
