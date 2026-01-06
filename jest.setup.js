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
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    reload: jest.fn(),
    assign: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
})

// Mock environment variables
process.env.NEXT_PUBLIC_API_HOST = 'http://localhost:19091'
process.env.NEXT_PUBLIC_API_TOKEN = 'test-token'
