export function resetExpenseFormInputs(prefix: string = 'add'): void {
  const fields = [
    `#${prefix}_expense_date`,
    `#${prefix}_amount`,
    `#${prefix}_description`,
    `#${prefix}_receipt_url`,
    `#${prefix}_notes`,
  ]
  fields.forEach((selector) => {
    const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      selector
    )
    if (el) el.value = ''
  })
}

export function readExpenseFormValues(prefix: string = 'add'): {
  expense_date: string
  amount: string
  description: string
  receipt_url: string
  notes: string
} {
  return {
    expense_date:
      document.querySelector<HTMLInputElement>(`#${prefix}_expense_date`)
        ?.value || '',
    amount:
      document.querySelector<HTMLInputElement>(`#${prefix}_amount`)?.value ||
      '0',
    description:
      document.querySelector<HTMLTextAreaElement>(`#${prefix}_description`)
        ?.value || '',
    receipt_url:
      document.querySelector<HTMLInputElement>(`#${prefix}_receipt_url`)
        ?.value || '',
    notes:
      document.querySelector<HTMLTextAreaElement>(`#${prefix}_notes`)?.value ||
      '',
  }
}

export interface ExpensePayload {
  expense_date: string
  category: string
  amount: number
  description: string
  payment_method: string
  receipt_url?: string
  notes?: string
}

export function validateExpenseForm(
  values: {
    expense_date: string
    amount: string | number
    description: string
    receipt_url?: string
    notes?: string
  },
  category: string,
  paymentMethod: string
): { ok: true; payload: ExpensePayload } | { ok: false; message: string } {
  if (!values.expense_date.trim()) {
    return { ok: false, message: 'Tanggal pengeluaran tidak boleh kosong.' }
  }

  if (!category || !category.trim()) {
    return { ok: false, message: 'Kategori pengeluaran harus dipilih.' }
  }

  const parsedAmount = Number(values.amount)
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return {
      ok: false,
      message: 'Nominal pengeluaran harus berupa angka lebih besar dari 0.',
    }
  }

  if (!values.description.trim()) {
    return { ok: false, message: 'Deskripsi pengeluaran tidak boleh kosong.' }
  }

  if (!paymentMethod || !paymentMethod.trim()) {
    return { ok: false, message: 'Metode pembayaran harus dipilih.' }
  }

  const payload: ExpensePayload = {
    expense_date: values.expense_date.trim(),
    category: category.trim(),
    amount: Math.round(parsedAmount),
    description: values.description.trim(),
    payment_method: paymentMethod.trim(),
  }

  if (values.receipt_url && values.receipt_url.trim()) {
    payload.receipt_url = values.receipt_url.trim()
  }

  if (values.notes && values.notes.trim()) {
    payload.notes = values.notes.trim()
  }

  return {
    ok: true,
    payload,
  }
}

export function formatRupiah(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount || 0
  return `Rp ${Math.round(num).toLocaleString('id-ID')}`
}

export function getCategoryBadgeClass(category: string): string {
  switch (category.toLowerCase()) {
    case 'operational':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'medical supplies':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'equipment':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'salary':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'utilities':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'marketing':
      return 'bg-pink-100 text-pink-800 border-pink-200'
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200'
  }
}
