import React from 'react'
import { PatientForm } from './patientForm'
import { PatientType } from '../_types/patient'
import { HealthConditionOptions } from '../_types/healthcondition'
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@material-tailwind/react'
import Swal from 'sweetalert2'

export default function Patient({
  ID,
  full_name: name,
  phone_number: phoneNumber,
  job,
  age,
  email,
  gender,
  address,
  health_history,
  surgery_history,
  patient_code: patientCode,
}: PatientType) {
  const [open, setOpen] = React.useState(false)

  const handleOpen = () => setOpen(!open)

  const handleHealthConditionLabelDisplay = (ids: string): string => {
    const idArray = ids.split(',').map((id) => id.trim())
    const labels = idArray
      .map((id) => {
        const option = HealthConditionOptions.find((opt) => opt.id === id)
        return option ? option.label : null
      })
      .filter((label) => label !== null)
    return labels.join(', ')
  }

  const handleHealthConditionInput = (input: string): string => {
    if (!input.trim() || input === '-') return '-'
    const inputArray = input.split(',').map((item) => item.trim().toLowerCase())
    const matchedIds = inputArray
      .map((inputItem) => {
        const option = HealthConditionOptions.find((opt) =>
          opt.label.toLowerCase().includes(inputItem)
        )
        return option ? option.id : null
      })
      .filter((id) => id !== null)
    return matchedIds.join(',')
  }

  const handleUpdatePatientInfo = () => {
    const full_name_new_input =
      document.querySelector<HTMLInputElement>('#full_name')?.value || name
    const phone_number_new_input =
      document.querySelector<HTMLInputElement>('#phone_number')?.value ||
      phoneNumber
    const job_new_input =
      document.querySelector<HTMLInputElement>('#job')?.value || job
    const age_new_input =
      document.querySelector<HTMLInputElement>('#age')?.value || age
    const email_new_input =
      document.querySelector<HTMLInputElement>('#email')?.value || email
    const address_new_input =
      document.querySelector<HTMLInputElement>('#address')?.value || address
    const health_history_new_input =
      document.querySelector<HTMLTextAreaElement>('#health_history')?.value ||
      ''
    const surgery_history_new_input =
      document.querySelector<HTMLTextAreaElement>('#surgery_history')?.value ||
      surgery_history

    const host = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:19091'
    fetch(`${host}/patient/${ID}`, {
      method: 'PATCH',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
        'session-token': localStorage.getItem('session-token') ?? '',
      },
      body: JSON.stringify({
        full_name: full_name_new_input,
        phone_number: phone_number_new_input,
        job: job_new_input,
        age: Number(age_new_input), // Convert age_new_input to number
        email: email_new_input,
        address: address_new_input,
        health_history: handleHealthConditionInput(
          health_history_new_input || ''
        ),
        surgery_history: surgery_history_new_input,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update patient information')
        }
        return response.json()
      })
      .then((data) => {
        console.log('Patient information updated successfully:', data)
      })
      .catch((error) => {
        console.error('Error updating patient information:', error)
      })
    Swal.fire({
      text: 'Data pasien berhasil diperbarui.',
      icon: 'success',
      confirmButtonText: 'OK',
    }).then(() => {
      // Reload the page after user clicks "OK"
      if (typeof window !== 'undefined') window.location.reload()
    })

    setOpen(!open)
  }

  const handleDeletePatient = () => {
    Swal.fire({
      title: 'Delete Patient Record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        const host =
          process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:19091'
        fetch(`${host}/patient/${ID}`, {
          method: 'DELETE',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
            'session-token': localStorage.getItem('session-token') ?? '',
          },
        })
          .then((response) => {
            if (!response.ok) throw new Error('Failed to delete')
            Swal.fire({
              text: 'Patient record deleted successfully.',
              icon: 'success',
              confirmButtonText: 'OK',
            }).then(() => {
              if (typeof window !== 'undefined') window.location.reload()
            })
          })
          .catch((error) => {
            console.error('Error deleting patient record:', error)
            Swal.fire('Error', 'Failed to delete patient record', 'error')
          })
      }
    })
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
          Ubah Data Pasien
        </DialogHeader>
        <DialogBody
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <PatientForm
            ID={ID}
            patient_code={patientCode}
            full_name={name}
            job={job}
            age={age}
            phone_number={phoneNumber}
            email={email}
            address={address}
            health_history={handleHealthConditionLabelDisplay(health_history)}
            surgery_history={surgery_history}
            gender={''}
            last_visit={''}
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
            onClick={() => handleUpdatePatientInfo()}
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
            onClick={() => handleDeletePatient()}
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
