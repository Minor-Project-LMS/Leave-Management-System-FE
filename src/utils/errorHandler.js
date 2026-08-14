export const handleApiError = (error) => {
  if (error.message === 'Server not reachable. Please check your connection.') {
    // Navigate to server error page
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