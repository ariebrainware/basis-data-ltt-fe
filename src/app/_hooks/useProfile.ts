'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import Swal from 'sweetalert2'
import {
  tryVerifyCurrentPassword,
  validatePasswordFields,
  navigateAfterSuccess,
  fetchUserProfile,
  submitProfileUpdate,
} from '@/app/_functions/profileHelpers'

async function performProfileUpdateHelper(params: {
  endpoint: string
  body: Record<string, unknown>
  changingPassword: boolean
  router: any
  clearPasswords: () => void
  setPwError: (s: string | null) => void
  setError: (s: string | null) => void
}): Promise<boolean> {
  const {
    endpoint,
    body,
    changingPassword,
    router,
    clearPasswords,
    setPwError,
    setError,
  } = params

  const result = await submitProfileUpdate(
    endpoint,
    body,
    changingPassword,
    router
  )

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
  const lengthOk = newPassword.length >= 8
  const lowerOk = /[a-z]/.test(newPassword)
  const upperOk = /[A-Z]/.test(newPassword)
  const digitOk = /\d/.test(newPassword)
  const specialOk = /[^A-Za-z0-9]/.test(newPassword)
  const strengthCount = [lengthOk, lowerOk, upperOk, digitOk, specialOk].filter(
    Boolean
  ).length
  const [strengthAnnounce, setStrengthAnnounce] = useState('')

  useEffect(() => {
    setStrengthAnnounce(`${strengthCount} of 5 password requirements met`)
  }, [strengthCount])

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetchUserProfile(USER_ENDPOINT, router)
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

  // validateAndPrepare removed: validations are performed inline in handleUpdateProfile

  const buildProfileBody = (changingPassword: boolean) => {
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

  const clearPasswordFields = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const validateInputs = (changingPassword: boolean) => {
    if (!name.trim()) {
      setError('Name is required')
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email')
      return false
    }

    const pwdValidation = validatePasswordFields(
      changingPassword,
      currentPassword,
      newPassword,
      confirmPassword
    )
    if (!pwdValidation.ok) {
      setError(pwdValidation.error || 'Invalid password')
      return false
    }

    return true
  }

  const verifyCurrentIfNeeded = async (changingPassword: boolean) => {
    if (!changingPassword || !currentPassword.trim()) return true
    const vp = await tryVerifyCurrentPassword(currentPassword)
    if (vp.available && vp.verified === false) {
      setPwError('Current password is incorrect')
      return false
    }
    return true
  }

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setMessage(null)
    setError(null)
    setPwError(null)

    const changingPassword = Boolean(
      currentPassword || newPassword || confirmPassword
    )

    if (!validateInputs(changingPassword)) return

    const verified = await verifyCurrentIfNeeded(changingPassword)
    if (!verified) return

    const body = buildProfileBody(changingPassword)
    await performProfileUpdateHelper({
      endpoint: UPDATE_PROFILE_ENDPOINT,
      body,
      changingPassword,
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
