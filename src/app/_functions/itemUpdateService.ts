import Swal from 'sweetalert2'
import { apiFetch } from './apiFetch'
import { UnauthorizedAccess } from './unauthorized'
import { validateItemForm } from './itemHelpers'

type UnauthorizedRouter = Parameters<typeof UnauthorizedAccess>[0]

interface UpdateItemParams {
  id: number
  name: string
  price: number
  quantity: number
  router: UnauthorizedRouter & { refresh: () => void }
  onDataChange?: () => void
}

export async function updateItem({
  id,
  name,
  price,
  quantity,
  router,
  onDataChange,
}: UpdateItemParams): Promise<void> {
  const validation = validateItemForm(name, String(price), String(quantity))

  if (!validation.ok) {
    await Swal.fire({
      text: validation.message,
      icon: 'warning',
      confirmButtonText: 'OK',
    })
    return
  }

  try {
    const response = await apiFetch(`/item/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(validation.payload),
    })

    if (response.status === 401) {
      UnauthorizedAccess(router)
      return
    }

    if (!response.ok) {
      throw new Error('Failed to update item information')
    }

    const data = await response.json()
    console.log('Item information updated successfully:', data)

    if (onDataChange) onDataChange()
    else router.refresh()

    await Swal.fire({
      text: 'Data item berhasil diperbarui.',
      icon: 'success',
      confirmButtonText: 'OK',
    })
  } catch (error) {
    console.error('Error updating item information:', error)
    await Swal.fire({
      text: 'Gagal memperbarui data item.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}
