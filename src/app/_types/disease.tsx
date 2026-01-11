export interface DiseaseType {
  ID: number
  name: string
  description: string
}

// UI components that need a callback for when disease data changes
// should use this interface (or define their own props interface)
// instead of putting callbacks directly on the core data model type.
export interface DiseaseComponentProps extends DiseaseType {
  onDataChange?: () => void
}
