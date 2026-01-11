import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DiseaseRow from '../diseaseRow'

// Mock Material Tailwind components used in DiseaseRow (and DiseaseForm)
jest.mock('@material-tailwind/react', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogBody: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-body">{children}</div>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
  Button: (props: any) => (
    <button
      onClick={props.onClick}
      data-testid={props['data-testid'] || undefined}
    >
      {props.children}
    </button>
  ),
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

// Mock helper modules used by the component
jest.mock('../../_functions/sessionToken', () => ({
  getSessionToken: () => 'mock-session-token',
}))

jest.mock('../../_functions/apiHost', () => ({
  getApiHost: () => 'http://localhost:19091',
}))

jest.mock('../../_functions/unauthorized', () => ({
  UnauthorizedAccess: jest.fn(),
}))

jest.mock('../../_hooks/useDeleteResource', () => ({
  useDeleteResource: () => jest.fn(),
}))

// Mock Swal
jest.mock('sweetalert2', () => ({
  fire: jest.fn(() => Promise.resolve({})),
}))

describe('DiseaseRow Component', () => {
  const mockOnDataChange = jest.fn()

  beforeEach(() => {
    // Reset mocks
    mockOnDataChange.mockReset()
    // Mock fetch
    // @ts-ignore
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: async () => ({}) })
    )
  })

  test('renders table row cells', () => {
    render(
      <table>
        <tbody>
          <DiseaseRow
            ID={1}
            name={'Flu'}
            description={'Viral'}
            onDataChange={mockOnDataChange}
          />
        </tbody>
      </table>
    )

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Flu')).toBeInTheDocument()
    expect(screen.getAllByText('Viral').length).toBeGreaterThanOrEqual(1)
  })

  test('clicking confirm triggers update flow and calls onDataChange', async () => {
    render(
      <table>
        <tbody>
          <DiseaseRow
            ID={1}
            name={'Flu'}
            description={'Viral'}
            onDataChange={mockOnDataChange}
          />
        </tbody>
      </table>
    )

    // Open edit dialog by clicking the edit button
    const editButton = screen.getByLabelText('Edit disease')
    fireEvent.click(editButton)

    // Confirm button exists in dialog footer and triggers update
    const confirmButton = screen.getByText('Confirm')
    fireEvent.click(confirmButton)

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    await waitFor(() => expect(mockOnDataChange).toHaveBeenCalled())
  })
})
