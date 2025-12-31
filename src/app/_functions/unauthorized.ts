export function UnauthorizedAccess() {
  window.location.href = '/login'
  localStorage.removeItem('session-token')
  localStorage.removeItem('user-role')
  localStorage.removeItem('user-id')
}
