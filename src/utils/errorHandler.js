export const handleApiError = (error, skipRedirect = false) => {
  if (error.message === 'Server not reachable. Please check your connection.' && !skipRedirect) {
    // Navigate to server error page (only if not skipping redirect)
    window.location.href = '/server-error';
    return;
  }
  
  // For other errors, return the error message
  return error.message || 'An unexpected error occurred';
};

export const isNetworkError = (error) => {
  return error.message === 'Server not reachable. Please check your connection.' ||
         error.name === 'TypeError' ||
         error.message.includes('Failed to fetch');
};

export const isSecurityError = (error) => {
  // Determine if this is a security/token error vs credential error
  // Token errors typically have specific error codes or messages
  const errorCode = error?.response?.data?.error?.code;
  const errorMessage = error?.response?.data?.error?.message || error?.message;
  
  // Security/token related errors
  const securityErrorCodes = ['TOKEN_EXPIRED', 'TOKEN_INVALID', 'UNAUTHORIZED'];
  
  return securityErrorCodes.includes(errorCode) ||
         errorMessage?.toLowerCase().includes('token') ||
         errorMessage?.toLowerCase().includes('expired');
};