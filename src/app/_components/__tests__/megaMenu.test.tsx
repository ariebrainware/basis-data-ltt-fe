import React from 'react'
import { render, screen } from '@testing-library/react'
import MegaMenuDefault from '../megaMenu'

const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}))

jest.mock('@/app/_functions/profileService', () => ({
  fetchUserProfile: jest.fn().mockResolvedValue({ name: 'Fetched User' }),
}))

describe('MegaMenuDefault Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
  })

  test('renders brand title and home navigation', async () => {
    render(<MegaMenuDefault />)

    expect(screen.getByText('Lee Tit Tar Dashboard')).toBeInTheDocument()
    expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Profile').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Log Out').length).toBeGreaterThanOrEqual(1)
  })

  test('displays personalized user name when user-name is stored in localStorage', async () => {
    window.localStorage.setItem('user-name', 'Budi Pratama')
    window.localStorage.setItem('user-role', 'super_admin')

    render(<MegaMenuDefault />)

    const userProfileEls = screen.getAllByTestId('nav-user-profile')
    expect(userProfileEls.length).toBeGreaterThanOrEqual(1)
    const usernameEls = screen.getAllByTestId('nav-username')
    expect(usernameEls[0]).toHaveTextContent('Budi Pratama')
    expect(screen.getAllByText('Super Admin').length).toBeGreaterThanOrEqual(1)
  })

  test('displays role label fallback when user-name is not set', async () => {
    window.localStorage.setItem('user-role', 'therapist')

    render(<MegaMenuDefault />)

    const userProfileEls = screen.getAllByTestId('nav-user-profile')
    expect(userProfileEls.length).toBeGreaterThanOrEqual(1)
    const usernameEls = screen.getAllByTestId('nav-username')
    expect(usernameEls[0]).toHaveTextContent('Terapis')
  })
})
