'use client'
import React from 'react'
import { Select, Option } from '@material-tailwind/react'

interface ControlledSelectProps {
  id?: string
  label: string
  onChange: (value: string) => void
}
export function ControlledSelect({
  id,
  label,
  onChange,
}: ControlledSelectProps) {
  //   const [value, setValue] = React.useState<string | undefined>('therapist')
  const handleChange = (value: string | undefined) => {
    onChange(value ?? '')
  }

  return (
    <div className="w-72">
      <Select id={id} label={label} onChange={handleChange}>
        <Option value="therapist-senior">Terapis Senior</Option>
        <Option value="therapist-master">Terapis Master</Option>
      </Select>
    </div>
  )
}
