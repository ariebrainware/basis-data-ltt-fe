'use client'
import React from 'react'
import { Select, Option } from '@material-tailwind/react'
import { getApiHost } from '../_functions/apiHost'
import { getSessionToken } from '../_functions/sessionToken'

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
  const handleChange = (newValue: string | undefined) => {
    console.log('ControlledSelect.handleChange', newValue)
    onChange(newValue ?? '')
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
        setTherapists(therapistsArray)
      })
      .catch(() => setTherapists([]))
  }, [])
  return (
    <div className="w-72">
      <Select
        id={id}
        label={label}
        defaultValue={undefined}
        onChange={handleChange}
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        {therapists.map((therapist) => (
          <Option key={therapist.ID} value={therapist.ID}>
            {therapist.role} | {therapist.full_name}
          </Option>
        ))}
      </Select>
    </div>
  )
}
