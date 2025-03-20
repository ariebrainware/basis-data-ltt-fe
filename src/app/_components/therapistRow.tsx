import { TherapistType } from '../_types/therapist'

export default function Therapist({
  full_name: name,
  email,
  phone_number: phoneNumber,
  address,
  date_of_birth: dateOfBirth,
  nik,
  weight,
  height,
  role,
  is_approved: isApproved,
}: TherapistType) {
  return (
    <tr className="border-slate-200 border-b last:border-0">
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
            {email}
          </small>
          <small className="font-sans text-sm text-current antialiased opacity-70">
            {address}
          </small>
        </div>
      </td>
      <td className="p-3">
        <div className="flex flex-col">
          <small className="font-sans text-sm text-current antialiased">
            {dateOfBirth}
          </small>
          <small className="font-sans text-sm text-current antialiased opacity-70">
            {nik}
          </small>
        </div>
      </td>
      <td className="p-3">
        <div className="flex flex-col">
          <small className="font-sans text-sm text-current antialiased">
            {weight}
          </small>
          <small className="font-sans text-sm text-current antialiased opacity-70">
            {height}
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
              {role}
            </span>
          </div>
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
              {isApproved ? 'Approved' : 'Not Approved'}
            </span>
          </div>
        </div>
      </td>
    </tr>
  )
}
