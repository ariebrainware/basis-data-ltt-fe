import React from 'react'
import { render } from '@testing-library/react'
import ForcePasswordChangeGuard from '../forcePasswordChangeGuard'

const mockReplace = jest.fn()
let mockPathname = '/dashboard'
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  usePathname: () => mockPathname,
}))

describe('ForcePasswordChangeGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
    mockPathname = '/dashboard'
  })

  test('does nothing when no password change is pending', () => {
    window.localStorage.setItem('session-token', 't')
    render(<ForcePasswordChangeGuard />)
    expect(mockReplace).not.toHaveBeenCalled()
  })

  test('redirects to /profile when password change is pending', () => {
    window.localStorage.setItem('session-token', 't')
    window.localStorage.setItem('must-change-password', '1')
    render(<ForcePasswordChangeGuard />)
    expect(mockReplace).toHaveBeenCalledWith('/profile')
  })

  test('does not redirect when already on /profile', () => {
    mockPathname = '/profile'
    window.localStorage.setItem('session-token', 't')
    window.localStorage.setItem('must-change-password', '1')
    render(<ForcePasswordChangeGuard />)
    expect(mockReplace).not.toHaveBeenCalled()
  })

  test('clears stale flag when there is no session', () => {
    window.localStorage.setItem('must-change-password', '1')
    render(<ForcePasswordChangeGuard />)
    expect(mockReplace).not.toHaveBeenCalled()
    expect(window.localStorage.getItem('must-change-password')).toBeNull()
  })
})
