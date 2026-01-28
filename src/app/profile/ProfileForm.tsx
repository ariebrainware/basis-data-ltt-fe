'use client'

import React from 'react'
import PasswordRequirements from './PasswordRequirements'
import StrengthBar from './StrengthBar'

interface ProfileFormProps {
  name: string
  setName: React.Dispatch<React.SetStateAction<string>>
  email: string
  setEmail: React.Dispatch<React.SetStateAction<string>>
  loading: boolean
  error: string | null | undefined
  pwError: string | null | undefined
  currentPassword: string
  setCurrentPassword: React.Dispatch<React.SetStateAction<string>>
  newPassword: string
  setNewPassword: React.Dispatch<React.SetStateAction<string>>
  confirmPassword: string
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>
  lengthOk: boolean
  lowerOk: boolean
  upperOk: boolean
  digitOk: boolean
  specialOk: boolean
  strengthCount: number
  strengthAnnounce: string
  handleUpdateProfile: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function ProfileForm(props: ProfileFormProps) {
  const {
    name,
    setName,
    email,
    setEmail,
    loading,
    error,
    pwError,
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
  } = props

  if (loading) return <p>Loading...</p>

  return (
    <form onSubmit={handleUpdateProfile} className="space-y-4">
      {error && <p className="text-red-600">{error}</p>}
      
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

      <section className="border-t pt-6">
        <h2 className="mb-3 text-xl font-medium">Change Password</h2>

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
          <label className="mb-1 block text-sm font-medium">New Password</label>
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded border px-3 py-2"
            type="password"
            placeholder="At least 8 characters"
          />

          <div className="mt-2 text-sm">
            <p className="mb-2 font-medium">Password requirements:</p>

            <PasswordRequirements
              items={[
                { ok: lengthOk, text: 'At least 8 characters' },
                { ok: lowerOk, text: 'Lowercase letter' },
                { ok: upperOk, text: 'Uppercase letter' },
                { ok: digitOk, text: 'Number' },
                { ok: specialOk, text: 'Special character (e.g. !@#$%)' },
              ]}
            />

            <StrengthBar
              strengthCount={strengthCount}
              strengthAnnounce={strengthAnnounce}
            />
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
  )
}
