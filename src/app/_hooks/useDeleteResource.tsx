import Swal from 'sweetalert2'
import { getApiHost } from '../_functions/apiHost'
import { UnauthorizedAccess } from '../_functions/unauthorized'

export interface DeleteResourceConfig {
  resourceType: 'patient' | 'therapist' | 'treatment'
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

  const getEndpoint = (): string => {
    switch (resourceType) {
      case 'patient':
        return `${getApiHost()}/patient/${resourceId}`
      case 'therapist':
        return `${getApiHost()}/therapist/${resourceId}`
      case 'treatment':
        return `${getApiHost()}/treatment/${resourceId}`
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
        fetch(getEndpoint(), {
          method: 'DELETE',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_TOKEN,
            'session-token': localStorage.getItem('session-token') ?? '',
          },
        })
          .then((response) => {
            if (response.status === 401) {
              UnauthorizedAccess()
              return Promise.reject(new Error('Unauthorized'))
            }
            if (!response.ok) throw new Error('Failed to delete')
            Swal.fire({
              text: messages.successText,
              icon: 'success',
              confirmButtonText: 'OK',
            }).then(() => {
              if (typeof window !== 'undefined') window.location.reload()
            })
          })
          .catch((error) => {
            console.error(messages.consoleError, error)
            // Don't show error for unauthorized access since UnauthorizedAccess handles it
            if (error.message !== 'Unauthorized') {
              Swal.fire('Error', messages.errorText, 'error')
            }
          })
      }
    })
  }

  return handleDelete
}
