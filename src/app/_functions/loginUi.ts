import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { format as formatDate } from 'date-fns'
import { extractDateStringFromText } from './loginParsing'

export async function showAccountLockedModal(lockedField: any) {
  let lockedDate: Date | null = null
  try {
    lockedDate = new Date(lockedField)
  } catch (e) {
    lockedDate = null
  }
  const formatted = lockedDate
    ? formatDate(lockedDate, 'yyyy/MM/dd HH:mm')
    : String(lockedField)

  await Swal.fire({
    icon: 'warning',
    title: 'Account Locked',
    html: `Your account is locked until <strong>${formatted}</strong>.`,
  })
}

export async function handleUserNotFound(responseData: any) {
  if (responseData?.error === 'user not found') {
    await Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: 'User not found!',
    })
    return true
  }
  return false
}

export async function handleErrorString(responseData: any) {
  if (typeof responseData.error !== 'string') return false
  const dateStr = extractDateStringFromText(responseData.error)
  if (!dateStr) return false
  const parsed = new Date(dateStr)
  const formatted = isNaN(parsed.getTime())
    ? dateStr
    : formatDate(parsed, 'yyyy/MM/dd HH:mm')
  await Swal.fire({
    icon: 'warning',
    title: 'Account Locked',
    html: `Your account is locked until <strong>${formatted}</strong>.`,
  })
  return true
}

export function storeSession(tokenVal: string, roleVal: any) {
  localStorage.setItem('session-token', tokenVal)
  if (roleVal) localStorage.setItem('user-role', roleVal)
}

export async function showLoginSuccess() {
  await Swal.fire({
    icon: 'success',
    title: 'Login Successful!',
    text: 'Redirecting to your dashboard...',
    timer: 1400,
    showConfirmButton: false,
  })
}
