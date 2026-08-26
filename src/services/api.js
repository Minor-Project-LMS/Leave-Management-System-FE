import { handleApiError } from '../utils/errorHandler';
import { env } from '../config/env';

const API_BASE_URL = env.apiBaseUrl;
const API_TIMEOUT = env.apiTimeout;

// The access token lives ONLY in memory (this module-level variable) — never
// in localStorage/sessionStorage. It's gone the moment the tab is closed or
// the page is fully reloaded, which is the point: it's not readable from
// DevTools > Application > Storage, and an XSS payload can't exfiltrate it
// from disk. On page load, AuthContext calls refreshToken() once to silently
// re-derive a new access token from the httpOnly refresh-token cookie.
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

class ApiService {
  async request(endpoint, options = {}, { skipAuthRetry = false } = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const defaultOptions = {
      // Omit Content-Type for FormData bodies — the browser must set its own
      // multipart boundary (e.g. "multipart/form-data; boundary=..."); setting
      // application/json here would break file uploads like uploadLeaveAttachment().
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      // Always send the httpOnly refresh-token cookie automatically. This is
      // what lets /auth/refresh and /auth/logout work without the frontend
      // ever touching the refresh token directly.
      credentials: 'include',
      // Add timeout using AbortController
      signal: AbortSignal.timeout(API_TIMEOUT),
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: { ...defaultOptions.headers, ...options.headers },
      // Merge signal if provided in options, otherwise use default
      signal: options.signal || defaultOptions.signal,
    };

    try {
      const response = await fetch(url, config);

      const contentType = response.headers.get('content-type') || '';
      let data;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { message: text } : { message: response.statusText || 'Request failed' };
      }

      if (!response.ok) {
        // Access token expired mid-session: try one silent refresh (via the
        // httpOnly cookie) and replay the original request exactly once.
        if (response.status === 401 && !skipAuthRetry && endpoint !== '/auth/refresh') {
          const refreshed = await this.tryRefresh();
          if (refreshed) {
            return this.request(endpoint, {
              ...options,
              headers: { ...options.headers, ...this.authHeaders() },
            }, { skipAuthRetry: true });
          }
        }

        const errorMessage = data?.message || data?.error || data?.detail || 'API request failed';
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        const networkError = new Error('Server not reachable. Please check your connection.');
        handleApiError(networkError);
        throw networkError;
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const token = data?.accessToken || data?.token || data?.data?.accessToken || data?.data?.token;
    if (token) setAccessToken(token);
    return data;
  }

  async getCurrentUser() {
    return this.request('/users/me', {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(email, otp, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });
  }

  // No refreshToken argument: the httpOnly cookie is sent automatically by
  // the browser (credentials: 'include'), so the frontend never reads or
  // passes the refresh token itself. The backend's /auth/refresh response
  // already includes the user profile, so no separate "get current user"
  // call is needed.
  async refreshToken() {
    const data = await this.request('/auth/refresh', { method: 'POST' }, { skipAuthRetry: true });
    const token = data?.accessToken || data?.token || data?.data?.accessToken || data?.data?.token;
    const profile = data?.user || data?.data?.user || data?.profile || data?.data?.profile;
    if (token) setAccessToken(token);
    return { ...data, profile };
  }

  // Attempts a silent refresh; returns true/false instead of throwing, for
  // use as an internal retry helper.
  async tryRefresh() {
    try {
      await this.refreshToken();
      return true;
    } catch {
      setAccessToken(null);
      return false;
    }
  }

  async logout() {
    try {
      return await this.request('/auth/logout', { method: 'POST',headers: this.authHeaders(), });
    } finally {
      setAccessToken(null);
    }
  }

  // Attaches the in-memory JWT as a Bearer token, per the auth convention
  // (Authorization header on every call except /auth/login and /auth/refresh).
  authHeaders() {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }

  // Dashboard endpoints (/api/... — no version segment, matches backend routing)
  async getDashboardSummary() {
    return this.request('/dashboard/summary', {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getLeaveTrend(year = new Date().getFullYear()) {
    return this.request(`/dashboard/leave-trend?year=${year}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getLeaveDistribution(year = new Date().getFullYear()) {
    return this.request(`/dashboard/leave-distribution?year=${year}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getRecentRequests(limit = 5) {
    return this.request(`/leave-requests?limit=${limit}&sort=recent`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getUpcomingHolidays(month, year) {
    const params = new URLSearchParams();
    if (month != null) params.set('month', month);
    if (year != null) params.set('year', year);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/holidays/upcoming${qs}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getRecentActivity(limit = 5) {
    return this.request(`/audit-log/recent?limit=${limit}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  // Manager dashboard endpoints (/api/manager/...)
  async getManagerSummary() {
    return this.request('/manager/dashboard/summary', {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getTeamLeaveTrend(months = 6) {
    return this.request(`/manager/dashboard/leave-trend?months=${months}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getTeamLeaveDistribution() {
    return this.request('/manager/dashboard/leave-distribution', {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getPendingApprovals(limit = 5) {
    return this.request(`/manager/approvals/pending?limit=${limit}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getTeamLeaveOverview() {
    return this.request('/manager/team/leave-overview', {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getUpcomingTeamLeaves(limit = 5) {
    return this.request(`/manager/team/upcoming-leaves?limit=${limit}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  // HR dashboard endpoints — paths confirmed against lms-openapi.yaml.
  // getHRSummary() only covers totalEmployees/activeEmployees/onLeaveToday/
  // inactiveEmployees per the spec (marked "x-assumption: true" there); it
  // does NOT include pendingRequests or a leave-utilization %, so those are
  // pulled from /reports/summary (pendingRequests, approvalRate) alongside it.
  async getHRSummary() {
    return this.request('/dashboard/hr-summary', {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getReportsSummary(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/reports/summary${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getHRLeaveTrend(year = new Date().getFullYear()) {
    return this.request(`/reports/leave-trend?year=${year}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getDepartmentSummary(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/reports/department-summary${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  // NOTE: reusing the manager preview endpoint for the HR "Pending Approvals"
  // widget — the spec doesn't define an HR-scoped equivalent, and the shape
  // (PendingApprovalPreview) matches what this widget needs. Confirm with
  // backend that HR_ADMIN is authorized here (may currently be manager-only).
  async getHRPendingApprovals(limit = 5) {
    return this.request(`/manager/approvals/pending?limit=${limit}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async exportReport(payload) {
    return this.request('/reports/export', {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(payload),
    });
  }

  async getReportExportStatus(jobId) {
    return this.request(`/reports/export/${jobId}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  // Approval Inbox (MGR-02) — GET /approvals/inbox returns per-tab counts
  // alongside the current page's data in one call.
  async getApprovalInbox({ status = 'PENDING', page = 1, limit = 5, sort = 'newest' } = {}) {
    const qs = new URLSearchParams({ status, page, limit, sort }).toString();
    return this.request(`/approvals/inbox?${qs}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  // Returns LeaveRequestDetail — includes attachments[] and approvals[]
  // inline, so the detail panel needs only this one call.
  async getLeaveRequestDetail(requestId) {
    return this.request(`/leave-requests/${requestId}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  // decision: 'APPROVED' | 'REJECTED'; comments required when REJECTED.
  async decideLeaveRequest(requestId, decision, comments) {
    return this.request(`/leave-requests/${requestId}/decisions`, {
      method: 'PATCH',
      headers: this.authHeaders(),
      body: JSON.stringify({ decision, comments }),
    });
  }

  // Apply Leave (EMP-02) endpoints
  async getLeaveCategories(status = 'ACTIVE') {
    return this.request(`/leave-categories?status=${status}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getLeavePolicies(categoryId) {
    const qs = categoryId != null ? `?categoryId=${categoryId}&status=ACTIVE` : '';
    return this.request(`/leave-policies${qs}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getLeaveLedger(year = new Date().getFullYear()) {
    return this.request(`/leave-ledger?year=${year}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  // payload: { categoryId, startDate, endDate, sessionType, reason, status? }
  // status: 'DRAFT' saves without submitting; omit/'PENDING_L1' submits (spec convention).
  async submitLeaveRequest(payload) {
    return this.request('/leave-requests', {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(payload),
    });
  }

  // Per spec: attachments are uploaded against an existing request id
  // (multipart/form-data), so this is called after submitLeaveRequest()
  // resolves with the new request's id.
  async uploadLeaveAttachment(requestId, file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request(`/leave-requests/${requestId}/attachments`, {
      method: 'POST',
      headers: this.authHeaders(), // no Content-Type — browser sets the multipart boundary
      body: formData,
    });
  }
}

export const apiService = new ApiService();
