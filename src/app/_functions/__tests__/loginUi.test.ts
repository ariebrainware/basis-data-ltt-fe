import Swal from 'sweetalert2'
import {
  showLoginSuccess,
  showAccountLockedModal,
  handleUserNotFound,
  handleErrorString,
  storeSession,
} from '../loginUi'

jest.mock('sweetalert2', () => ({
  fire: jest.fn().mockResolvedValue({ isConfirmed: true }),
}))

describe('loginUi functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
  })

  describe('showLoginSuccess', () => {
    test('calls Swal.fire with greeting and role information when role is provided', async () => {
      await showLoginSuccess('super_admin')

      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'success',
          title: 'Selamat Datang!',
          html: expect.stringContaining('Super Admin'),
          timer: 1400,
          showConfirmButton: false,
        })
      )
    })

    test('calls Swal.fire with therapist role label when role is therapist', async () => {
      await showLoginSuccess('therapist')

      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'success',
          title: 'Selamat Datang!',
          html: expect.stringContaining('Terapis'),
        })
      )
    })

    test('calls Swal.fire with personalized greeting title when name is provided', async () => {
      await showLoginSuccess('super_admin', 'Budi Santoso')

      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'success',
          title: 'Selamat Datang, Budi Santoso!',
          html: expect.stringContaining('Super Admin'),
          timer: 1400,
          showConfirmButton: false,
        })
      )
    })

    test('calls Swal.fire with default greeting when no role is provided', async () => {
      await showLoginSuccess()

      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'success',
          title: 'Selamat Datang!',
          html: 'Login berhasil! Mengalihkan ke dashboard...',
        })
      )
    })
  })

  describe('storeSession', () => {
    test('stores token, role and name in localStorage', () => {
      storeSession('test-token-123', 'super_admin', 'Budi Santoso')

      expect(window.localStorage.getItem('session-token')).toBe(
        'test-token-123'
      )
      expect(window.localStorage.getItem('user-role')).toBe('super_admin')
      expect(window.localStorage.getItem('user-name')).toBe('Budi Santoso')
    })

    test('does not store empty token', () => {
      storeSession('', 'super_admin')

      expect(window.localStorage.getItem('session-token')).toBeNull()
    })
  })

  describe('handleUserNotFound', () => {
    test('handles user not found response and shows error dialog', async () => {
      const handled = await handleUserNotFound({ error: 'user not found' })

      expect(handled).toBe(true)
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'error',
          title: 'Login Failed',
          text: 'User not found!',
        })
      )
    })

    test('returns false for non matching errors', async () => {
      const handled = await handleUserNotFound({ error: 'other error' })

      expect(handled).toBe(false)
      expect(Swal.fire).not.toHaveBeenCalled()
    })
  })
})
