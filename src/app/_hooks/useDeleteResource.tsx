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

/**
 * Custom hook for deleting resources with confirmation dialog
 * @param config Configuration object containing resource type, ID, and display name
 * @returns Function to trigger the delete operation
 *
 * @example
 * ```typescript
 * const handleDelete = useDeleteResource({
 *   resourceType: 'patient',
 *   resourceId: 123,
 *   resourceName: 'Data Pasien'
 * })
 *
 * // Then call it from a button:
 * <button onClick={handleDelete}>Delete</button>
 * ```
 */
export function useDeleteResource(config: DeleteResourceConfig) {
  const { resourceType, resourceId } = config
  const router = useRouter()

  const getEndpoint = (): string => {
    switch (resourceType) {
      case 'patient':
        return `${getApiHost()}/patient/${resourceId}`
      case 'therapist':
        return `${getApiHost()}/therapist/${resourceId}`
      case 'treatment':
        return `${getApiHost()}/treatment/${resourceId}`
      case 'disease':
        return `${getApiHost()}/disease/${resourceId}`
      default:
        throw new Error(`Unsupported resource type: ${resourceType}`)
    }
  }

  const getMessages = () => {
    const messages = {
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
    }
    return messages[resourceType]
  }

  const handleDelete = () => {
    const messages = getMessages()

    Swal.fire({
      title: messages.confirmTitle,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
      apetch(getEndpoint(), { method: 'DELETE' })
      .then((response) => {
            response.status === 401) {
            UnthorizedAccess(router)
           retrn Promise.reject(new Error('Unauthorized'))
          }
           i!response.ok) throw new Error('Failed to delete')
         Swa.fire({
            te: messages.successText,
             i: 'success',
            coirmButtonText: 'OK',
        }).then(() => {
              er.refresh()
          })
      })
          ch((error) => {
           cole.error(messages.consoleError, error)
         // on't show error for unauthorized access since UnauthorizedAccess handles it
          iferror.message !== 'Unauthorized') {
             S.fire('Error', messages.errorText, 'error')
         }
      })
      }
    })
  }

  return handleDelete
}
