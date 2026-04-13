import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from '@material-tailwind/react'
import Swal from 'sweetalert2'
import { apiFetch } from '../_functions/apiFetch'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import { TransactionType } from '../_types/transaction'
import { TransactionForm } from './transactionForm'

export default function TransactionRow({
  ID,
  treatment_id,
  patient_name,
  amount,
  payment_status,
  notes,
  transaction_date,
  treatment_date,
}: TransactionType) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  const handleOpen = () => setOpen((prev) => !prev)

  const handleUpdateTransaction = () => {
    const treatmentIdInput =
      document.querySelector<HTMLInputElement>('#treatment_id')?.value ||
      String(treatment_id)
    const patientNameInput =
      document.querySelector<HTMLInputElement>('#patient_name')?.value ||
      patient_name
    const pricingNameInput =
      document.querySelector<HTMLInputElement>('#pricing_name')?.value || ''
    const amountInput =
      document.querySelector<HTMLInputElement>('#amount')?.value ||
      String(amount)
    const paymentStatusInput =
      document.querySelector<HTMLInputElement>('#payment_status')?.value ||
      payment_status
    const transactionDateInput =
      document.querySelector<HTMLInputElement>('#transaction_date')?.value ||
      transaction_date
    const treatmentDateInput =
      document.querySelector<HTMLInputElement>('#treatment_date')?.value ||
      treatment_date
    const notesInput =
      document.querySelector<HTMLTextAreaElement>('#notes')?.value || notes

    apiFetch(`/transaction/${ID}`, {
      method: 'PATCH',
      body: JSON.stringify({
        treatment_id: Number(treatmentIdInput),
        patient_name: patientNameInput.trim(),
        pricing_name: pricingNameInput.trim(),
        amount: Number(amountInput),
        payment_status: paymentStatusInput.trim(),
        transaction_date: transactionDateInput.trim(),
        treatment_date: treatmentDateInput.trim(),
        notes: notesInput.trim(),
      }),
    })
      .then((response) => {
        if (response.status === 401) {
          UnauthorizedAccess(router)
          return Promise.reject(new Error('Unauthorized'))
        }
        if (!response.ok) {
          throw new Error('Failed to update transaction information')
        }
        return response.json()
      })
      .then((data) => {
        console.log('Transaction information updated successfully:', data)
        setOpen(false)
        Swal.fire({
          text: 'Data transaksi berhasil diperbarui.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          router.refresh()
        })
      })
      .catch((error) => {
        console.error('Error updating transaction information:', error)
        if (error.message !== 'Unauthorized') {
          Swal.fire({
            text: 'Gagal memperbarui data transaksi.',
            icon: 'error',
            confirmButtonText: 'OK',
          })
        }
      })
  }

  return (
    <>
      <Dialog
        size={'xl'}
        className="max-h-[90vh] overflow-y-auto"
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
          Ubah Data Transaksi
        </DialogHeader>
        <DialogBody
          className="px-2 md:px-6"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <TransactionForm
            ID={ID}
            treatment_id={treatment_id}
            patient_name={patient_name}
            pricing_name={''}
            amount={amount}
            payment_status={payment_status}
            notes={notes}
            transaction_date={transaction_date}
            treatment_date={treatment_date}
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
            onClick={handleOpen}
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
            onClick={handleUpdateTransaction}
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
          <small className="font-sans text-sm text-current antialiased">
            {transaction_date || '-'}
          </small>
        </td>
        <td className="p-3">
          <small className="font-sans text-sm text-current antialiased">
            {treatment_date || '-'}
          </small>
        </td>
        <td className="p-3">
          <small className="font-sans text-sm text-current antialiased">
            {patient_name || '-'}
          </small>
        </td>
        <td className="p-3">
          <small className="font-sans text-sm text-current antialiased">
            {treatment_id}
          </small>
        </td>
        <td className="p-3">
          <small className="font-sans text-sm text-current antialiased">
            Rp {Number(amount || 0).toLocaleString('id-ID')}
          </small>
        </td>
        <td className="p-3">
          <small className="font-sans text-sm text-current antialiased">
            {payment_status || '-'}
          </small>
        </td>
        <td className="p-3">
          <small className="font-sans text-sm text-current antialiased">
            {notes || '-'}
          </small>
        </td>
        <td className="p-3">
          <button
            data-open={open}
            className="text-slate-800 hover:border-slate-600/10 hover:bg-slate-200/10 group inline-grid min-h-[38px] min-w-[38px] select-none place-items-center rounded-md border border-transparent bg-transparent text-center align-middle font-sans text-sm font-medium shadow-none outline-none transition-all duration-300 ease-in hover:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none data-[shape=circular]:rounded-full"
            data-shape="default"
            onClick={handleOpen}
            aria-label="Edit transaction"
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
        </td>
      </tr>
    </>
  )
}
