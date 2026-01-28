export function isPasswordError(serverMsg: string) {
  const m = serverMsg || ''
  return m.includes('current') || m.includes('incorrect')
}

function allPasswordFieldsFilled(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) {
  return Boolean(currentPassword && newPassword && confirmPassword)
}

function isStrongPassword(pwd: string) {
  const strongPwd = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/
  return strongPwd.test(pwd)
}

export function validatePasswordFields(
  changingPassword: boolean,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): { ok: boolean; error?: string } {
  if (!changingPassword) return { ok: true }

  if (!allPasswordFieldsFilled(currentPassword, newPassword, confirmPassword)) {
    return {
      ok: false,
      error:
        'To change your password, fill all password fields or leave them all empty',
    }
  }

  if (newPassword.length < 8) {
    return { ok: false, error: 'New password must be at least 8 characters' }
  }

  if (newPassword !== confirmPassword) {
    return { ok: false, error: 'New password and confirmation do not match' }
  }

  if (!isStrongPassword(newPassword)) {
    return {
      ok: false,
      error:
        'Password must include uppercase, lowercase, number, and special character',
    }
  }

  return { ok: true }
}
