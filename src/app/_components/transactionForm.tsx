'use client'
import React, { useState, useEffect } from 'react'
import { Card, Input, Textarea } from '@material-tailwind/react'
import { TransactionType } from '../_types/transaction'
import { apiFetch } from '../_functions/apiFetch'
import { extractItemList } from '../_functions/itemDataHelpers'
import { ItemType } from '../_types/item'
import { useRouter } from 'next/navigation'
import { UnauthorizedAccess } from '../_functions/unauthorized'

import { getAttachmentUrl } from '../_functions/apiHost'

const formatPaymentStatus = (s?: string | null) => {
  if (!s) return '-'
  const lower = s.trim().toLowerCase()
  if (lower === 'unpaid') return 'Terhutang'
  if (lower === 'partial') return 'Parsial'
  if (lower === 'cash') return 'Cash'
  return s
    .replace(/[_\-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

const normalizePricingNameDefault = (val?: string | null) => {
  if (!val) return ''
  const lower = val.toLowerCase()
  if (['cash', 'transfer_or_qris', 'debit'].includes(lower)) {
    return lower
  }
  return val
}

const normalizePaymentStatusDefault = (val?: string | null) => {
  if (!val) return ''
  const lower = val.toLowerCase()
  if (['paid', 'unpaid', 'partial'].includes(lower)) {
    return lower
  }
  return val
}

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
  attachment_path,
}: TransactionType) {
  const [allItems, setAllItems] = useState<ItemType[]>([])
  const [selectedItems, setSelectedItems] = useState<
    { item_id: number; quantity: number; price?: number }[]
  >(() => items ?? [])
  const [dbAmount, setDbAmount] = useState<number | null>(null)
  const [dbItems, setDbItems] = useState<
    { item_id: number; quantity: number; price?: number }[] | null
  >(null)
  const [manualAmount, setManualAmount] = useState<number | null>(null)
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [itemsError, setItemsError] = useState<string | null>(null)
  const [attachmentPaths, setAttachmentPaths] = useState<string[]>(() => {
    return attachment_path
      ? attachment_path.split(/,(?=\/?uploads\/|https?:\/\/)/).filter(Boolean)
      : []
  })
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (attachment_path !== undefined) {
      setAttachmentPaths(
        attachment_path
          ? attachment_path
              .split(/,(?=\/?uploads\/|https?:\/\/)/)
              .filter(Boolean)
          : []
      )
    }
  }, [attachment_path])

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
    ;(async () => {
      try {
        const res = await apiFetch(`/transaction/${ID}`, { method: 'GET' })
        if (res.status === 401) {
          UnauthorizedAccess(router)
          return
        }
        if (res.ok) {
          const body = await res.json()
          const fetchedItems = body?.data?.items
          const fetchedAmount = body?.data?.amount
          const fetchedAttachment =
            body?.data?.attachment_path || body?.data?.file_path
          if (mounted) {
            if (fetchedAmount !== undefined && fetchedAmount !== null) {
              setDbAmount(Number(fetchedAmount))
            }
            if (Array.isArray(fetchedItems)) {
              const mapped = fetchedItems.map((i: any) => ({
                item_id: Number(i?.item_id ?? i?.ItemID ?? 0),
                quantity: Number(i?.quantity ?? i?.Quantity ?? 0),
                price: i?.price !== undefined ? Number(i.price) : undefined,
              }))
              setDbItems(mapped)
              setSelectedItems(mapped)
            }
            if (fetchedAttachment) {
              setAttachmentPaths(
                typeof fetchedAttachment === 'string'
                  ? fetchedAttachment
                      .split(/,(?=\/?uploads\/|https?:\/\/)/)
                      .filter(Boolean)
                  : Array.isArray(fetchedAttachment)
                    ? fetchedAttachment
                    : []
              )
            }
          }
        }
      } catch (e) {
        console.error('Failed to load transaction details:', e)
      }
    })()

    return () => {
      mounted = false
    }
  }, [ID, router])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 5MB')
      e.target.value = ''
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    const sanitizedName = file.name.replace(/,/g, '_')
    formData.append('file', file, sanitizedName)

    try {
      const res = await apiFetch('/transaction/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        throw new Error('Upload failed')
      }
      const data = await res.json()
      const uploadedPath =
        data?.data?.attachment_path ||
        data?.data?.file_path ||
        data?.attachment_path ||
        data?.file_path
      if (uploadedPath) {
        setAttachmentPaths((prev) => [...prev, uploadedPath])
      }
    } catch (err) {
      console.error(err)
      alert('Gagal mengunggah file')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const currentBaseAmount = dbAmount !== null ? dbAmount : amount
  const currentBaseItems = dbItems !== null ? dbItems : (items ?? [])

  // Calculate base price (amount of transaction minus the cost of the original items)
  let calculatedBasePrice = currentBaseAmount
  if (currentBaseItems.length > 0 && allItems.length > 0) {
    let originalItemsCost = 0
    for (const item of currentBaseItems) {
      const detail = allItems.find((i) => i.ID === item.item_id)
      if (detail) {
        const itemPrice = item.price !== undefined ? item.price : detail.price
        originalItemsCost += itemPrice * item.quantity
      }
    }
    calculatedBasePrice = Math.max(0, currentBaseAmount - originalItemsCost)
  }

  // Calculate new total amount including the currently selected items
  let newAmount = calculatedBasePrice
  for (const item of selectedItems) {
    const detail = allItems.find((i) => i.ID === item.item_id)
    if (detail) {
      const itemPrice = item.price !== undefined ? item.price : detail.price
      newAmount += itemPrice * item.quantity
    }
  }

  const currentAmount = manualAmount !== null ? manualAmount : newAmount

  const handleAddItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (!val) return

    const itemId = Number(val)
    if (selectedItems.some((i) => i.item_id === itemId)) return

    const detail = allItems.find((i) => i.ID === itemId)
    const price = detail ? detail.price : 0

    setSelectedItems((prev) => [
      ...prev,
      { item_id: itemId, quantity: 1, price },
    ])
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

  const handlePriceChange = (itemId: number, price: number) => {
    if (price < 0) return
    setSelectedItems((prev) =>
      prev.map((item) => (item.item_id === itemId ? { ...item, price } : item))
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
          <div className="w-full">
            <label
              htmlFor="pricing_name"
              className="mb-1 block text-sm text-gray-600"
            >
              Metode Pembayaran
            </label>
            <select
              id="pricing_name"
              defaultValue={normalizePricingNameDefault(pricing_name)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Pilih metode pembayaran
              </option>
              <option value="cash">Cash</option>
              <option value="transfer_or_qris">Transfer atau QRIS</option>
              <option value="debit">Debit</option>
              {pricing_name &&
                !['cash', 'transfer_or_qris', 'debit'].includes(
                  pricing_name.toLowerCase()
                ) && <option value={pricing_name}>{pricing_name}</option>}
            </select>
          </div>
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
              defaultValue={normalizePaymentStatusDefault(payment_status)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Pilih status pembayaran
              </option>
              <option value="paid">Lunas</option>
              <option value="unpaid">Terhutang</option>
              <option value="partial">Parsial</option>
              {payment_status &&
                !['paid', 'unpaid', 'partial'].includes(
                  payment_status.toLowerCase()
                ) && (
                  <option value={payment_status}>
                    {formatPaymentStatus(payment_status)}
                  </option>
                )}
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
              {allItems.map((item) => {
                const isSelected = selectedItems.some(
                  (si) => si.item_id === item.ID
                )
                return (
                  <option key={item.ID} value={item.ID} disabled={isSelected}>
                    {item.name} - Rp. {item.price.toLocaleString('id-ID')}{' '}
                    (Stok: {item.quantity}){isSelected ? ' (Terpilih)' : ''}
                  </option>
                )
              })}
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
                  const defaultPrice = detail ? detail.price : 0
                  const price =
                    selectedItem.price !== undefined
                      ? selectedItem.price
                      : defaultPrice
                  const maxStock = detail ? detail.quantity : 999

                  return (
                    <div
                      key={selectedItem.item_id}
                      className="flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-white p-2 text-sm shadow-sm transition-all hover:shadow"
                    >
                      <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-gray-800">
                          {name}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">
                            Harga: Rp
                          </span>
                          <input
                            id={`price-${selectedItem.item_id}`}
                            type="number"
                            min="0"
                            value={price}
                            onChange={(e) =>
                              handlePriceChange(
                                selectedItem.item_id,
                                Number(e.target.value)
                              )
                            }
                            className="w-24 rounded border border-gray-300 px-2 py-1 text-right text-sm"
                          />
                        </div>
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

          <input
            id="attachment_path"
            name="attachment_path"
            type="hidden"
            value={attachmentPaths.join(',')}
          />

          <div className="mt-2 w-full">
            <label className="text-slate-800 mb-1 block font-sans text-sm font-semibold antialiased dark:text-white">
              Lampiran Transaksi
            </label>
            <div className="space-y-2">
              {attachmentPaths.map((path, index) => (
                <div
                  key={index}
                  className="border-slate-200 dark:bg-slate-900/50 flex items-center justify-between gap-4 rounded-md border bg-white/50 p-2 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="dark:bg-blue-950/40 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:text-blue-400">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </span>
                    <div className="flex flex-col overflow-hidden text-xs">
                      <span className="text-slate-800 dark:text-slate-200 truncate font-semibold">
                        {path.split('/').pop()}
                      </span>
                      <a
                        href={getAttachmentUrl(path)}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Lihat Lampiran
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachmentPaths((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                    className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-1 hover:text-red-500"
                    aria-label={`Hapus lampiran ${index + 1}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}

              <div>
                <label className="border-slate-350 hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-900/80 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed p-3 transition-all">
                  {isUploading ? (
                    <svg
                      className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-slate-500"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  )}
                  <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                    {isUploading
                      ? 'Mengunggah lampiran...'
                      : 'Unggah Lampiran Transaksi (PDF, JPEG, PNG, HEIC maks 5MB)'}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    accept=".pdf,.jpeg,.jpg,.png,.heic,.heif,image/*,application/pdf"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Card>
  )
}
