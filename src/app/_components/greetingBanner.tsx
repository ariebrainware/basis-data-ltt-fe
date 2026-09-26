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

function getInitialDateStr(): string {
  if (typeof window === 'undefined') return ''
  try {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date())
  } catch {
    return new Date().toDateString()
  }
}

export default function GreetingBanner() {
  const router = useRouter()
  const userRole = useUserRole()
  const userName = useUserName()
  const [mounted, setMounted] = useState(false)
  const [greeting, setGreeting] = useState<{
    text: string
    period: 'pagi' | 'siang' | 'sore' | 'malam'
  }>(() => getTimeGreeting())
  const [formattedDate, setFormattedDate] = useState<string>(() =>
    getInitialDateStr()
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
      const now = new Date()
      setGreeting(getTimeGreeting(now.getHours()))
      try {
        const dateStr = new Intl.DateTimeFormat('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(now)
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
    }, 0)
    return () => clearTimeout(timer)
  }, [router])

  const roleLabel = formatRoleLabel(userRole)
  const greetingDisplayName = userName?.trim() || roleLabel

  return (
    <div
      data-testid="greeting-banner"
      className="from-slate-900 via-indigo-950 relative overflow-hidden rounded-2xl border border-indigo-900/40 bg-gradient-to-r to-indigo-900 p-5 text-white shadow-xl md:p-6"
    >
      {/* Background Decorative Blur Glows */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 size-44 rounded-full bg-blue-500/15 blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        {/* Left Side: Greeting & Description */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-0.5 text-xs font-medium text-indigo-200">
              {greeting.period === 'pagi' || greeting.period === 'siang' ? (
                <SunIcon className="size-3.5 text-amber-300" />
              ) : (
                <MoonIcon className="size-3.5 text-indigo-300" />
              )}
              {mounted ? greeting.text : 'Selamat Datang'}
            </span>
            <span
              data-testid="greeting-role-badge"
              className="inline-flex items-center gap-1 rounded-full border border-teal-400/30 bg-teal-500/20 px-3 py-0.5 text-xs font-semibold text-teal-200"
            >
              <SparklesIcon className="size-3 text-teal-300" />
              {roleLabel}
            </span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl md:text-3xl">
            {mounted ? `${greeting.text}, ` : 'Selamat Datang, '}
            <span
              data-testid="greeting-name"
              className="bg-gradient-to-r from-teal-200 via-indigo-200 to-white bg-clip-text text-transparent"
            >
              {greetingDisplayName}
            </span>{' '}
            👋
          </h2>

          <p className="max-w-2xl text-xs text-indigo-200/90 sm:text-sm">
            Selamat datang kembali di sistem pengelolaan Lee Tit Tar. Kelola
            data jadwal, pasien, dan transaksi dengan mudah dan efisien.
          </p>
        </div>

        {/* Right Side: Date & Status */}
        <div className="flex shrink-0 flex-row items-center gap-3 md:flex-col md:items-end">
          {formattedDate && (
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
              <CalendarDaysIcon className="size-4 text-indigo-300" />
              <span>{formattedDate}</span>
            </div>
          )}
          <div className="border-emerald-500/20 bg-emerald-950/40 text-emerald-300 flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
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
