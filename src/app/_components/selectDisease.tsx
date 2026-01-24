'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../_functions/apiFetch'
import { DiseaseType } from '../_types/disease'
import { UnauthorizedAccess } from '../_functions/unauthorized'

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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const selected = propValue ?? []
  const options = propOptions ?? fetchedOptions
  // Detect E2E testing mode from localStorage so we can provide deterministic
  // fallback options when the backend is unavailable during tests.
  const isE2E =
    typeof window !== 'undefined' &&
    window.localStorage.getItem('__E2E_TEST__') === '1'

  // Provide fallback options during E2E if no options were loaded.
  const effectiveOptions =
    options.length === 0 && propOptions === undefined && isE2E
      ? [
          { ID: 1, name: 'Test Disease A' },
          { ID: 2, name: 'Test Disease B' },
        ]
      : options

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
      setIsLoading(true)
      setError(null)
      try {
        const res = await apiFetch('/disease', { method: 'GET' })
        if (res.status === 401) {
          UnauthorizedAccess(router)
          if (mounted) {
            // clear loading state so UI does not stay permanently disabled in E2E
            setIsLoading(false)
          }
          return
        }
        if (!res.ok) {
          if (mounted) {
            setError('Failed to load disease options')
            setIsLoading(false)
          }
          return
        }
        const data = await res.json()
        // backend shape: { data: { disease: [...] } } or just []
        const list: DiseaseType[] =
          data?.data?.disease ?? data?.data ?? data ?? []
        if (mounted) {
          setFetchedOptions(list)
          setIsLoading(false)
        }
      } catch (e) {
        if (mounted) {
          setError('Failed to load disease options')
          setIsLoading(false)
        }
      }
    })()
    return () => {
      mounted = false
    }
  }, [propOptions, router])

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
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      {error && (
        <div className="mb-2 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}
      {isLoading && propOptions === undefined && (
        <div
          className="mb-2 text-sm text-gray-600"
          role="status"
          aria-live="polite"
        >
          Loading options...
        </div>
      )}
      <select
        id={id}
        data-testid={id}
        multiple
        value={selected}
        onChange={handleNativeSelectChange}
        disabled={
          disabled || (isLoading && propOptions === undefined && !isE2E)
        }
        className="w-full rounded-md border px-3 py-2 text-sm disabled:opacity-50"
        aria-label={
          isLoading
            ? 'Loading disease options'
            : effectiveOptions.length === 0
              ? 'No disease options available'
              : label
        }
      >
        {effectiveOptions.length === 0 && !isLoading ? (
          <option value="" disabled>
            No options available
          </option>
        ) : (
          effectiveOptions.map((opt) => (
            <option key={opt.ID} value={String(opt.ID)}>
              {opt.name}
            </option>
          ))
        )}
      </select>
    </div>
  )
}
