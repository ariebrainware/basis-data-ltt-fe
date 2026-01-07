// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

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
process.env.NEXT_PUBLIC_API_HOST = 'http://localhost:19091'
process.env.NEXT_PUBLIC_API_TOKEN = 'test-token'
