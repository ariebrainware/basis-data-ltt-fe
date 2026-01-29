import { DiseaseType } from '../_types/disease'
import { PatientType } from '../_types/patient'
import { isAdmin } from './userRole'

export type PatientUpdatePayload = Omit<
  PatientType,
  'ID' | 'last_visit' | 'onDataChange' | 'patient_code'
> & {
  patient_code?: string
}

const LOCKED_HEALTH_INPUT = '-'

/**
 * Resolves health condition input by converting disease names to IDs
 * @param input - Comma-separated disease names or IDs
 * @param diseases - Array of available disease types with IDs and names
 * @returns Comma-separated disease IDs, or '-' if locked/empty, or original input if no matches found
 * @example
 * ```typescript
 * const diseases = [{ ID: 1, name: 'Diabetes' }, { ID: 2, name: 'Hypertension' }]
 * resolveHealthConditionInput('diabetes, hypertension', diseases)
 * // returns: '1,2'
 *
 * resolveHealthConditionInput('1,2', diseases)
 * // returns: '1,2'
 *
 * resolveHealthConditionInput('-', diseases)
 * // returns: '-'
 * ```
 */
export function resolveHealthConditionInput(
  input: string,
  diseases: DiseaseType[]
): string {
  if (!input.trim() || input === LOCKED_HEALTH_INPUT) return LOCKED_HEALTH_INPUT
  const items = input
    .split(',')
    .map((it) => it.trim())
    .filter(Boolean)
  const matchedIds = items
    .map((item) => {
      if (/^\d+$/.test(item)) return item
      const match = diseases.find((d) =>
        d.name.toLowerCase().includes(item.toLowerCase())
      )
      return match ? String(match.ID) : null
    })
    .filter(Boolean) as string[]

  if (matchedIds.length === 0) {
    return items.join(',')
  }
  return matchedIds.join(',')
}

/**
 * Normalizes phone number input from various formats into an array
 * @param raw - Phone number(s) as string, array, or undefined
 * @returns Array of trimmed phone number strings, empty array if no valid input
 * @example
 * ```typescript
 * normalizePhoneInput('123-456-7890, 098-765-4321')
 * // returns: ['123-456-7890', '098-765-4321']
 *
 * normalizePhoneInput(['123-456-7890', '098-765-4321'])
 * // returns: ['123-456-7890', '098-765-4321']
 *
 * normalizePhoneInput(undefined)
 * // returns: []
 * ```
 */
export function normalizePhoneInput(
  raw?: string | string[] | undefined
): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map((p) => p.trim()).filter(Boolean)
  return raw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
}

/**
 * Gets the value from an HTML input element or CSS selector
 * @param target - CSS selector string or HTMLInputElement reference
 * @param fallback - Optional fallback value if element value is empty
 * @returns The input value as string, or fallback value, or empty string
 * @example
 * ```typescript
 * getInputValue('#email', 'default@example.com')
 * // returns: value from #email input or 'default@example.com' if empty
 *
 * const inputEl = document.querySelector('#name')
 * getInputValue(inputEl, 'John Doe')
 * // returns: value from inputEl or 'John Doe' if empty
 * ```
 */
export function getInputValue(
  target: string | HTMLInputElement | null | undefined,
  fallback?: string | number | undefined
): string {
  const val =
    typeof target === 'string'
      ? document.querySelector<HTMLInputElement>(target)?.value
      : target?.value
  if (typeof val === 'string' && val !== '') return val
  if (fallback === undefined || fallback === null) return ''
  return String(fallback)
}

/**
 * Gets the value from an HTML textarea element or CSS selector
 * @param target - CSS selector string or HTMLTextAreaElement reference
 * @param fallback - Optional fallback value if element value is empty
 * @returns The textarea value as string, or fallback value, or empty string
 * @example
 * ```typescript
 * getTextAreaValue('#description', 'No description')
 * // returns: value from #description textarea or 'No description' if empty
 * ```
 */
export function getTextAreaValue(
  target: string | HTMLTextAreaElement | null | undefined,
  fallback?: string | undefined
): string {
  const val =
    typeof target === 'string'
      ? document.querySelector<HTMLTextAreaElement>(target)?.value
      : target?.value
  if (typeof val === 'string' && val !== '') return val
  return fallback ?? ''
}

type PatientUpdatePayloadArgs = {
  name: string
  phoneNumber: string | string[] | undefined
  job?: string
  age?: number
  email?: string
  address?: string
  healthHistory?: string
  surgeryHistory?: string
  genderValue: string
  gender?: string
  patientCode?: string
  diseases: DiseaseType[]
}

/**
 * Builds a patient update payload by extracting form values and normalizing data
 * @param args - Patient data arguments including form field references and disease list
 * @returns PatientUpdatePayload object ready for API submission
 * @example
 * ```typescript
 * const payload = buildPatientUpdatePayload({
 *   name: 'John Doe',
 *   phoneNumber: '123-456-7890',
 *   job: 'Engineer',
 *   age: 30,
 *   email: 'john@example.com',
 *   address: '123 Main St',
 *   healthHistory: 'diabetes',
 *   surgeryHistory: 'none',
 *   genderValue: 'male',
 *   diseases: [{ ID: 1, name: 'Diabetes' }]
 * })
 * // Returns normalized payload with resolved health conditions
 * ```
 */
export function buildPatientUpdatePayload(
  args: PatientUpdatePayloadArgs
): PatientUpdatePayload {
  const {
    name,
    phoneNumber,
    job,
    age,
    email,
    address,
    healthHistory,
    surgeryHistory,
    genderValue,
    gender,
    patientCode,
    diseases,
  } = args

  const full_name_new_input = getInputValue('#full_name', name)
  const rawPhoneInput = getInputValue(
    '#phone_number',
    Array.isArray(phoneNumber) ? phoneNumber.join(',') : phoneNumber
  )
  const phone_number_new_input_arr: string[] =
    normalizePhoneInput(rawPhoneInput)
  const job_new_input = getInputValue('#job', job)
  const age_new_input = getInputValue('#age', String(age))
  const email_new_input = getInputValue('#email', email)
  const address_new_input = getInputValue('#address', address)
  const health_history_new_input = getTextAreaValue(
    '#health_history',
    healthHistory || ''
  )
  const surgery_history_new_input = getTextAreaValue(
    '#surgery_history',
    surgeryHistory
  )
  const gender_new_input = genderValue || gender || ''
  const patient_code_new_input = getInputValue('#patient_code', patientCode)

  const payload: PatientUpdatePayload = {
    full_name: full_name_new_input,
    phone_number: phone_number_new_input_arr,
    gender: gender_new_input,
    job: job_new_input,
    age: Number(age_new_input),
    email: email_new_input,
    address: address_new_input,
    health_history: resolveHealthConditionInput(
      health_history_new_input || '',
      diseases
    ),
    surgery_history: surgery_history_new_input,
  }

  if (isAdmin()) {
    payload.patient_code = patient_code_new_input
  }

  return payload
}
