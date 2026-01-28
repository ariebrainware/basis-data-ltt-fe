const LOCKED_FIELD_KEYS = [
  'locked_until',
  'lockedUntil',
  'lock_expires_at',
  'locked_at',
] as const

export function getLockedFieldFromResponse(responseData: any) {
  const data = responseData?.data
  if (!data) return undefined
  for (const key of LOCKED_FIELD_KEYS) {
    const value = data?.[key]
    if (value) return value
  }
  return undefined
}

export function extractDateStringFromText(text: string) {
  if (!text) return null
  const dateMatch = text.match(
    /(\d{4}[-\/]\d{2}[-\/]\d{2}[ T]\d{2}:\d{2}(:\d{2})?)/
  )
  return dateMatch ? dateMatch[1] : null
}

const USER_ID_ACCESSORS = [
  (data: any) => data?.id,
  (data: any) => data?.user_id,
  (data: any) => data?.therapist_id,
  (data: any) => data?.ID,
  (data: any) => data?.therapist?.ID,
  (data: any) => data?.therapist?.id,
  (data: any) => data?.user?.ID,
  (data: any) => data?.user?.id,
]

export function getUserIdFromResponse(responseData: any) {
  const data = responseData?.data
  if (!data) return undefined
  for (const getValue of USER_ID_ACCESSORS) {
    const value = getValue(data)
    if (value) return value
  }
  return undefined
}
