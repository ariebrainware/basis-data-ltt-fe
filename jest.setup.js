// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock `next/navigation` so `useRouter()` is available in tests
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    pathname: '/',
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

// Filter out specific React DOM warnings that occur due to forwarded props
const _consoleError = console.error.bind(console)
console.error = (...args) => {
  try {
    // If any argument contains known React DOM warnings that are noisy in tests,
    // swallow them to keep test output focused on real failures.
    const anyArg = args.find((a) => typeof a === 'string' || a instanceof Error)
    const s = anyArg ? String(anyArg) : ''
    const ignoredSubstrings = [
      'Unknown event handler property `onPointer',
      '<tbody> cannot contain',
      'cannot be a child of <tbody>',
      'not wrapped in act(',
    ]
    if (ignoredSubstrings.some((sub) => s.includes(sub))) {
      return
    }
  } catch (e) {
    // fall through to default behavior on unexpected errors
  }
  return _consoleError(...args)
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Safely mock `window.location` methods/properties without forcing re-definition
const createLocationMock = () => ({
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
  href: '',
  origin: 'http://localhost',
  pathname: '/',
  search: '',
  hash: '',
})

try {
  // Try to redefine when configurable (older environments/tests may allow this)
  const desc = Object.getOwnPropertyDescriptor(window, 'location')
  if (!desc || desc.configurable) {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: createLocationMock(),
    })
  } else {
    // Fallback: patch methods on existing Location object
    const loc = window.location
    const mock = createLocationMock()
    try {
      loc.assign = mock.assign
    } catch {}
    try {
      loc.reload = mock.reload
    } catch {}
    try {
      loc.replace = mock.replace
    } catch {}
    try {
      Object.defineProperty(loc, 'href', {
        configurable: true,
        writable: true,
        value: mock.href,
      })
    } catch {}
    try {
      Object.defineProperty(loc, 'origin', {
        configurable: true,
        writable: true,
        value: mock.origin,
      })
    } catch {}
    try {
      Object.defineProperty(loc, 'pathname', {
        configurable: true,
        writable: true,
        value: mock.pathname,
      })
    } catch {}
    try {
      Object.defineProperty(loc, 'search', {
        configurable: true,
        writable: true,
        value: mock.search,
      })
    } catch {}
    try {
      Object.defineProperty(loc, 'hash', {
        configurable: true,
        writable: true,
        value: mock.hash,
      })
    } catch {}
  }
} catch {
  // As a last resort, ensure methods exist and are jest functions
  try {
    window.location.assign = jest.fn()
  } catch {}
  try {
    window.location.reload = jest.fn()
  } catch {}
  try {
    window.location.replace = jest.fn()
  } catch {}
}

// Mock environment variables
process.env.NEXT_PUBLIC_API_HOST = 'https://localhost:19091'
process.env.NEXT_PUBLIC_API_TOKEN = 'test-token'

// Provide a basic `fetch` mock for tests that call browser APIs
global.fetch =
  global.fetch ||
  jest.fn((url) => {
    // Return sensible defaults depending on endpoint
    const stringUrl = String(url)
    if (stringUrl.includes('/therapist')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { therapists: [] }, total: 0 }),
      })
    }
    if (stringUrl.includes('/patient')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { patients: [] }, total: 0 }),
      })
    }
    if (stringUrl.includes('/treatment')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { treatments: [] }, total: 0 }),
      })
    }
    // default
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  })
