'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import Swal from 'sweetalert2'
import {
  tryVerifyCurrentPassword,
  navigateAfterSuccess,
} from '@/app/_functions/userHelpers'
import { validatePasswordFields } from '@/app/_functions/passwordUtils'
import {
  fetchUserProfile,
  submitProfileUpdate,
} from '@/app/_functions/profileService'

function isEmailValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function getPasswordStrength(password: string) {
  const lengthOk = password.length >= 8
  const lowerOk = /[a-z]/.test(password)
  const upperOk = /[A-Z]/.test(password)
  const digitOk = /\d/.test(password)
  const specialOk = /[^A-Za-z0-9]/.test(password)
  const strengthCount = [lengthOk, lowerOk, upperOk, digitOk, specialOk].filter(
    Boolean
  ).length
  return { lengthOk, lowerOk, upperOk, digitOk, specialOk, strengthCount }
}

function buildProfileBody(params: {
  name: string
  email: string
  currentPassword: string
  newPassword: string
  changingPassword: boolean
}) {
  const { name, email, currentPassword, newPassword, changingPassword } = params
  const b: Record<string, unknown> = {
    name: name.trim(),
    email: email.trim(),
  }
  if (changingPassword) {
    b.old_password = currentPassword
    b.password = newPassword
  }
  return b
}

function validateProfileInputs(params: {
  name: string
  email: string
  changingPassword: boolean
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): string | null {
  const {
    name,
    email,
    changingPassword,
    currentPassword,
    newPassword,
    confirmPassword,
  } = params

  if (!name.trim()) return 'Name is required'
  if (!isEmailValid(email)) return 'Please enter a valid email'

  const pwdValidation = validatePasswordFields(
    changingPassword,
    currentPassword,
    newPassword,
    confirmPassword
  )
  if (!pwdValidation.ok) return pwdValidation.error || 'Invalid password'

  return null
}

async function verifyCurrentIfNeeded(
  changingPassword: boolean,
  currentPassword: string,
  setPwError: (s: string | null) => void
): Promise<boolean> {
  if (!changingPassword || !currentPassword.trim()) return true
  const vp = await tryVerifyCurrentPassword(currentPassword)
  if (vp.available && vp.verified === false) {
    setPwError('Current password is incorrect')
    return false
  }
  return true
}

async function performProfileUpdateHelper(params: {
  endpoint: string
  body: Record<string, unknown>
  changingPasswordFlag: boolean
  router: any
  clearPasswords: () => void
  setPwError: (s: string | null) => void
  setError: (s: string | null) => void
}): Promise<boolean> {
  const {
    endpoint,
    body,
    changingPasswordFlag,
    router,
    clearPasswords,
    setPwError,
    setError,
  } = params

  const result = await submitProfileUpdate({
    endpoint,
    body,
    changingPasswordFlag,
    router,
  })

  if (!result.success) {
    if (result.pwError) setPwError(result.pwError)
    else setError(result.error || 'Failed to update profile')
    return false
  }

  await Swal.fire({
    text: 'Profile updated successfully',
    icon: 'success',
    confirmButtonText: 'OK',
  })

  clearPasswords()
  navigateAfterSuccess(router)
  return true
}

export function useProfile() {
  const router = useRouter()
  const USER_ENDPOINT = process.env.NEXT_PUBLIC_CURRENT_USER_ENDPOINT || '/user'
  const UPDATE_PROFILE_ENDPOINT =
    process.env.NEXT_PUBLIC_UPDATE_PROFILE_ENDPOINT || '/user'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Change password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwError, setPwError] = useState<string | null>(null)

  // Live password requirement booleans
  const { lengthOk, lowerOk, upperOk, digitOk, specialOk, strengthCount } =
    getPasswordStrength(newPassword)
  const [strengthAnnounce, setStrengthAnnounce] = useState('')

  useEffect(() => {
    setStrengthAnnounce(`${strengthCount} of 5 password requirements met`)
  }, [strengthCount])

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetchUserProfile({ endpoint: USER_ENDPOINT, router })
        if ((r as any).unauthorized) return
        if ((r as any).error) {
          setError('Failed to load profile')
          return
        }

        if ((r as any).name) setName((r as any).name)
        if ((r as any).email) setEmail((r as any).email)
      } catch (err) {
        console.error('fetch profile error', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router, USER_ENDPOINT])

  const clearPasswordFields = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setMessage(null)
    setError(null)
    setPwError(null)

    const changingPassword = Boolean(
      currentPassword || newPassword || confirmPassword
    )

    const validationError = validateProfileInputs({
      name,
      email,
      changingPassword,
      currentPassword,
      newPassword,
      confirmPassword,
    })
    if (validationError) {
      setError(validationError)
      return
    }

    const verified = await verifyCurrentIfNeeded(
      changingPassword,
      currentPassword,
      setPwError
    )
    if (!verified) return

    const body = buildProfileBody({
      name,
      email,
      currentPassword,
      newPassword,
      changingPassword,
    })
    await performProfileUpdateHelper({
      endpoint: UPDATE_PROFILE_ENDPOINT,
      body,
      changingPasswordFlag: changingPassword,
      router,
      clearPasswords: clearPasswordFields,
      setPwError,
      setError,
    })
  }

  return {
    name,
    setName,
    email,
    setEmail,
    loading,
    message,
    error,
    pwError,
    setPwError,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    lengthOk,
    lowerOk,
    upperOk,
    digitOk,
    specialOk,
    strengthCount,
    strengthAnnounce,
    handleUpdateProfile,
  }
}
