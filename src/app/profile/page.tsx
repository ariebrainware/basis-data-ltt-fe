'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/app/_functions/apiFetch'
import { UnauthorizedAccess } from '@/app/_functions/unauthorized'
import { getUserId } from '@/app/_functions/userId'
import { fetchCurrentUserId } from '@/app/_functions/fetchCurrentUser'
import { verifyPassword } from '@/app/_functions/verifyPassword'
import { logout } from '@/app/_functions/logout'
import Swal from 'sweetalert2'
import StatusIcon from '@/app/_components/statusIcon'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function ProfilePage() {
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
    const fetchProfile = async () => {
      try {
        // Try localStorage first
        let userId = getUserId()

        // If missing, attempt fallback fetch to resolve user ID from session token
        if (!userId) {
          const fetched = await fetchCurrentUserId()
          if (fetched) {
            userId = fetched
            try {
              localStorage.setItem('user-id', String(fetched))
            } catch {}
          }
        }

        if (!userId) {
          setError('Unable to determine current user')
          setLoading(false)
          return
        }

        const res = await apiFetch(`${USER_ENDPOINT}/${userId}`)

        if (res.status === 401) {
          UnauthorizedAccess(router)
          return
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const json = await res.json()

        // Try a few shapes the API might return
        const source = json?.data?.user ?? json?.data ?? json?.user ?? json

        if (source) {
          if (typeof source.name === 'string') setName(source.name)
          if (typeof source.email === 'string') setEmail(source.email)
        }
      } catch (err) {
        console.error('fetch profile error', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router, USER_ENDPOINT])

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setMessage(null)
    setError(null)

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email')
      return
    }

    const changingPassword = Boolean(
      currentPassword || newPassword || confirmPassword
    )

    // If user wants to change password as part of this save, validate password fields
    if (changingPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError(
          'To change your password, fill all password fields or leave them all empty'
        )
        return
      }

      if (newPassword.length < 8) {
        setError('New password must be at least 8 characters')
        return
      }

      if (newPassword !== confirmPassword) {
        setError('New password and confirmation do not match')
        return
      }

      const strongPwd = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/
      if (!strongPwd.test(newPassword)) {
        setError(
          'Password must include uppercase, lowercase, number, and special character'
        )
        return
      }
      if (currentPassword.trim()) {
        try {
          const vp = await verifyPassword(currentPassword)
          if (vp.status === 401) return
          if (!vp.available) {
            // verification endpoint not available or returned error; fall back to attempting change
          } else {
            if (!vp.verified) {
              setPwError('Current password is incorrect')
              return
            }
          }
        } catch (verifyErr) {
          // network or unexpected error while verifying — fall back to attempting change
          console.warn(
            'verify password error, will attempt change directly',
            verifyErr
          )
        }
      }
    }

    try {
      // Only verify password if caller explicitly provided a current password
      // (we already return above if any password fields are present).

      const body: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim(),
      }

      if (changingPassword) {
        body.old_password = currentPassword
        body.password = newPassword
      }

      const res = await apiFetch(UPDATE_PROFILE_ENDPOINT, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })

      if (res.status === 401) {
        UnauthorizedAccess(router)
        return
      }

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        const serverMsg = (j?.message || '').toString().toLowerCase()
        if (
          changingPassword &&
          (serverMsg.includes('current') || serverMsg.includes('incorrect'))
        ) {
          setPwError('Current password is incorrect')
        } else {
          setError(j?.message || 'Failed to update profile')
        }
        return
      }

      await Swal.fire({
        text: 'Profile updated successfully',
        icon: 'success',
        confirmButtonText: 'OK',
      })
      // Clear password fields regardless of change
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      try {
        const isE2E =
          typeof window !== 'undefined' &&
          window.localStorage.getItem('__E2E_TEST__') === '1'
        if (!isE2E) {
          router.push('/dashboard')
        }
      } catch (err) {
        if (typeof window !== 'undefined') window.location.href = '/dashboard'
      }
    } catch (err) {
      console.error(err)
      setError('Network error while updating profile')
    }
  }

  // helper removed: password change is handled by `handleUpdateProfile`

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Profile</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="email@example.com"
              type="email"
            />
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <section className="border-t pt-6">
            <h2 className="mb-3 text-xl font-medium">Change Password</h2>
            {/* inputs only — submit via Save Changes */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Current Password
              </label>
              <input
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded border px-3 py-2"
                type="password"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                New Password
              </label>
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded border px-3 py-2"
                type="password"
                placeholder="At least 8 characters"
              />
              <div className="mt-2 text-sm">
                <p className="mb-2 font-medium">Password requirements:</p>
                <ul className="space-y-1">
                  {[
                    { ok: lengthOk, text: 'At least 8 characters' },
                    { ok: lowerOk, text: 'Lowercase letter' },
                    { ok: upperOk, text: 'Uppercase letter' },
                    { ok: digitOk, text: 'Number' },
                    { ok: specialOk, text: 'Special character (e.g. !@#$%)' },
                  ].map((r) => (
                    <li
                      key={r.text}
                      className={`flex items-center gap-2 text-sm transition-colors duration-150 ${
                        r.ok ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-xs text-white ${
                          r.ok ? 'bg-green-600' : 'bg-red-600'
                        } transition-colors duration-150`}
                      >
                        <StatusIcon
                          ok={r.ok}
                          title={
                            r.ok ? 'requirement met' : 'requirement not met'
                          }
                        />
                      </span>
                      <span>{r.text}</span>
                    </li>
                  ))}
                </ul>

                {/* Strength bar */}
                <div className="mt-3">
                  <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
                    <div
                      className="h-2 rounded transition-all duration-300"
                      style={{
                        width: `${(strengthCount / 5) * 100}%`,
                        background:
                          'linear-gradient(90deg, #ef4444, #f59e0b, #10b981)',
                        backgroundSize: `${(strengthCount / 5) * 100}% 100%`,
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-600">
                    {strengthCount}/5 requirements met
                  </p>
                  <div aria-live="polite" className="sr-only">
                    {strengthAnnounce}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Confirm New Password
              </label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded border px-3 py-2"
                type="password"
              />
            </div>
            {/* removed separate Change Password submit — use "Save Changes" instead */}
            {pwError && <p className="text-red-600">{pwError}</p>}
          </section>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-white"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
