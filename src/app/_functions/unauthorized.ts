export function UnauthorizedAccess() {
  try {
    const isE2E = window.localStorage.getItem('__E2E_TEST__') === '1'
    // Always clear session-related storage
    localStorage.removeItem('session-token')
    localStorage.removeItem('user-role')
    localStorage.removeItem('user-id')

    // During E2E tests we skip the redirect to allow tests to control navigation
    if (!isE2E) {
      window.location.href = '/login'
    }
  } catch (err) {
    // If localStorage isn't available or other errors occur, attempt best-effort redirect
    try {
      window.location.href = '/login'
    } catch {
      // no-op
    }
  }
}
