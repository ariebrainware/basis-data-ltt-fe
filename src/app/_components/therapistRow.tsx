import React from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../_functions/apiFetch'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import { TherapistType } from '../_types/therapist'
import { TherapistForm } from '../_components/therapistForm'
import Swal from 'sweetalert2'
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@material-tailwind/react'
import { getApiHost } from '../_functions/apiHost'
import { useDeleteResource } from '../_hooks/useDeleteResource'

export default function Therapist({
  ID: ID,
  full_name: fullName,
  email,
  phone_number: phoneNumber,
  address,
  date_of_birth: dateOfBirth,
  nik,
  weight,
  height,
  is_approved: isApproved,
  role: initialRole,
}: TherapistType) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const [role, setRole] = React.useState<string>(initialRole || '')
  const [approved, setApproved] = React.useState<boolean>(isApproved)

  React.useEffect(() => {
    setRole(initialRole || '')
    setApproved(isApproved)
  }, [initialRole, isApproved])

  const handleRoleChange = (newRole: string) => {
    setRole(newRole)
  }

  const handleDeleteTherapist = useDeleteResource({
    resourceType: 'therapist',
    resourceId: ID,
    resourceName: 'Data Terapis',
  })

  const handleOpen = () => setOpen(!open)

  const handleUpdateTherapist = () => {
    const full_name_input =
      document.querySelector<HTMLInputElement>('#full_name')?.value || fullName
    const email_input =
      document.querySelector<HTMLInputElement>('#email')?.value || email
    const phone_number_input =
      document.querySelector<HTMLInputElement>('#phone_number')?.value ||
      phoneNumber
    const address_input =
      document.querySelector<HTMLInputElement>('#address')?.value || address
    const date_of_birth_input =
      document.querySelector<HTMLInputElement>('#date_of_birth')?.value ||
      dateOfBirth
    const nik_input =
      document.querySelector<HTMLTextAreaElement>('#nik')?.value || nik
    const weight_input =
      document.querySelector<HTMLTextAreaElement>('#weight')?.value || weight
    const height_input =
      document.querySelector<HTMLTextAreaElement>('#height')?.value || height
    const role_input =
      document.querySelector<HTMLTextAreaElement>('#role')?.value || role
    apiFetch(`/therapist/${ID}`, {
      method: 'PATCH',
      body: JSON.stringify({
        full_name: full_name_input,
        email: email_input,
        phone_number: phone_number_input,
        address: address_input,
        date_of_birth: date_of_birth_input,
        nik: nik_input,
        weight: Number(weight_input),
        height: Number(height_input),
        role: role_input,
      }),
    })
      .then((response) => {
        if (response.status === 401) {
          UnauthorizedAccess(router)
          return Promise.reject(new Error('Unauthorized'))
        }
        if (!response.ok || response.status !== 200) {
          return response.json().then((data) => {
            Swal.fire({
              text: `Data terapis gagal diperbarui dengan error "${data.error || 'Unknown error'}"`,
              icon: 'error',
              confirmButtonText: 'OK',
            })
            throw new Error('Failed to update patient information')
          })
        } else {
          Swal.fire({
            text: 'Data terapis berhasil diperbarui.',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            router.refresh()
          })
        }

        return response.json()
      })
      .then((data) => {
        console.log('Patient information updated successfully:', data)
      })
      .catch((error) => {
        console.error('Error updating patient information:', error)
      })

    setOpen(!open)
  }

  return (
    <>
      <Dialog
        size={'sm'}
        handler={handleOpen}
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        open={open}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        <DialogHeader
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          Ubah Data Terapis
        </DialogHeader>
        <DialogBody
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <TherapistForm
            ID={ID}
            full_name={fullName}
            email={email}
            phone_number={phoneNumber}
            address={address}
            date_of_birth={dateOfBirth}
            nik={nik}
            weight={weight}
            height={height}
            role={role}
            is_approved={isApproved}
            onRoleChange={handleRoleChange}
          />
        </DialogBody>
        <DialogFooter
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <Button
            variant="text"
            color="red"
            onClick={() => handleOpen()}
            className="mr-1"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <span>Cancel</span>
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={() => handleUpdateTherapist()}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>

      <tr className="border-slate-200 border-b last:border-0">
        <td className="p-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <small className="font-sans text-sm text-current antialiased">
                {fullName}
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
              data-id={ID}
              data-open="true"
              data-shape="pill"
              onClick={() => {
                if (!approved) {
                  console.log('Set to Approved')
                  apiFetch(`/therapist/${ID}`, {
                    method: 'PUT',
                    body: JSON.stringify({ is_approved: true }),
                  })
                    .then((response) => {
                      if (response.status === 401) {
                        UnauthorizedAccess(router)
                        return Promise.reject(new Error('Unauthorized'))
                      }
                      if (!response.ok) {
                        throw new Error('Failed to update approval status')
                      }
                      return response.json()
                    })
                    .then((data) => {
                      console.log('Approval status updated:', data)
                      setApproved(true)
                      router.refresh()
                    })
                    .catch((error) => {
                      console.error('Error:', error)
                    })
                }
              }}
              className={`relative inline-flex w-max items-center rounded-md border p-0.5 font-sans text-xs font-medium text-green-50 shadow-sm data-[shape=pill]:rounded-full ${
                approved
                  ? 'border-green-500 bg-green-500'
                  : 'border-red-500 bg-red-500'
              }`}
            >
              <span
                id="text-approve"
                className="mx-1.5 my-0.5 font-sans leading-none text-current"
              >
                {approved ? 'Approved' : 'Not Approved'}
              </span>
            </div>
          </div>
        </td>
        <td className="p-3">
          <button
            data-open={open}
            className="text-slate-800 hover:border-slate-600/10 hover:bg-slate-200/10 group inline-grid min-h-[38px] min-w-[38px] select-none place-items-center rounded-md border border-transparent bg-transparent text-center align-middle font-sans text-sm font-medium shadow-none outline-none transition-all duration-300 ease-in hover:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none data-[shape=circular]:rounded-full"
            data-shape="default"
            onClick={() => handleOpen()}
          >
            <svg
              width="1.5em"
              height="1.5em"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              color="currentColor"
              className="text-slate-800 size-4 dark:text-white"
            >
              <path
                d="M14.3632 5.65156L15.8431 4.17157C16.6242 3.39052 17.8905 3.39052 18.6716 4.17157L20.0858 5.58579C20.8668 6.36683 20.8668 7.63316 20.0858 8.41421L18.6058 9.8942M14.3632 5.65156L4.74749 15.2672C4.41542 15.5993 4.21079 16.0376 4.16947 16.5054L3.92738 19.2459C3.87261 19.8659 4.39148 20.3848 5.0115 20.33L7.75191 20.0879C8.21972 20.0466 8.65806 19.8419 8.99013 19.5099L18.6058 9.8942M14.3632 5.65156L18.6058 9.8942"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </button>
          <button
            className="text-slate-800 hover:border-slate-600/10 hover:bg-slate-200/10 group inline-grid min-h-[38px] min-w-[38px] select-none place-items-center rounded-md border border-transparent bg-transparent text-center align-middle font-sans text-sm font-medium shadow-none outline-none transition-all duration-300 ease-in hover:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none data-[shape=circular]:rounded-full"
            data-shape="default"
            onClick={handleDeleteTherapist}
          >
            <svg
              width="1.5em"
              height="1.5em"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              color="currentColor"
              className="text-slate-800 size-4 dark:text-white"
            >
              <path
                d="M19.5 6H16.5M19.5 6H4.5M19.5 6V19.5C19.5 20.2956 18.8284 21 18 21H6C5.17157 21 4.5 20.2956 4.5 19.5V6M9 10.5V16.5M15 10.5V16.5M9 6V4.5C9 3.67157 9.67157 3 10.5 3H13.5C14.3284 3 15 3.67157 15 4.5V6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </button>
        </td>
      </tr>
    </>
  )
}
