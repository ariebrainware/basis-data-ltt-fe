'use client'

import React from 'react'

export default function StrengthBar({
  strengthCount,
  strengthAnnounce,
}: {
  strengthCount: number
  strengthAnnounce: string
}) {
  return (
    <div className="mt-3">
      <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
        <div
          className="h-2 rounded transition-all duration-300"
          style={{
            width: `${(strengthCount / 5) * 100}%`,
            background: 'linear-gradient(90deg, #ef4444, #f59e0b, #10b981)',
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
  )
}
