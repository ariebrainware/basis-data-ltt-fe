import React from 'react'
import { ExpenseType } from '../_types/expense'
import ExpenseEditDialog from './expenseEditDialog'
import { useDeleteResource } from '../_hooks/useDeleteResource'

export default function ExpenseRowActions({
  ID,
  expense_date,
  category,
  amount,
  description,
  payment_method,
  receipt_url,
  notes,
  onDataChange,
}: ExpenseType & { onDataChange?: () => void }) {
  const [open, setOpen] = React.useState(false)
  const handleOpen = () => setOpen((prev) => !prev)

  const handleDeleteExpense = useDeleteResource({
    resourceType: 'expense',
    resourceId: ID,
    resourceName: 'Data Pengeluaran',
    onSuccess: onDataChange,
  })

  return (
    <>
      <ExpenseEditDialog
        ID={ID}
        expense_date={expense_date}
        category={category}
        amount={amount}
        description={description}
        payment_method={payment_method}
        receipt_url={receipt_url}
        notes={notes}
        open={open}
        setOpen={setOpen}
        onDataChange={onDataChange}
      />

      <div className="flex items-center gap-2">
        <button
          data-open={open}
          className="text-slate-800 hover:border-slate-600/10 hover:bg-slate-200/10 group inline-grid min-h-[38px] min-w-[38px] select-none place-items-center rounded-md border border-transparent bg-transparent text-center align-middle font-sans text-sm font-medium shadow-none outline-none transition-all duration-300 ease-in hover:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none data-[shape=circular]:rounded-full"
          data-shape="default"
          onClick={handleOpen}
          aria-label="Edit expense"
          title="Ubah Pengeluaran"
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
          onClick={handleDeleteExpense}
          aria-label="Delete expense"
          title="Hapus Pengeluaran"
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
      </div>
    </>
  )
}
