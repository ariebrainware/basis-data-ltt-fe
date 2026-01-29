/**
 * Type definition for login API response
 */
export type LoginResponseData = {
  data?: {
    token?: string
    role?: string
    id?: number
    user_id?: number
    therapist_id?: number
    ID?: number
    therapist?: {
      ID?: number
      id?: number
    }
    user?: {
      ID?: number
      id?: number
    }
    locked_until?: string
    lockedUntil?: string
    lock_expires_at?: string
    locked_at?: string
  }
  error?: string
}
