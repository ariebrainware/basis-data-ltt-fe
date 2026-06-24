import React from 'react'
import { ItemType } from '../_types/item'
import ItemRowActions from './itemRowActions'

export default function ItemRow({
  ID,
  name,
  price,
  quantity,
  onDataChange,
}: ItemType & { onDataChange?: () => void }) {
  return (
    <tr className="border-slate-200 border-b last:border-0">
      <td className="p-3">
        <small className="font-sans text-sm text-current antialiased">
          {ID}
        </small>
      </td>
      <td className="p-3">
        <small className="font-sans text-sm font-medium text-current antialiased">
          {name}
        </small>
      </td>
      <td className="p-3">
        <small className="font-sans text-sm text-current antialiased">
          Rp. {Number(price || 0).toLocaleString('id-ID')}
        </small>
      </td>
      <td className="p-3">
        <small className="font-sans text-sm text-current antialiased">
          {Number(quantity || 0).toLocaleString('id-ID')}
        </small>
      </td>
      <td className="p-3">
        <ItemRowActions
          ID={ID}
          name={name}
          price={price}
          quantity={quantity}
          onDataChange={onDataChange}
        />
      </td>
    </tr>
  )
}
