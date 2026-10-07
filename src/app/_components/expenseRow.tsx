import React from 'react'
import { ExpenseType } from '../_types/expense'
import ExpenseRowActions from './expenseRowActions'
import {
  formatRupiah,
  getCategoryBadgeClass,
} from '../_functions/expenseHelpers'
import { parseAttachmentPaths } from '../_functions/apiHost'
import { viewAttachment } from '../_functions/viewAttachment'

export default function ExpenseRow({
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
  const badgeClass = getCategoryBadgeClass(category)
  const attachmentList = parseAttachmentPaths(receipt_url)

  return (
    <tr className="border-slate-200 hover:bg-slate-50/50 border-b transition-colors last:border-0">
      <td className="p-3">
        <small className="text-slate-600 font-mono font-sans text-sm antialiased">
          #{ID}
        </small>
      </td>
      <td className="p-3">
        <small className="whitespace-nowrap font-sans text-sm text-current antialiased">
          {expense_date}
        </small>
      </td>
      <td className="p-3">
        <span
          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
        >
          {category}
        </span>
      </td>
      <td className="max-w-xs truncate p-3" title={description}>
        <small className="font-sans text-sm font-medium text-current antialiased">
          {description}
        </small>
      </td>
      <td className="p-3">
        <small className="text-slate-700 whitespace-nowrap font-sans text-sm capitalize antialiased">
          {payment_method.replace('_', ' ')}
        </small>
      </td>
      <td className="whitespace-nowrap p-3">
        <small className="text-rose-600 font-sans text-sm font-semibold antialiased">
          {formatRupiah(amount)}
        </small>
      </td>
      <td className="max-w-[150px] truncate p-3">
        {attachmentList.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1">
            {attachmentList.map((path, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  void viewAttachment(path, path.split('/').pop() || 'receipt')
                }
                className="dark:bg-blue-950/40 inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800 dark:text-blue-400"
                title={`Lihat bukti ${idx + 1}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.52 9.52l3.45-3.451a.75.75 0 1 1 1.061 1.06l-3.45 3.451a1.125 1.125 0 0 0 1.587 1.595l3.454-3.553a3 3 0 0 0 0-4.242Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Lihat Bukti{attachmentList.length > 1 ? ` ${idx + 1}` : ''}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <span className="text-slate-400 text-xs italic">-</span>
        )}
      </td>
      <td className="max-w-[150px] truncate p-3" title={notes || '-'}>
        <small className="text-slate-500 font-sans text-xs antialiased">
          {notes || '-'}
        </small>
      </td>
      <td className="p-3">
        <ExpenseRowActions
          ID={ID}
          expense_date={expense_date}
          category={category}
          amount={amount}
          description={description}
          payment_method={payment_method}
          receipt_url={receipt_url}
          notes={notes}
          onDataChange={onDataChange}
        />
      </td>
    </tr>
  )
}
