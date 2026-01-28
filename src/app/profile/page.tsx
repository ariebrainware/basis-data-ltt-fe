'use client'

import React from 'react'
import ProfileForm from './ProfileForm'
import { useProfile } from '@/app/_hooks/useProfile'

export default function ProfilePage() {
  const profile = useProfile()

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Profile</h1>

      <ProfileForm {...profile} />
    </div>
  )
}
