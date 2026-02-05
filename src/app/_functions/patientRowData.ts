import { apiFetch } from './apiFetch'
import { UnauthorizedAccess } from './unauthorized'
import { DiseaseType } from '../_types/disease'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

/**
 * Fetches the list of diseases from the API
 * @param router - Next.js app router instance for navigation
 * @returns Promise resolving to an array of DiseaseType objects, or empty array on error
 * @example
 * ```typescript
 * const diseases = await fetchDiseaseList(router)
 * // diseases: DiseaseType[]
 * ```
 */
export async function fetchDiseaseList(router: AppRouterInstance) {
  try {
    const res = await apiFetch('/disease', { method: 'GET' })
    if (res.status === 401) {
      UnauthorizedAccess(router)
      return [] as DiseaseType[]
    }
    if (!res.ok) return [] as DiseaseType[]
    const data = await res.json()
    return extractDiseaseList(data)
  } catch (e) {
    return [] as DiseaseType[]
  }
}

/**
 * Extracts disease list from various API response formats
 * @param data - API response data that may contain diseases in different structures
 * @returns Array of DiseaseType objects, or empty array if not found
 * @example
 * ```typescript
 * const data = { data: { disease: [...] } }
 * const diseases = extractDiseaseList(data)
 * // diseases: DiseaseType[]
 * ```
 */
export function extractDiseaseList(data: any): DiseaseType[] {
  const isLikelyDiseaseArray = (arr: any): boolean => {
    if (!Array.isArray(arr)) return false
    if (arr.length === 0) return true
    const first = arr[0]
    if (first && typeof first === 'object') {
      return (
        'ID' in first || 'id' in first || 'Name' in first || 'name' in first
      )
    }
    return false
  }

  // Direct array
  if (isLikelyDiseaseArray(data)) return data as DiseaseType[]

  // Common nested shapes: { data: { disease: [...] } } or { data: { diseases: [...] } }
  const candidates = [data?.data, data?.Data, data]
  for (const cand of candidates) {
    if (!cand || typeof cand !== 'object') continue
    // direct disease or diseases property
    if (isLikelyDiseaseArray(cand.disease)) {
      return cand.disease as DiseaseType[]
    }
    if (isLikelyDiseaseArray(cand.diseases)) {
      return cand.diseases as DiseaseType[]
    }
    // scan values for the first matching array
    for (const v of Object.values(cand)) {
      if (isLikelyDiseaseArray(v)) return v as DiseaseType[]
    }
  }

  return [] as DiseaseType[]
}
