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
  // Ensure the structure matches DiseaseType: requires 'ID' and 'name'
  return 'ID' in (first as any) && 'name' in (first as any)
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
function isPlainObject(v: unknown): v is Record<string, any> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

/**
 * Checks known disease keys in a node and queues nested objects
 * @param node - Object to check
 * @param keysToCheck - Keys to search for
 * @param visited - WeakSet of already visited objects
 * @param queue - Queue of objects to process
 * @returns DiseaseType array if found in known keys, undefined otherwise
 */
function checkKnownKeys(
  node: Record<string, any>,
  keysToCheck: string[],
  visited: WeakSet<Record<string, any>>,
  queue: Record<string, any>[]
): DiseaseType[] | undefined {
  for (const key of keysToCheck) {
    const val = node[key]
    if (looksLikeDiseaseArray(val)) return val
    if (isPlainObject(val) && !visited.has(val)) queue.push(val)
  }
  return undefined
}

/**
 * Inspects all values in a node for disease arrays
 * @param node - Object to inspect
 * @param visited - WeakSet of already visited objects
 * @param queue - Queue of objects to process
 * @returns DiseaseType array if found, undefined otherwise
 */
function inspectNodeValues(
  node: Record<string, any>,
  visited: WeakSet<Record<string, any>>,
  queue: Record<string, any>[]
): DiseaseType[] | undefined {
  for (const val of Object.values(node)) {
    if (looksLikeDiseaseArray(val)) return val
    if (isPlainObject(val) && !visited.has(val)) queue.push(val)
  }
  return undefined
}

function searchForDiseaseArray(cand: any): DiseaseType[] | undefined {
  if (!isPlainObject(cand)) return undefined

  const keysToCheck = ['disease', 'diseases', 'Data']
  const visited = new WeakSet<Record<string, any>>()
  const queue: Record<string, any>[] = [cand]

  while (queue.length) {
    const node = queue.shift()!
    if (!isPlainObject(node) || visited.has(node)) continue
    visited.add(node)

    // Check known keys first
    const knownKeysResult = checkKnownKeys(node, keysToCheck, visited, queue)
    if (knownKeysResult) return knownKeysResult

    // Also inspect any array or object values in the node
    const nodeValuesResult = inspectNodeValues(node, visited, queue)
    if (nodeValuesResult) return nodeValuesResult
  }

  return undefined
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
    // Check if the candidate itself is a disease array
    if (looksLikeDiseaseArray(cand)) return cand
    // Otherwise search for disease keys within the candidate
    const arr = searchForDiseaseArray(cand)
    if (arr) return arr
  }

  // Fallback: search on the top-level data object
  const topLevelArr = searchForDiseaseArray(data)
  if (topLevelArr) return topLevelArr
  return []
}
