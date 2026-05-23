import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import PricingRow from '../pricingRow'
import { apiFetch } from '../../_functions/apiFetch'

const mockRefresh = jest.fn()
const mockDeletePricing = jest.fn()

jest.mock('@material-tailwind/react', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogBody: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Button: (props: any) => (
    <button onClick={props.onClick}>{props.children}</button>
  ),
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Input: (props: React.ComponentProps<'input'> & { label?: string }) => (
    <input {...props} aria-label={props.label} />
  ),
  Textarea: (props: React.ComponentProps<'textarea'> & { label?: string }) => (
    <textarea {...props} aria-label={props.label} />
  ),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

jest.mock('../../_functions/apiFetch', () => ({
  apiFetch: jest.fn(),
}))

jest.mock('../../_functions/unauthorized', () => ({
  UnauthorizedAccess: jest.fn(),
}))

jest.mock('../../_hooks/useDeleteResource', () => ({
  useDeleteResource: () => mockDeletePricing,
}))

jest.mock('sweetalert2', () => ({
  fire: jest.fn(() => Promise.resolve({})),
}))

describe('PricingRow', () => {
  const mockOnDataChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(apiFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    })
  })

  test('submits PATCH payload with name field', async () => {
    render(
      <table>
        <tbody>
          <PricingRow
            ID={1}
            name="Harga Umum"
            amount={10000}
            description="Deskripsi"
            onDataChange={mockOnDataChange}
          />
        </tbody>
      </table>
    )

    fireEvent.click(screen.getByLabelText('Edit pricing'))
    fireEvent.click(screen.getByText('Konfirmasi'))

    await waitFor(() => expect(apiFetch).toHaveBeenCalled())
    const [, request] = (apiFetch as jest.Mock).mock.calls[0]
    expect(request.method).toBe('PATCH')
    expect(JSON.parse(request.body)).toEqual({
      name: 'Harga Umum',
      amount: 10000,
      description: 'Deskripsi',
    })
    await waitFor(() => expect(mockOnDataChange).toHaveBeenCalled())
  })

  test('calls delete handler when delete button is clicked', () => {
    render(
      <table>
        <tbody>
          <PricingRow ID={1} name="Harga Umum" amount={10000} description="" />
        </tbody>
      </table>
    )

    fireEvent.click(screen.getByLabelText('Delete pricing'))

    expect(mockDeletePricing).toHaveBeenCalled()
  })
})
