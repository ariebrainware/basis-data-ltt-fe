import { extractDiseaseList } from '../patientRowData'
import { DiseaseType } from '../../_types/disease'

describe('patientRowData helpers', () => {
  describe('extractDiseaseList', () => {
    test('extracts diseases from nested data.disease structure', () => {
      const mockDiseases: DiseaseType[] = [
        { ID: 1, name: 'Diabetes' } as DiseaseType,
        { ID: 2, name: 'Hypertension' } as DiseaseType,
      ]
      const data = {
        data: {
          disease: mockDiseases,
        },
      }
      const result = extractDiseaseList(data)
      expect(result).toEqual(mockDiseases)
    })

    test('extracts diseases from flat array', () => {
      const mockDiseases: DiseaseType[] = [
        { ID: 1, name: 'Diabetes' } as DiseaseType,
        { ID: 2, name: 'Hypertension' } as DiseaseType,
      ]
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
      const data = {
        data: {
          disease: [],
        },
      }
      const result = extractDiseaseList(data)
      expect(result).toEqual([])
    })

    test('extracts diseases from data.Data (capital D) structure', () => {
      const mockDiseases: DiseaseType[] = [
        { ID: 1, name: 'Diabetes' } as DiseaseType,
        { ID: 2, name: 'Hypertension' } as DiseaseType,
      ]
      const data = {
        data: {
          Data: mockDiseases,
        },
      }
      const result = extractDiseaseList(data)
      expect(result).toEqual(mockDiseases)
    })

    test('extracts diseases from data.diseases (plural) structure', () => {
      const mockDiseases: DiseaseType[] = [
        { ID: 1, name: 'Diabetes' } as DiseaseType,
        { ID: 2, name: 'Hypertension' } as DiseaseType,
      ]
      const data = {
        data: {
          diseases: mockDiseases,
        },
      }
      const result = extractDiseaseList(data)
      expect(result).toEqual(mockDiseases)
    })

    test('extracts diseases from nested data.Data.disease structure', () => {
      const mockDiseases: DiseaseType[] = [
        { ID: 1, name: 'Diabetes' } as DiseaseType,
        { ID: 2, name: 'Hypertension' } as DiseaseType,
      ]
      const data = {
        data: {
          Data: {
            disease: mockDiseases,
          },
        },
      }
      const result = extractDiseaseList(data)
      expect(result).toEqual(mockDiseases)
    })

    test('extracts diseases from top-level diseases (plural) structure', () => {
      const mockDiseases: DiseaseType[] = [
        { ID: 1, name: 'Diabetes' } as DiseaseType,
        { ID: 2, name: 'Hypertension' } as DiseaseType,
      ]
      const data = {
        diseases: mockDiseases,
      }
      const result = extractDiseaseList(data)
      expect(result).toEqual(mockDiseases)
    })

    test('extracts diseases from top-level disease (singular) structure', () => {
      const mockDiseases: DiseaseType[] = [
        { ID: 1, name: 'Diabetes' } as DiseaseType,
        { ID: 2, name: 'Hypertension' } as DiseaseType,
      ]
      const data = {
        disease: mockDiseases,
      }
      const result = extractDiseaseList(data)
      expect(result).toEqual(mockDiseases)
    })

    test('prefers data.disease over data.diseases when both exist', () => {
      const correctDiseases: DiseaseType[] = [
        { ID: 1, name: 'Diabetes' } as DiseaseType,
      ]
      const wrongDiseases: DiseaseType[] = [
        { ID: 99, name: 'Wrong' } as DiseaseType,
      ]
      const data = {
        data: {
          disease: correctDiseases,
          diseases: wrongDiseases,
        },
      }
      const result = extractDiseaseList(data)
      expect(result).toEqual(correctDiseases)
    })

    test('prefers disease over diseases at top level when both exist', () => {
      const correctDiseases: DiseaseType[] = [
        { ID: 1, name: 'Diabetes' } as DiseaseType,
      ]
      const wrongDiseases: DiseaseType[] = [
        { ID: 99, name: 'Wrong' } as DiseaseType,
      ]
      const data = {
        disease: correctDiseases,
        diseases: wrongDiseases,
      }
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
      const data = {
        data: {
          disease: [
            { id: 1, label: 'Wrong structure' }, // lowercase id, wrong field names
          ],
        },
      }
      const result = extractDiseaseList(data)
      expect(result).toEqual([])
    })

    test('accepts array with correct ID and name properties', () => {
      const mockDiseases: DiseaseType[] = [
        { ID: 1, name: 'Diabetes' } as DiseaseType,
      ]
      const data = {
        data: {
          disease: mockDiseases,
        },
      }
      const result = extractDiseaseList(data)
      expect(result).toEqual(mockDiseases)
    })
  })
})
