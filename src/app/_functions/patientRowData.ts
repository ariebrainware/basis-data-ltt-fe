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
 * Type guard to check if a value looks like a DiseaseType array
 * @param arr - Unknown value to check
 * @returns True if arr is an array of DiseaseType objects
 */
function looksLikeDiseaseArray(arr: unknown): arr is DiseaseType[] {
  if (!Array.isArray(arr)) return false
  if (arr.length === 0) return true
  const first = arr[0]
  if (!first || typeof first !== 'object') return false
  return (
    'ID' in (first as any) ||
    'id' in (first as any) ||
    'Name' in (first as any) ||
    'name' in (first as any)
  )
}

/**
 * Finds the first array value in an object
 * @param obj - Object to search
 * @returns First array found, or undefined
 */
function findFirstArrayValue(obj: Record<string, any> | null | undefined) {
  if (!obj || typeof obj !== 'object') return undefined
  for (const v of Object.values(obj)) {
    if (Array.isArray(v)) return v
  }
  return undefined
}

/**
 * Searches for a disease array in common response locations
 * @param cand - Candidate object to search
 * @returns DiseaseType array if found, or undefined
 */
function searchForDiseaseArray(cand: any): DiseaseType[] | undefined {
  if (!cand || typeof cand !== 'object') return undefined
  const arr = cand.disease ?? cand.diseases
  return looksLikeDiseaseArray(arr) ? arr : undefined
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
  // Direct array case
  if (looksLikeDiseaseArray(data)) return data

  // Try common nested candidate locations first
  const candidates = [data?.data, data?.Data]
  for (const cand of candidates) {
    const arr = searchForDiseaseArray(cand)
    if (arr) return arr
  }

  // Fallback: search on the top-level data object
  const topLevelArr = searchForDiseaseArray(data)
  if (topLevelArr) return topLevelArr
  return []
}
