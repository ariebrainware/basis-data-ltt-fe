import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from '@material-tailwind/react'
import { ItemForm } from './itemForm'
import { ItemType } from '../_types/item'
import { updateItem } from '@/app/_functions/itemUpdateService'

export type ItemEditDialogProps = ItemType & {
  open: boolean
  setOpen: (v: boolean) => void
  onDataChange?: () => void
}

export default function ItemEditDialog({
  ID,
  name,
  price,
  quantity,
  open,
  setOpen,
  onDataChange: onParentDataChange,
}: ItemEditDialogProps) {
  const router = useRouter()

  const handleConfirm = () => {
    const nameInput =
      document.querySelector<HTMLInputElement>('#name')?.value || name
    const priceInput =
      document.querySelector<HTMLInputElement>('#price')?.value || String(price)
    const quantityInput =
      document.querySelector<HTMLInputElement>('#quantity')?.value ||
      String(quantity)

    void updateItem({
      id: ID,
      name: nameInput,
      price: Number(priceInput),
      quantity: Number(quantityInput),
      router,
      onDataChange: () => {
        setOpen(false)
        if (onParentDataChange) onParentDataChange()
        else router.refresh()
      },
    })
  }

  return (
    <Dialog
      size={'md'}
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
        Ubah Data Item
      </DialogHeader>
      <DialogBody
        className="px-2 md:px-6"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        <ItemForm ID={ID} name={name} price={price} quantity={quantity} />
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
          <span>Konfirmasi</span>
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
