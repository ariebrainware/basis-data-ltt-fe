import React from 'react'

interface AlertProps {
  children: React.ReactNode
  onClose: () => void
}
interface AlertPropsWithVariant extends AlertProps {
  variant: AlertVariant
}

export type AlertVariant = 'error' | 'success'
export function VariantAlert({
  children,
  onClose,
  variant,
}: AlertPropsWithVariant) {
  const variantClasses =
    variant === 'success'
      ? 'border-green-500 bg-green-500 text-green-50'
      : 'border-red-500 bg-red-500 text-red-50'
  return (
    <div
      role="alert"
      className={`relative flex w-full items-start rounded-md ${variantClasses} p-2`}
    >
      <span className="grid shrink-0 place-items-center p-1">
        <svg
          width="1.5em"
          height="1.5em"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          color="currentColor"
          className="size-5"
        >
          {variant === 'success' ? (
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <>
              <path
                d="M12 7L12 13"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 17.01L12.01 16.9989"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}
        </svg>
      </span>
      <div className="m-1.5 w-full font-sans text-base leading-none">
        {children}
      </div>
      <button data-dismiss="alert" className="outline-none" onClick={onClose}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          color="currentColor"
          className="m-1 size-5 stroke-2"
        >
          <path
            d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}
