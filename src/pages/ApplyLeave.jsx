import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import LeaveBalanceSummary from '../components/leave/LeaveBalanceSummary';
import LeavePolicyCard from '../components/leave/LeavePolicyCard';
import ImportantNotesCard from '../components/leave/ImportantNotesCard';
import {
  PaperclipIcon,
  PlusIcon,
  XIcon,
  InfoIcon,
} from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EMPLOYEE_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import {
  mockLeaveCategories,
  mockLeavePolicies,
  mockLeaveLedger,
} from '../utils/mockData';
import './ApplyLeave.css';

const USE_MOCK =
  String(import.meta.env.VITE_USE_MOCK_DATA).toLowerCase() === 'true';

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const REASON_MAX_LEN = 500;

const formatBytes = (bytes) => {
  const kb = bytes / 1024;

  return kb < 1024
    ? `${Math.round(kb)} KB`
    : `${(kb / 1024).toFixed(1)} MB`;
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
  const location = useLocation();

  // Extract draftData passed via React Router navigation state (if any)
  const draftData = location.state?.draftData || null;

  const { user, logout } = useAuth();

  useRoleRedirect('employee');

  const [categories, setCategories] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [policy, setPolicy] = useState(null);

  const [policyLoading, setPolicyLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  // Draft ID tracking if editing an existing draft
  const [draftId, setDraftId] = useState(draftData?.id || null);

  const [categoryId, setCategoryId] = useState('');
  const [applyFor, setApplyFor] = useState(
    draftData?.applyFor === 'HALF_DAY' || draftData?.sessionType === 'FIRST_HALF'
      ? 'HALF_DAY'
      : 'FULL_DAY'
  );

  const [startDate, setStartDate] = useState(draftData?.fromDate || draftData?.startDate || '');
  const [endDate, setEndDate] = useState(draftData?.toDate || draftData?.endDate || '');
  const [reason, setReason] = useState(draftData?.reason || '');

  const [files, setFiles] = useState([]);

  const fileInputRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const categoryCodeById = useMemo(
    () =>
      Object.fromEntries(
        categories.map((c) => [c.id, c.categoryCode])
      ),
    [categories]
  );

  const selectedCategory = categories.find(
    (c) => c.id === Number(categoryId)
  );

  /*
   * Check whether selected leave type is Sick Leave.
   */
  const isSickLeave = useMemo(() => {
    if (!selectedCategory) return false;

    const categoryName = String(
      selectedCategory.categoryName || ''
    ).toLowerCase();

    const categoryCode = String(
      selectedCategory.categoryCode || ''
    ).toLowerCase();

    return (
      categoryName.includes('sick') ||
      categoryCode === 'sick' ||
      categoryCode === 'sick_leave'
    );
  }, [selectedCategory]);

  const totalDays = useMemo(() => {
    if (applyFor === 'HALF_DAY') {
      return startDate ? 0.5 : 0;
    }

    return daysBetweenInclusive(startDate, endDate);
  }, [applyFor, startDate, endDate]);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      setCategories(mockLeaveCategories);
      setLedger(mockLeaveLedger);

      // Match category ID from draft if provided, otherwise default to first category
      let matchedId = mockLeaveCategories[0]?.id;
      if (draftData?.leaveType) {
        const foundCat = mockLeaveCategories.find(
          (c) => c.categoryName.toLowerCase() === String(draftData.leaveType).toLowerCase()
        );
        if (foundCat) matchedId = foundCat.id;
      }

      setCategoryId(String(matchedId ?? ''));
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

      setLedger(
        ledgerRes?.data ?? ledgerRes ?? []
      );

      if (cats.length) {
        let matchedId = cats[0].id;
        if (draftData?.leaveType || draftData?.categoryId) {
          const foundCat = cats.find(
            (c) =>
              c.id === draftData.categoryId ||
              c.categoryName.toLowerCase() === String(draftData.leaveType).toLowerCase()
          );
          if (foundCat) matchedId = foundCat.id;
        }
        setCategoryId(String(matchedId));
      }
    } catch (err) {
      setError(
        err.message || 'Failed to load leave data.'
      );

      setCategories(mockLeaveCategories);
      setLedger(mockLeaveLedger);

      setCategoryId(
        String(mockLeaveCategories[0]?.id ?? '')
      );
    } finally {
      setLoading(false);
    }
  }, [draftData]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  /*
   * Sync component state when location state changes dynamically
   */
  useEffect(() => {
    if (draftData) {
      setDraftId(draftData.id || null);
      setStartDate(draftData.fromDate || draftData.startDate || '');
      setEndDate(draftData.toDate || draftData.endDate || '');
      setReason(draftData.reason || '');
      setApplyFor(
        draftData.applyFor === 'HALF_DAY' || draftData.sessionType === 'FIRST_HALF'
          ? 'HALF_DAY'
          : 'FULL_DAY'
      );
    }
  }, [draftData]);

  /*
   * Load leave policy whenever leave type changes.
   */
  useEffect(() => {
    if (!categoryId) return;

    setPolicyLoading(true);

    if (USE_MOCK) {
      setPolicy(
        mockLeavePolicies[categoryId] ?? null
      );

      setPolicyLoading(false);

      return;
    }

    apiService
      .getLeavePolicies(categoryId)
      .then((res) => {
        const list = res?.data ?? res ?? [];

        setPolicy(list[0] ?? null);
      })
      .catch(() => {
        setPolicy(
          mockLeavePolicies[categoryId] ?? null
        );
      })
      .finally(() => {
        setPolicyLoading(false);
      });
  }, [categoryId]);

  /*
   * Half Day only makes sense for one day.
   */
  useEffect(() => {
    if (applyFor === 'HALF_DAY' && startDate) {
      setEndDate(startDate);
    }
  }, [applyFor, startDate]);

  /*
   * Handle file selection.
   */
  const handleAddFiles = (e) => {
    const picked = Array.from(
      e.target.files || []
    );

    if (!picked.length) return;

    const tooBig = picked.find(
      (file) => file.size > MAX_FILE_BYTES
    );

    if (tooBig) {
      setFormError(
        `"${tooBig.name}" exceeds the 10 MB attachment limit.`
      );

      return;
    }

    setFormError('');

    setFiles((prev) => [
      ...prev,
      ...picked,
    ]);

    // Allow selecting the same file again.
    e.target.value = '';
  };

  /*
   * Remove attachment.
   */
  const removeFile = (index) => {
    setFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /*
   * Build leave request payload.
   */
  const buildPayload = (status) => ({
    ...(draftId ? { id: draftId } : {}),
    categoryId: Number(categoryId),
    startDate,
    endDate: endDate || startDate,
    sessionType:
      applyFor === 'HALF_DAY'
        ? 'FIRST_HALF'
        : 'FULL_DAY',
    reason: reason.trim(),
    status,
  });

  /*
   * Validate leave application.
   */
  const validate = (status) => {
    if (!categoryId) {
      return 'Please select a leave type.';
    }

    if (!startDate) {
      return 'Please select a start date.';
    }

    if (applyFor === 'FULL_DAY' && !endDate) {
      return 'Please select an end date.';
    }

    if (
      applyFor === 'FULL_DAY' &&
      new Date(endDate) < new Date(startDate)
    ) {
      return 'End date cannot be before the start date.';
    }

    if (!reason.trim()) {
      return 'Please provide a reason for leave.';
    }

    /*
     * Sick Leave requires an attachment when submitting the request.
     */
    if (
      status !== 'DRAFT' &&
      isSickLeave &&
      files.length === 0
    ) {
      return 'Please attach a supporting document for Sick Leave.';
    }

    return '';
  };

  /*
   * Submit or save draft.
   */
  const handleSubmit = async (status) => {
    const validationError = validate(status);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const setBusy =
      status === 'DRAFT'
        ? setSavingDraft
        : setSubmitting;

    setBusy(true);

    setFormError('');
    setSuccessMessage('');

    if (USE_MOCK) {
      setTimeout(() => {
        setBusy(false);

        setSuccessMessage(
          status === 'DRAFT'
            ? 'Draft saved successfully.'
            : 'Leave request submitted for approval.'
        );

        if (status !== 'DRAFT') {
          setTimeout(() => {
            navigate('/my-requests');
          }, 1200);
        }
      }, 700);

      return;
    }

    try {
      const payload = buildPayload(status);
      let response;

      // Call update API if updating existing draft, else create new
      if (draftId && apiService.updateLeaveRequest) {
        response = await apiService.updateLeaveRequest(draftId, payload);
      } else {
        response = await apiService.submitLeaveRequest(payload);
      }

      const requestId =
        response?.id ??
        response?.data?.id ??
        draftId;

      /*
       * Upload attachments after the leave request has been submitted/saved.
       */
      if (
        requestId &&
        files.length
      ) {
        for (const file of files) {
          // eslint-disable-next-line no-await-in-loop
          await apiService.uploadLeaveAttachment(
            requestId,
            file
          );
        }
      }

      setSuccessMessage(
        status === 'DRAFT'
          ? 'Draft saved successfully.'
          : 'Leave request submitted for approval.'
      );

      if (status !== 'DRAFT') {
        setTimeout(() => {
          navigate('/my-requests');
        }, 1200);
      }
    } catch (err) {
      setFormError(
        err.message ||
          'Failed to submit leave request.'
      );
    } finally {
      setBusy(false);
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
      title={draftId ? 'Edit Draft Request' : 'Apply Leave'}
      breadcrumbs={[
        {
          label: 'Dashboard',
          path: '/dashboard',
        },
        {
          label: draftId ? 'Edit Draft Request' : 'Apply Leave',
        },
      ]}
      portalLabel={EMPLOYEE_PORTAL.portalLabel}
      navItems={EMPLOYEE_PORTAL.navItems}
      searchPlaceholder={
        EMPLOYEE_PORTAL.searchPlaceholder
      }
      user={user}
      onLogout={handleLogout}
    >
      {error && (
        <div className="dashboard-error-banner">
          {error} — showing sample data instead.
        </div>
      )}

      <div className="apply-leave-layout">
        <div className="dashboard-panel apply-leave-form-panel">
          <div className="widget-header">
            <h3>
              {draftId
                ? `Edit Draft Request (${draftData?.id || draftId})`
                : 'Leave Application Form'}
            </h3>
          </div>

          {formError && (
            <div className="apply-leave-alert error">
              {formError}
            </div>
          )}

          {successMessage && (
            <div className="apply-leave-alert success">
              {successMessage}
            </div>
          )}

          <div className="apply-leave-grid">

            {/* Leave Type */}
            <div className="form-field">
              <label>Leave Type *</label>

              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);

                  // Clear old validation message
                  setFormError('');
                }}
              >
                {categories.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                  >
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply For */}
            <div className="form-field">
              <label>Apply For *</label>

              <div className="apply-leave-radio-group">
                <label className="apply-leave-radio">
                  <input
                    type="radio"
                    checked={
                      applyFor === 'FULL_DAY'
                    }
                    onChange={() =>
                      setApplyFor('FULL_DAY')
                    }
                  />

                  Full Day
                </label>

                <label className="apply-leave-radio">
                  <input
                    type="radio"
                    checked={
                      applyFor === 'HALF_DAY'
                    }
                    onChange={() =>
                      setApplyFor('HALF_DAY')
                    }
                  />

                  Half Day
                </label>
              </div>
            </div>

            {/* From Date */}
            <div className="form-field">
              <label>From Date *</label>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
              />
            </div>

            {/* To Date */}
            <div className="form-field">
              <label>To Date *</label>

              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
                min={
                  startDate || undefined
                }
                disabled={
                  applyFor === 'HALF_DAY'
                }
              />
            </div>

            {/* Total Days */}
            <div className="form-field">
              <label>Total Days</label>

              <input
                type="text"
                value={`${totalDays} Days`}
                readOnly
                className="apply-leave-readonly"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="form-field apply-leave-full">
            <label>Reason for Leave *</label>

            <textarea
              rows={4}
              maxLength={REASON_MAX_LEN}
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              placeholder="Briefly describe the reason for your leave..."
            />

            <span className="apply-leave-char-count">
              {reason.length}/{REASON_MAX_LEN}
            </span>
          </div>

          {/* Attachment */}
          <div className="form-field apply-leave-full">

            <label>
              Attach Document{' '}
              {isSickLeave
                ? '*'
                : '(Optional)'}
            </label>

            {files.length > 0 && (
              <ul className="apply-leave-file-list">
                {files.map((file, i) => (
                  <li
                    key={`${file.name}-${i}`}
                  >
                    <PaperclipIcon
                      width={14}
                      height={14}
                    />

                    <span className="apply-leave-file-name">
                      {file.name}
                    </span>

                    <span className="apply-leave-file-size">
                      {formatBytes(file.size)}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeFile(i)
                      }
                      aria-label="Remove file"
                    >
                      <XIcon
                        width={13}
                        height={13}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              className="apply-leave-add-file"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              <PlusIcon
                width={14}
                height={14}
              />

              Add{' '}
              {files.length > 0
                ? 'Another'
                : ''}{' '}
              File
            </button>

            {/* Sick Leave requirement message */}
            {isSickLeave &&
              files.length === 0 && (
                <small className="apply-leave-file-required">
                  Supporting document is required
                  for Sick Leave.
                </small>
              )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={handleAddFiles}
            />
          </div>

          {/* Information */}
          <div className="apply-leave-info-banner">
            <InfoIcon
              width={16}
              height={16}
            />

            <p>
              Please ensure you apply for leave
              as per the leave policy.
            </p>
          </div>

          {/* Actions */}
          <div className="apply-leave-actions">

            <button
              className="apply-leave-btn cancel"
              onClick={() =>
                navigate('/my-requests')
              }
            >
              Cancel
            </button>

            <button
              className="apply-leave-btn draft"
              onClick={() =>
                handleSubmit('DRAFT')
              }
              disabled={
                savingDraft ||
                submitting
              }
            >
              {savingDraft
                ? 'Saving...'
                : draftId
                ? 'Update Draft'
                : 'Save Draft'}
            </button>

            <button
              className="apply-leave-btn submit"
              onClick={() =>
                handleSubmit('PENDING_L1')
              }
              disabled={
                savingDraft ||
                submitting
              }
            >
              {submitting
                ? 'Submitting...'
                : 'Submit Request'}
            </button>

          </div>
        </div>

        {/* Sidebar */}
        <div className="apply-leave-sidebar">

          <div className="dashboard-panel">
            <LeaveBalanceSummary
              ledger={ledger}
              categoryCodeById={
                categoryCodeById
              }
            />
          </div>

          <div className="dashboard-panel">
            <LeavePolicyCard
              categoryName={
                selectedCategory?.categoryName ||
                ''
              }
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