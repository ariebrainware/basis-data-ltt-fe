import { extractDiseaseList } from '../patientRowData'
import { DiseaseType } from '../../_types/disease'

describe('patientRowData helpers', () => {
  // Helper factories to reduce duplication in tests
  function d(id: number, name: string): DiseaseType {
    return { ID: id, name } as DiseaseType
  }

  function diseases(...pairs: [number, string][]) {
    return pairs.map(([id, name]) => d(id, name))
  }

  // Shared fixtures to reduce duplication
  const SAMPLE_TWO = diseases([1, 'Diabetes'], [2, 'Hypertension'])
  const SAMPLE_ONE = diseases([1, 'Diabetes'])
  const SAMPLE_WRONG = diseases([99, 'Wrong'])

  describe('extractDiseaseList', () => {
    test('extracts diseases from nested data.disease structure', () => {
      const mockDiseases = SAMPLE_TWO
      const data = {
        data: {
          disease: mockDiseases,
        },
      }
      const result = extractDiseaseList(data)
      expect(result).toEqual(mockDiseases)
    })

    test('extracts diseases from flat array', () => {
      const mockDiseases = SAMPLE_TWO
      const result = extractDiseaseList(mockDiseases)
      expect(result).toEqual(mockDiseases)
    })

    test('returns empty array when data.disease is not an array', () => {
      const data = {
        data: {
          disease: 'not an array',
        },
      }
      const result = extractDiseaseList(data)
      expect(result).toEqual([])
    })

    test('returns empty array when data.disease is missing', () => {
      const data = {
        data: {
          other: 'value',
        },
      }
      const result = extractDiseaseList(data)
      expect(result).toEqual([])
    })

    test('returns empty array when data is missing', () => {
      const data = {}
      const result = extractDiseaseList(data)
      expect(result).toEqual([])
    })

    test('returns empty array when input is null', () => {
      const result = extractDiseaseList(null)
      expect(result).toEqual([])
    })

    test('returns empty array when input is undefined', () => {
      const result = extractDiseaseList(undefined)
      expect(result).toEqual([])
    })

    test('returns empty array when data.disease is null', () => {
      const data = {
        data: {
          disease: null,
        },
      }
      const result = extractDiseaseList(data)
      expect(result).toEqual([])
    })

    test('returns empty array when data.disease is undefined', () => {
      const data = {
        data: {
          disease: undefined,
        },
      }
      const result = extractDiseaseList(data)
      expect(result).toEqual([])
    })

    test('handles empty disease array', () => {
      const data = { data: { disease: [] } }
      const result = extractDiseaseList(data)
      expect(result).toEqual([])
    })

    test('extracts diseases from data.Data (capital D) structure', () => {
      const mockDiseases = SAMPLE_TWO
      const data = { data: { Data: mockDiseases } }
      const result = extractDiseaseList(data)
      expect(result).toEqual(mockDiseases)
    })

    test('extracts diseases from data.diseases (plural) structure', () => {
      const mockDiseases = SAMPLE_TWO
      const data = { data: { diseases: mockDiseases } }
      const result = extractDiseaseList(data)
      expect(result).toEqual(mockDiseases)
    })

    test('extracts diseases from nested data.Data.disease structure', () => {
      const mockDiseases = SAMPLE_TWO
      const data = { data: { Data: { disease: mockDiseases } } }
      const result = extractDiseaseList(data)
      expect(result).toEqual(mockDiseases)
    })

    test('extracts diseases from top-level diseases (plural) structure', () => {
      const mockDiseases = SAMPLE_TWO
      const data = { diseases: mockDiseases }
      const result = extractDiseaseList(data)
      expect(result).toEqual(mockDiseases)
    })

    test('extracts diseases from top-level disease (singular) structure', () => {
      const mockDiseases = SAMPLE_TWO
      const data = { disease: mockDiseases }
      const result = extractDiseaseList(data)
      expect(result).toEqual(mockDiseases)
    })

    test('prefers data.disease over data.diseases when both exist', () => {
      const correctDiseases = SAMPLE_ONE
      const wrongDiseases = SAMPLE_WRONG
      const data = {
        data: { disease: correctDiseases, diseases: wrongDiseases },
      }
      const result = extractDiseaseList(data)
      expect(result).toEqual(correctDiseases)
    })

    test('prefers disease over diseases at top level when both exist', () => {
      const correctDiseases = SAMPLE_ONE
      const wrongDiseases = SAMPLE_WRONG
      const data = { disease: correctDiseases, diseases: wrongDiseases }
      const result = extractDiseaseList(data)
      expect(result).toEqual(correctDiseases)
    })

    test('returns empty array when objects have no disease-like keys', () => {
      const data = {
        data: {
          patients: [{ id: 1, name: 'John' }],
          therapists: [{ id: 2, name: 'Jane' }],
        },
      }
      const result = extractDiseaseList(data)
      expect(result).toEqual([])
    })

    test('validates array items have correct DiseaseType structure', () => {
      const data = { data: { disease: [{ id: 1, label: 'Wrong structure' }] } }
      const result = extractDiseaseList(data)
      expect(result).toEqual([])
    })

    test('accepts array with correct ID and name properties', () => {
      const mockDiseases = SAMPLE_ONE
      const data = { data: { disease: mockDiseases } }
      const result = extractDiseaseList(data)
      expect(result).toEqual(mockDiseases)
    })
  })
})
