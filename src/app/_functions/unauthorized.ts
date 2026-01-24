export function UnauthorizedAccess(router?: { push?: (p: string) => void }) {
  try {
    const isE2E =
      typeof window !== 'undefined' &&
      window.localStorage.getItem('__E2E_TEST__') === '1'
    // Always clear session-related storage
    try {
      localStorage.removeItem('session-token')
      localStorage.removeItem('user-role')
      localStorage.removeItem('user-id')
    } catch {}

    // During E2E tests we skip the redirect to allow tests to control navigation
    if (!isE2E) {
      if (router && typeof router.push === 'function') {
        router.push('/login')
      } else if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  } catch (err) {
    // If localStorage isn't available or other errors occur, attempt best-effort redirect
    try {
      if (router && typeof router.push === 'function') {
        router.push('/login')
      } else if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    } catch {
      // no-op
    }
  }
}
