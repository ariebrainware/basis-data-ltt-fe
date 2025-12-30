export function getUserRole(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('user-role')
  }
  return null
}

export function isTherapist(): boolean {
  return getUserRole() === 'therapist'
}

export function isAdmin(): boolean {
  return getUserRole() === 'super_admin'
}
