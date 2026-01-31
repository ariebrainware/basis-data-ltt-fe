import { getApiHost } from '../apiHost'

describe('getApiHost', () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_HOST

  afterEach(() => {
    // Restore original environment variable after each test
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_API_HOST = originalEnv
    } else {
      delete process.env.NEXT_PUBLIC_API_HOST
    }
  })

  describe('when NEXT_PUBLIC_API_HOST is not set', () => {
    test('returns default HTTPS localhost URL', () => {
      delete process.env.NEXT_PUBLIC_API_HOST
      expect(getApiHost()).toBe('https://localhost:19091')
    })
  })

  describe('when NEXT_PUBLIC_API_HOST has a scheme', () => {
    test('preserves https:// scheme', () => {
      process.env.NEXT_PUBLIC_API_HOST = 'https://api.example.com'
      expect(getApiHost()).toBe('https://api.example.com')
    })

    test('preserves http:// scheme', () => {
      process.env.NEXT_PUBLIC_API_HOST = 'http://api.example.com'
      expect(getApiHost()).toBe('http://api.example.com')
    })

    test('preserves https:// scheme for localhost', () => {
      process.env.NEXT_PUBLIC_API_HOST = 'https://localhost:19091'
      expect(getApiHost()).toBe('https://localhost:19091')
    })

    test('preserves http:// scheme for localhost', () => {
      process.env.NEXT_PUBLIC_API_HOST = 'http://localhost:19091'
      expect(getApiHost()).toBe('http://localhost:19091')
    })

    test('preserves https:// scheme with port', () => {
      process.env.NEXT_PUBLIC_API_HOST = 'https://api.example.com:8443'
      expect(getApiHost()).toBe('https://api.example.com:8443')
    })
  })

  describe('when NEXT_PUBLIC_API_HOST lacks a scheme', () => {
    test('defaults localhost to http:// for ease of local development', () => {
      process.env.NEXT_PUBLIC_API_HOST = 'localhost:19091'
      expect(getApiHost()).toBe('http://localhost:19091')
    })

    test('defaults localhost (without port) to http://', () => {
      process.env.NEXT_PUBLIC_API_HOST = 'localhost'
      expect(getApiHost()).toBe('http://localhost')
    })

    test('defaults 127.0.0.1 to http:// for local development', () => {
      process.env.NEXT_PUBLIC_API_HOST = '127.0.0.1:19091'
      expect(getApiHost()).toBe('http://127.0.0.1:19091')
    })

    test('defaults non-localhost domains to https://', () => {
      process.env.NEXT_PUBLIC_API_HOST = 'api.example.com'
      expect(getApiHost()).toBe('https://api.example.com')
    })

    test('defaults non-localhost domains with port to https://', () => {
      process.env.NEXT_PUBLIC_API_HOST = 'api.example.com:8443'
      expect(getApiHost()).toBe('https://api.example.com:8443')
    })

    test('defaults production-like domain to https://', () => {
      process.env.NEXT_PUBLIC_API_HOST = 'api.production-server.com'
      expect(getApiHost()).toBe('https://api.production-server.com')
    })
  })

  describe('edge cases', () => {
    test('handles empty string as undefined', () => {
      process.env.NEXT_PUBLIC_API_HOST = ''
      expect(getApiHost()).toBe('https://localhost:19091')
    })

    test('handles URL with path', () => {
      process.env.NEXT_PUBLIC_API_HOST = 'https://api.example.com/v1'
      expect(getApiHost()).toBe('https://api.example.com/v1')
    })

    test('handles localhost with different casing', () => {
      process.env.NEXT_PUBLIC_API_HOST = 'LocalHost:19091'
      expect(getApiHost()).toBe('http://LocalHost:19091')
    })

    test('handles LOCALHOST in uppercase', () => {
      process.env.NEXT_PUBLIC_API_HOST = 'LOCALHOST:19091'
      expect(getApiHost()).toBe('http://LOCALHOST:19091')
    })
  })
})
