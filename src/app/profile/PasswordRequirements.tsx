'use client'

import React from 'react'
import StatusIcon from '@/app/_components/statusIcon'

export default function PasswordRequirements({
  items,
}: {
  items: Array<{ ok: boolean; text: string }>
}) {
  return (
    <ul className="space-y-1">
      {items.map((r) => (
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
              title={r.ok ? 'requirement met' : 'requirement not met'}
            />
          </span>
          <span>{r.text}</span>
        </li>
      ))}
    </ul>
  )
}
