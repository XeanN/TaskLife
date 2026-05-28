/**
 * Centralized error handling for API responses
 * Converts various error formats into standardized error objects
 */

interface ApiError extends Error {
  code?: string;
  statusCode?: number;
  timestamp?: string;
  isRetryable?: boolean;
}

/**
 * Parse API error response into standardized format
 * Handles both structured error responses and plain text
 */
export async function parseApiError(res: Response, existingText?: string): Promise<ApiError> {
  // If the caller already consumed the response body, use the provided text
  // to avoid attempting to read the stream again (which causes "body already read" errors).
  let text = existingText;
  if (typeof text === 'undefined') {
    // Only read body if it hasn't been consumed yet
    try {
      text = await res.text();
    } catch (e) {
      text = '';
    }
  }

  let errorData: any = null;
  let isParsedJson = false;

  try {
    errorData = text ? JSON.parse(text) : {};
    isParsedJson = true;
  } catch (e) {
    errorData = { message: text };
  }

  // Extract error information from response
  const errorCode = errorData?.code || errorData?.error || `HTTP_${res.status}`;
  const message = errorData?.message || errorData?.error || text || `Error ${res.status}`;
  const timestamp = errorData?.timestamp || new Date().toISOString();

  // Determine if error is retryable
  const isRetryable = isRetryableError(res.status, errorCode);

  // Create error object
  const error = new Error(message) as ApiError;
  error.code = errorCode;
  error.statusCode = res.status;
  error.timestamp = timestamp;
  error.isRetryable = isRetryable;

  // Log structured error
  console.error('❌ API Error:', {
    code: error.code,
    status: error.statusCode,
    message: error.message,
    timestamp: error.timestamp,
    retryable: error.isRetryable,
  });

  return error;
}

/**
 * Determine if an error should be retried
 */
function isRetryableError(status: number, code: string): boolean {
  // HTTP status codes that are retryable
  const retryableStatus = [408, 429, 500, 502, 503, 504];
  if (retryableStatus.includes(status)) return true;

  // Error codes that are NOT retryable
  const nonRetryableCodes = [
    'VALIDATION_ERROR',
    'INVALID_INPUT',
    'NOT_FOUND',
    'PERMISSION_DENIED',
    'UNAUTHORIZED',
    'FORBIDDEN',
    'INVALID_TOKEN',
  ];
  
  return !nonRetryableCodes.includes(code);
}

/**
 * Format error message for UI display
 */
export function formatErrorMessage(error: ApiError | Error): string {
  const errorMessages: Record<string, string> = {
    'VALIDATION_ERROR': '⚠️ Datos inválidos. Verifica el formulario.',
    'INVALID_INPUT': '⚠️ Entrada inválida. Revisa los campos.',
    'NOT_FOUND': '❌ No encontrado. Puede haber sido eliminado.',
    'PERMISSION_DENIED': '🔒 No tienes permiso para hacer esto.',
    'UNAUTHORIZED': '🔐 Necesitas iniciar sesión.',
    'FORBIDDEN': '🚫 Acceso denegado.',
    'QUOTA_EXCEEDED': '📊 Límite temporal alcanzado. Intenta en 1 minuto.',
    'NETWORK_ERROR': '🌐 Problema de conexión. Revisa tu Wi-Fi.',
    'TIMEOUT': '⏱️ La solicitud tardó demasiado. Intenta de nuevo.',
    'SERVER_ERROR': '⚠️ Error del servidor. Intenta más tarde.',
  };

  if (error instanceof Error && 'code' in error) {
    const apiError = error as ApiError;
    return errorMessages[apiError.code || ''] || apiError.message || 'Ocurrió un error desconocido.';
  }

  return error?.message || 'Ocurrió un error desconocido.';
}

/**
 * Check if error is quota-related (429)
 */
export function isQuotaError(error: any): boolean {
  return error?.statusCode === 429 || error?.code === 'QUOTA_EXCEEDED';
}

/**
 * Check if error is network-related
 */
export function isNetworkError(error: any): boolean {
  const networkCodes = ['NETWORK_ERROR', 'TIMEOUT', 'ECONNREFUSED', 'ENOTFOUND'];
  return networkCodes.includes(error?.code) || 
         error?.message?.toLowerCase().includes('network') ||
         error?.message?.toLowerCase().includes('failed to fetch');
}
