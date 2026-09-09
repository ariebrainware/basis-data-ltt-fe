import React from 'react'
import { ExpenseType } from '../_types/expense'
import ExpenseRowActions from './expenseRowActions'
import {
  formatRupiah,
  getCategoryBadgeClass,
} from '../_functions/expenseHelpers'

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
        {receipt_url ? (
          <a
            href={receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 underline hover:text-blue-800"
          >
            Lihat Bukti
          </a>
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
