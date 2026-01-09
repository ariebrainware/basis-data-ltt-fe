import { normalizeGenderValue } from '../normalizeGender'

describe('normalizeGenderValue', () => {
  describe('Male gender variations', () => {
    test('normalizes "l" to "male"', () => {
      expect(normalizeGenderValue('l')).toBe('male')
    })

    test('normalizes "L" (uppercase) to "male"', () => {
      expect(normalizeGenderValue('L')).toBe('male')
    })

    test('normalizes "m" to "male"', () => {
      expect(normalizeGenderValue('m')).toBe('male')
    })

    test('normalizes "M" (uppercase) to "male"', () => {
      expect(normalizeGenderValue('M')).toBe('male')
    })

    test('normalizes "male" to "male"', () => {
      expect(normalizeGenderValue('male')).toBe('male')
    })

    test('normalizes "Male" (mixed case) to "male"', () => {
      expect(normalizeGenderValue('Male')).toBe('male')
    })

    test('normalizes "MALE" (uppercase) to "male"', () => {
      expect(normalizeGenderValue('MALE')).toBe('male')
    })

    test('normalizes "laki-laki" to "male"', () => {
      expect(normalizeGenderValue('laki-laki')).toBe('male')
    })

    test('normalizes "Laki-Laki" (mixed case) to "male"', () => {
      expect(normalizeGenderValue('Laki-Laki')).toBe('male')
    })

    test('normalizes "laki" to "male"', () => {
      expect(normalizeGenderValue('laki')).toBe('male')
    })
  })

  describe('Female gender variations', () => {
    test('normalizes "p" to "female"', () => {
      expect(normalizeGenderValue('p')).toBe('female')
    })

    test('normalizes "P" (uppercase) to "female"', () => {
      expect(normalizeGenderValue('P')).toBe('female')
    })

    test('normalizes "f" to "female"', () => {
      expect(normalizeGenderValue('f')).toBe('female')
    })

    test('normalizes "F" (uppercase) to "female"', () => {
      expect(normalizeGenderValue('F')).toBe('female')
    })

    test('normalizes "female" to "female"', () => {
      expect(normalizeGenderValue('female')).toBe('female')
    })

    test('normalizes "Female" (mixed case) to "female"', () => {
      expect(normalizeGenderValue('Female')).toBe('female')
    })

    test('normalizes "FEMALE" (uppercase) to "female"', () => {
      expect(normalizeGenderValue('FEMALE')).toBe('female')
    })

    test('normalizes "perempuan" to "female"', () => {
      expect(normalizeGenderValue('perempuan')).toBe('female')
    })

    test('normalizes "Perempuan" (mixed case) to "female"', () => {
      expect(normalizeGenderValue('Perempuan')).toBe('female')
    })
  })

  describe('Other gender values', () => {
    test('normalizes "other" to "other"', () => {
      expect(normalizeGenderValue('other')).toBe('other')
    })

    test('normalizes "non-binary" to "other"', () => {
      expect(normalizeGenderValue('non-binary')).toBe('other')
    })

    test('normalizes any unrecognized string to "other"', () => {
      expect(normalizeGenderValue('xyz')).toBe('other')
    })

    test('normalizes numeric values to "other"', () => {
      expect(normalizeGenderValue(123)).toBe('other')
    })
  })

  describe('Empty/null/undefined values', () => {
    test('returns empty string for empty string', () => {
      expect(normalizeGenderValue('')).toBe('')
    })

    test('returns empty string for null', () => {
      expect(normalizeGenderValue(null)).toBe('')
    })

    test('returns empty string for undefined', () => {
      expect(normalizeGenderValue(undefined)).toBe('')
    })

    test('returns empty string for 0', () => {
      expect(normalizeGenderValue(0)).toBe('')
    })
  })

  describe('Edge cases', () => {
    test('handles strings with extra whitespace', () => {
      // Note: Current implementation doesn't trim, so this would be 'other'
      // If trimming is desired, the function should be updated
      expect(normalizeGenderValue(' male ')).toBe('other')
    })

    test('handles mixed case correctly', () => {
      expect(normalizeGenderValue('MaLe')).toBe('male')
      expect(normalizeGenderValue('FeMaLe')).toBe('female')
    })
  })
})
