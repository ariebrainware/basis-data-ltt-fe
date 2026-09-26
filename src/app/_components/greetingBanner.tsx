'use client'

import React, { useEffect, useState } from 'react'
import { useUserRole } from '../_functions/userRole'
import { useUserName, setUserName } from '../_functions/userName'
import { fetchUserProfile } from '../_functions/profileService'
import { useRouter } from 'next/navigation'
import {
  SunIcon,
  MoonIcon,
  CalendarDaysIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

export function getTimeGreeting(hour: number = new Date().getHours()): {
  text: string
  period: 'pagi' | 'siang' | 'sore' | 'malam'
} {
  if (hour >= 4 && hour < 11) {
    return { text: 'Selamat Pagi', period: 'pagi' }
  }
  if (hour >= 11 && hour < 15) {
    return { text: 'Selamat Siang', period: 'siang' }
  }
  if (hour >= 15 && hour < 18) {
    return { text: 'Selamat Sore', period: 'sore' }
  }
  return { text: 'Selamat Malam', period: 'malam' }
}

export function formatRoleLabel(role: string | null): string {
  if (!role) return 'Pengguna'
  const lower = role.toLowerCase().trim()
  if (lower === 'super_admin' || lower === 'admin') return 'Super Admin'
  if (lower === 'therapist') return 'Terapis'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export default function GreetingBanner() {
  const router = useRouter()
  const userRole = useUserRole()
  const userName = useUserName()
  const [greeting] = useState<{
    text: string
    period: 'pagi' | 'siang' | 'sore' | 'malam'
  }>(() => getTimeGreeting())
  const [formattedDate, setFormattedDate] = useState<string>('')

  useEffect(() => {
    const now = new Date()
    try {
      const dateStr = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormattedDate(dateStr)
    } catch {
      setFormattedDate(now.toDateString())
    }

    // If username not yet in cache, attempt background fetch
    if (
      !localStorage.getItem('user-name') &&
      localStorage.getItem('session-token')
    ) {
      const USER_ENDPOINT =
        process.env.NEXT_PUBLIC_CURRENT_USER_ENDPOINT || '/user'
      fetchUserProfile({ endpoint: USER_ENDPOINT, router })
        .then((res: any) => {
          if (res && res.name) {
            setUserName(res.name)
          }
        })
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const roleLabel = formatRoleLabel(userRole)
  const greetingDisplayName = userName?.trim() || roleLabel
  const isDaytime = greeting.period === 'pagi' || greeting.period === 'siang'

  return (
    <div
      data-testid="greeting-banner"
      className="relative overflow-hidden rounded-xl border border-blue-gray-100 bg-white p-5 shadow-sm md:p-6"
    >
      {/* Top Accent Gradient Bar */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400" />

      {/* Subtle Background Decorative Blur */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-indigo-50/80 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-teal-50/80 blur-2xl" />

      <div className="relative z-10 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        {/* Left Section: Badges, Greeting, Description */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                isDaytime
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-indigo-200 bg-indigo-50 text-indigo-700'
              }`}
            >
              {isDaytime ? (
                <SunIcon className="size-4 text-amber-600" />
              ) : (
                <MoonIcon className="size-4 text-indigo-600" />
              )}
              {greeting.text}
            </span>

            <span
              data-testid="greeting-role-badge"
              className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800"
            >
              <SparklesIcon className="size-3.5 text-teal-600" />
              {roleLabel}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-blue-gray-900 sm:text-2xl md:text-3xl">
              {`${greeting.text}, `}
              <span
                data-testid="greeting-name"
                className="font-extrabold text-indigo-600"
              >
                {greetingDisplayName}
              </span>{' '}
              👋
            </h2>
            <p className="mt-1 max-w-2xl text-xs font-normal text-blue-gray-600 sm:text-sm">
              Selamat datang kembali di sistem pengelolaan Lee Tit Tar. Kelola
              data jadwal penanganan, pasien, dan transaksi dengan mudah dan
              efisien.
            </p>
          </div>
        </div>

        {/* Right Section: Date & Active Status Pill */}
        <div className="flex shrink-0 flex-row flex-wrap items-center gap-2.5 md:flex-col md:items-end">
          {formattedDate && (
            <div className="flex items-center gap-2 rounded-lg border border-blue-gray-100 bg-blue-gray-50/70 px-3.5 py-1.5 text-xs font-medium text-blue-gray-700">
              <CalendarDaysIcon className="size-4 text-indigo-600" />
              <span>{formattedDate}</span>
            </div>
          )}
          <div className="border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold">
            <span className="relative flex size-2">
              <span className="bg-emerald-400 absolute inline-flex size-full animate-ping rounded-full opacity-75"></span>
              <span className="bg-emerald-500 relative inline-flex size-2 rounded-full"></span>
            </span>
            Sistem Aktif
          </div>
        </div>
      </div>
    </div>
  )
}
