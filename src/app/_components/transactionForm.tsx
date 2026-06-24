'use client'
import React, { useState, useEffect } from 'react'
import { Card, Input, Textarea } from '@material-tailwind/react'
import { TransactionType } from '../_types/transaction'
import { apiFetch } from '../_functions/apiFetch'
import { extractItemList } from '../_functions/itemDataHelpers'
import { ItemType } from '../_types/item'
import { useRouter } from 'next/navigation'
import { UnauthorizedAccess } from '../_functions/unauthorized'

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
  items,
}: TransactionType) {
  const [allItems, setAllItems] = useState<ItemType[]>([])
  const [selectedItems, setSelectedItems] = useState<
    { item_id: number; quantity: number }[]
  >(() => items ?? [])
  const [manualAmount, setManualAmount] = useState<number | null>(null)
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [itemsError, setItemsError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    // avoid network calls during unit tests
    if (process.env.NODE_ENV === 'test') {
      return
    }

    ;(async () => {
      setIsLoadingItems(true)
      setItemsError(null)
      try {
        const res = await apiFetch('/item?limit=1000', { method: 'GET' })
        if (res.status === 401) {
          UnauthorizedAccess(router)
          return
        }
        if (!res.ok) {
          if (mounted) {
            setItemsError('Failed to load item options')
          }
          return
        }
        const data = await res.json()
        const list = extractItemList(data)
        if (mounted) {
          setAllItems(list)
        }
      } catch (e) {
        if (mounted) {
          setItemsError('Failed to load item options')
        }
      } finally {
        if (mounted) {
          setIsLoadingItems(false)
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [router])

  // Calculate base price (amount of transaction minus the cost of the original items)
  let calculatedBasePrice = amount
  if (items && items.length > 0 && allItems.length > 0) {
    let originalItemsCost = 0
    for (const item of items) {
      const detail = allItems.find((i) => i.ID === item.item_id)
      if (detail) {
        originalItemsCost += detail.price * item.quantity
      }
    }
    calculatedBasePrice = Math.max(0, amount - originalItemsCost)
  }

  // Calculate new total amount including the currently selected items
  let newAmount = calculatedBasePrice
  for (const item of selectedItems) {
    const detail = allItems.find((i) => i.ID === item.item_id)
    if (detail) {
      newAmount += detail.price * item.quantity
    }
  }

  const currentAmount = manualAmount !== null ? manualAmount : newAmount

  const handleAddItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (!val) return

    const itemId = Number(val)
    if (selectedItems.some((i) => i.item_id === itemId)) return

    setSelectedItems((prev) => [...prev, { item_id: itemId, quantity: 1 }])
    setManualAmount(null)
    e.target.value = '' // Reset selection
  }

  const handleQuantityChange = (itemId: number, qty: number) => {
    if (qty < 1) return
    const detail = allItems.find((i) => i.ID === itemId)
    const maxStock = detail ? detail.quantity : 999
    const targetQty = qty > maxStock ? maxStock : qty

    setSelectedItems((prev) =>
      prev.map((item) =>
        item.item_id === itemId ? { ...item, quantity: targetQty } : item
      )
    )
    setManualAmount(null)
  }

  const handleRemoveItem = (itemId: number) => {
    setSelectedItems((prev) => prev.filter((item) => item.item_id !== itemId))
    setManualAmount(null)
  }

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
            value={currentAmount}
            onChange={(e) => setManualAmount(Number(e.target.value))}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            crossOrigin={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          />

          <div className="w-full">
            <label
              htmlFor="payment_status"
              className="mb-1 block text-sm text-gray-600"
            >
              Status Pembayaran
            </label>
            <select
              id="payment_status"
              defaultValue={payment_status ?? ''}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Pilih status</option>
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <div className="w-full">
            <label
              htmlFor="add_transaction_item"
              className="mb-1 block text-sm text-gray-600"
            >
              Pilih Item Transaksi
            </label>
            {itemsError && (
              <p className="mb-1 text-xs text-red-500">{itemsError}</p>
            )}
            <select
              id="add_transaction_item"
              onChange={handleAddItemChange}
              disabled={isLoadingItems}
              defaultValue=""
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100"
            >
              <option value="" disabled>
                {isLoadingItems
                  ? 'Memuat data item...'
                  : 'Pilih item untuk ditambahkan...'}
              </option>
              {allItems
                .filter(
                  (item) => !selectedItems.some((si) => si.item_id === item.ID)
                )
                .map((item) => (
                  <option key={item.ID} value={item.ID}>
                    {item.name} - Rp. {item.price.toLocaleString('id-ID')}{' '}
                    (Stok: {item.quantity})
                  </option>
                ))}
            </select>
          </div>

          {selectedItems.length > 0 && (
            <div className="w-full rounded-md border border-gray-200 bg-gray-50 p-3">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Daftar Item Terpilih
              </span>
              <div className="flex flex-col gap-2">
                {selectedItems.map((selectedItem) => {
                  const detail = allItems.find(
                    (i) => i.ID === selectedItem.item_id
                  )
                  const name = detail
                    ? detail.name
                    : `Item #${selectedItem.item_id}`
                  const price = detail ? detail.price : 0
                  const maxStock = detail ? detail.quantity : 999

                  return (
                    <div
                      key={selectedItem.item_id}
                      className="flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-white p-2 text-sm shadow-sm transition-all hover:shadow"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">
                          {name}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          (Rp. {price.toLocaleString('id-ID')})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`qty-${selectedItem.item_id}`}
                          className="sr-only"
                        >
                          Quantity
                        </label>
                        <input
                          id={`qty-${selectedItem.item_id}`}
                          type="number"
                          min="1"
                          max={maxStock}
                          value={selectedItem.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              selectedItem.item_id,
                              Number(e.target.value)
                            )
                          }
                          className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(selectedItem.item_id)}
                          className="rounded p-1 text-red-500 hover:bg-gray-100 hover:text-red-700"
                          aria-label={`Hapus ${name}`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <input
            type="hidden"
            id="items"
            value={JSON.stringify(selectedItems)}
          />

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
