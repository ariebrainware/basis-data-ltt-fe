'use client'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../_functions/apiFetch'
import { UnauthorizedAccess } from '../_functions/unauthorized'

export interface DeleteResourceConfig {
  resourceType: 'patient' | 'therapist' | 'treatment' | 'disease'
  resourceId: number
  resourceName: string
}

export function useDeleteResource(config: DeleteResourceConfig) {
  const { resourceType, resourceId } = config
  const router = useRouter()

  const getEndpoint = (): string => `/${resourceType}/${resourceId}`

  const getMessages = () => {
    return {
      patient: {
        confirmTitle: 'Hapus Data Pasien?',
        successText: 'Data pasien berhasil dihapus.',
        errorText: 'Gagal menghapus data pasien',
        consoleError: 'Error deleting patient record:',
      },
      therapist: {
        confirmTitle: 'Hapus Data Terapis?',
        successText: 'Data terapis berhasil dihapus.',
        errorText: 'Gagal menghapus data terapis',
        consoleError: 'Error deleting therapist record:',
      },
      treatment: {
        confirmTitle: 'Hapus Data Penanganan?',
        successText: 'Data penanganan berhasil dihapus.',
        errorText: 'Gagal menghapus data penanganan',
        consoleError: 'Error deleting treatment record:',
      },
      disease: {
        confirmTitle: 'Hapus Data Penyakit?',
        successText: 'Data penyakit berhasil dihapus.',
        errorText: 'Gagal menghapus data penyakit',
        consoleError: 'Error deleting disease record:',
      },
    }[resourceType]
  }

  const handleDelete = async () => {
    const messages = getMessages()

    const result = await Swal.fire({
      title: messages.confirmTitle,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
    })

    if (!result.isConfirmed) return

    try {
      const response = await apiFetch(getEndpoint(), { method: 'DELETE' })
      if (response.status === 401) {
        UnauthorizedAccess(router)
        return
      }
      if (!response.ok) throw new Error('Failed to delete')

      await Swal.fire({ text: messages.successText, icon: 'success' })
      router.refresh()
    } catch (err) {
      console.error(getMessages().consoleError, err)
      if (err instanceof Error && err.message === 'Unauthorized') return
      Swal.fire({ title: 'Error', text: messages.errorText, icon: 'error' })
    }
  }

  return handleDelete
}
