import {
  resolveHealthConditionInput,
  normalizePhoneInput,
  getInputValue,
  getTextAreaValue,
} from '../patientRowForm'
import { DiseaseType } from '../../_types/disease'

describe('patientRowForm helpers', () => {
  describe('resolveHealthConditionInput', () => {
    const mockDiseases: DiseaseType[] = [
      { ID: 1, name: 'Diabetes' } as DiseaseType,
      { ID: 2, name: 'Hypertension' } as DiseaseType,
      { ID: 3, name: 'Heart Disease' } as DiseaseType,
    ]

    test('converts disease names to IDs', () => {
      const result = resolveHealthConditionInput('diabetes, hypertension', mockDiseases)
      expect(result).toBe('1,2')
    })

    test('handles case-insensitive disease name matching', () => {
      const result = resolveHealthConditionInput('DIABETES, HyPeRtEnSiOn', mockDiseases)
      expect(result).toBe('1,2')
    })

    test('preserves existing numeric IDs', () => {
      const result = resolveHealthConditionInput('1,2', mockDiseases)
      expect(result).toBe('1,2')
    })

    test('handles mixed names and IDs', () => {
      const result = resolveHealthConditionInput('1, diabetes', mockDiseases)
      expect(result).toBe('1,1')
    })

    test('returns "-" for locked health input', () => {
      const result = resolveHealthConditionInput('-', mockDiseases)
      expect(result).toBe('-')
    })

    test('returns "-" for empty input', () => {
      const result = resolveHealthConditionInput('', mockDiseases)
      expect(result).toBe('-')
    })

    test('returns "-" for whitespace-only input', () => {
      const result = resolveHealthConditionInput('   ', mockDiseases)
      expect(result).toBe('-')
    })

    test('returns original input for unmatched disease names', () => {
      const result = resolveHealthConditionInput('unknown disease', mockDiseases)
      expect(result).toBe('unknown disease')
    })

    test('handles partial name matches', () => {
      const result = resolveHealthConditionInput('heart', mockDiseases)
      expect(result).toBe('3')
    })

    test('filters out empty strings after splitting', () => {
      const result = resolveHealthConditionInput('diabetes,,hypertension', mockDiseases)
      expect(result).toBe('1,2')
    })
  })

  describe('normalizePhoneInput', () => {
    test('splits comma-separated phone numbers', () => {
      const result = normalizePhoneInput('123-456-7890, 098-765-4321')
      expect(result).toEqual(['123-456-7890', '098-765-4321'])
    })

    test('handles array input', () => {
      const result = normalizePhoneInput(['123-456-7890', '098-765-4321'])
      expect(result).toEqual(['123-456-7890', '098-765-4321'])
    })

    test('trims whitespace from phone numbers', () => {
      const result = normalizePhoneInput('  123-456-7890  ,  098-765-4321  ')
      expect(result).toEqual(['123-456-7890', '098-765-4321'])
    })

    test('filters out empty strings', () => {
      const result = normalizePhoneInput('123-456-7890, , 098-765-4321')
      expect(result).toEqual(['123-456-7890', '098-765-4321'])
    })

    test('returns empty array for undefined input', () => {
      const result = normalizePhoneInput(undefined)
      expect(result).toEqual([])
    })

    test('returns empty array for empty string', () => {
      const result = normalizePhoneInput('')
      expect(result).toEqual([])
    })

    test('handles single phone number', () => {
      const result = normalizePhoneInput('123-456-7890')
      expect(result).toEqual(['123-456-7890'])
    })

    test('filters out whitespace-only entries in array', () => {
      const result = normalizePhoneInput(['123-456-7890', '  ', '098-765-4321'])
      expect(result).toEqual(['123-456-7890', '098-765-4321'])
    })
  })

  describe('getInputValue', () => {
    beforeEach(() => {
      document.body.innerHTML = ''
    })

    test('returns value from input element via selector', () => {
      document.body.innerHTML = '<input id="test" value="test value" />'
      const result = getInputValue('#test')
      expect(result).toBe('test value')
    })

    test('returns value from input element reference', () => {
      const input = document.createElement('input')
      input.value = 'test value'
      const result = getInputValue(input)
      expect(result).toBe('test value')
    })

    test('returns fallback for empty value', () => {
      document.body.innerHTML = '<input id="test" value="" />'
      const result = getInputValue('#test', 'fallback')
      expect(result).toBe('fallback')
    })

    test('returns empty string for non-existent selector without fallback', () => {
      const result = getInputValue('#nonexistent')
      expect(result).toBe('')
    })

    test('returns fallback for non-existent selector', () => {
      const result = getInputValue('#nonexistent', 'fallback')
      expect(result).toBe('fallback')
    })

    test('converts numeric fallback to string', () => {
      const result = getInputValue('#nonexistent', 42)
      expect(result).toBe('42')
    })

    test('handles null target', () => {
      const result = getInputValue(null, 'fallback')
      expect(result).toBe('fallback')
    })

    test('handles undefined target', () => {
      const result = getInputValue(undefined, 'fallback')
      expect(result).toBe('fallback')
    })

    test('returns empty string for null/undefined fallback', () => {
      const result = getInputValue('#nonexistent', null)
      expect(result).toBe('')
    })
  })

  describe('getTextAreaValue', () => {
    beforeEach(() => {
      document.body.innerHTML = ''
    })

    test('returns value from textarea element via selector', () => {
      document.body.innerHTML = '<textarea id="test">test content</textarea>'
      const result = getTextAreaValue('#test')
      expect(result).toBe('test content')
    })

    test('returns value from textarea element reference', () => {
      const textarea = document.createElement('textarea')
      textarea.value = 'test content'
      const result = getTextAreaValue(textarea)
      expect(result).toBe('test content')
    })

    test('returns fallback for empty value', () => {
      document.body.innerHTML = '<textarea id="test"></textarea>'
      const result = getTextAreaValue('#test', 'fallback')
      expect(result).toBe('fallback')
    })

    test('returns empty string for non-existent selector without fallback', () => {
      const result = getTextAreaValue('#nonexistent')
      expect(result).toBe('')
    })

    test('returns fallback for non-existent selector', () => {
      const result = getTextAreaValue('#nonexistent', 'fallback')
      expect(result).toBe('fallback')
    })

    test('handles null target', () => {
      const result = getTextAreaValue(null, 'fallback')
      expect(result).toBe('fallback')
    })

    test('handles undefined target', () => {
      const result = getTextAreaValue(undefined, 'fallback')
      expect(result).toBe('fallback')
    })

    test('returns empty string for undefined fallback', () => {
      const result = getTextAreaValue('#nonexistent', undefined)
      expect(result).toBe('')
    })
  })
})
