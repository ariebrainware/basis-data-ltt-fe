import { Card, Input } from '@material-tailwind/react'
import { ItemType } from '../_types/item'

export function ItemForm({ ID, name, price, quantity }: ItemType) {
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
            id="name"
            type="text"
            label="Nama Item"
            defaultValue={name}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            crossOrigin={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          />
          <Input
            id="price"
            type="number"
            label="Harga"
            defaultValue={price}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            crossOrigin={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          />
          <Input
            id="quantity"
            type="number"
            label="Quantity"
            defaultValue={quantity}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            crossOrigin={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          />
        </div>
      </form>
    </Card>
  )
}
