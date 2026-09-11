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
import { ExpenseForm } from './expenseForm'
import { ExpenseType } from '../_types/expense'
import { apiFetch } from '../_functions/apiFetch'
import { UnauthorizedAccess } from '../_functions/unauthorized'
import {
  readExpenseFormValues,
  validateExpenseForm,
} from '../_functions/expenseHelpers'

export type ExpenseEditDialogProps = ExpenseType & {
  open: boolean
  setOpen: (v: boolean) => void
  onDataChange?: () => void
}

export default function ExpenseEditDialog({
  ID,
  expense_date,
  category: initialCategory,
  amount,
  description,
  payment_method: initialPaymentMethod,
  receipt_url,
  notes,
  open,
  setOpen,
  onDataChange,
}: ExpenseEditDialogProps) {
  const router = useRouter()
  const [category, setCategory] = React.useState<string>(
    initialCategory || 'Operational'
  )
  const [paymentMethod, setPaymentMethod] = React.useState<string>(
    initialPaymentMethod || 'bank_transfer'
  )

  React.useEffect(() => {
    if (open) {
      const t = setTimeout(() => {
        setCategory(initialCategory || 'Operational')
        setPaymentMethod(initialPaymentMethod || 'bank_transfer')
      }, 0)
      return () => clearTimeout(t)
    }
  }, [open, initialCategory, initialPaymentMethod])

  const handleConfirm = async () => {
    const rawValues = readExpenseFormValues('edit')
    const validation = validateExpenseForm(rawValues, category, paymentMethod)

    if (!validation.ok) {
      Swal.fire({
        text: validation.message,
        icon: 'warning',
        confirmButtonText: 'OK',
      })
      return
    }

    try {
      const response = await apiFetch(`/expense/${ID}`, {
        method: 'PATCH',
        body: JSON.stringify(validation.payload),
      })

      if (response.status === 401) {
        UnauthorizedAccess(router)
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData?.message ||
            errorData?.error ||
            'Gagal memperbarui data pengeluaran.'
        )
      }

      setOpen(false)
      await Swal.fire({
        text: 'Data pengeluaran berhasil diperbarui.',
        icon: 'success',
        confirmButtonText: 'OK',
      })

      if (onDataChange) {
        onDataChange()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating expense:', error)
      Swal.fire({
        text:
          error instanceof Error
            ? error.message
            : 'Gagal memperbarui data pengeluaran.',
        icon: 'error',
        confirmButtonText: 'OK',
      })
    }
  }

  return (
    <Dialog
      size={'xl'}
      className="max-h-[90vh] overflow-y-auto"
      handler={() => setOpen(!open)}
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
        Ubah Data Pengeluaran
      </DialogHeader>
      <DialogBody
        className="px-2 md:px-6"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        <ExpenseForm
          ID={ID}
          expense_date={expense_date}
          category={category}
          amount={amount}
          description={description}
          payment_method={paymentMethod}
          receipt_url={receipt_url}
          notes={notes}
          onCategoryChange={setCategory}
          onPaymentMethodChange={setPaymentMethod}
          isEdit={true}
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
          onClick={() => setOpen(false)}
          className="mr-1"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <span>Batal</span>
        </Button>
        <Button
          variant="gradient"
          color="green"
          onClick={handleConfirm}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <span>Simpan Perubahan</span>
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
