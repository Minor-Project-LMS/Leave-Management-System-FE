/**
 * Environment Configuration
 * Centralized access to environment variables with validation and defaults
 */

// Validate that required environment variables are set
const validateEnv = () => {
  const required = [];
  const missing = [];

  // Add any required environment variables here
  // For now, all variables have defaults, so no strict validation needed
};

// Get environment variable with type safety
const getEnvVar = (key, defaultValue = '') => {
  const value = import.meta.env[key];
  return value !== undefined ? value : defaultValue;
};

// Get boolean environment variable
const getBoolEnvVar = (key, defaultValue = false) => {
  const value = getEnvVar(key, String(defaultValue));
  return value.toLowerCase() === 'true';
};

// Get number environment variable
const getNumberEnvVar = (key, defaultValue = 0) => {
  const value = getEnvVar(key, String(defaultValue));
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
};

// Environment configuration object
export const env = {
  // API Configuration
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', '/api/v1'),
  apiTarget: getEnvVar('VITE_API_TARGET', 'http://localhost:8081'),
  apiTimeout: getNumberEnvVar('VITE_API_TIMEOUT', 30000),
  
  // Feature Flags
  useMockData: getBoolEnvVar('VITE_USE_MOCK_DATA', false),
  
  // Application Configuration
  appName: getEnvVar('VITE_APP_NAME', 'Leave Management System'),
  
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
};

// Validate environment on load
validateEnv();

export default env;