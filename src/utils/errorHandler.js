export const getApiErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred';

  if (typeof error === 'string') return error;

  const payload = error.response?.data;

  if (payload) {
    if (typeof payload === 'string') return payload;
    if (payload.message) return payload.message;
    if (payload.error) return payload.error;
    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      return payload.errors[0].message || payload.errors[0] || 'Request failed';
    }
  }

  if (error.message && error.message !== 'Request failed with status code 401' && 
      error.message !== 'Request failed with status code 403') {
    return error.message;
  }

  if (error.response?.status) {
    const statusMessages = {
      400: 'Invalid request. Please check your input.',
      401: 'Invalid credentials. Please check your email and password.',
      403: 'Access denied. You do not have permission to perform this action.',
      404: 'Resource not found. The requested resource does not exist.',
      419: 'Session expired. Please login again.',
      422: 'Validation error. Please check your input.',
      429: 'Too many requests. Please wait and try again later.',
      500: 'Server error. Please try again later.',
      502: 'Server unavailable. The service is temporarily down. Please try again later.',
      503: 'Service unavailable. The server is temporarily unable to handle your request.',
      504: 'Gateway timeout. The server took too long to respond. Please try again.',
    };
    return statusMessages[error.response.status] || `Request failed with status code ${error.response.status}`;
  }

  return 'An unexpected error occurred';
};

export const handleApiError = (error) => {
  const message = getApiErrorMessage(error);

  if (error?.message === 'Server not reachable. Please check your connection.') {
    window.location.href = '/server-error';
    return message;
  }

  // Handle security-related errors that should force logout
  if (isSecurityError(error)) {
    return message;
  }

  return message;
};

// Detect security-related errors that should force logout
export const isSecurityError = (error) => {
  const payload = error.response?.data;
  const status = error.response?.status;
  
  // Check for specific security error messages that indicate token/session issues
  const securityErrorMessages = [
    'session validation failed',
    'token mismatch detected',
    'invalid token',
    'token expired',
    'session expired',
    'unauthorized access',
    'access token expired',
    'refresh token expired'
  ];
  
  // These are credential errors (wrong password, etc.) - should NOT force logout
  const credentialErrorMessages = [
    'invalid credentials',
    'wrong password',
    'incorrect password',
    'invalid email or password',
    'email or password is incorrect',
    'user not found',
    'invalid email',
    'invalid username'
  ];
  
  const errorMessage = (payload?.message || payload?.error || '').toLowerCase();
  const hasSecurityMessage = securityErrorMessages.some(msg => errorMessage.includes(msg));
  const hasCredentialMessage = credentialErrorMessages.some(msg => errorMessage.includes(msg));
  
  // If it's a credential error, don't treat as security error
  if (hasCredentialMessage) {
    return false;
  }
  
  // Security-related status codes (only for token/session issues, not credential issues)
  // 401 is only treated as security error if it has a security message, not for credential errors
  const securityStatusCodes = [403, 419];
  
  // For 401, only treat as security error if it has a security message
  if (status === 401) {
    return hasSecurityMessage;
  }
  
  return hasSecurityMessage || securityStatusCodes.includes(status);
};

export const isNetworkError = (error) => {
  const msg = getApiErrorMessage(error);
  return error?.message === 'Server not reachable. Please check your connection.' ||
    error?.name === 'TypeError' ||
    error?.code === 'ERR_NETWORK' ||
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'ETIMEDOUT' ||
    msg.includes('Failed to fetch') ||
    msg.includes('Network Error') ||
    msg.includes('ERR_NETWORK') ||
    !error.response && error.message; // No response means network error
};