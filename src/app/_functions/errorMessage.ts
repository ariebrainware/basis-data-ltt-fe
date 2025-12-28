/**
 * Interface for API error responses
 */
export interface ApiErrorResponse {
  message?: string
  error?: string
  errors?: string | string[]
}

/**
 * Extracts a user-friendly error message from an API error response
 * @param apiResponse - The error response object from the API
 * @param defaultMessage - The default message to show if no error message is found (default: 'An error occurred')
 * @returns A formatted error message string
 * @example
 * ```typescript
 * const errorMessage = extractErrorMessage(responseData, 'Registrasi gagal')
 * ```
 */
export function extractErrorMessage(
  apiResponse: ApiErrorResponse | null | undefined,
  defaultMessage = 'An error occurred'
): string {
  // Check if apiResponse is valid
  if (!apiResponse || typeof apiResponse !== 'object') {
    return defaultMessage
  }

  // Check for message property
  if (
    typeof apiResponse.message === 'string' &&
    apiResponse.message.trim() !== ''
  ) {
    return apiResponse.message
  }

  // Check for error property
  if (
    typeof apiResponse.error === 'string' &&
    apiResponse.error.trim() !== ''
  ) {
    return apiResponse.error
  }

  // Check for errors as array
  if (Array.isArray(apiResponse.errors)) {
    const errorArray = (apiResponse.errors as string[])
      .map((err) => (typeof err === 'string' ? err.trim() : ''))
      .filter((err) => err !== '')
    if (errorArray.length > 0) {
      return errorArray.join(', ')
    }
  }

  // Check for errors as string
  if (
    typeof apiResponse.errors === 'string' &&
    apiResponse.errors.trim() !== ''
  ) {
    return apiResponse.errors
  }

  // Return default message if no error message found
  return defaultMessage
}
