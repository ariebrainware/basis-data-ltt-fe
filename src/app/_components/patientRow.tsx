interface PatientProps {
  // patientKey: string
  name: string
  phoneNumber: string
  job: string
  age: number
  gender: string
  patientCode: string
}

export default function Patient({
  // patientKey,
  name,
  phoneNumber,
  job,
  age,
  gender,
  patientCode,
}: PatientProps) {
  return (
    <tr className="border-b border-slate-200 last:border-0">
      <td className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <small className="font-sans text-sm text-current antialiased">
              {name}
            </small>
            <small className="font-sans text-sm text-current antialiased opacity-70">
              {phoneNumber}
            </small>
          </div>
        </div>
      </td>
      <td className="p-3">
        <div className="flex flex-col">
          <small className="font-sans text-sm text-current antialiased">
            {job}
          </small>
          <small className="font-sans text-sm text-current antialiased opacity-70">
            {age}
          </small>
        </div>
      </td>
      <td className="p-3">
        <div className="w-max">
          <div
            data-open="true"
            data-shape="pill"
            className="relative inline-flex w-max items-center rounded-md border border-green-500 bg-green-500 p-0.5 font-sans text-xs font-medium text-green-50 shadow-sm data-[shape=pill]:rounded-full"
          >
            <span className="mx-1.5 my-0.5 font-sans leading-none text-current">
              {gender}
            </span>
          </div>
        </div>
      </td>
      <td className="p-3">
        <small className="font-sans text-sm text-current antialiased">
          {patientCode}
        </small>
      </td>
      <td className="p-3">
        <button
          data-open="false"
          className="group inline-grid min-h-[38px] min-w-[38px] select-none place-items-center rounded-md border border-transparent bg-transparent text-center align-middle font-sans text-sm font-medium text-slate-800 shadow-none outline-none transition-all duration-300 ease-in hover:border-slate-600/10 hover:bg-slate-200/10 hover:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none data-[shape=circular]:rounded-full"
          data-shape="default"
        >
          <svg
            width="1.5em"
            height="1.5em"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            color="currentColor"
            className="size-4 text-slate-800 dark:text-white"
          >
            <path
              d="M14.3632 5.65156L15.8431 4.17157C16.6242 3.39052 17.8905 3.39052 18.6716 4.17157L20.0858 5.58579C20.8668 6.36683 20.8668 7.63316 20.0858 8.41421L18.6058 9.8942M14.3632 5.65156L4.74749 15.2672C4.41542 15.5993 4.21079 16.0376 4.16947 16.5054L3.92738 19.2459C3.87261 19.8659 4.39148 20.3848 5.0115 20.33L7.75191 20.0879C8.21972 20.0466 8.65806 19.8419 8.99013 19.5099L18.6058 9.8942M14.3632 5.65156L18.6058 9.8942"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </button>
      </td>
    </tr>
  )
}
