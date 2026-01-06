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

// Remove existing window.location if possible
delete window.location
// Now safely re-define
Object.defineProperty(window, 'location', {
  configurable: true,
  value: {
    assign: jest.fn(),
    reload: jest.fn(),
    replace: jest.fn(),
    href: '',
    origin: 'http://localhost',
    pathname: '/',
    search: '',
    hash: '',
  },
})

// Mock environment variables
process.env.NEXT_PUBLIC_API_HOST = 'http://localhost:19091'
process.env.NEXT_PUBLIC_API_TOKEN = 'test-token'
