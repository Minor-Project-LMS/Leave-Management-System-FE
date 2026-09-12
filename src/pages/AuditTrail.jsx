import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import AuditTrailTable from '../components/audit/AuditTrailTable';
import ActivitySummaryWidget from '../components/audit/ActivitySummaryWidget';
import TopActionsWidget from '../components/audit/TopActionsWidget';
import AuditInfoWidget from '../components/audit/AuditInfoWidget';
import DiffViewerModal from '../components/audit/DiffViewerModal';
import { HistoryIcon, DownloadIcon, FilterIcon } from '../components/icons/Icons';
// import { api } from '../api/axios';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HR_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { env } from '../config/env';
import './AuditTrail.css';

const USE_MOCK = env.useMockData;

// Mock data for development
const mockAuditEntries = [
  {
    id: 1,
    entityType: 'LEAVE_REQUEST',
    entityId: 123,
    action: 'CREATE',
    performedBy: 1,
    performedByName: 'John Doe',
    employeeCode: 'EMP001',
    description: 'Leave request created for Sick Leave',
    module: 'Leave Requests',
    status: 'SUCCESS',
    ipAddress: '192.168.1.100',
    performedAt: '2024-05-23T10:30:00Z',
  },
  {
    id: 2,
    entityType: 'LEAVE_REQUEST',
    entityId: 123,
    action: 'APPROVE',
    performedBy: 2,
    performedByName: 'Jane Smith',
    employeeCode: 'EMP002',
    description: 'Leave request approved',
    module: 'Leave Requests',
    status: 'SUCCESS',
    ipAddress: '192.168.1.101',
    performedAt: '2024-05-23T11:45:00Z',
  },
  {
    id: 3,
    entityType: 'LEAVE_LEDGER',
    entityId: 456,
    action: 'UPDATE',
    performedBy: 3,
    performedByName: 'Bob Johnson',
    employeeCode: 'EMP003',
    description: 'Leave balance updated',
    module: 'Leave Ledger',
    status: 'SUCCESS',
    ipAddress: '192.168.1.102',
    performedAt: '2024-05-23T14:20:00Z',
  },
  {
    id: 4,
    entityType: 'DELEGATION',
    entityId: 789,
    action: 'CREATE',
    performedBy: 1,
    performedByName: 'John Doe',
    employeeCode: 'EMP001',
    description: 'Delegation created for vacation period',
    module: 'Delegations',
    status: 'SUCCESS',
    ipAddress: '192.168.1.100',
    performedAt: '2024-05-22T09:15:00Z',
  },
  {
    id: 5,
    entityType: 'LEAVE_REQUEST',
    entityId: 124,
    action: 'REJECT',
    performedBy: 2,
    performedByName: 'Jane Smith',
    employeeCode: 'EMP002',
    description: 'Leave request rejected - insufficient balance',
    module: 'Leave Requests',
    status: 'SUCCESS',
    ipAddress: '192.168.1.101',
    performedAt: '2024-05-22T16:30:00Z',
  },
];

const mockActivitySummary = {
  totalActivities: 1248,
  successful: 1186,
  failed: 42,
  uniqueUsers: 63,
};

const mockTopActions = [
  { action: 'CREATE', count: 450, percentage: 36 },
  { action: 'UPDATE', count: 320, percentage: 26 },
  { action: 'APPROVE', count: 180, percentage: 14 },
  { action: 'LOGIN', count: 150, percentage: 12 },
  { action: 'DELETE', count: 80, percentage: 6 },
  { action: 'OTHER', count: 68, percentage: 6 },
];

const mockAuditInfo = {
  retentionPeriod: 355,
  logIntegrity: true,
  lastBackup: '2024-05-23T23:30:00Z',
  nextBackup: '2024-05-24T23:30:00Z',
};

const AuditTrail = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('hr');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  
  // Filters
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState('');
  
  // Data
  const [auditEntries, setAuditEntries] = useState([]);
  const [activitySummary, setActivitySummary] = useState(null);
  const [topActions, setTopActions] = useState([]);
  const [auditInfo, setAuditInfo] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Diff modal
  const [diffModalOpen, setDiffModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loadingDiff, setLoadingDiff] = useState(false);
  
  // Date preset buttons
  const [activePreset, setActivePreset] = useState('');
  
  const ACTION_OPTIONS = [
    { value: '', label: 'All Actions' },
    { value: 'CREATE', label: 'Create' },
    { value: 'UPDATE', label: 'Update' },
    { value: 'APPROVE', label: 'Approve' },
    { value: 'REJECT', label: 'Reject' },
    { value: 'CANCEL', label: 'Cancel' },
    { value: 'DELEGATE', label: 'Delegate' },
    { value: 'DELETE', label: 'Delete' },
  ];
  
  const ENTITY_TYPE_OPTIONS = [
    { value: '', label: 'All Modules' },
    { value: 'LEAVE_REQUEST', label: 'Leave Requests' },
    { value: 'LEAVE_LEDGER', label: 'Leave Ledger' },
    { value: 'DELEGATION', label: 'Delegations' },
    { value: 'COMP_OFF_REQUEST', label: 'Comp-Off Requests' },
    { value: 'HOLIDAY_CALENDAR', label: 'Holiday Calendar' },
    { value: 'LEAVE_CATEGORY', label: 'Leave Categories' },
    { value: 'LEAVE_POLICY', label: 'Leave Policies' },
    { value: 'USER', label: 'Users' },
    { value: 'DEPARTMENT', label: 'Departments' },
  ];
  
  const loadAuditData = useCallback(async () => {
  setLoading(true);
  setError('');

  if (USE_MOCK) {
    setAuditEntries(mockAuditEntries);
    setActivitySummary(mockActivitySummary);
    setTopActions(mockTopActions);
    setAuditInfo(mockAuditInfo);
    setTotalCount(mockAuditEntries.length);
    setTotalPages(Math.ceil(mockAuditEntries.length / pageSize));
    setLoading(false);
    return;
  }

  try {
    const params = {
      page,
      limit: pageSize,
    };

    if (dateRange.from) params.dateFrom = dateRange.from;
    if (dateRange.to) params.dateTo = dateRange.to;
    if (selectedAction) params.action = selectedAction;
    if (selectedEntityType) params.entityType = selectedEntityType;
    if (searchQuery) params.q = searchQuery;
    if (userId) params.userId = userId;

    const response = await apiService.getAuditLogs(params);
    const data = response?.data || response?.items || response || [];

    setAuditEntries(data);
    setTotalCount(response?.totalCount || response?.totalElements || data.length || 0);
    setTotalPages(response?.totalPages || Math.ceil((response?.totalCount || data.length) / pageSize));

    setActivitySummary(mockActivitySummary);
    setTopActions(mockTopActions);
    setAuditInfo(mockAuditInfo);
  } catch (err) {
    console.error('API Error:', err);
    if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
      setError('Authentication required. Please log in to access audit trail data.');
    } else {
      setError(err.message || 'Failed to load audit trail data.');
    }
  } finally {
    setLoading(false);
  }
}, [page, pageSize, dateRange, selectedAction, selectedEntityType, searchQuery, userId]);
  
  useEffect(() => {
    loadAuditData();
  }, [loadAuditData]);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const handleDatePreset = (preset) => {
    setActivePreset(preset);
    const now = new Date();
    let from = null;
    
    switch (preset) {
      case 'today':
        from = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'last7days':
        from = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'last30days':
        from = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'custom':
        // Don't set automatic date for custom
        setActivePreset('');
        return;
      default:
        break;
    }
    
    if (from) {
      setDateRange({
        from: from.toISOString(),
        to: new Date().toISOString(),
      });
    }
  };
  
  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
    setActivePreset('');
  };
  
  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    
    if (USE_MOCK) {
      setTimeout(() => setExporting(false), 1500);
      return;
    }
    
    try {
      const params = {
        format: 'csv',
      };
      
      if (dateRange.from) params.dateFrom = dateRange.from;
      if (dateRange.to) params.dateTo = dateRange.to;
      
      console.log('Making export API call to /audit-log/export with params:', params);
      const response = await api.get('/audit-log/export', { 
        params,
        responseType: 'blob',
      });
      console.log('Export API response:', response);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-trail-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export API Error:', err);
      console.error('Export Error response:', err.response);
      setError(err.message || 'Failed to export audit logs.');
    } finally {
      setExporting(false);
    }
  };
  
  const handleViewDiff = async (entry) => {
  setSelectedEntry(entry);
  setDiffModalOpen(true);
  setLoadingDiff(true);

  if (USE_MOCK) {
    setLoadingDiff(false);
    return;
  }

  try {
    const detailData = await apiService.getAuditLogDetail(entry.id || entry.auditId);
    setSelectedEntry({ ...entry, ...(detailData?.data || detailData) });
  } catch (err) {
    console.error('Detail API Error:', err);
    setError(err.message || 'Failed to load audit entry details.');
  } finally {
    setLoadingDiff(false);
  }
};
  
  const handleApplyFilters = () => {
    setPage(1);
    loadAuditData();
  };
  
  const handleResetFilters = () => {
    setDateRange({ from: null, to: null });
    setSelectedAction('');
    setSelectedEntityType('');
    setSearchQuery('');
    setUserId('');
    setActivePreset('');
    setPage(1);
  };
  
  if (loading && !auditEntries.length) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading audit trail...</p>
      </div>
    );
  }
  
  return (
    <DashboardLayout
      title="Audit Trail"
      subtitle="Track and monitor all system activities and changes"
      breadcrumbs={[
        { label: 'HR Dashboard', path: '/hr/dashboard' },
        { label: 'Audit Trail' }
      ]}
      portalLabel={HR_PORTAL.portalLabel}
      navItems={HR_PORTAL.navItems}
      searchPlaceholder={HR_PORTAL.searchPlaceholder}
      badgeCounts={{}}
      user={user}
      notificationCount={0}
      onLogout={handleLogout}
    >
      {USE_MOCK && (
        <div className="dashboard-info-banner">
          <strong>Development Mode:</strong> Using mock data. Set VITE_USE_MOCK_DATA=false to connect to real backend.
        </div>
      )}
      
      {error && <div className="dashboard-error-banner">{error}</div>}
      
      <div className="audit-trail-container">
        {/* Main Content Area */}
        <div className="audit-trail-main">
          {/* Header with Filters */}
          <div className="audit-header">
            <div className="audit-header-title">
              <HistoryIcon width={24} height={24} />
              <div>
                <h1>Audit Trail</h1>
                <p className="audit-header-subtitle">Monitor all system activities and changes</p>
              </div>
            </div>
            
            <div className="audit-header-actions">
              <button 
                className="audit-export-btn"
                onClick={handleExport}
                disabled={exporting}
              >
                <DownloadIcon width={16} height={16} />
                {exporting ? 'Exporting...' : 'Export Logs'}
              </button>
            </div>
          </div>
          
          {/* Filter Bar */}
          <div className="audit-filter-bar">
            <div className="audit-filter-group">
              <label>Date Range</label>
              <div className="audit-date-presets">
                <button 
                  className={`audit-preset-btn ${activePreset === 'today' ? 'active' : ''}`}
                  onClick={() => handleDatePreset('today')}
                >
                  Today
                </button>
                <button 
                  className={`audit-preset-btn ${activePreset === 'last7days' ? 'active' : ''}`}
                  onClick={() => handleDatePreset('last7days')}
                >
                  Last 7 Days
                </button>
                <button 
                  className={`audit-preset-btn ${activePreset === 'last30days' ? 'active' : ''}`}
                  onClick={() => handleDatePreset('last30days')}
                >
                  Last 30 Days
                </button>
              </div>
              <div className="audit-date-inputs">
                <input
                  type="datetime-local"
                  className="audit-date-input"
                  value={dateRange.from || ''}
                  onChange={(e) => handleDateRangeChange('from', e.target.value)}
                />
                <span className="audit-date-separator">to</span>
                <input
                  type="datetime-local"
                  className="audit-date-input"
                  value={dateRange.to || ''}
                  onChange={(e) => handleDateRangeChange('to', e.target.value)}
                />
              </div>
            </div>
            
            <div className="audit-filter-group">
              <label>Action</label>
              <select
                className="audit-select"
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
              >
                {ACTION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="audit-filter-group">
              <label>Module</label>
              <select
                className="audit-select"
                value={selectedEntityType}
                onChange={(e) => setSelectedEntityType(e.target.value)}
              >
                {ENTITY_TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="audit-filter-group audit-search-group">
              <label>Search</label>
              <input
                type="text"
                className="audit-search-input"
                placeholder="Search by employee code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="audit-filter-actions">
              <button 
                className="audit-filter-btn audit-apply-btn"
                onClick={handleApplyFilters}
              >
                <FilterIcon width={16} height={16} />
                Apply Filters
              </button>
              <button 
                className="audit-filter-btn audit-reset-btn"
                onClick={handleResetFilters}
              >
                Reset
              </button>
            </div>
          </div>
          
          {/* Audit Trail Table */}
          <div className="audit-table-section">
            <AuditTrailTable
              entries={auditEntries}
              loading={loading}
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              onViewDiff={handleViewDiff}
            />
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="audit-sidebar">
          <ActivitySummaryWidget 
            data={activitySummary} 
            loading={loading}
          />
          <TopActionsWidget 
            data={topActions} 
            loading={loading}
          />
          <AuditInfoWidget 
            data={auditInfo} 
            loading={loading}
          />
        </div>
      </div>
      
      {/* Diff Viewer Modal */}
      {diffModalOpen && (
        <DiffViewerModal
          isOpen={diffModalOpen}
          onClose={() => setDiffModalOpen(false)}
          entry={selectedEntry}
          loading={loadingDiff}
        />
      )}
    </DashboardLayout>
  );
};

export default AuditTrail;