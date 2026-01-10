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
  // Fully controlled component - no internal state
  const selected = propValue ?? []

  const handleNativeSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const options = Array.from(e.target.options)
    const values = options.filter((o) => o.selected).map((o) => o.value)
    onChange(values)
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id: optionId, checked } = e.target
    const next = checked
      ? [...selected, optionId]
      : selected.filter((s) => s !== optionId)
    onChange(next)
  }

  // Prefer a native <select multiple> for a compact UI, fall back to checkboxes
  // so tests and non-browser environments continue to work.
  // Render a deterministic DOM for server and client: a native <select multiple>
  // This avoids SSR vs client markup mismatches caused by branching on `window`.
  return (
    <div className="w-full">
      {/* Label is sr-only for accessibility. Parent components must provide 
          their own visible label element to inform sighted users what they're selecting. */}
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
