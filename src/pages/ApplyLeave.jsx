import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import LeaveBalanceSummary from '../components/leave/LeaveBalanceSummary';
import LeavePolicyCard from '../components/leave/LeavePolicyCard';
import ImportantNotesCard from '../components/leave/ImportantNotesCard';
import { PaperclipIcon, PlusIcon, XIcon, InfoIcon } from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EMPLOYEE_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { mockLeaveCategories, mockLeavePolicies, mockLeaveLedger } from '../utils/mockData';
import './ApplyLeave.css';

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK_DATA).toLowerCase() === 'true';
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB, per spec (FILE_TOO_LARGE)
const LARGE_FILE_THRESHOLD = 2 * 1024 * 1024; // 2 MB threshold for direct upload
const REASON_MAX_LEN = 500;

const formatBytes = (bytes) => {
  const kb = bytes / 1024;
  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`;
};

const daysBetweenInclusive = (start, end) => {
  if (!start || !end) return 0;
  const a = new Date(start);
  const b = new Date(end);
  const diff = Math.round((b - a) / 86400000) + 1;
  return diff > 0 ? diff : 0;
};

const ApplyLeave = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('employee');

  const [categories, setCategories] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [categoryId, setCategoryId] = useState('');
  const [applyFor, setApplyFor] = useState('FULL_DAY'); // 'FULL_DAY' | 'HALF_DAY'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState([]); // File[]
  const fileInputRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState({}); // { fileName: progressPercentage }

  const categoryCodeById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.categoryCode])),
    [categories]
  );

  const selectedCategory = categories.find((c) => c.id === Number(categoryId));

  const totalDays = useMemo(() => {
    if (applyFor === 'HALF_DAY') return startDate ? 0.5 : 0;
    return daysBetweenInclusive(startDate, endDate);
  }, [applyFor, startDate, endDate]);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      setCategories(mockLeaveCategories);
      setLedger(mockLeaveLedger);
      setCategoryId(String(mockLeaveCategories[0]?.id ?? ''));
      setLoading(false);
      return;
    }

    try {
      const [catRes, ledgerRes] = await Promise.all([
        apiService.getLeaveCategories(),
        apiService.getLeaveLedger(),
      ]);
      const cats = catRes?.data ?? catRes ?? [];
      setCategories(cats);
      setLedger(ledgerRes?.data ?? ledgerRes ?? []);
      if (cats.length) setCategoryId(String(cats[0].id));
    } catch (err) {
      setError(err.message || 'Failed to load leave data.');
      setCategories(mockLeaveCategories);
      setLedger(mockLeaveLedger);
      setCategoryId(String(mockLeaveCategories[0]?.id ?? ''));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load the policy for whichever category is currently selected.
  useEffect(() => {
    if (!categoryId) return;
    setPolicyLoading(true);

    if (USE_MOCK) {
      setPolicy(mockLeavePolicies[categoryId] ?? null);
      setPolicyLoading(false);
      return;
    }

    apiService
      .getLeavePolicies(categoryId)
      .then((res) => {
        const list = res?.data ?? res ?? [];
        setPolicy(list[0] ?? null);
      })
      .catch(() => setPolicy(mockLeavePolicies[categoryId] ?? null))
      .finally(() => setPolicyLoading(false));
  }, [categoryId]);

  // Half Day only makes sense for a single day — keep end date in sync.
  useEffect(() => {
    if (applyFor === 'HALF_DAY' && startDate) setEndDate(startDate);
  }, [applyFor, startDate]);

  const handleAddFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    const tooBig = picked.find((f) => f.size > MAX_FILE_BYTES);
    if (tooBig) {
      setFormError(`"${tooBig.name}" exceeds the 10 MB attachment limit.`);
    } else {
      setFormError('');
      setFiles((prev) => [...prev, ...picked]);
    }
    e.target.value = ''; // allow re-selecting the same file later
  };

  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const uploadSingleFile = async (file, requestId) => {
    // Use direct-to-blob-storage for large files, multipart for small files
    if (file.size > LARGE_FILE_THRESHOLD) {
      return uploadLargeFile(file, requestId);
    } else {
      return uploadSmallFile(file, requestId);
    }
  };

  const uploadSmallFile = async (file, requestId) => {
    try {
      return await apiService.uploadLeaveAttachment(requestId, file);
    } catch (err) {
      throw new Error(`Failed to upload ${file.name}: ${err.message}`);
    }
  };

  const uploadLargeFile = async (file, requestId) => {
    try {
      // Step 1: Request presigned upload URL
      const uploadUrlResponse = await apiService.requestAttachmentUploadUrl(
        file.name,
        file.type,
        file.size,
        'LEAVE_REQUEST',
        requestId
      );

      const { attachmentId, uploadUrl } = uploadUrlResponse;

      // Step 2: Upload directly to blob storage with progress tracking
      await uploadToBlobStorage(file, uploadUrl, file.name);

      // Step 3: Confirm the upload
      const confirmedAttachment = await apiService.confirmAttachmentUpload(attachmentId, requestId);

      return confirmedAttachment;
    } catch (err) {
      throw new Error(`Failed to upload ${file.name}: ${err.message}`);
    }
  };

  const uploadToBlobStorage = (file, uploadUrl, fileName) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress((prev) => ({
            ...prev,
            [fileName]: progress,
          }));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled'));
      });

      xhr.open('PUT', uploadUrl);
      // IMPORTANT: Do NOT include Authorization header for blob storage upload
      // This goes directly to the blob storage provider, not the LMS API
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  };

  const buildPayload = (status) => ({
    categoryId: Number(categoryId),
    startDate,
    endDate: endDate || startDate,
    sessionType: applyFor === 'HALF_DAY' ? 'FIRST_HALF' : 'FULL_DAY',
    reason: reason.trim(),
    status,
  });

  const validate = () => {
    if (!categoryId) return 'Please select a leave type.';
    if (!startDate) return 'Please select a start date.';
    if (applyFor === 'FULL_DAY' && !endDate) return 'Please select an end date.';
    if (applyFor === 'FULL_DAY' && new Date(endDate) < new Date(startDate)) {
      return 'End date cannot be before the start date.';
    }
    if (!reason.trim()) return 'Please provide a reason for leave.';
    return '';
  };

  const handleSubmit = async (status) => {
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const setBusy = status === 'DRAFT' ? setSavingDraft : setSubmitting;
    setBusy(true);
    setFormError('');
    setSuccessMessage('');
    setUploadProgress({});

    if (USE_MOCK) {
      setTimeout(() => {
        setBusy(false);
        setSuccessMessage(
          status === 'DRAFT' ? 'Draft saved.' : 'Leave request submitted for approval.'
        );
      }, 700);
      return;
    }

    try {
      const created = await apiService.submitLeaveRequest(buildPayload(status));
      const requestId = created?.id ?? created?.data?.id;

      if (requestId && files.length) {
        for (const file of files) {
          // eslint-disable-next-line no-await-in-loop
          await uploadSingleFile(file, requestId);
        }
      }

      setSuccessMessage(
        status === 'DRAFT' ? 'Draft saved.' : 'Leave request submitted for approval.'
      );
      if (status !== 'DRAFT') {
        setTimeout(() => navigate('/my-requests'), 1200);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to submit leave request.');
    } finally {
      setBusy(false);
      setUploadProgress({});
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading Apply Leave...</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Apply Leave"
      breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Apply Leave' }]}
      portalLabel={EMPLOYEE_PORTAL.portalLabel}
      navItems={EMPLOYEE_PORTAL.navItems}
      searchPlaceholder={EMPLOYEE_PORTAL.searchPlaceholder}
      user={user}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error} — showing sample data instead.</div>}

      <div className="apply-leave-layout">
        <div className="dashboard-panel apply-leave-form-panel">
          <div className="widget-header">
            <h3>Leave Application Form</h3>
          </div>

          {formError && <div className="apply-leave-alert error">{formError}</div>}
          {successMessage && <div className="apply-leave-alert success">{successMessage}</div>}

          <div className="apply-leave-grid">
            <div className="form-field">
              <label>Leave Type *</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Apply For *</label>
              <div className="apply-leave-radio-group">
                <label className="apply-leave-radio">
                  <input
                    type="radio"
                    checked={applyFor === 'FULL_DAY'}
                    onChange={() => setApplyFor('FULL_DAY')}
                  />
                  Full Day
                </label>
                <label className="apply-leave-radio">
                  <input
                    type="radio"
                    checked={applyFor === 'HALF_DAY'}
                    onChange={() => setApplyFor('HALF_DAY')}
                  />
                  Half Day
                </label>
              </div>
            </div>

            <div className="form-field">
              <label>From Date *</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="form-field">
              <label>To Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                disabled={applyFor === 'HALF_DAY'}
              />
            </div>

            <div className="form-field">
              <label>Total Days</label>
              <input type="text" value={`${totalDays} Days`} readOnly className="apply-leave-readonly" />
            </div>
          </div>

          <div className="form-field apply-leave-full">
            <label>Reason for Leave *</label>
            <textarea
              rows={4}
              maxLength={REASON_MAX_LEN}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe the reason for your leave..."
            />
            <span className="apply-leave-char-count">
              {reason.length}/{REASON_MAX_LEN}
            </span>
          </div>

          <div className="form-field apply-leave-full">
            <label>Attach Document (Optional)</label>
            {files.length > 0 && (
              <ul className="apply-leave-file-list">
                {files.map((file, i) => (
                  <li key={`${file.name}-${i}`}>
                    <PaperclipIcon width={14} height={14} />
                    <div className="apply-leave-file-info">
                      <span className="apply-leave-file-name">{file.name}</span>
                      <span className="apply-leave-file-size">{formatBytes(file.size)}</span>
                      {uploadProgress[file.name] !== undefined && (
                        <div className="apply-leave-upload-progress">
                          <div 
                            className="apply-leave-progress-bar" 
                            style={{ width: `${uploadProgress[file.name]}%` }}
                          />
                          <span className="apply-leave-progress-text">{uploadProgress[file.name]}%</span>
                        </div>
                      )}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeFile(i)} 
                      aria-label="Remove file"
                      disabled={submitting || savingDraft}
                    >
                      <XIcon width={13} height={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button 
              type="button" 
              className="apply-leave-add-file" 
              onClick={() => fileInputRef.current?.click()}
              disabled={submitting || savingDraft}
            >
              <PlusIcon width={14} height={14} />
              Add {files.length > 0 ? 'Another' : ''} File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={handleAddFiles}
            />
          </div>

          <div className="apply-leave-info-banner">
            <InfoIcon width={16} height={16} />
            <p>Please ensure you apply for leave as per the leave policy.</p>
          </div>

          <div className="apply-leave-actions">
            <button className="apply-leave-btn cancel" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
            <button
              className="apply-leave-btn draft"
              onClick={() => handleSubmit('DRAFT')}
              disabled={savingDraft || submitting}
            >
              {savingDraft ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              className="apply-leave-btn submit"
              onClick={() => handleSubmit('PENDING_L1')}
              disabled={savingDraft || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>

        <div className="apply-leave-sidebar">
          <div className="dashboard-panel">
            <LeaveBalanceSummary ledger={ledger} categoryCodeById={categoryCodeById} />
          </div>
          <div className="dashboard-panel">
            <LeavePolicyCard
              categoryName={selectedCategory?.categoryName || ''}
              policy={policy}
              loading={policyLoading}
            />
          </div>
          <ImportantNotesCard />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApplyLeave;
