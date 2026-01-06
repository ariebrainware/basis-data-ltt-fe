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

// Mock window.location properly for jsdom
delete window.location
Object.defineProperty(window, 'location', {
  writable: true,
  value: { assign: jest.fn(), reload: jest.fn(), replace: jest.fn() },
})
globalThis.navigation = {
  // If direct access is used
  navigate: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
}

// Mock environment variables
process.env.NEXT_PUBLIC_API_HOST = 'http://localhost:19091'
process.env.NEXT_PUBLIC_API_TOKEN = 'test-token'
