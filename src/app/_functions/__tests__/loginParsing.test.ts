import {
  getLockedFieldFromResponse,
  extractDateStringFromText,
  getUserIdFromResponse,
} from '../loginParsing'

describe('loginParsing helpers', () => {
  describe('getLockedFieldFromResponse', () => {
    test('extracts locked_until field', () => {
      const response = {
        data: { locked_until: '2024-01-01T12:00:00' },
      }
      expect(getLockedFieldFromResponse(response)).toBe('2024-01-01T12:00:00')
    })

    test('extracts lockedUntil field', () => {
      const response = {
        data: { lockedUntil: '2024-01-01T12:00:00' },
      }
      expect(getLockedFieldFromResponse(response)).toBe('2024-01-01T12:00:00')
    })

    test('extracts lock_expires_at field', () => {
      const response = {
        data: { lock_expires_at: '2024-01-01T12:00:00' },
      }
      expect(getLockedFieldFromResponse(response)).toBe('2024-01-01T12:00:00')
    })

    test('extracts locked_at field', () => {
      const response = {
        data: { locked_at: '2024-01-01T12:00:00' },
      }
      expect(getLockedFieldFromResponse(response)).toBe('2024-01-01T12:00:00')
    })

    test('returns first found field when multiple exist', () => {
      const response = {
        data: {
          locked_until: '2024-01-01T12:00:00',
          lockedUntil: '2024-01-02T12:00:00',
        },
      }
      expect(getLockedFieldFromResponse(response)).toBe('2024-01-01T12:00:00')
    })

    test('returns undefined when no locked field exists', () => {
      const response = {
        data: { token: 'abc123' },
      }
      expect(getLockedFieldFromResponse(response)).toBeUndefined()
    })

    test('returns undefined when data is missing', () => {
      const response = {}
      expect(getLockedFieldFromResponse(response)).toBeUndefined()
    })

    test('returns undefined when responseData is null', () => {
      expect(getLockedFieldFromResponse(null)).toBeUndefined()
    })

    test('returns undefined when responseData is undefined', () => {
      expect(getLockedFieldFromResponse(undefined)).toBeUndefined()
    })
  })

  describe('extractDateStringFromText', () => {
    test('extracts date with time in format YYYY-MM-DD HH:mm:ss', () => {
      const text = 'Account locked until 2024-01-01 12:00:00'
      expect(extractDateStringFromText(text)).toBe('2024-01-01 12:00:00')
    })

    test('extracts date with time in format YYYY-MM-DD HH:mm', () => {
      const text = 'Account locked until 2024-01-01 12:00'
      expect(extractDateStringFromText(text)).toBe('2024-01-01 12:00')
    })

    test('extracts date with ISO format YYYY-MM-DDTHH:mm:ss', () => {
      const text = 'Locked until 2024-01-01T12:00:00'
      expect(extractDateStringFromText(text)).toBe('2024-01-01T12:00:00')
    })

    test('extracts date with ISO format YYYY-MM-DDTHH:mm', () => {
      const text = 'Locked until 2024-01-01T12:00'
      expect(extractDateStringFromText(text)).toBe('2024-01-01T12:00')
    })

    test('extracts date with forward slashes YYYY/MM/DD HH:mm:ss', () => {
      const text = 'Account locked until 2024/01/01 12:00:00'
      expect(extractDateStringFromText(text)).toBe('2024/01/01 12:00:00')
    })

    test('returns null when no date pattern found', () => {
      const text = 'No date here'
      expect(extractDateStringFromText(text)).toBeNull()
    })

    test('returns null for empty string', () => {
      expect(extractDateStringFromText('')).toBeNull()
    })

    test('returns null for whitespace string', () => {
      expect(extractDateStringFromText('   ')).toBeNull()
    })

    test('extracts first date when multiple dates exist', () => {
      const text = 'Date 2024-01-01 12:00:00 and also 2024-12-31 23:59:59'
      expect(extractDateStringFromText(text)).toBe('2024-01-01 12:00:00')
    })
  })

  describe('getUserIdFromResponse', () => {
    test('extracts id from data', () => {
      const response = { data: { id: 123 } }
      expect(getUserIdFromResponse(response)).toBe(123)
    })

    test('extracts user_id from data', () => {
      const response = { data: { user_id: 456 } }
      expect(getUserIdFromResponse(response)).toBe(456)
    })

    test('extracts therapist_id from data', () => {
      const response = { data: { therapist_id: 789 } }
      expect(getUserIdFromResponse(response)).toBe(789)
    })

    test('extracts ID from data', () => {
      const response = { data: { ID: 101 } }
      expect(getUserIdFromResponse(response)).toBe(101)
    })

    test('extracts ID from therapist object', () => {
      const response = { data: { therapist: { ID: 202 } } }
      expect(getUserIdFromResponse(response)).toBe(202)
    })

    test('extracts id from therapist object', () => {
      const response = { data: { therapist: { id: 303 } } }
      expect(getUserIdFromResponse(response)).toBe(303)
    })

    test('extracts ID from user object', () => {
      const response = { data: { user: { ID: 404 } } }
      expect(getUserIdFromResponse(response)).toBe(404)
    })

    test('extracts id from user object', () => {
      const response = { data: { user: { id: 505 } } }
      expect(getUserIdFromResponse(response)).toBe(505)
    })

    test('returns first found ID when multiple exist', () => {
      const response = {
        data: {
          id: 123,
          user_id: 456,
          therapist_id: 789,
        },
      }
      expect(getUserIdFromResponse(response)).toBe(123)
    })

    test('returns undefined when no ID field exists', () => {
      const response = { data: { token: 'abc123' } }
      expect(getUserIdFromResponse(response)).toBeUndefined()
    })

    test('returns undefined when data is missing', () => {
      const response = {}
      expect(getUserIdFromResponse(response)).toBeUndefined()
    })

    test('returns undefined when responseData is null', () => {
      expect(getUserIdFromResponse(null)).toBeUndefined()
    })

    test('returns undefined when responseData is undefined', () => {
      expect(getUserIdFromResponse(undefined)).toBeUndefined()
    })

    test('handles string ID values', () => {
      const response = { data: { id: '123' } }
      expect(getUserIdFromResponse(response)).toBe('123')
    })
  })
})
