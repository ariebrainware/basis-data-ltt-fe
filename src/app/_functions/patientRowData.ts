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
  const nested = data?.data?.disease
  if (Array.isArray(nested)) return nested as DiseaseType[]
  if (Array.isArray(data)) return data as DiseaseType[]
  return [] as DiseaseType[]
}
