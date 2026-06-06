import { ItemType } from '../_types/item'

export function resetItemFormInputs(): void {
  const nameInput = document.querySelector<HTMLInputElement>('#add_name')
  const priceInput = document.querySelector<HTMLInputElement>('#add_price')
  const quantityInput =
    document.querySelector<HTMLInputElement>('#add_quantity')

  if (nameInput) nameInput.value = ''
  if (priceInput) priceInput.value = ''
  if (quantityInput) quantityInput.value = ''
}

export function readItemFormValues(): {
  name: string
  price: string
  quantity: string
} {
  return {
    name: document.querySelector<HTMLInputElement>('#add_name')?.value || '',
    price: document.querySelector<HTMLInputElement>('#add_price')?.value || '0',
    quantity:
      document.querySelector<HTMLInputElement>('#add_quantity')?.value || '0',
  }
}

export function validateItemForm(
  name: string,
  price: string,
  quantity: string
):
  | { ok: true; payload: { name: string; price: number; quantity: number } }
  | { ok: false; message: string } {
  if (!name.trim()) {
    return {
      ok: false,
      message: 'Nama item tidak boleh kosong.',
    }
  }

  const parsedPrice = Number(price)
  const parsedQuantity = Number(quantity)

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return {
      ok: false,
      message: 'Harga dan quantity harus berupa angka yang valid.',
    }
  }

  if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
    return {
      ok: false,
      message: 'Harga dan quantity harus berupa angka yang valid.',
    }
  }

  return {
    ok: true,
    payload: {
      name: name.trim(),
      price: parsedPrice,
      quantity: parsedQuantity,
    },
  }
}
