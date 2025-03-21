import { TherapistType } from '../_types/therapist'

export default function Therapist({
  ID: id,
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
            {weight} KG
          </small>
          <small className="font-sans text-sm text-current antialiased opacity-70">
            {height} CM
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
        <div className="w-max cursor-pointer">
          <div
            data-id={id}
            data-open="true"
            data-shape="pill"
            onClick={() => {
              if (!isApproved) {
                // Logic to update the approval status can be added here
                console.log('Set to Approved')
                const host =
                  process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:19091'
                fetch(`${host}/therapist/${id}`, {
                  method: 'PUT',
                  mode: 'cors',
                  headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization:
                      'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
                    'session-token':
                      localStorage.getItem('session-token') ?? '',
                  },
                  body: JSON.stringify({ is_approved: true }),
                })
                  .then((response) => {
                    if (!response.ok) {
                      throw new Error('Failed to update approval status')
                    }
                    return response.json()
                  })
                  .then((data) => {
                    console.log('Approval status updated:', data)
                    document
                      .querySelector(`[data-id="${id}"]`)
                      ?.classList.remove('border-red-500', 'bg-red-500')
                    document
                      .querySelector(`[data-id="${id}"]`)
                      ?.classList.add('border-green-500', 'bg-green-500')
                  })
                  .catch((error) => {
                    console.error('Error:', error)
                  })
              }
            }}
            className={`relative inline-flex w-max items-center rounded-md border p-0.5 font-sans text-xs font-medium text-green-50 shadow-sm data-[shape=pill]:rounded-full ${
              isApproved
                ? 'border-green-500 bg-green-500'
                : 'border-red-500 bg-red-500'
            }`}
          >
            <span
              id="text-approve"
              className="mx-1.5 my-0.5 font-sans leading-none text-current"
            >
              {isApproved ? 'Approved' : 'Not Approved'}
            </span>
          </div>
        </div>
      </td>
    </tr>
  )
}
