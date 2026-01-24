'use client'

import React, { useEffect, useState } from 'react'
import { getApiHost } from '@/app/_functions/apiHost'
import { getSessionToken } from '@/app/_functions/sessionToken'
import { UnauthorizedAccess } from '@/app/_functions/unauthorized'
import { getUserId } from '@/app/_functions/userId'
import { fetchCurrentUserId } from '@/app/_functions/fetchCurrentUser'
import { verifyPassword } from '@/app/_functions/verifyPassword'
import Swal from 'sweetalert2'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function ProfilePage() {
  const CURRENT_USER_ENDPOINT =
    process.env.NEXT_PUBLIC_CURRENT_USER_ENDPOINT || '/user'
  const UPDATE_PROFILE_ENDPOINT =
    process.env.NEXT_PUBLIC_UPDATE_PROFILE_ENDPOINT || '/user'
  const CHANGE_PASSWORD_ENDPOINT =
    process.env.NEXT_PUBLIC_CHANGE_PASSWORD_ENDPOINT || UPDATE_PROFILE_ENDPOINT

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Change password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMessage, setPwMessage] = useState<string | null>(null)
  const [pwError, setPwError] = useState<string | null>(null)

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

        const res = await fetch(`${getApiHost()}/user/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
            'session-token': getSessionToken(),
          },
        })

        if (res.status === 401) {
          UnauthorizedAccess()
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
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
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

    try {
      // Optional: verify current password before attempting change if backend supports it
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

      const res = await fetch(`${getApiHost()}${UPDATE_PROFILE_ENDPOINT}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
          'session-token': getSessionToken(),
        },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })

      if (res.status === 401) {
        UnauthorizedAccess()
        return
      }

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j?.message || 'Failed to update profile')
        return
      }

      await Swal.fire({
        text: 'Profile updated successfully',
        icon: 'success',
        confirmButtonText: 'OK',
      })
    } catch (err) {
      console.error(err)
      setError('Network error while updating profile')
    }
  }

  // Helper to trigger profile update from outside the profile form
  const triggerUpdateProfile = () => {
    // call handler with a dummy event that has preventDefault
    void handleUpdateProfile({
      preventDefault: () => {},
    } as unknown as React.FormEvent)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMessage(null)
    setPwError(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('All password fields are required')
      return
    }

    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setPwError('New password and confirmation do not match')
      return
    }

    // Password strength: at least one lowercase, one uppercase, one digit, one special char
    const strongPwd = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/
    if (!strongPwd.test(newPassword)) {
      setPwError(
        'Password must include uppercase, lowercase, number, and special character'
      )
      return
    }

    try {
      const res = await fetch(`${getApiHost()}${UPDATE_PROFILE_ENDPOINT}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
          'session-token': getSessionToken(),
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      })

      if (res.status === 401) {
        UnauthorizedAccess()
        return
      }

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        const serverMsg = (j?.message || '').toString().toLowerCase()
        if (serverMsg.includes('current') || serverMsg.includes('incorrect')) {
          setPwError('Current password is incorrect')
        } else {
          setPwError(j?.message || 'Failed to change password')
        }
        return
      }

      await Swal.fire({
        text: 'Profile successfully updated',
        icon: 'success',
        confirmButtonText: 'OK',
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error(err)
      setPwError('Network error while changing password')
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Profile</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <form onSubmit={handleUpdateProfile} className="mb-8 space-y-4">
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

            {message && <p className="text-green-600">{message}</p>}
            {error && <p className="text-red-600">{error}</p>}
          </form>

          <section className="border-t pt-6">
            <h2 className="mb-3 text-xl font-medium">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
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

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-rose-600 rounded px-4 py-2 text-white"
                >
                  Change Password
                </button>
              </div>

              {pwMessage && <p className="text-green-600">{pwMessage}</p>}
              {pwError && <p className="text-red-600">{pwError}</p>}
            </form>
          </section>
          <div className="mt-6 flex justify-end">
            <button
              onClick={triggerUpdateProfile}
              className="rounded bg-blue-600 px-4 py-2 text-white"
            >
              Save Changes
            </button>
          </div>
        </>
      )}
    </div>
  )
}
