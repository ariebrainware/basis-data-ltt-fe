import { Card, Input, Textarea } from '@material-tailwind/react'
import { TransactionType } from '../_types/transaction'

export function TransactionForm({
  ID,
  treatment_id,
  patient_name,
  pricing_name,
  amount,
  payment_status,
  notes,
  transaction_date,
  treatment_date,
}: TransactionType) {
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
      <form className="mb-2 mt-4 w-full px-2 md:mt-8 md:px-0">
        <div className="mb-1 flex w-full flex-col gap-4">
          <Input
            id="ID"
            type="text"
            label="ID"
            disabled
            defaultValue={ID}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            crossOrigin={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          />
          <Input
            id="treatment_id"
            type="number"
            label="ID Penanganan"
            disabled
            defaultValue={treatment_id}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            crossOrigin={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          />
          <Input
            id="patient_name"
            type="text"
            label="Nama Pasien"
            disabled
            defaultValue={patient_name}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            crossOrigin={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          />
          <Input
            id="pricing_name"
            type="text"
            label="Jenis Harga"
            defaultValue={pricing_name}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            crossOrigin={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          />
          <Input
            id="amount"
            type="number"
            label="Nominal"
            defaultValue={amount}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            crossOrigin={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          />
          <div className="w-full">
            <label className="mb-1 block text-sm text-gray-600">
              Status Pembayaran
            </label>
            <select
              id="payment_status"
              defaultValue={payment_status ?? ''}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Pilih status</option>
              <option value="cash">cash</option>
              <option value="transfer">transfer</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <Input
            id="transaction_date"
            type="text"
            disabled
            label="Tanggal Transaksi"
            defaultValue={transaction_date}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            crossOrigin={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          />
          <Input
            id="treatment_date"
            disabled
            type="text"
            label="Tanggal Terapi"
            defaultValue={treatment_date}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            crossOrigin={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          />
          <Textarea
            id="notes"
            label="Catatan"
            defaultValue={notes}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          />
        </div>
      </form>
    </Card>
  )
}
