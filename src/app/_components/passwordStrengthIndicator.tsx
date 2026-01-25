'use client'
import React from 'react'

interface PasswordStrengthIndicatorProps {
  password: string
}

interface PasswordRequirement {
  label: string
  met: boolean
}

// Password validation constants
const MIN_PASSWORD_LENGTH = 8
const UPPERCASE_REGEX = /[A-Z]/
const LOWERCASE_REGEX = /[a-z]/
const NUMBER_REGEX = /\d/
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const requirements: PasswordRequirement[] = [
    {
      label: 'Minimal 8 karakter',
      met: password.length >= MIN_PASSWORD_LENGTH,
    },
    {
      label: 'Mengandung huruf besar (A-Z)',
      met: UPPERCASE_REGEX.test(password),
    },
    {
      label: 'Mengandung huruf kecil (a-z)',
      met: LOWERCASE_REGEX.test(password),
    },
    {
      label: 'Mengandung angka (0-9)',
      met: NUMBER_REGEX.test(password),
    },
    {
      label: 'Mengandung karakter khusus (!@#$%^&*)',
      met: SPECIAL_CHAR_REGEX.test(password),
    },
  ]

  const metCount = requirements.filter((req) => req.met).length
  const strengthPercentage = (metCount / requirements.length) * 100

  const getStrengthColor = () => {
    if (strengthPercentage >= 80) return 'bg-green-500'
    if (strengthPercentage >= 60) return 'bg-yellow-500'
    if (strengthPercentage >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getStrengthLabel = () => {
    if (strengthPercentage >= 80) return 'Kuat'
    if (strengthPercentage >= 60) return 'Sedang'
    if (strengthPercentage >= 40) return 'Lemah'
    return 'Sangat Lemah'
  }

  if (password.length === 0) {
    return null
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400">
            Kekuatan Kata Sandi
          </span>
          <span
            className={`font-semibold ${
              strengthPercentage >= 80
                ? 'text-green-600'
                : strengthPercentage >= 60
                  ? 'text-yellow-600'
                  : strengthPercentage >= 40
                    ? 'text-orange-600'
                    : 'text-red-600'
            }`}
          >
            {getStrengthLabel()}
          </span>
        </div>
        <div className="bg-slate-200 h-2 w-full overflow-hidden rounded-full">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strengthPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1">
        {requirements.map((requirement, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <span
              className={`flex size-4 items-center justify-center rounded-full ${
                requirement.met
                  ? 'bg-green-500 text-white'
                  : 'border-slate-300 text-slate-300 border bg-transparent'
              }`}
            >
              {requirement.met ? (
                <svg
                  width="12px"
                  height="12px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 13L9 17L19 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </span>
            <span
              className={
                requirement.met
                  ? 'text-slate-800 dark:text-white'
                  : 'text-slate-400 dark:text-slate-500'
              }
            >
              {requirement.label}
            </span>
          </div>
        ))}
      </div>

      {/* Security note */}
      <div className="text-slate-600 dark:bg-blue-950 flex gap-1.5 rounded border border-blue-100 bg-blue-50 p-2 dark:border-blue-900">
        <svg
          width="1.5em"
          height="1.5em"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          color="currentColor"
          className="size-3.5 shrink-0 translate-y-[2px] stroke-2 text-blue-600 dark:text-blue-400"
        >
          <path
            d="M12 11.5V16.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M12 7.51L12.01 7.49889"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
        <small className="font-sans text-xs leading-relaxed text-blue-700 dark:text-blue-300">
          Kata sandi Anda akan di-hash dengan aman di server. Jangan gunakan
          kata sandi yang sama dengan akun lain.
        </small>
      </div>
    </div>
  )
}

/**
 * Validates if a password meets all security requirements
 * @param password - The password to validate
 * @returns true if password meets all requirements, false otherwise
 */
export function validatePasswordStrength(password: string): boolean {
  const requirements = [
    password.length >= MIN_PASSWORD_LENGTH,
    UPPERCASE_REGEX.test(password),
    LOWERCASE_REGEX.test(password),
    NUMBER_REGEX.test(password),
    SPECIAL_CHAR_REGEX.test(password),
  ]

  return requirements.every((req) => req === true)
}

/**
 * Gets a list of unmet password requirements
 * @param password - The password to check
 * @returns Array of requirement messages that are not met
 */
export function getUnmetPasswordRequirements(password: string): string[] {
  const unmet: string[] = []

  if (password.length < MIN_PASSWORD_LENGTH) {
    unmet.push('Minimal 8 karakter')
  }
  if (!UPPERCASE_REGEX.test(password)) {
    unmet.push('Mengandung huruf besar (A-Z)')
  }
  if (!LOWERCASE_REGEX.test(password)) {
    unmet.push('Mengandung huruf kecil (a-z)')
  }
  if (!NUMBER_REGEX.test(password)) {
    unmet.push('Mengandung angka (0-9)')
  }
  if (!SPECIAL_CHAR_REGEX.test(password)) {
    unmet.push('Mengandung karakter khusus (!@#$%^&*)')
  }

  return unmet
}
