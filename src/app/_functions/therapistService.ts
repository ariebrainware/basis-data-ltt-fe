import { apiFetch } from './apiFetch'
import { extractErrorMessage } from './errorMessage'

export type RegisterTherapistPayload = {
  full_name: string
  email: string
  password: string
  address: string
  date_of_birth: string
  phone_number: string
  nik: string
  weight?: number
  height?: number
  role?: string
}

export async function registerTherapist(payload: RegisterTherapistPayload) {
  try {
    const res = await apiFetch('/therapist', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => null)
    if (res.ok) return { ok: true, data }

    const msg = extractErrorMessage(data, 'Gagal mendaftarkan terapis')
    return { ok: false, error: msg, data }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}
