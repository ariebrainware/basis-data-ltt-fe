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
  const [therapists, setTherapists] = React.useState<
    { ID: string; full_name: string; role: string }[]
  >([])

  React.useEffect(() => {
    const host = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:19091'

    fetch(`${host}/therapist`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
        'session-token': localStorage.getItem('session-token') ?? '',
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
        onChange={handleChange}
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
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
