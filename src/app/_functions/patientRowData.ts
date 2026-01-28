import { apiFetch } from './apiFetch'
import { UnauthorizedAccess } from './unauthorized'
import { DiseaseType } from '../_types/disease'

export async function fetchDiseaseList(router: any) {
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

export function extractDiseaseList(data: any): DiseaseType[] {
  const nested = data?.data?.disease
  if (Array.isArray(nested)) return nested as DiseaseType[]
  if (Array.isArray(data)) return data as DiseaseType[]
  return [] as DiseaseType[]
}
