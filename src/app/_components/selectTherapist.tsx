'use client'
import React from 'react'
import * as MT from '@material-tailwind/react'
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
    // In test or SSR environments `fetch` may be undefined — guard against that.
    if (typeof fetch === 'undefined') {
      setTherapists([])
      return
    }

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
    if ((propValue ?? '') !== '') {
      setSelectedValue(String(propValue))
    }
  }, [propValue])

  // If the library Select is unavailable (e.g., in lightweight tests),
  // fall back to a native <select> so tests and non-browser envs work.
  const LibrarySelect = (MT as unknown as Record<string, unknown>).Select as
    | React.ElementType
    | undefined
  const LibraryOption = (MT as unknown as Record<string, unknown>).Option as
    | React.ElementType
    | undefined

  const isLibraryAvailable =
    LibrarySelect &&
    LibraryOption &&
    (typeof LibrarySelect === 'function' ||
      typeof LibrarySelect === 'object') &&
    (typeof LibraryOption === 'function' || typeof LibraryOption === 'object')

  if (!isLibraryAvailable) {
    return (
      <div className="w-full">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <select
          id={id}
          data-testid={id}
          defaultValue={
            propValue === '' ? selectedValue : (propValue ?? selectedValue)
          }
          onChange={(e) => handleChange((e.target as HTMLSelectElement).value)}
          disabled={disabled}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          <option value="">Pilih Terapis</option>
          {propValue &&
          !therapists.find((t) => String(t.ID) === String(propValue)) ? (
            <option value={String(propValue)}>{String(propValue)}</option>
          ) : null}
          {therapists.map((therapist) => (
            <option key={therapist.ID} value={String(therapist.ID)}>
              {therapist.role} | {therapist.full_name}
            </option>
          ))}
        </select>
      </div>
    )
  }

  const selectOptions: React.ReactNode[] = [
    ...(propValue &&
    !therapists.find((t) => String(t.ID) === String(propValue))
      ? [
          <LibraryOption key="__prefill" value={String(propValue)}>
            {String(propValue)}
          </LibraryOption>,
        ]
      : []),
    ...therapists.map((therapist) => (
      <LibraryOption key={therapist.ID} value={String(therapist.ID)}>
        {therapist.role} | {therapist.full_name}
      </LibraryOption>
    )),
  ]

  return (
    <div className="w-full">
      <LibrarySelect
        id={id}
        data-testid={id}
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
        {selectOptions}
      </LibrarySelect>
    </div>
  )
}
