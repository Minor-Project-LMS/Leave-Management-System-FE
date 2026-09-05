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
  async request(endpoint, options = {}, { skipAuthRetry = false, skipErrorRedirect = false } = {}) {
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
        // Some failure modes (a servlet-container error page, an API
        // gateway timeout page, etc.) return a full HTML document with a
        // text/plain or missing content-type. Never surface that raw
        // markup as a user-facing message — fall back to the HTTP status
        // text instead.
        const looksLikeHtml = contentType.includes('text/html') || /^\s*<(!doctype|html)/i.test(text || '');
        data =
          !text || looksLikeHtml
            ? { message: response.statusText || `Request failed (${response.status})` }
            : { message: text };
      }

      if (!response.ok) {
        // Access token expired mid-session: try one silent refresh (via the
        // httpOnly cookie) and replay the original request exactly once.
        if (response.status === 401 && !skipAuthRetry && endpoint !== '/auth/refresh') {
          const refreshed = await this.tryRefresh();
          if (refreshed) {
            return this.request(
              endpoint,
              {
                ...options,
                headers: { ...options.headers, ...this.authHeaders() },
              },
              { skipAuthRetry: true }
            );
          }
        }

        // Safely extract string message from standard or nested error response shapes
        const rawMsg = data?.error?.message || data?.message || data?.error || data?.detail;
        const errorMessage =
          typeof rawMsg === 'object'
            ? rawMsg?.message || JSON.stringify(rawMsg)
            : rawMsg || 'API request failed';

        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        const networkError = new Error('Server not reachable. Please check your connection.');
        handleApiError(networkError, skipErrorRedirect);
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

  // EMP-09 Profile — Personal Information / Emergency Contact "Edit" cards.
  // Only the self-editable subset (UserProfileUpdate) is sent.
  async updateProfile(payload) {
    return this.request('/users/me', {
      method: 'PATCH',
      headers: this.authHeaders(),
      body: JSON.stringify(payload),
    });
  }

  // EMP-09 "Change Password" form.
  async changeMyPassword(currentPassword, newPassword) {
    return this.request('/users/me/password', {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // EMP-09 "Change Photo" action.
  async uploadMyAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/users/me/avatar', {
      method: 'POST',
      headers: this.authHeaders(),
      body: formData,
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
    const data = await this.request('/auth/refresh', { method: 'POST' }, { skipAuthRetry: true, skipErrorRedirect: true });
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
      return await this.request('/auth/logout', {
        method: 'POST',
        headers: this.authHeaders(),
      });
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

  async getHolidays(params = {}) {
    const { year, month, departmentId, type, page = 1, limit = 50 } = params;
    const queryParams = new URLSearchParams({ page, limit });
    if (year != null) queryParams.set('year', year);
    if (month != null) queryParams.set('month', month);
    if (departmentId != null) queryParams.set('departmentId', departmentId);
    if (type != null) queryParams.set('type', type);
    const qs = queryParams.toString();
    return this.request(`/holidays${qs ? `?${qs}` : ''}`, {
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

  // Team Calendar (MGR-04) + Team Members (MGR-05) — paths confirmed
  // against lms-openapi.yaml (/team/members, /team/calendar, /team/leave-summary).
  async getTeamMembers({ departmentId, q, page = 1, limit = 8 } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (departmentId) params.set('departmentId', departmentId);
    if (q) params.set('q', q);
    return this.request(`/team/members?${params.toString()}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getTeamCalendar({ month, year, departmentId, categoryId, showWeekends = false }) {
    const params = new URLSearchParams({ month, year, showWeekends });
    if (departmentId) params.set('departmentId', departmentId);
    if (categoryId) params.set('categoryId', categoryId);
    return this.request(`/team/calendar?${params.toString()}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getTeamLeaveSummary({ year = new Date().getFullYear(), month } = {}) {
    const params = new URLSearchParams({ year });
    if (month) params.set('month', month);
    return this.request(`/team/leave-summary?${params.toString()}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  // Used by department filter dropdowns (Team Calendar, Team Members).
  async getDepartments({ page = 1, limit = 50 } = {}) {
    const params = new URLSearchParams({ page, limit });
    return this.request(`/departments?${params.toString()}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  // Employee Management (HR-01) — paths/schema confirmed against lms-openapi.yaml.
  async getEmployees({ q, departmentId, designation, status, page = 1, limit = 8 } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (q) params.set('q', q);
    if (departmentId) params.set('departmentId', departmentId);
    if (designation) params.set('designation', designation);
    if (status) params.set('status', status);
    return this.request(`/employees?${params.toString()}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async createEmployee(payload) {
    return this.request('/employees', {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(payload),
    });
  }

  async updateEmployee(employeeId, payload) {
    return this.request(`/employees/${employeeId}`, {
      method: 'PATCH',
      headers: this.authHeaders(),
      body: JSON.stringify(payload),
    });
  }

  async deactivateEmployee(employeeId) {
    return this.request(`/employees/${employeeId}`, {
      method: 'DELETE',
      headers: this.authHeaders(),
    });
  }

  async assignEmployeeQuota(employeeId, payload) {
    return this.request(`/employees/${employeeId}/quota`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(payload),
    });
  }

  // Leave Policies (HR-02) — paths/schema confirmed against lms-openapi.yaml.
  async getLeavePolicies({ status, categoryId, departmentId, page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.set('status', status);
    if (categoryId) params.set('categoryId', categoryId);
    if (departmentId) params.set('departmentId', departmentId);
    return this.request(`/leave-policies?${params.toString()}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async createLeavePolicy(payload) {
    return this.request('/leave-policies', {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(payload),
    });
  }

  async updateLeavePolicy(policyId, payload) {
    return this.request(`/leave-policies/${policyId}`, {
      method: 'PATCH',
      headers: this.authHeaders(),
      body: JSON.stringify(payload),
    });
  }

  async getLeavePolicyHistory(policyId) {
    return this.request(`/leave-policies/${policyId}/history`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  // Delegations (MGR-06) — paths/schema confirmed against lms-openapi.yaml.
  // "Delegate To" candidates — HR admins only (mirrors the same HR routing
  // the backend uses when a leave request escalates to PENDING_L2), not
  // the manager's own team. See GET /delegations/eligible-delegates.
  async getEligibleDelegates() {
    return this.request('/delegations/eligible-delegates', {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getDelegations({ status, page = 1, limit = 50 } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.set('status', status);
    return this.request(`/delegations?${params.toString()}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async createDelegation(payload) {
    return this.request('/delegations', {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(payload),
    });
  }

  async updateDelegation(delegationId, payload) {
    return this.request(`/delegations/${delegationId}`, {
      method: 'PATCH',
      headers: this.authHeaders(),
      body: JSON.stringify(payload),
    });
  }

  async revokeDelegation(delegationId) {
    return this.request(`/delegations/${delegationId}/revoke`, {
      method: 'POST',
      headers: this.authHeaders(),
    });
  }

  // HR dashboard endpoints — paths confirmed against lms-openapi.yaml.
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

  // NOTE: renamed from getLeavePolicies(categoryId) — it was a duplicate of
  // the HR-02 getLeavePolicies({...}) method above. Two methods with the
  // same name in one class silently collide (the second definition wins),
  // so every HR-02 caller was actually invoking THIS one, passing its whole
  // options object as `categoryId`. That produced a query string containing
  // the literal text "[object Object]", which the backend's servlet
  // container rejected with a raw HTML 400 page before reaching any
  // controller logic. If you update this file directly, also update the
  // one call site in ApplyLeave.jsx (~line 246):
  //   .getLeavePolicies(categoryId)  →  .getLeavePolicyForCategory(categoryId)
  async getLeavePolicyForCategory(categoryId) {
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

  async getLeaveLedgerTransactions(params = {}) {
    const { year, userId, categoryId, page = 1, limit = 10 } = params;
    const queryParams = new URLSearchParams({ page, limit });
    if (year) queryParams.set('year', year);
    if (userId) queryParams.set('userId', userId);
    if (categoryId) queryParams.set('categoryId', categoryId);
    const qs = queryParams.toString();
    return this.request(`/leave-ledger/transactions${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async exportLeaveLedger(params = {}) {
    const { year = new Date().getFullYear(), format = 'csv' } = params;
    const qs = new URLSearchParams({ year, format }).toString();
    return this.request(`/leave-ledger/export?${qs}`, {
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

  // New direct-to-blob-storage upload flow
  async requestAttachmentUploadUrl(fileName, contentType, sizeBytes, entityType, entityId = null) {
    const payload = {
      fileName,
      contentType,
      sizeBytes,
      entityType,
    };
    if (entityId !== null) {
      payload.entityId = entityId;
    }
    return this.request('/attachments/upload-url', {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(payload),
    });
  }

  async confirmAttachmentUpload(attachmentId, entityId = null) {
    const payload = entityId !== null ? { entityId } : {};
    return this.request(`/attachments/${attachmentId}/confirm`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(payload),
    });
  }

  // My Requests (EMP-03) endpoints
  async getLeaveRequests(params = {}) {
    const { status, categoryId, userId, fromDate, toDate, page = 1, limit = 10, sort = 'recent' } = params;
    const queryParams = new URLSearchParams({ page, limit, sort });
    if (status) queryParams.set('status', status);
    if (categoryId) queryParams.set('categoryId', categoryId);
    if (userId) queryParams.set('userId', userId);
    if (fromDate) queryParams.set('fromDate', fromDate);
    if (toDate) queryParams.set('toDate', toDate);
    const qs = queryParams.toString();
    return this.request(`/leave-requests${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  // Request Details (EMP-04) endpoints
  async withdrawLeaveRequest(requestId, payload = {}) {
    return this.request(`/leave-requests/${requestId}/withdraw`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(payload),
    });
  }

  async addLeaveComment(requestId, payload) {
    return this.request(`/leave-requests/${requestId}/comments`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(payload),
    });
  }

  async getLeaveComments(requestId) {
    return this.request(`/leave-requests/${requestId}/comments`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getLeaveAttachments(requestId) {
    return this.request(`/leave-requests/${requestId}/attachments`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getLeaveApprovals(requestId) {
    return this.request(`/leave-requests/${requestId}/approvals`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async downloadRequestPDF(requestId) {
    return this.request(`/leave-requests/${requestId}/pdf`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  // Comp-Off (EMP-06) endpoints
  async getCompOffRequests(params = {}) {
    const { status, userId, page = 1, limit = 10 } = params;
    const queryParams = new URLSearchParams({ page, limit });
    if (status) queryParams.set('status', status);
    if (userId) queryParams.set('userId', userId);
    const qs = queryParams.toString();
    return this.request(`/comp-off-requests${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getCompOffRequest(compId) {
    return this.request(`/comp-off-requests/${compId}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async submitCompOffRequest(payload) {
    return this.request('/comp-off-requests', {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(payload),
    });
  }

  async withdrawCompOffRequest(compId) {
    return this.request(`/comp-off-requests/${compId}`, {
      method: 'DELETE',
      headers: this.authHeaders(),
    });
  }

  async decideCompOffRequest(compId, decision, comments) {
    return this.request(`/comp-off-requests/${compId}/decisions`, {
      method: 'PATCH',
      headers: this.authHeaders(),
      body: JSON.stringify({ decision, comments }),
    });
  }

  async getCompOffSummary() {
    // This endpoint might not exist in the spec yet, but we'll add it for the dashboard
    // For now, we'll derive it from the comp-off requests data
    return this.request('/dashboard/summary', {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async getNotifications({ tab = 'all', page = 1, limit = 10 } = {}) {
    const qs = new URLSearchParams({ tab, page, limit }).toString();
    return this.request(`/notifications?${qs}`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: this.authHeaders(),
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'POST',
      headers: this.authHeaders(),
    });
  }

  async getNotificationPreferences() {
    return this.request('/notifications/preferences', {
      method: 'GET',
      headers: this.authHeaders(),
    });
  }

  async updateNotificationPreferences(preferences) {
    return this.request('/notifications/preferences', {
      method: 'PATCH',
      headers: this.authHeaders(),
      body: JSON.stringify(preferences),
    });
  }
}

export const apiService = new ApiService();