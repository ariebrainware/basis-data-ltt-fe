import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  PasswordStrengthIndicator,
  validatePasswordStrength,
  getUnmetPasswordRequirements,
} from '../passwordStrengthIndicator'

describe('validatePasswordStrength', () => {
  test('returns false for empty password', () => {
    expect(validatePasswordStrength('')).toBe(false)
  })

  test('returns false for password with only lowercase letters', () => {
    expect(validatePasswordStrength('abcdefgh')).toBe(false)
  })

  test('returns false for password with only uppercase letters', () => {
    expect(validatePasswordStrength('ABCDEFGH')).toBe(false)
  })

  test('returns false for password shorter than 8 characters', () => {
    expect(validatePasswordStrength('Abc123!')).toBe(false)
  })

  test('returns false for password without numbers', () => {
    expect(validatePasswordStrength('Abcdefgh!')).toBe(false)
  })

  test('returns false for password without special characters', () => {
    expect(validatePasswordStrength('Abcdefgh123')).toBe(false)
  })

  test('returns false for password without uppercase letters', () => {
    expect(validatePasswordStrength('abcdefgh123!')).toBe(false)
  })

  test('returns false for password without lowercase letters', () => {
    expect(validatePasswordStrength('ABCDEFGH123!')).toBe(false)
  })

  test('returns true for password meeting all requirements', () => {
    expect(validatePasswordStrength('Abcdefgh123!')).toBe(true)
  })

  test('returns true for strong password with multiple special characters', () => {
    expect(validatePasswordStrength('MyP@ssw0rd!')).toBe(true)
  })

  test('returns true for password with various special characters', () => {
    expect(validatePasswordStrength('Test123#$%')).toBe(true)
    expect(validatePasswordStrength('Pass123&*()')).toBe(true)
    expect(validatePasswordStrength('Secure123[]')).toBe(true)
  })
})

describe('getUnmetPasswordRequirements', () => {
  test('returns all requirements for empty password', () => {
    const unmet = getUnmetPasswordRequirements('')
    expect(unmet).toHaveLength(5)
    expect(unmet).toContain('Minimal 8 karakter')
    expect(unmet).toContain('Mengandung huruf besar (A-Z)')
    expect(unmet).toContain('Mengandung huruf kecil (a-z)')
    expect(unmet).toContain('Mengandung angka (0-9)')
    expect(unmet).toContain('Mengandung karakter khusus (!@#$%^&*)')
  })

  test('returns empty array for password meeting all requirements', () => {
    expect(getUnmetPasswordRequirements('Abcdefgh123!')).toEqual([])
  })

  test('returns only missing requirements for partial password', () => {
    const unmet = getUnmetPasswordRequirements('abcdefgh')
    expect(unmet).toHaveLength(3)
    expect(unmet).toContain('Mengandung huruf besar (A-Z)')
    expect(unmet).toContain('Mengandung angka (0-9)')
    expect(unmet).toContain('Mengandung karakter khusus (!@#$%^&*)')
    expect(unmet).not.toContain('Minimal 8 karakter')
    expect(unmet).not.toContain('Mengandung huruf kecil (a-z)')
  })

  test('identifies missing minimum length', () => {
    const unmet = getUnmetPasswordRequirements('Ab1!')
    expect(unmet).toContain('Minimal 8 karakter')
  })

  test('identifies missing uppercase', () => {
    const unmet = getUnmetPasswordRequirements('abcdef123!')
    expect(unmet).toContain('Mengandung huruf besar (A-Z)')
  })

  test('identifies missing lowercase', () => {
    const unmet = getUnmetPasswordRequirements('ABCDEF123!')
    expect(unmet).toContain('Mengandung huruf kecil (a-z)')
  })

  test('identifies missing number', () => {
    const unmet = getUnmetPasswordRequirements('Abcdefgh!')
    expect(unmet).toContain('Mengandung angka (0-9)')
  })

  test('identifies missing special character', () => {
    const unmet = getUnmetPasswordRequirements('Abcdefgh123')
    expect(unmet).toContain('Mengandung karakter khusus (!@#$%^&*)')
  })
})

describe('PasswordStrengthIndicator', () => {
  test('renders nothing when password is empty', () => {
    const { container } = render(<PasswordStrengthIndicator password="" />)
    expect(container.firstChild).toBeNull()
  })

  test('renders strength indicator for weak password', () => {
    render(<PasswordStrengthIndicator password="abc" />)
    expect(screen.getByText('Sangat Lemah')).toBeInTheDocument()
  })

  test('renders strength indicator for weak password with 2 requirements met', () => {
    render(<PasswordStrengthIndicator password="abcdefgh" />)
    expect(screen.getByText('Lemah')).toBeInTheDocument()
  })

  test('renders strength indicator for moderate password', () => {
    render(<PasswordStrengthIndicator password="Abcdefgh1" />)
    expect(screen.getByText('Sedang')).toBeInTheDocument()
  })

  test('renders strength indicator for strong password', () => {
    render(<PasswordStrengthIndicator password="Abcdefgh123!" />)
    expect(screen.getByText('Kuat')).toBeInTheDocument()
  })

  test('shows "Kuat" only when all requirements are met', () => {
    render(<PasswordStrengthIndicator password="Abcd1234!" />)
    expect(screen.getByText('Kuat')).toBeInTheDocument()

    // Verify all checkmarks are present
    const checklist = screen.getByText('Minimal 8 karakter')
    expect(checklist).toBeInTheDocument()
  })

  test('displays all password requirements', () => {
    render(<PasswordStrengthIndicator password="Abcdefgh123!" />)

    expect(screen.getByText('Minimal 8 karakter')).toBeInTheDocument()
    expect(screen.getByText('Mengandung huruf besar (A-Z)')).toBeInTheDocument()
    expect(screen.getByText('Mengandung huruf kecil (a-z)')).toBeInTheDocument()
    expect(screen.getByText('Mengandung angka (0-9)')).toBeInTheDocument()
    expect(
      screen.getByText('Mengandung karakter khusus (!@#$%^&*)')
    ).toBeInTheDocument()
  })

  test('displays strength label', () => {
    render(<PasswordStrengthIndicator password="Test123!" />)
    expect(screen.getByText('Kekuatan Kata Sandi')).toBeInTheDocument()
  })

  test('displays security note', () => {
    render(<PasswordStrengthIndicator password="Test123!" />)
    expect(
      screen.getByText(/Kata sandi Anda akan di-hash dengan aman di server/)
    ).toBeInTheDocument()
  })

  test('shows different colors for different password strengths', () => {
    const { rerender } = render(<PasswordStrengthIndicator password="abc" />)
    expect(screen.getByText('Sangat Lemah')).toBeInTheDocument()

    rerender(<PasswordStrengthIndicator password="Abcdefgh123!" />)
    expect(screen.getByText('Kuat')).toBeInTheDocument()
  })

  test('updates indicator when password changes', () => {
    const { rerender } = render(<PasswordStrengthIndicator password="weak" />)
    expect(screen.getByText('Sangat Lemah')).toBeInTheDocument()

    rerender(<PasswordStrengthIndicator password="StrongP@ss123" />)
    expect(screen.getByText('Kuat')).toBeInTheDocument()
  })
})
