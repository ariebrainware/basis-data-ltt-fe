'use client'
import React from 'react'
import { Select, Option } from '@material-tailwind/react'
import { getApiHost } from '../_functions/apiHost'
import { getSessionToken } from '../_functions/sessionToken'

interface ControlledSelectProps {
  id?: string
  label: string
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}
export function ControlledSelect({
  id,
  label,
  value: propValue,
  onChange,
  disabled,
}: ControlledSelectProps) {
  const [selectedValue, setSelectedValue] = React.useState<string | undefined>(
    undefined
  )
  const handleChange = (newValue: string | undefined) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('ControlledSelect.handleChange', newValue)
    }
    const stringValue = newValue == null ? undefined : String(newValue)
    setSelectedValue(stringValue)
    onChange(stringValue ?? '')
  }
  const [therapists, setTherapists] = React.useState<
    { ID: string; full_name: string; role: string }[]
  >([])

  React.useEffect(() => {
    fetch(`${getApiHost()}/therapist`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
        'session-token': getSessionToken(),
      },
      credentials: 'include',
      redirect: 'follow',
    })
      .then((res) => res.json())
      .then((data) => {
        const therapistsArray = Array.isArray(data.data.therapists)
          ? data.data.therapists
          : []
        // dedupe by ID to avoid React key collisions
        const uniqueById = Array.from(
          new Map(
            therapistsArray.map((t: unknown) => [
              String((t as { ID: string }).ID),
              t,
            ])
          ).values()
        ) as { ID: string; full_name: string; role: string }[]

        // Warn in development if duplicates were found
        if (process.env.NODE_ENV !== 'production') {
          const duplicateCount = therapistsArray.length - uniqueById.length
          if (duplicateCount > 0) {
            console.warn(
              `[ControlledSelect] Detected ${duplicateCount} duplicate therapist ID(s) in API response. This may indicate a backend data integrity issue.`,
              {
                total: therapistsArray.length,
                unique: uniqueById.length,
                duplicates: duplicateCount,
              }
            )
          }
        }

        setTherapists(uniqueById)
      })
      .catch(() => setTherapists([]))
  }, [])

  React.useEffect(() => {
    if (propValue !== undefined && propValue !== null && propValue !== '') {
      setSelectedValue(String(propValue))
    }
  }, [propValue])

  return (
    <div className="w-full">
      <Select
        id={id}
        label={label}
        defaultValue={
          propValue === '' ? selectedValue : (propValue ?? selectedValue)
        }
        onChange={handleChange}
        disabled={disabled}
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        {therapists.map((therapist) => (
          <Option key={therapist.ID} value={String(therapist.ID)}>
            {therapist.role} | {therapist.full_name}
          </Option>
        ))}
      </Select>
    </div>
  )
}
