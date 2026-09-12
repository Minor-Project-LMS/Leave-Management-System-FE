import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HR_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { env } from '../config/env';
import { 
  SettingsIcon, 
  FileTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '../components/icons/Icons';
import './HRSettings.css';

const USE_MOCK = env.useMockData;

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'leave-settings', label: 'Leave Settings' },
  { id: 'approval-workflows', label: 'Approval Workflows' },
  { id: 'roles-permissions', label: 'Roles & Permissions' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'system', label: 'System' },
];

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 
  'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney'
];

const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
const TIME_FORMATS = ['12h', '24h'];
const LANGUAGES = ['en', 'es', 'fr', 'de', 'ja'];

const QUICK_ACTIONS = [
  { id: 'logs', label: 'View Activity Logs', icon: FileTextIcon },
];



const LEAVE_SUMMARY_FIELDS = [
  { key: 'maxLeaveDays', label: 'Maximum Leave Days', icon: ClockIcon },
  { key: 'advanceLeaveDays', label: 'Advance Leave Days', icon: ClockIcon },
  { key: 'cancellationWindowDays', label: 'Cancellation Window', icon: ClockIcon },
  { key: 'minNoticePeriodDays', label: 'Min Notice Period', icon: ClockIcon },
  { key: 'probationAccessEnabled', label: 'Probation Access', type: 'boolean' },
  { key: 'carryForwardEnabled', label: 'Carry Forward', type: 'boolean' },
];

const APPROVAL_WORKFLOW_FIELDS = [
  { key: 'twoStepApprovalEnabled', label: 'Enable Two-Step Approval' },
  { key: 'autoApproveSmallLeaves', label: 'Auto-Approve Small Leaves' },
  { key: 'backdatedLeaveRestricted', label: 'Restrict Backdated Leaves' },
];

const SYSTEM_PREFERENCES = [
  { key: 'employeeSelfRegistration', label: 'Allow Employee Self Registration' },
  { key: 'leaveBalanceDisplayEnabled', label: 'Enable Leave Balance Display' },
  { key: 'weekendSelectionEnabled', label: 'Enable Weekend Selection' },
  { key: 'holidayDisplayEnabled', label: 'Show Holidays in Calendar' },
];

const HRSettings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('hr');

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Company Settings form state
  const [companySettings, setCompanySettings] = useState({
    companyName: '',
    companyEmail: '',
    contactNumber: '',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    language: 'en',
    logoUrl: null,
  });

  // System Preferences state
  const [systemPreferences, setSystemPreferences] = useState({});

  // Leave Settings state
  const [leaveSettings, setLeaveSettings] = useState({});

  // Approval Workflow state
  const [approvalWorkflow, setApprovalWorkflow] = useState({});

  // Notifications state
  const [notifications, setNotifications] = useState({});

  // Security state
  const [security, setSecurity] = useState({});

  // Integrations state
  const [integrations, setIntegrations] = useState({});

  // System Info state
  const [systemInfo, setSystemInfo] = useState({});

  // Dirty state tracking
  const [isDirty, setIsDirty] = useState(false);

  // Logo upload state
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState('');

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      // Mock data for development
      setCompanySettings({
        companyName: 'Acme Corporation',
        companyEmail: 'hr@acme.com',
        contactNumber: '+1-555-0123',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        language: 'en',
        logoUrl: null,
      });
      setSystemPreferences({
        employeeSelfRegistration: false,
        leaveBalanceDisplayEnabled: true,
        weekendSelectionEnabled: true,
        holidayDisplayEnabled: true,
      });
      setLeaveSettings({
        maxLeaveDays: 30,
        advanceLeaveDays: 7,
        cancellationWindowDays: 3,
        minNoticePeriodDays: 2,
        probationAccessEnabled: true,
        carryForwardEnabled: true,
      });

      setApprovalWorkflow({
        twoStepApprovalEnabled: true,
        autoApproveSmallLeaves: false,
        backdatedLeaveRestricted: true,
      });

      setNotifications({
        emailProvider: 'SendGrid',
        smsProvider: 'Twilio',
      });

      setSecurity({
        passwordMinLength: 8,
        ssoGoogleEnabled: false,
        ssoMicrosoftEnabled: false,
      });

      setIntegrations({
        calendarSyncProvider: 'Google',
        ssoProvider: 'Azure AD',
      });
      setSystemInfo({
        version: '1.0.0',
        environment: 'Development',
        databaseVersion: '8.0.32',
        lastUpdatedBy: 'Priya Sharma',
        lastUpdatedAt: '2026-09-10T09:30:00Z',
      });
      setIntegrations([
        { id: 'email', name: 'Email Service', provider: 'SendGrid', status: 'connected' },
        { id: 'sms', name: 'SMS Service', provider: 'Twilio', status: 'not_configured' },
        { id: 'calendar', name: 'Calendar', provider: 'Google', status: 'connected' },
        { id: 'sso', name: 'SSO', provider: 'Azure AD', status: 'not_configured' },
      ]);
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.getSettings();
      const settings = response?.data ?? response ?? {};

      setCompanySettings({
        companyName: settings.general?.companyName || '',
        companyEmail: settings.general?.companyEmail || '',
        contactNumber: settings.general?.contactNumber || '',
        timezone: settings.general?.timezone || 'Asia/Kolkata',
        dateFormat: settings.general?.dateFormat || 'DD/MM/YYYY',
        timeFormat: settings.general?.timeFormat || '24h',
        language: settings.general?.language || 'en',
        logoUrl: settings.general?.logoUrl || null,
      });

      setSystemPreferences({
        employeeSelfRegistration: settings.systemPreferences?.employeeSelfRegistration ?? false,
        leaveBalanceDisplayEnabled: settings.systemPreferences?.leaveBalanceDisplayEnabled ?? true,
        weekendSelectionEnabled: settings.systemPreferences?.weekendSelectionEnabled ?? true,
        holidayDisplayEnabled: settings.systemPreferences?.holidayDisplayEnabled ?? true,
      });

      setLeaveSettings({
        maxLeaveDays: settings.leaveSettings?.maxLeaveDays || 30,
        advanceLeaveDays: settings.leaveSettings?.advanceLeaveDays || 7,
        cancellationWindowDays: settings.leaveSettings?.cancellationWindowDays || 3,
        minNoticePeriodDays: settings.leaveSettings?.minNoticePeriodDays || 2,
        probationAccessEnabled: settings.leaveSettings?.probationAccessEnabled ?? true,
        carryForwardEnabled: settings.leaveSettings?.carryForwardEnabled ?? true,
      });

      setApprovalWorkflow({
        twoStepApprovalEnabled: settings.approvalWorkflow?.twoStepApprovalEnabled ?? true,
        autoApproveSmallLeaves: settings.approvalWorkflow?.autoApproveSmallLeaves ?? false,
        backdatedLeaveRestricted: settings.approvalWorkflow?.backdatedLeaveRestricted ?? true,
      });

      setNotifications({
        emailProvider: settings.notifications?.emailProvider || '',
        smsProvider: settings.notifications?.smsProvider || '',
      });

      setSecurity({
        passwordMinLength: settings.security?.passwordMinLength || 8,
        ssoGoogleEnabled: settings.security?.ssoGoogleEnabled ?? false,
        ssoMicrosoftEnabled: settings.security?.ssoMicrosoftEnabled ?? false,
      });

      setIntegrations({
        calendarSyncProvider: settings.integrations?.calendarSyncProvider || '',
        ssoProvider: settings.integrations?.ssoProvider || '',
      });

      setSystemInfo({
        version: settings.systemInfo?.version || '1.0.0',
        environment: settings.systemInfo?.environment || 'Production',
        databaseVersion: settings.systemInfo?.databaseVersion || '8.0.32',
        lastUpdatedBy: settings.systemInfo?.lastUpdatedBy || 'System',
        lastUpdatedAt: settings.systemInfo?.lastUpdatedAt || new Date().toISOString(),
      });

    } catch (err) {
      setError(err.message || 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleCompanySettingsChange = (field, value) => {
    setCompanySettings(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setSuccess('');
  };

  const handlePreferenceToggle = async (key) => {
    const newValue = !systemPreferences[key];
    setSystemPreferences(prev => ({ ...prev, [key]: newValue }));
    setIsDirty(true);
    setSuccess('');

    try {
      await apiService.updateSettings({
        systemPreferences: {
          [key]: newValue,
        },
      });
      setSuccess(`${key.replace(/([A-Z])/g, ' $1').trim()} updated successfully.`);
    } catch (err) {
      setSystemPreferences(prev => ({ ...prev, [key]: !newValue })); // Revert on error
      setError(err.message || 'Failed to update preference.');
    }
  };

  const handleLeaveSettingsChange = (field, value) => {
    setLeaveSettings(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setSuccess('');
  };

  const handleSaveLeaveSettings = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiService.updateSettings({
        leaveSettings,
      });
      setSuccess('Leave settings saved successfully.');
      setIsDirty(false);
    } catch (err) {
      setError(err.message || 'Failed to save leave settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleApprovalWorkflowChange = (field, value) => {
    setApprovalWorkflow(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setSuccess('');
  };

  const handleSaveApprovalWorkflow = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiService.updateSettings({
        approvalWorkflow,
      });
      setSuccess('Approval workflow settings saved successfully.');
      setIsDirty(false);
    } catch (err) {
      setError(err.message || 'Failed to save approval workflow settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationsChange = (field, value) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setSuccess('');
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiService.updateSettings({
        notifications,
      });
      setSuccess('Notification settings saved successfully.');
      setIsDirty(false);
    } catch (err) {
      setError(err.message || 'Failed to save notification settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSecurityChange = (field, value) => {
    setSecurity(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setSuccess('');
  };

  const handleSaveSecurity = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiService.updateSettings({
        security,
      });
      setSuccess('Security settings saved successfully.');
      setIsDirty(false);
    } catch (err) {
      setError(err.message || 'Failed to save security settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleIntegrationsChange = (field, value) => {
    setIntegrations(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setSuccess('');
  };

  const handleSaveIntegrations = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiService.updateSettings({
        integrations,
      });
      setSuccess('Integration settings saved successfully.');
      setIsDirty(false);
    } catch (err) {
      setError(err.message || 'Failed to save integration settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCompanySettings = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiService.updateSettings({
        general: companySettings,
      });
      setSuccess('Company settings saved successfully.');
      setIsDirty(false);
    } catch (err) {
      setError(err.message || 'Failed to save company settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file) => {
    setLogoError('');
    setLogoUploading(true);

    // Validate file size (2MB max)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setLogoError('File size exceeds 2MB limit.');
      setLogoUploading(false);
      return;
    }

    // Validate file type
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setLogoError('Invalid file type. Please upload JPG, PNG, or SVG.');
      setLogoUploading(false);
      return;
    }

    try {
      // For now, create a local preview URL
      // In production, this would call the logo upload API
      const previewUrl = URL.createObjectURL(file);
      setCompanySettings(prev => ({ ...prev, logoUrl: previewUrl }));
      setIsDirty(true);
      setSuccess('Logo uploaded successfully.');
    } catch (err) {
      setLogoError(err.message || 'Failed to upload logo.');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleQuickAction = (actionId) => {
    if (actionId === 'logs') {
      navigate('/hr/audit-log');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Settings"
      breadcrumbs={[
        { label: 'HR Dashboard', path: '/hr-dashboard' },
        { label: 'Settings', path: '/hr/settings' }
      ]}
      portalLabel={HR_PORTAL.portalLabel}
      navItems={HR_PORTAL.navItems}
      searchPlaceholder={HR_PORTAL.searchPlaceholder}
      user={user}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error}</div>}
      {success && <div className="dashboard-success-banner">{success}</div>}

      {/* Navigation Tabs */}
      <div className="settings-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="settings-content-grid">
        {/* Left Column - Main Settings */}
        <div className="settings-main-column">
          {activeTab === 'general' && (
            <>
              {/* Company Settings */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <h3>Company Settings</h3>
                  <p className="settings-card-subtitle">Configure your organization's basic information</p>
                </div>

                <div className="settings-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Company Name</label>
                      <input
                        type="text"
                        value={companySettings.companyName}
                        onChange={(e) => handleCompanySettingsChange('companyName', e.target.value)}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Company Email</label>
                      <input
                        type="email"
                        value={companySettings.companyEmail}
                        onChange={(e) => handleCompanySettingsChange('companyEmail', e.target.value)}
                        placeholder="hr@company.com"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Number</label>
                      <input
                        type="tel"
                        value={companySettings.contactNumber}
                        onChange={(e) => handleCompanySettingsChange('contactNumber', e.target.value)}
                        placeholder="+1-555-0123"
                      />
                    </div>
                    <div className="form-group">
                      <label>Timezone</label>
                      <select
                        value={companySettings.timezone}
                        onChange={(e) => handleCompanySettingsChange('timezone', e.target.value)}
                      >
                        {TIMEZONES.map(tz => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date Format</label>
                      <select
                        value={companySettings.dateFormat}
                        onChange={(e) => handleCompanySettingsChange('dateFormat', e.target.value)}
                      >
                        {DATE_FORMATS.map(df => (
                          <option key={df} value={df}>{df}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Time Format</label>
                      <select
                        value={companySettings.timeFormat}
                        onChange={(e) => handleCompanySettingsChange('timeFormat', e.target.value)}
                      >
                        {TIME_FORMATS.map(tf => (
                          <option key={tf} value={tf}>{tf}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Language</label>
                      <select
                        value={companySettings.language}
                        onChange={(e) => handleCompanySettingsChange('language', e.target.value)}
                      >
                        {LANGUAGES.map(lang => (
                          <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Company Logo</label>
                      <div className="logo-upload-section">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoUpload(file);
                          }}
                          disabled={logoUploading}
                          id="logo-upload"
                          className="logo-upload-input"
                        />
                        <label htmlFor="logo-upload" className="logo-upload-btn">
                          {logoUploading ? 'Uploading...' : 'Choose File'}
                        </label>
                        <span className="logo-upload-hint">JPG, PNG or SVG, Max size 2MB</span>
                      </div>
                      {logoError && <div className="field-error">{logoError}</div>}
                      {companySettings.logoUrl && (
                        <div className="logo-preview">
                          <img src={companySettings.logoUrl} alt="Company Logo" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="settings-form-actions">
                    <button
                      className="btn-primary"
                      onClick={handleSaveCompanySettings}
                      disabled={saving || !isDirty}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>

              {/* System Preferences */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <h3>System Preferences</h3>
                  <p className="settings-card-subtitle">Configure system-wide behavior and features</p>
                </div>

                <div className="preferences-grid">
                  {SYSTEM_PREFERENCES.map(pref => (
                    <div key={pref.key} className="preference-item">
                      <label className="preference-label">
                        <input
                          type="checkbox"
                          checked={systemPreferences[pref.key]}
                          onChange={() => handlePreferenceToggle(pref.key)}
                          className="preference-toggle"
                        />
                        <span>{pref.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leave Settings Summary */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <h3>Leave Settings Summary</h3>
                  <p className="settings-card-subtitle">Current leave policy configuration</p>
                </div>

                <div className="leave-summary-grid">
                  {LEAVE_SUMMARY_FIELDS.map(field => (
                    <div key={field.key} className="summary-card">
                      <div className="summary-card-icon">
                        {field.icon && <field.icon width={20} height={20} />}
                      </div>
                      <div className="summary-card-content">
                        <div className="summary-card-label">{field.label}</div>
                        <div className="summary-card-value">
                          {field.type === 'boolean' 
                            ? (leaveSettings[field.key] ? 'Enabled' : 'Disabled')
                            : leaveSettings[field.key] || 'N/A'
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'leave-settings' && (
            <>
              <div className="settings-card">
                <div className="settings-card-header">
                  <h3>Leave Settings</h3>
                  <p className="settings-card-subtitle">Configure leave policy parameters</p>
                </div>

                <div className="settings-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Maximum Leave Days</label>
                      <input
                        type="number"
                        value={leaveSettings.maxLeaveDays || ''}
                        onChange={(e) => handleLeaveSettingsChange('maxLeaveDays', parseInt(e.target.value))}
                        placeholder="30"
                      />
                    </div>
                    <div className="form-group">
                      <label>Advance Leave Days</label>
                      <input
                        type="number"
                        value={leaveSettings.advanceLeaveDays || ''}
                        onChange={(e) => handleLeaveSettingsChange('advanceLeaveDays', parseInt(e.target.value))}
                        placeholder="7"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Cancellation Window (Days)</label>
                      <input
                        type="number"
                        value={leaveSettings.cancellationWindowDays || ''}
                        onChange={(e) => handleLeaveSettingsChange('cancellationWindowDays', parseInt(e.target.value))}
                        placeholder="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>Min Notice Period (Days)</label>
                      <input
                        type="number"
                        value={leaveSettings.minNoticePeriodDays || ''}
                        onChange={(e) => handleLeaveSettingsChange('minNoticePeriodDays', parseInt(e.target.value))}
                        placeholder="2"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Probation Access</label>
                      <select
                        value={leaveSettings.probationAccessEnabled ? 'true' : 'false'}
                        onChange={(e) => handleLeaveSettingsChange('probationAccessEnabled', e.target.value === 'true')}
                      >
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Carry Forward</label>
                      <select
                        value={leaveSettings.carryForwardEnabled ? 'true' : 'false'}
                        onChange={(e) => handleLeaveSettingsChange('carryForwardEnabled', e.target.value === 'true')}
                      >
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    </div>
                  </div>

                  <div className="settings-form-actions">
                    <button
                      className="btn-primary"
                      onClick={handleSaveLeaveSettings}
                      disabled={saving || !isDirty}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'approval-workflows' && (
            <>
              <div className="settings-card">
                <div className="settings-card-header">
                  <h3>Approval Workflows</h3>
                  <p className="settings-card-subtitle">Configure approval process settings</p>
                </div>

                <div className="settings-form">
                  <div className="form-group">
                    <label className="preference-label">
                      <input
                        type="checkbox"
                        checked={approvalWorkflow.twoStepApprovalEnabled}
                        onChange={(e) => handleApprovalWorkflowChange('twoStepApprovalEnabled', e.target.checked)}
                        className="preference-toggle"
                      />
                      <span>Enable Two-Step Approval (HR Review after Manager)</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="preference-label">
                      <input
                        type="checkbox"
                        checked={approvalWorkflow.autoApproveSmallLeaves}
                        onChange={(e) => handleApprovalWorkflowChange('autoApproveSmallLeaves', e.target.checked)}
                        className="preference-toggle"
                      />
                      <span>Auto-Approve Small Leaves</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="preference-label">
                      <input
                        type="checkbox"
                        checked={approvalWorkflow.backdatedLeaveRestricted}
                        onChange={(e) => handleApprovalWorkflowChange('backdatedLeaveRestricted', e.target.checked)}
                        className="preference-toggle"
                      />
                      <span>Restrict Backdated Leaves</span>
                    </label>
                  </div>

                  <div className="settings-form-actions">
                    <button
                      className="btn-primary"
                      onClick={handleSaveApprovalWorkflow}
                      disabled={saving || !isDirty}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <>
              <div className="settings-card">
                <div className="settings-card-header">
                  <h3>Notifications</h3>
                  <p className="settings-card-subtitle">Configure notification providers</p>
                </div>

                <div className="settings-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Provider</label>
                      <select
                        value={notifications.emailProvider || ''}
                        onChange={(e) => handleNotificationsChange('emailProvider', e.target.value)}
                      >
                        <option value="">Select Provider</option>
                        <option value="SendGrid">SendGrid</option>
                        <option value="AWS SES">AWS SES</option>
                        <option value="Mailgun">Mailgun</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>SMS Provider</label>
                      <select
                        value={notifications.smsProvider || ''}
                        onChange={(e) => handleNotificationsChange('smsProvider', e.target.value)}
                      >
                        <option value="">Select Provider</option>
                        <option value="Twilio">Twilio</option>
                        <option value="AWS SNS">AWS SNS</option>
                        <option value="Nexmo">Nexmo</option>
                      </select>
                    </div>
                  </div>

                  <div className="settings-form-actions">
                    <button
                      className="btn-primary"
                      onClick={handleSaveNotifications}
                      disabled={saving || !isDirty}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <div className="settings-card">
                <div className="settings-card-header">
                  <h3>Security</h3>
                  <p className="settings-card-subtitle">Configure security settings</p>
                </div>

                <div className="settings-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Password Min Length</label>
                      <input
                        type="number"
                        value={security.passwordMinLength || ''}
                        onChange={(e) => handleSecurityChange('passwordMinLength', parseInt(e.target.value))}
                        placeholder="8"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="preference-label">
                      <input
                        type="checkbox"
                        checked={security.ssoGoogleEnabled}
                        onChange={(e) => handleSecurityChange('ssoGoogleEnabled', e.target.checked)}
                        className="preference-toggle"
                      />
                      <span>Enable Google SSO</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="preference-label">
                      <input
                        type="checkbox"
                        checked={security.ssoMicrosoftEnabled}
                        onChange={(e) => handleSecurityChange('ssoMicrosoftEnabled', e.target.checked)}
                        className="preference-toggle"
                      />
                      <span>Enable Microsoft SSO</span>
                    </label>
                  </div>

                  <div className="settings-form-actions">
                    <button
                      className="btn-primary"
                      onClick={handleSaveSecurity}
                      disabled={saving || !isDirty}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'integrations' && (
            <>
              <div className="settings-card">
                <div className="settings-card-header">
                  <h3>Integrations</h3>
                  <p className="settings-card-subtitle">Configure third-party integrations</p>
                </div>

                <div className="settings-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Calendar Sync Provider</label>
                      <select
                        value={integrations.calendarSyncProvider || ''}
                        onChange={(e) => handleIntegrationsChange('calendarSyncProvider', e.target.value)}
                      >
                        <option value="">Select Provider</option>
                        <option value="Google">Google Calendar</option>
                        <option value="Outlook">Outlook Calendar</option>
                        <option value="Apple">Apple Calendar</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>SSO Provider</label>
                      <select
                        value={integrations.ssoProvider || ''}
                        onChange={(e) => handleIntegrationsChange('ssoProvider', e.target.value)}
                      >
                        <option value="">Select Provider</option>
                        <option value="Azure AD">Azure AD</option>
                        <option value="Okta">Okta</option>
                        <option value="Auth0">Auth0</option>
                      </select>
                    </div>
                  </div>

                  <div className="settings-form-actions">
                    <button
                      className="btn-primary"
                      onClick={handleSaveIntegrations}
                      disabled={saving || !isDirty}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'roles-permissions' && (
            <div className="settings-card">
              <div className="settings-card-header">
                <h3>Roles & Permissions</h3>
                <p className="settings-card-subtitle">This section is under development</p>
              </div>
              <div className="placeholder-content">
                <SettingsIcon width={48} height={48} />
                <p>Roles and permissions management will be implemented in future updates.</p>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <>
              <div className="settings-card">
                <div className="settings-card-header">
                  <h3>System Information</h3>
                  <p className="settings-card-subtitle">Read-only system details</p>
                </div>

                <div className="system-info-list">
                  <div className="info-item">
                    <span className="info-label">System Version</span>
                    <span className="info-value">{systemInfo.version}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Environment</span>
                    <span className="info-value">{systemInfo.environment}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Database Version</span>
                    <span className="info-value">{systemInfo.databaseVersion}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Last Updated</span>
                    <span className="info-value">{formatDate(systemInfo.lastUpdatedAt)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Updated By</span>
                    <span className="info-value">{systemInfo.lastUpdatedBy}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column - Sidebar Widgets */}
        <div className="settings-sidebar-column">
          {/* System Information */}
          {activeTab !== 'system' && (
            <div className="settings-widget">
              <div className="widget-header">
                <h3>System Information</h3>
              </div>
              <div className="system-info-list">
                <div className="info-item">
                  <span className="info-label">System Version</span>
                  <span className="info-value">{systemInfo.version}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Environment</span>
                  <span className="info-value">{systemInfo.environment}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Database Version</span>
                  <span className="info-value">{systemInfo.databaseVersion}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Updated</span>
                  <span className="info-value">{formatDate(systemInfo.lastUpdatedAt)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Updated By</span>
                  <span className="info-value">{systemInfo.lastUpdatedBy}</span>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Status */}
          <div className="settings-widget">
            <div className="widget-header">
              <h3>Integrations Status</h3>
            </div>
            <div className="integrations-list">
              <div className="integration-item">
                <div className="integration-info">
                  <span className="integration-name">Email Service</span>
                  <span className="integration-provider">{notifications.emailProvider || 'Not Configured'}</span>
                </div>
                <div className={`integration-status ${notifications.emailProvider ? 'connected' : 'not_configured'}`}>
                  {notifications.emailProvider ? (
                    <>
                      <CheckCircleIcon width={16} height={16} />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon width={16} height={16} />
                      <span>Not Configured</span>
                    </>
                  )}
                </div>
              </div>
              <div className="integration-item">
                <div className="integration-info">
                  <span className="integration-name">SMS Service</span>
                  <span className="integration-provider">{notifications.smsProvider || 'Not Configured'}</span>
                </div>
                <div className={`integration-status ${notifications.smsProvider ? 'connected' : 'not_configured'}`}>
                  {notifications.smsProvider ? (
                    <>
                      <CheckCircleIcon width={16} height={16} />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon width={16} height={16} />
                      <span>Not Configured</span>
                    </>
                  )}
                </div>
              </div>
              <div className="integration-item">
                <div className="integration-info">
                  <span className="integration-name">Calendar Sync</span>
                  <span className="integration-provider">{integrations.calendarSyncProvider || 'Not Configured'}</span>
                </div>
                <div className={`integration-status ${integrations.calendarSyncProvider ? 'connected' : 'not_configured'}`}>
                  {integrations.calendarSyncProvider ? (
                    <>
                      <CheckCircleIcon width={16} height={16} />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon width={16} height={16} />
                      <span>Not Configured</span>
                    </>
                  )}
                </div>
              </div>
              <div className="integration-item">
                <div className="integration-info">
                  <span className="integration-name">SSO</span>
                  <span className="integration-provider">{integrations.ssoProvider || 'Not Configured'}</span>
                </div>
                <div className={`integration-status ${integrations.ssoProvider ? 'connected' : 'not_configured'}`}>
                  {integrations.ssoProvider ? (
                    <>
                      <CheckCircleIcon width={16} height={16} />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon width={16} height={16} />
                      <span>Not Configured</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button className="manage-integrations-btn" onClick={() => setActiveTab('integrations')}>
              Manage Integrations →
            </button>
          </div>

          {/* Quick Actions */}
          <div className="settings-widget">
            <div className="widget-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="quick-actions-list">
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.id}
                  className="quick-action-item"
                  onClick={() => handleQuickAction(action.id)}
                >
                  <action.icon width={16} height={16} />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note Box */}
          <div className="settings-widget note-widget">
            <div className="note-content">
              <div className="note-icon">⚠️</div>
              <div className="note-text">
                <strong>Important:</strong> Changes to system preferences may affect ongoing leave requests and approval workflows. Review carefully before applying.
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HRSettings;