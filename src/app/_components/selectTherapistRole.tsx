'use client'
import React from 'react'
import { Select, Option } from '@material-tailwind/react'

interface ControlledSelectProps {
  id?: string
  value?: string
  defaultValue?: string
  label: string
  onChange: (value: string) => void
}
export function ControlledSelect({
  id,
  label,
  value,
  onChange,
}: ControlledSelectProps) {
  const handleChange = (value: string | undefined) => {
    onChange(value ?? '')
  }
  const [therapists] = React.useState<{ ID: string; role: string }[]>([
    { ID: '1', role: 'therapist-senior' },
    { ID: '2', role: 'therapist-master' },
  ])

  return (
    <div className="w-72">
      <Select
        id={id}
        label={label}
        value={value}
        defaultValue={value}
        onChange={handleChange}
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        {therapists.map((therapist) => (
          <Option key={therapist.ID} value={therapist.role}>
            {therapist.role}
          </Option>
        ))}
      </Select>
    </div>
  )
}
