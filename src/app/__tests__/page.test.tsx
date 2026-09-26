import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from '../page'

const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    pathname: '/',
    push: jest.fn(),
    replace: mockReplace,
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

describe('Home Page (/)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
  })

  test('redirects to /dashboard if already logged in (session-token exists)', () => {
    window.localStorage.setItem('session-token', 'mock-session-token')

    render(<Home />)

    expect(mockReplace).toHaveBeenCalledWith('/dashboard')
  })

  test('does not redirect if user is not logged in', () => {
    render(<Home />)

    expect(mockReplace).not.toHaveBeenCalled()
    expect(screen.getByText('Lee Tit Tar One Solution Web')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'LOGIN' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'DAFTAR' })).toBeInTheDocument()
  })
})
