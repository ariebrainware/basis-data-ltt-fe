'use client'
import React from 'react'
import { Select, Option } from '@material-tailwind/react'

interface GenderSelectProps {
  id?: string
  label: string
  value?: string
  onChange?: (value: string) => void
}

/**
 * Normalizes various gender input values to standardized options
 * @param gender - The gender value to normalize
 * @returns Normalized gender value ('male', 'female', 'other', or empty string)
 */
export function normalizeGenderValue(gender: string | undefined): string {
  if (!gender) return ''

  const normalizedGender = gender.toLowerCase().trim()

  // Check for male variants
  if (['l', 'm', 'male', 'laki-laki', 'laki'].includes(normalizedGender)) {
    return 'male'
  }

  // Check for female variants
  if (['p', 'f', 'female', 'perempuan'].includes(normalizedGender)) {
    return 'female'
  }

  // If there's a value but it doesn't match male/female, return 'other'
  return 'other'
}

export function GenderSelect({
  id,
  label,
  value,
  onChange,
}: GenderSelectProps) {
  const [selectedValue, setSelectedValue] = React.useState<string>(
    normalizeGenderValue(value)
  )

  const handleChange = (newValue: string | undefined) => {
    const stringValue = newValue ?? ''
    setSelectedValue(stringValue)
    if (onChange) {
      onChange(stringValue)
    }
  }

  React.useEffect(() => {
    setSelectedValue(normalizeGenderValue(value))
  }, [value])

  return (
    <div className="w-full">
      <Select
        id={id}
        data-testid={id}
        label={label}
        value={selectedValue}
        onChange={handleChange}
      >
        <Option value="">Pilih Jenis Kelamin</Option>
        <Option value="male">Laki-laki</Option>
        <Option value="female">Perempuan</Option>
        <Option value="other">Lainnya</Option>
      </Select>
    </div>
  )
}
