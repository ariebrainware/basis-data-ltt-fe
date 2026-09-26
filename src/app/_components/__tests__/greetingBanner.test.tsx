import React from 'react'
import { render, screen } from '@testing-library/react'
import GreetingBanner, {
  getTimeGreeting,
  formatRoleLabel,
} from '../greetingBanner'

describe('GreetingBanner Unit Functions', () => {
  test('getTimeGreeting returns correct period and greeting text based on hour', () => {
    expect(getTimeGreeting(5)).toEqual({
      text: 'Selamat Pagi',
      period: 'pagi',
    })
    expect(getTimeGreeting(10)).toEqual({
      text: 'Selamat Pagi',
      period: 'pagi',
    })
    expect(getTimeGreeting(12)).toEqual({
      text: 'Selamat Siang',
      period: 'siang',
    })
    expect(getTimeGreeting(16)).toEqual({
      text: 'Selamat Sore',
      period: 'sore',
    })
    expect(getTimeGreeting(20)).toEqual({
      text: 'Selamat Malam',
      period: 'malam',
    })
    expect(getTimeGreeting(1)).toEqual({
      text: 'Selamat Malam',
      period: 'malam',
    })
  })

  test('formatRoleLabel formats role names accurately', () => {
    expect(formatRoleLabel('super_admin')).toBe('Super Admin')
    expect(formatRoleLabel('admin')).toBe('Super Admin')
    expect(formatRoleLabel('therapist')).toBe('Terapis')
    expect(formatRoleLabel('staff')).toBe('Staff')
    expect(formatRoleLabel(null)).toBe('Pengguna')
  })
})

describe('GreetingBanner Component', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  test('renders greeting banner with default role badge when role not set', () => {
    render(<GreetingBanner />)

    expect(screen.getByTestId('greeting-banner')).toBeInTheDocument()
    expect(screen.getByTestId('greeting-role-badge')).toHaveTextContent(
      'Pengguna'
    )
    expect(screen.getByText(/Sistem Aktif/i)).toBeInTheDocument()
  })

  test('renders greeting banner with Super Admin badge when user-role is super_admin', () => {
    window.localStorage.setItem('user-role', 'super_admin')

    render(<GreetingBanner />)

    expect(screen.getByTestId('greeting-role-badge')).toHaveTextContent(
      'Super Admin'
    )
  })

  test('renders greeting banner with Terapis badge when user-role is therapist', () => {
    window.localStorage.setItem('user-role', 'therapist')

    render(<GreetingBanner />)

    expect(screen.getByTestId('greeting-role-badge')).toHaveTextContent(
      'Terapis'
    )
  })

  test('renders greeting with personalized name when user-name is set in localStorage', () => {
    window.localStorage.setItem('user-name', 'Dr. Budi')
    window.localStorage.setItem('user-role', 'therapist')

    render(<GreetingBanner />)

    expect(screen.getByTestId('greeting-name')).toHaveTextContent('Dr. Budi')
  })
})
