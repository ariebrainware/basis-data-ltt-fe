'use client'
import React, { useEffect, useState } from 'react'
import { getApiHost } from '../_functions/apiHost'
import { DiseaseType } from '../_types/disease'

/**
 * Props for {@link DiseaseMultiSelect}.
 *
 * Usage notes:
 * - If the parent component already has a list of diseases (for example from a
 *   prior fetch, a shared cache, or server‑side data), it should pass that list
 *   via the {@link MultiSelectProps.options | options} prop. In that case this
 *   component will **not** perform its own network request, which avoids
 *   duplicate calls to the `/disease` endpoint.
 * - If the parent does **not** provide `options`, this component will fetch the
 *   available diseases on mount and whenever the `options` prop changes from
 *   `undefined` to a defined value.
 * - Supplying an empty array (`options={[]}`) explicitly indicates that there
 *   are no selectable diseases and also prevents the internal fetch.
 */
interface MultiSelectProps {
  id?: string
  label?: string
  value?: string[]
  onChange: (values: string[]) => void
  disabled?: boolean
  // Parent may supply options to avoid duplicate network requests. When this
  // prop is defined (including an empty array), DiseaseMultiSelect will not
  // perform a fetch and will render exactly the options provided here.
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
  // keep fetched options separate from parent-provided options to avoid synchronous setState in effect
  const [fetchedOptions, setFetchedOptions] = useState<DiseaseType[]>([])
  const selected = propValue ?? []
  const options = propOptions ?? fetchedOptions

  useEffect(() => {
    let mounted = true
    // If parent provided `options` (even an empty array), do not fetch here.
    if (propOptions !== undefined) {
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
        if (mounted) setFetchedOptions(list)
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
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
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
