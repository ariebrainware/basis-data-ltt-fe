export function UnauthorizedAccess() {
  window.location.href = '/login'
  localStorage.removeItem('session-token')
}
