'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Spinner,
} from '@material-tailwind/react'
import {
  PrinterIcon,
  PencilSquareIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { TransactionType } from '../_types/transaction'
import { InvoiceData, InvoiceLineItem } from '../_types/invoice'
import {
  buildInitialInvoiceData,
  calculateInvoiceTotals,
  formatRupiah,
  printInvoiceDocument,
} from '../_functions/invoiceHelpers'

import { apiFetch } from '../_functions/apiFetch'
import { extractItemList } from '../_functions/itemDataHelpers'
import { ItemType } from '../_types/item'

interface InvoiceDialogProps {
  open: boolean
  onClose: () => void
  transaction: TransactionType
}

export default function InvoiceDialog({
  open,
  onClose,
  transaction,
}: InvoiceDialogProps) {
  const [invoice, setInvoice] = useState<InvoiceData>(() =>
    buildInitialInvoiceData({ transaction })
  )
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [allItems, setAllItems] = useState<ItemType[]>([])

  // Store fetched initial reference for reset
  const initialDataRef = useRef<InvoiceData | null>(null)

  useEffect(() => {
    if (!open) return

    let isMounted = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)

    // Set initial fallback immediately
    const fallback = buildInitialInvoiceData({ transaction, allItems })

    setInvoice(fallback)
    initialDataRef.current = fallback

    ;(async () => {
      try {
        // 1. Fetch item catalog if not yet loaded
        let itemsList = allItems
        if (itemsList.length === 0) {
          try {
            const itemRes = await apiFetch('/item?limit=1000', {
              method: 'GET',
            })
            if (itemRes.ok) {
              const itemData = await itemRes.json()
              itemsList = extractItemList(itemData)
              if (isMounted) setAllItems(itemsList)
            }
          } catch (e) {
            console.error('Failed to load item list for invoice:', e)
          }
        }

        // 2. Fetch full transaction details to ensure item list and therapist are complete
        let fullTrans: Partial<TransactionType> = { ...transaction }
        try {
          const transRes = await apiFetch(`/transaction/${transaction.ID}`, {
            method: 'GET',
          })
          if (transRes.ok) {
            const transData = await transRes.json()
            if (transData?.data) {
              fullTrans = {
                ...fullTrans,
                ...transData.data,
                amount: Number(transData.data.amount ?? fullTrans.amount),
                items: Array.isArray(transData.data.items)
                  ? transData.data.items.map((i: any) => ({
                      item_id: Number(i.item_id ?? i.ItemID ?? 0),
                      quantity: Number(i.quantity ?? i.Quantity ?? 1),
                      price:
                        i.price !== undefined ? Number(i.price) : undefined,
                    }))
                  : fullTrans.items,
              }
            }
          }
        } catch (e) {
          console.error('Failed to load transaction details for invoice:', e)
        }

        // 3. Try to fetch patient phone number if patient name exists
        let patientPhone = ''
        if (transaction.patient_name) {
          try {
            const patientRes = await apiFetch(
              `/patient?keyword=${encodeURIComponent(transaction.patient_name.trim())}`,
              { method: 'GET' }
            )
            if (patientRes.ok) {
              const pData = await patientRes.json()
              const patients = Array.isArray(pData?.data?.patients)
                ? pData.data.patients
                : Array.isArray(pData?.data)
                  ? pData.data
                  : []
              const found = patients.find(
                (p: any) =>
                  p.full_name?.toLowerCase() ===
                  transaction.patient_name.toLowerCase()
              )
              if (found) {
                if (
                  Array.isArray(found.phone_number) &&
                  found.phone_number.length > 0
                ) {
                  patientPhone = found.phone_number.join(' / ')
                } else if (typeof found.phone_number === 'string') {
                  patientPhone = found.phone_number
                }
              }
            }
          } catch (e) {
            console.error('Failed to load patient phone for invoice:', e)
          }
        }

        if (isMounted) {
          const enriched = buildInitialInvoiceData({
            transaction: fullTrans,
            allItems: itemsList,
            patientPhone,
            therapistName: fullTrans.therapist_name,
          })
          setInvoice(enriched)
          initialDataRef.current = enriched
        }
      } catch (err) {
        console.error('Error preparing invoice data:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    })()

    return () => {
      isMounted = false
    }
  }, [open, transaction.ID])

  const handlePrint = () => {
    printInvoiceDocument(invoice)
  }

  const handleReset = () => {
    if (initialDataRef.current) {
      setInvoice({ ...initialDataRef.current })
    } else {
      setInvoice(buildInitialInvoiceData({ transaction, allItems }))
    }
  }

  const handleItemChange = (
    index: number,
    field: keyof InvoiceLineItem,
    value: string | number
  ) => {
    setInvoice((prev) => {
      const newItems = [...prev.items]
      const current = { ...newItems[index] }

      if (field === 'description') {
        current.description = String(value)
      } else if (field === 'quantity') {
        current.quantity = Math.max(1, Number(value) || 1)
        current.total = current.quantity * current.unitPrice
      } else if (field === 'unitPrice') {
        current.unitPrice = Math.max(0, Number(value) || 0)
        current.total = current.quantity * current.unitPrice
      }

      newItems[index] = current
      const { subtotal, total } = calculateInvoiceTotals(
        newItems,
        prev.discount
      )

      return {
        ...prev,
        items: newItems,
        subtotal,
        total,
      }
    })
  }

  const handleAddItem = () => {
    setInvoice((prev) => {
      const newItem: InvoiceLineItem = {
        id: `custom-item-${Date.now()}`,
        description: 'Item Baru',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      }
      const newItems = [...prev.items, newItem]
      const { subtotal, total } = calculateInvoiceTotals(
        newItems,
        prev.discount
      )
      return {
        ...prev,
        items: newItems,
        subtotal,
        total,
      }
    })
  }

  const handleRemoveItem = (index: number) => {
    setInvoice((prev) => {
      const newItems = prev.items.filter((_, i) => i !== index)
      const { subtotal, total } = calculateInvoiceTotals(
        newItems,
        prev.discount
      )
      return {
        ...prev,
        items: newItems,
        subtotal,
        total,
      }
    })
  }

  const handleDiscountChange = (val: number) => {
    const validDiscount = Math.max(0, val || 0)
    setInvoice((prev) => {
      const { subtotal, total } = calculateInvoiceTotals(
        prev.items,
        validDiscount
      )
      return {
        ...prev,
        discount: validDiscount,
        subtotal,
        total,
      }
    })
  }

  // Calculate buffer rows to match Excel template (at least 8 rows for visual consistency)
  const minRows = 8
  const emptyRowsCount = Math.max(0, minRows - invoice.items.length)

  return (
    <Dialog
      size="xl"
      open={open}
      handler={onClose}
      className="bg-slate-100 dark:bg-slate-900 max-h-[95vh] overflow-y-auto p-0 shadow-2xl"
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
      onResize={undefined}
      onResizeCapture={undefined}
    >
      {/* Non-printable Modal Header */}
      <DialogHeader
        className="no-print border-slate-200 dark:border-slate-800 dark:bg-slate-900 sticky top-0 z-20 flex flex-wrap items-center justify-between border-b bg-white px-6 py-4"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-lg p-2">
            <PrinterIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-slate-800 text-lg font-bold dark:text-white">
              Invoice #{invoice.invoiceNumber}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              {isEditing
                ? 'Mode Edit: Ubah data invoice sebelum dicetak'
                : 'Pratinjau Cetak: Sesuai template Excel Lee Tit Tar'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={isEditing ? 'gradient' : 'outlined'}
            color={isEditing ? 'amber' : 'blue-gray'}
            onClick={() => setIsEditing((prev) => !prev)}
            className="flex items-center gap-1.5 normal-case"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            {isEditing ? (
              <>
                <EyeIcon className="h-4 w-4" />
                <span>Lihat Pratinjau</span>
              </>
            ) : (
              <>
                <PencilSquareIcon className="h-4 w-4" />
                <span>Ubah Data (Edit)</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="text"
            color="blue-gray"
            onClick={handleReset}
            className="flex items-center gap-1 normal-case"
            title="Kembalikan ke data transaksi awal"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Reset</span>
          </Button>

          <Button
            size="sm"
            variant="gradient"
            color="green"
            onClick={handlePrint}
            className="flex items-center gap-1.5 normal-case shadow-md"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <PrinterIcon className="h-4 w-4" />
            <span>Cetak Invoice</span>
          </Button>

          <button
            onClick={onClose}
            className="text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-lg p-1.5"
            aria-label="Tutup dialog invoice"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </DialogHeader>

      <DialogBody
        className="px-4 py-6 md:px-8"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        {isLoading && (
          <div className="no-print dark:bg-blue-950/30 mb-4 flex items-center justify-center gap-2 rounded-lg bg-blue-50 p-3 text-sm font-medium text-blue-700 dark:text-blue-300">
            <Spinner
              className="h-4 w-4"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            />
            <span>Memuat rincian transaksi dan data pasien...</span>
          </div>
        )}

        {/* Printable Invoice Container */}
        <div
          id="printable-invoice-container"
          className="border-slate-300 mx-auto max-w-4xl rounded-lg border bg-white p-6 shadow-sm md:p-10"
          style={{ fontFamily: "'Poppins', 'Arial', sans-serif" }}
        >
          {/* Header Banner - Row 1 to 4 from invoice-template.xlsx */}
          <div className="flex flex-col justify-between gap-4 border-b-4 border-[#B7B7B7] bg-[#F3F3F3] p-5 md:flex-row md:items-center">
            {/* Company Name */}
            <div>
              {isEditing ? (
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Nama Perusahaan / Klinik
                  </label>
                  <input
                    type="text"
                    value={invoice.companyName}
                    onChange={(e) =>
                      setInvoice((prev) => ({
                        ...prev,
                        companyName: e.target.value,
                      }))
                    }
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-2xl font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <h1 className="text-3xl font-extrabold tracking-wide text-gray-900 md:text-4xl">
                  {invoice.companyName}
                </h1>
              )}
            </div>

            {/* Company Contact Info */}
            <div className="text-right text-xs text-[#666666] md:text-sm">
              {isEditing ? (
                <div className="flex flex-col gap-1 text-left md:text-right">
                  <input
                    type="text"
                    value={invoice.companyPhone}
                    placeholder="No. Telepon"
                    onChange={(e) =>
                      setInvoice((prev) => ({
                        ...prev,
                        companyPhone: e.target.value,
                      }))
                    }
                    className="rounded border border-gray-300 bg-white px-2 py-0.5 text-right text-xs font-bold text-gray-800"
                  />
                  <input
                    type="text"
                    value={invoice.companyEmail}
                    placeholder="Email"
                    onChange={(e) =>
                      setInvoice((prev) => ({
                        ...prev,
                        companyEmail: e.target.value,
                      }))
                    }
                    className="rounded border border-gray-300 bg-white px-2 py-0.5 text-right text-xs text-gray-700"
                  />
                  <input
                    type="text"
                    value={invoice.companyAddress}
                    placeholder="Alamat"
                    onChange={(e) =>
                      setInvoice((prev) => ({
                        ...prev,
                        companyAddress: e.target.value,
                      }))
                    }
                    className="rounded border border-gray-300 bg-white px-2 py-0.5 text-right text-xs text-gray-700"
                  />
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="font-bold text-gray-800">
                    {invoice.companyPhone}
                  </p>
                  <p>{invoice.companyEmail}</p>
                  <p>{invoice.companyAddress}</p>
                </div>
              )}
            </div>
          </div>

          {/* Title - Row 5 */}
          <div className="py-4 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[#666666] md:text-3xl">
              Invoice
            </h2>
          </div>

          {/* Customer & Order Information Box - Row 6 to 8 */}
          <div className="mb-6 rounded border border-[#B7B7B7] bg-white p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Left Column: Kepada / Patient */}
              <div className="space-y-1">
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Kepada:
                </span>
                {isEditing ? (
                  <div className="space-y-1.5">
                    <div>
                      <label className="text-[10px] text-gray-500">
                        Nama Pasien
                      </label>
                      <input
                        type="text"
                        value={invoice.patientName}
                        onChange={(e) =>
                          setInvoice((prev) => ({
                            ...prev,
                            patientName: e.target.value,
                          }))
                        }
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm font-bold text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">
                        No. HP Pasien
                      </label>
                      <input
                        type="text"
                        value={invoice.patientPhone}
                        placeholder="Contoh: 0812-XXXX-XXXX"
                        onChange={(e) =>
                          setInvoice((prev) => ({
                            ...prev,
                            patientPhone: e.target.value,
                          }))
                        }
                        className="w-full rounded border border-gray-300 px-2 py-1 text-xs text-gray-800"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-base font-bold text-gray-900">
                      {invoice.patientName || '-'}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {invoice.patientPhone || '-'}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Invoice # & Tanggal */}
              <div className="space-y-2 md:text-right">
                {isEditing ? (
                  <div className="space-y-1.5 md:ml-auto md:w-3/4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-600">Invoice #:</span>
                      <input
                        type="text"
                        value={invoice.invoiceNumber}
                        onChange={(e) =>
                          setInvoice((prev) => ({
                            ...prev,
                            invoiceNumber: e.target.value,
                          }))
                        }
                        className="w-36 rounded border border-gray-300 px-2 py-1 text-right text-xs font-bold text-gray-900"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-600">
                        Tanggal Pesanan:
                      </span>
                      <input
                        type="text"
                        value={invoice.orderDate}
                        onChange={(e) =>
                          setInvoice((prev) => ({
                            ...prev,
                            orderDate: e.target.value,
                          }))
                        }
                        className="w-36 rounded border border-gray-300 px-2 py-1 text-right text-xs font-bold text-gray-900"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="inline-block text-left md:text-right">
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-gray-600">Invoice #</span>
                      <span className="font-bold text-gray-900">
                        : {invoice.invoiceNumber}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between gap-4 text-sm">
                      <span className="text-gray-600">Tanggal Pesanan</span>
                      <span className="font-bold text-gray-900">
                        : {invoice.orderDate}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table - Row 10 to 20 */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-300 bg-white text-xs font-bold uppercase tracking-wider text-[#999999]">
                  <th className="w-12 px-3 py-2.5 text-center">No</th>
                  <th className="px-4 py-2.5">Deskripsi Barang</th>
                  <th className="w-20 px-3 py-2.5 text-center">Jumlah</th>
                  <th className="w-32 px-3 py-2.5 text-right">Harga Satuan</th>
                  <th className="w-32 px-3 py-2.5 text-right">Total</th>
                  {isEditing && (
                    <th className="no-print w-10 px-2 py-2.5 text-center">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => {
                  const isOdd = (index + 1) % 2 !== 0
                  const rowBg = isOdd ? 'bg-[#F3F3F3]' : 'bg-white'

                  return (
                    <tr
                      key={item.id || index}
                      className={`${rowBg} transition-colors hover:bg-blue-50/50`}
                    >
                      <td className="px-3 py-2 text-center text-xs font-medium text-gray-600">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 text-gray-800">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'description',
                                e.target.value
                              )
                            }
                            className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900"
                          />
                        ) : (
                          <span className="font-medium">
                            {item.description}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-800">
                        {isEditing ? (
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'quantity',
                                Number(e.target.value)
                              )
                            }
                            className="w-16 rounded border border-gray-300 bg-white px-1 py-1 text-center text-xs"
                          />
                        ) : (
                          item.quantity
                        )}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-800">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'unitPrice',
                                Number(e.target.value)
                              )
                            }
                            className="w-28 rounded border border-gray-300 bg-white px-2 py-1 text-right text-xs"
                          />
                        ) : (
                          formatRupiah(item.unitPrice)
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">
                        {formatRupiah(item.total)}
                      </td>
                      {isEditing && (
                        <td className="no-print px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700"
                            aria-label={`Hapus baris ${index + 1}`}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })}

                {/* Empty Buffer Rows (to mirror the 10 rows grid in invoice-template.xlsx) */}
                {!isEditing &&
                  Array.from({ length: emptyRowsCount }).map((_, idx) => {
                    const rowNumber = invoice.items.length + idx + 1
                    const isOdd = rowNumber % 2 !== 0
                    const rowBg = isOdd ? 'bg-[#F3F3F3]' : 'bg-white'

                    return (
                      <tr key={`empty-${rowNumber}`} className={rowBg}>
                        <td className="px-3 py-2 text-center text-xs text-gray-400">
                          {rowNumber}
                        </td>
                        <td className="px-4 py-2">&nbsp;</td>
                        <td className="px-3 py-2 text-center">&nbsp;</td>
                        <td className="px-3 py-2 text-right">&nbsp;</td>
                        <td className="px-3 py-2 text-right">&nbsp;</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>

            {isEditing && (
              <div className="no-print mt-3 flex justify-start">
                <Button
                  size="sm"
                  variant="outlined"
                  color="blue"
                  onClick={handleAddItem}
                  className="flex items-center gap-1.5 normal-case"
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  onResize={undefined}
                  onResizeCapture={undefined}
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Tambah Baris Item</span>
                </Button>
              </div>
            )}
          </div>

          {/* Bottom Calculation Summary - Row 22 to 24 */}
          <div className="mb-8 flex flex-col items-end">
            <div className="w-full max-w-xs space-y-1.5 text-sm">
              {/* Subtotal */}
              <div className="flex items-center justify-between border-b border-t border-[#D9D9D9] py-1.5">
                <span className="text-gray-700">Subtotal :</span>
                <span className="font-bold text-gray-900">
                  {formatRupiah(invoice.subtotal)}
                </span>
              </div>

              {/* Diskon */}
              <div className="flex items-center justify-between border-b border-[#D9D9D9] py-1.5">
                <span className="text-gray-700">Diskon :</span>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    value={invoice.discount}
                    onChange={(e) =>
                      handleDiscountChange(Number(e.target.value))
                    }
                    className="w-28 rounded border border-gray-300 px-2 py-0.5 text-right text-xs font-bold text-gray-900"
                  />
                ) : (
                  <span className="font-bold text-gray-900">
                    {formatRupiah(invoice.discount)}
                  </span>
                )}
              </div>

              {/* Total (Styled highlight matching template fill `#B7B7B7` & orange bottom accent) */}
              <div className="flex items-center justify-between border-b-2 border-[#FF6D01] bg-[#B7B7B7] px-3 py-2 font-bold text-white shadow-sm">
                <span className="text-sm uppercase tracking-wider">
                  Total :
                </span>
                <span className="text-base">{formatRupiah(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer - Best Regards - Row 26 to 27 */}
          <div className="mt-10 flex justify-end text-right">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Best Regards,</p>
              {isEditing ? (
                <input
                  type="text"
                  value={invoice.bestRegards}
                  onChange={(e) =>
                    setInvoice((prev) => ({
                      ...prev,
                      bestRegards: e.target.value,
                    }))
                  }
                  className="rounded border border-gray-300 px-2 py-1 text-right text-sm font-bold text-gray-900"
                />
              ) : (
                <p className="text-base font-extrabold text-gray-900">
                  {invoice.bestRegards}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogBody>

      {/* Non-printable Modal Footer */}
      <DialogFooter
        className="no-print border-slate-200 dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between border-t bg-white px-6 py-4"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        <span className="text-slate-500 text-xs">
          Template: invoice-template.xlsx (Lee Tit Tar)
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="text"
            color="red"
            onClick={onClose}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            Tutup
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={handlePrint}
            className="flex items-center gap-2 shadow-md"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <PrinterIcon className="h-4 w-4" />
            <span>Cetak / Simpan PDF</span>
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}
