'use client'
import React, { useEffect, useState } from 'react'
import { getApiHost } from '../_functions/apiHost'
import { DiseaseType } from '../_types/disease'

interface MultiSelectProps {
  id?: string
  label?: string
  value?: string[]
  onChange: (values: string[]) => void
  disabled?: boolean
  // parent may supply options to avoid duplicate network requests
  options?: DiseaseType[]
}

export function DiseaseMultiSelect({
  id,
  label,
  value: propValue,
  onChange,
  disabled,
  options: propOptions,
}: MultiSelectProps) {
  const [options, setOptions] = useState<DiseaseType[]>(propOptions ?? [])
  const selected = propValue ?? []

  useEffect(() => {
    let mounted = true
    // If parent provided `options` (even an empty array), do not fetch here.
    if (propOptions !== undefined) {
      setOptions(propOptions)
      return () => {
        mounted = false
      }
    }
    // avoid network calls during unit tests
    if (process.env.NODE_ENV === 'test') {
      return () => {
        mounted = false
      }
    }

    ;(async () => {
      try {
        const res = await fetch(`${getApiHost()}/disease`, {
          headers: {
            Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
            'session-token': localStorage.getItem('session-token') ?? '',
          },
        })
        if (!res.ok) return
        const data = await res.json()
        // backend shape: { data: { disease: [...] } } or just []
        const list: DiseaseType[] =
          data?.data?.disease ?? data?.data ?? data ?? []
        if (mounted) setOptions(list)
      } catch (e) {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [propOptions])

  const handleNativeSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const values = Array.from(e.target.options)
      .filter((o) => o.selected)
      .map((o) => o.value)
    onChange(values)
  }

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
        {options.map((opt) => (
          <option key={opt.ID} value={String(opt.ID)}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  )
}
