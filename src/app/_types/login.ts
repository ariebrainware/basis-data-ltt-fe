/**
 * Type definition for login API response
 */
export type LoginResponseData = {
  data?: {
    token?: string
    role?: string
    name?: string
    username?: string
    email?: string
    id?: number | string
    user_id?: number | string
    therapist_id?: number | string
    ID?: number | string
    therapist?: {
      ID?: number | string
      id?: number | string
      name?: string
    }
    user?: {
      ID?: number | string
      id?: number | string
      name?: string
      username?: string
      email?: string
    }
    locked_until?: string
    lockedUntil?: string
    lock_expires_at?: string
    locked_at?: string
  }
  error?: string
}
