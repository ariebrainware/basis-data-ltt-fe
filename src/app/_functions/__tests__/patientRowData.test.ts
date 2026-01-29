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
  })
})
