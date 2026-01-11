import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { DiseaseForm } from '../diseaseForm'
import { DiseaseType } from '@/app/_types/disease'

// Mock Material Tailwind components used in DiseaseForm
jest.mock('@material-tailwind/react', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  Input: (props: React.ComponentProps<'input'> & { label?: string }) => (
    <input
      {...props}
      id={props.id}
      data-testid={String(props.id)}
      aria-label={props.label}
    />
  ),
  Textarea: (props: React.ComponentProps<'textarea'> & { label?: string }) => (
    <textarea
      {...props}
      id={props.id}
      data-testid={String(props.id)}
      aria-label={props.label}
    />
  ),
}))

describe('DiseaseForm Component', () => {
  const mockDisease: DiseaseType = {
    ID: 1,
    name: 'Influenza',
    description: 'A common viral infection.',
  }

  test('renders disease form fields with values', () => {
    render(<DiseaseForm {...mockDisease} />)

    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('ID')).toBeInTheDocument()
    expect(screen.getByTestId('name')).toBeInTheDocument()
    expect(screen.getByTestId('description')).toBeInTheDocument()

    expect(screen.getByTestId('ID')).toHaveValue('1')
    expect(screen.getByTestId('name')).toHaveValue('Influenza')
    expect(screen.getByTestId('description')).toHaveValue(
      'A common viral infection.'
    )
  })

  test('renders empty fields when no data provided', () => {
    render(<DiseaseForm ID={0} name={''} description={''} />)

    expect(screen.getByTestId('ID')).toHaveValue('0')
    expect(screen.getByTestId('name')).toHaveValue('')
    expect(screen.getByTestId('description')).toHaveValue('')
  })

  test('ID field is disabled', () => {
    render(<DiseaseForm {...mockDisease} />)
    expect(screen.getByTestId('ID')).toBeDisabled()
  })
})
