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