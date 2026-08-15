import { handleApiError, isSecurityError } from '../utils/errorHandler';
import api, { rawApi } from '../api/axios';

class ApiService {
  // Generic request via axios api (will include Authorization header if access token set)
  async request(endpoint, options = {}) {
    try {
      const method = (options.method || 'GET').toLowerCase();
      const config = {
        url: endpoint,
        method,
        params: options.params,
        data: options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined,
      };
      const resp = await api.request(config);
      return resp.data;
    } catch (error) {
      // Security errors are handled by axios interceptors, but we still check here
      if (isSecurityError(error)) {
        // Let the error propagate - it will be handled by the auth context
        throw error;
      }
      handleApiError(error);
      throw error;
    }
  }

  // Auth endpoints: use rawApi so refresh logic doesn't intercept these calls
  async login(email, password) {
    try {
      const resp = await rawApi.post('/auth/login', { email, password });
      return resp.data;
    } catch (error) {
      if (isSecurityError(error)) {
        throw error; // Let auth context handle security errors
      }
      handleApiError(error);
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      const resp = await rawApi.post('/auth/forgot-password', { email });
      return resp.data;
    } catch (error) {
      if (isSecurityError(error)) {
        throw error; // Let components handle security errors
      }
      handleApiError(error);
      throw error;
    }
  }

  async resetPassword(email, otp, newPassword) {
    try {
      const resp = await rawApi.post('/auth/reset-password', { email, otp, newPassword });
      return resp.data;
    } catch (error) {
      if (isSecurityError(error)) {
        throw error; // Let components handle security errors
      }
      handleApiError(error);
      throw error;
    }
  }

  async refreshToken() {
    try {
      const resp = await rawApi.post('/auth/refresh');
      return resp.data;
    } catch (error) {
      if (isSecurityError(error)) {
        throw error; // Let auth context handle security errors
      }
      handleApiError(error);
      throw error;
    }
  }

  async logout() {
    try {
      const resp = await rawApi.post('/auth/logout');
      return resp.data;
    } catch (error) {
      if (isSecurityError(error)) {
        throw error; // Let auth context handle security errors
      }
      handleApiError(error);
      throw error;
    }
  }
}

export const apiService = new ApiService();