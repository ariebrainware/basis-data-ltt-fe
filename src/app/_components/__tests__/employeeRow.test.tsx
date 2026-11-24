import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import EmployeeRow from '../employeeRow'

const mockPush = jest.fn()
const mockRouter = { push: mockPush, refresh: jest.fn(), replace: jest.fn() }
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

jest.mock('../employeeRowActions', () => ({
  __esModule: true,
  default: () => (
    <div>
      <button aria-label="Edit employee">edit</button>
      <span>dialog content</span>
    </div>
  ),
}))

const employee = {
  ID: 12,
  nik: '3201000000000001',
  full_name: 'Jane Doe',
  gender: 'Female',
  address: 'Jl. Mawar',
  religion: 'Islam',
  phone_number: '0812',
  email: 'jane@example.com',
  joined_date: '2026-01-01',
  position: 'Staff',
  base_salary: 1000,
  lunch_money: 100,
}

function renderRow() {
  return render(
    <table>
      <tbody>
        <EmployeeRow {...employee} />
      </tbody>
    </table>
  )
}

describe('EmployeeRow', () => {
  beforeEach(() => jest.clearAllMocks())

  it('opens the detail page when any cell is clicked', () => {
    renderRow()
    fireEvent.click(screen.getByText('3201000000000001'))
    expect(mockPush).toHaveBeenCalledWith('/employee/12')

    mockPush.mockClear()
    fireEvent.click(screen.getByText('Islam'))
    expect(mockPush).toHaveBeenCalledWith('/employee/12')
  })

  it('opens a new tab on cmd/ctrl click', () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null)
    renderRow()
    fireEvent.click(screen.getByText('Islam'), { metaKey: true })
    expect(open).toHaveBeenCalledWith(
      '/employee/12',
      '_blank',
      'noopener,noreferrer'
    )
    expect(mockPush).not.toHaveBeenCalled()
    open.mockRestore()
  })

  it('does not navigate from the actions cell', () => {
    renderRow()
    fireEvent.click(screen.getByLabelText('Edit employee'))
    fireEvent.click(screen.getByText('dialog content'))
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('leaves the name link to handle its own click', () => {
    renderRow()
    const link = screen.getByRole('link', { name: 'Jane Doe' })
    expect(link).toHaveAttribute('href', '/employee/12')
    fireEvent.click(link)
    expect(mockPush).not.toHaveBeenCalled()
  })
})
