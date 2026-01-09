import { normalizeGenderValue } from '../selectGender'

describe('normalizeGenderValue', () => {
  test('returns empty string for undefined input', () => {
    expect(normalizeGenderValue(undefined)).toBe('')
  })

  test('returns empty string for empty string input', () => {
    expect(normalizeGenderValue('')).toBe('')
  })

  test('normalizes male variants to "male"', () => {
    expect(normalizeGenderValue('l')).toBe('male')
    expect(normalizeGenderValue('m')).toBe('male')
    expect(normalizeGenderValue('male')).toBe('male')
    expect(normalizeGenderValue('laki-laki')).toBe('male')
    expect(normalizeGenderValue('laki')).toBe('male')
  })

  test('normalizes female variants to "female"', () => {
    expect(normalizeGenderValue('p')).toBe('female')
    expect(normalizeGenderValue('f')).toBe('female')
    expect(normalizeGenderValue('female')).toBe('female')
    expect(normalizeGenderValue('perempuan')).toBe('female')
  })

  test('handles case-insensitive input', () => {
    expect(normalizeGenderValue('Male')).toBe('male')
    expect(normalizeGenderValue('MALE')).toBe('male')
    expect(normalizeGenderValue('Female')).toBe('female')
    expect(normalizeGenderValue('FEMALE')).toBe('female')
    expect(normalizeGenderValue('Laki-Laki')).toBe('male')
    expect(normalizeGenderValue('Perempuan')).toBe('female')
  })

  test('handles input with leading/trailing whitespace', () => {
    expect(normalizeGenderValue('  male  ')).toBe('male')
    expect(normalizeGenderValue('  female  ')).toBe('female')
    expect(normalizeGenderValue('  laki-laki  ')).toBe('male')
  })

  test('returns "other" for unrecognized non-empty values', () => {
    expect(normalizeGenderValue('other')).toBe('other')
    expect(normalizeGenderValue('non-binary')).toBe('other')
    expect(normalizeGenderValue('unknown')).toBe('other')
    expect(normalizeGenderValue('xyz')).toBe('other')
  })

  test('handles mixed case and whitespace', () => {
    expect(normalizeGenderValue('  LAKI-LAKI  ')).toBe('male')
    expect(normalizeGenderValue('  PEREMPUAN  ')).toBe('female')
  })
})
