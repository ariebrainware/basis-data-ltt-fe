import React from 'react'
import { render, screen } from '@testing-library/react'
import Login from '../page'

const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    pathname: '/login',
    push: jest.fn(),
    replace: mockReplace,
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

jest.mock('@/app/_functions/apiFetch', () => ({
  apiFetch: jest.fn(),
}))

jest.mock('sweetalert2', () => ({
  fire: jest.fn().mockResolvedValue({ isConfirmed: true }),
}))

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
  })

  test('redirects to /dashboard if already logged in (session-token exists)', () => {
    window.localStorage.setItem('session-token', 'mock-existing-token')

    render(<Login />)

    expect(mockReplace).toHaveBeenCalledWith('/dashboard')
  })

  test('redirects to /dashboard if alternative token keys exist', () => {
    window.localStorage.setItem('session_token', 'mock-alt-token')

    render(<Login />)

    expect(mockReplace).toHaveBeenCalledWith('/dashboard')
  })

  test('does not redirect if user is not logged in', () => {
    render(<Login />)

    expect(mockReplace).not.toHaveBeenCalled()
    expect(screen.getByText('Login Lee Tit Tar')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
  })
})
