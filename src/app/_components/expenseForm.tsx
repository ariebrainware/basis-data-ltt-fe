import React from 'react'
import { Card, Input, Textarea, Select, Option } from '@material-tailwind/react'
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../_types/expense'

interface ExpenseFormProps {
  ID?: number
  expense_date?: string
  category?: string
  amount?: number
  description?: string
  payment_method?: string
  receipt_url?: string
  notes?: string
  onCategoryChange?: (value: string) => void
  onPaymentMethodChange?: (value: string) => void
  isEdit?: boolean
}

export function ExpenseForm({
  ID,
  expense_date,
  category = 'Operational',
  amount,
  description,
  payment_method = 'bank_transfer',
  receipt_url,
  notes,
  onCategoryChange,
  onPaymentMethodChange,
  isEdit = false,
}: ExpenseFormProps) {
  const prefix = isEdit ? 'edit' : 'add'
  const today = new Date().toISOString().split('T')[0]

  return (
    <Card
      color="transparent"
      shadow={false}
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
      onResize={undefined}
      onResizeCapture={undefined}
    >
      <form className="mb-2 mt-4 w-full px-2 md:mt-6 md:px-0">
        <div className="flex w-full flex-col gap-4 md:flex-row md:gap-6">
          {/* Left Column */}
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            {isEdit && (
              <Input
                id={`${prefix}_ID`}
                type="text"
                label="ID Pengeluaran"
                disabled
                defaultValue={ID}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              />
            )}
            <Input
              id={`${prefix}_expense_date`}
              type="date"
              label="Tanggal Pengeluaran"
              defaultValue={expense_date || today}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <div className="w-full">
              <Select
                id={`${prefix}_category`}
                data-testid={`${prefix}_category`}
                label="Kategori Pengeluaran"
                value={category}
                onChange={(val) =>
                  onCategoryChange && onCategoryChange(val || '')
                }
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <Option key={cat} value={cat}>
                    {cat}
                  </Option>
                ))}
              </Select>
            </div>
            <Input
              id={`${prefix}_amount`}
              type="number"
              label="Nominal (Rp)"
              defaultValue={amount !== undefined ? amount : ''}
              placeholder="Contoh: 150000"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <div className="w-full">
              <Select
                id={`${prefix}_payment_method`}
                data-testid={`${prefix}_payment_method`}
                label="Metode Pembayaran"
                value={payment_method}
                onChange={(val) =>
                  onPaymentMethodChange && onPaymentMethodChange(val || '')
                }
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                {PAYMENT_METHODS.map((method) => (
                  <Option key={method.value} value={method.value}>
                    {method.label}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            <Textarea
              id={`${prefix}_description`}
              label="Deskripsi / Keperluan"
              rows={3}
              defaultValue={description}
              placeholder="Contoh: Pembayaran tagihan listrik klinik bulan Januari"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Input
              id={`${prefix}_receipt_url`}
              type="text"
              label="URL Bukti / Kwitansi (Opsional)"
              defaultValue={receipt_url}
              placeholder="https://..."
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <Textarea
              id={`${prefix}_notes`}
              label="Catatan Tambahan (Opsional)"
              rows={2}
              defaultValue={notes}
              placeholder="Catatan tambahan..."
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
          </div>
        </div>
      </form>
    </Card>
  )
}
