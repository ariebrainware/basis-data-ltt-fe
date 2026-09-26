'use client'

import React from 'react'
import ProfileForm from './ProfileForm'
import { useProfile } from '@/app/_hooks/useProfile'
import MegaMenuDefault from '../_components/megaMenu'

export default function ProfilePage() {
  const profile = useProfile()

  return (
    <div className="min-h-screen space-y-6 bg-blue-gray-50/20 p-4 md:p-6">
      <MegaMenuDefault />

      <div className="mx-auto max-w-3xl rounded-2xl border border-blue-gray-100 bg-white p-6 shadow-md md:p-8">
        <h1 className="mb-4 text-2xl font-bold text-blue-gray-900">Profile</h1>

        <ProfileForm {...profile} />
      </div>
    </div>
  )
}
