import {
  DEFAULT_PASSWORD,
  clearMustChangePassword,
  isDefaultPassword,
  mustChangePassword,
  responseRequiresPasswordChange,
  setMustChangePassword,
  shouldRedirectToChangePassword,
} from '../defaultPassword'
import { validatePasswordFields } from '../passwordUtils'

describe('defaultPassword helpers', () => {
  beforeEach(() => window.localStorage.clear())

  test('default password is LTT2025', () => {
    expect(DEFAULT_PASSWORD).toBe('LTT2025')
  })

  test('isDefaultPassword matches exactly', () => {
    expect(isDefaultPassword('LTT2025')).toBe(true)
    expect(isDefaultPassword('ltt2025')).toBe(false)
    expect(isDefaultPassword('LTT2025!')).toBe(false)
    expect(isDefaultPassword(undefined)).toBe(false)
  })

  test('responseRequiresPasswordChange detects backend flags', () => {
    expect(responseRequiresPasswordChange({ must_change_password: true })).toBe(
      true
    )
    expect(responseRequiresPasswordChange({ is_default_password: true })).toBe(
      true
    )
    expect(
      responseRequiresPasswordChange({ must_change_password: false })
    ).toBe(false)
    expect(responseRequiresPasswordChange(undefined)).toBe(false)
  })

  test('flag can be set and cleared', () => {
    expect(mustChangePassword()).toBe(false)
    setMustChangePassword()
    expect(mustChangePassword()).toBe(true)
    clearMustChangePassword()
    expect(mustChangePassword()).toBe(false)
  })

  test('shouldRedirectToChangePassword only when flagged and off allowed routes', () => {
    expect(shouldRedirectToChangePassword('/dashboard')).toBe(false)
    setMustChangePassword()
    expect(shouldRedirectToChangePassword('/dashboard')).toBe(true)
    expect(shouldRedirectToChangePassword('/patient')).toBe(true)
    expect(shouldRedirectToChangePassword('/')).toBe(true)
    expect(shouldRedirectToChangePassword('/profile')).toBe(false)
    expect(shouldRedirectToChangePassword('/login')).toBe(false)
    expect(shouldRedirectToChangePassword('/profiles')).toBe(true)
  })

  test('validatePasswordFields rejects the default password as new password', () => {
    expect(
      validatePasswordFields(true, 'Old1!pass', 'LTT2025', 'LTT2025')
    ).toEqual({
      ok: false,
      error: 'New password must not be the default password',
    })
  })

  test('validatePasswordFields rejects reusing the current password', () => {
    expect(
      validatePasswordFields(true, 'Same1!pass', 'Same1!pass', 'Same1!pass')
    ).toEqual({
      ok: false,
      error: 'New password must be different from the current password',
    })
  })
})
