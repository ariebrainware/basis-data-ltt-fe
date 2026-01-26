import React from 'react'

interface StatusIconProps {
  ok: boolean
  title?: string
}

export default function StatusIcon({ ok, title }: StatusIconProps) {
  return (
    <span
      role="img"
      aria-label={title ?? (ok ? 'met' : 'unmet')}
      className="inline-block"
    >
      {ok ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          aria-hidden="true"
        >
          <path
            d="M20 6L9 17l-5-5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          aria-hidden="true"
        >
          <path
            d="M18 6L6 18M6 6l12 12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  )
}
