import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from '../page'
import { apiFetch } from '../../_functions/apiFetch'
import Swal from 'sweetalert2'

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

jest.mock('../../_functions/apiFetch', () => ({
  apiFetch: jest.fn(),
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

  test('validates required fields before submitting', async () => {
    render(<Login />)

    const form = screen.getByRole('button', { name: /login/i }).closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'error',
          title: 'Login Failed',
          text: 'Please enter both email and password.',
        })
      )
    })
    expect(apiFetch).not.toHaveBeenCalled()
  })

  test('submits credentials via form submit and handles successful login', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: {
          token: 'token-123',
          role: 'super_admin',
          name: 'Super Admin',
          id: 1,
        },
      }),
    }
    ;(apiFetch as jest.Mock).mockResolvedValue(mockResponse)

    render(<Login />)

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'admin@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'secret123' },
    })

    const form = screen.getByRole('button', { name: /login/i }).closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        '/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'admin@example.com',
            password: 'secret123',
          }),
        })
      )
      expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    })
  })

  test('shows safe generic error without leaking sensitive backend details on failed login', async () => {
    const mockErrorResponse = {
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({
        error:
          'crypto/bcrypt: hashedPassword is not the hash of the given password',
        msg: 'Invalid request payload internal details',
      }),
    }
    ;(apiFetch as jest.Mock).mockResolvedValue(mockErrorResponse)

    render(<Login />)

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' },
    })

    const form = screen.getByRole('button', { name: /login/i }).closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'error',
          title: 'Login Failed',
          text: 'Invalid email or password.',
        })
      )
    })
  })

  test('shows safe generic connection error on network failure', async () => {
    ;(apiFetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'))

    render(<Login />)

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    })

    const form = screen.getByRole('button', { name: /login/i }).closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'error',
          title: 'Connection Error',
          text: 'Unable to connect to the server. Please check your connection and try again.',
        })
      )
    })
  })
})
