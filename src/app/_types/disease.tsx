export interface DiseaseType {
  ID: number
  name: string
  description: string
  onDataChange?: () => void
}
