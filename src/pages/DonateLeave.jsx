import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import { GiftIcon, UsersIcon, ClockIcon, CheckCircleIcon, XCircleIcon, SearchIcon } from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EMPLOYEE_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { env } from '../config/env';
import { formatToday } from '../utils/date';
import { mockLeaveLedger } from '../utils/mockData';
import './DonateLeave.css';

const USE_MOCK = env.useMockData;

const TABS = [
  { key: 'donate', label: 'Donate Leave' },
  { key: 'sent', label: 'Donations Sent' },
  { key: 'received', label: 'Donations Received' },
];

const STATUS_LABEL = { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected' };

// Matches the backend's DONATABLE_CATEGORY_NAMES — only these leave types
// can be donated. Filtered here too so the dropdown doesn't even offer an
// ineligible type, rather than relying solely on the backend's rejection.
const DONATABLE_CATEGORY_NAMES = ['casual leave', 'sick leave'];
const isDonatableCategory = (name) => DONATABLE_CATEGORY_NAMES.includes(String(name ?? '').trim().toLowerCase());

const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

const DonateLeave = () => {
  const { user, logout } = useAuth();
  useRoleRedirect('employee');

  const [tab, setTab] = useState('donate');
  const [ledger, setLedger] = useState([]);
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [categoryId, setCategoryId] = useState('');
  const [days, setDays] = useState('');
  const [reason, setReason] = useState('');
  const [recipientQuery, setRecipientQuery] = useState('');
  const [recipientResults, setRecipientResults] = useState([]);
  const [recipient, setRecipient] = useState(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const searchTimer = useRef(null);

  const handleLogout = async () => {
    await logout();
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      setLedger(mockLeaveLedger);
      setSent([]);
      setReceived([]);
      setLoading(false);
      return;
    }

    try {
      const [ledgerRes, sentRes, receivedRes] = await Promise.all([
        apiService.getLeaveLedger(),
        apiService.getMyLeaveDonations({ limit: 50 }),
        apiService.getReceivedLeaveDonations({ limit: 50 }),
      ]);
      setLedger(ledgerRes?.data ?? ledgerRes ?? []);
      setSent(sentRes?.data ?? []);
      setReceived(receivedRes?.data ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load donation data.');
      setLedger(mockLeaveLedger);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Debounced colleague search-as-you-type.
  useEffect(() => {
    if (recipient) return; // don't re-search once someone's picked
    if (!recipientQuery.trim()) {
      setRecipientResults([]);
      return;
    }
    if (USE_MOCK) return;

    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiService.getUserDirectory(recipientQuery.trim());
        setRecipientResults(res?.data ?? res ?? []);
      } catch {
        setRecipientResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer.current);
  }, [recipientQuery, recipient]);

  const donatableLedger = useMemo(() => ledger.filter((l) => isDonatableCategory(l.categoryName)), [ledger]);

  const selectedCategory = useMemo(
    () => donatableLedger.find((l) => String(l.categoryId) === String(categoryId)),
    [donatableLedger, categoryId]
  );
  const availableInCategory = selectedCategory
    ? Number(selectedCategory.availableBalance ?? selectedCategory.closingBalance ?? 0)
    : null;

  const totalDonatedThisYear = sent
    .filter((d) => d.status === 'APPROVED')
    .reduce((sum, d) => sum + Number(d.days), 0);
  const totalReceivedThisYear = received
    .filter((d) => d.status === 'APPROVED')
    .reduce((sum, d) => sum + Number(d.days), 0);
  const pendingSentCount = sent.filter((d) => d.status === 'PENDING').length;

  const resetForm = () => {
    setCategoryId('');
    setDays('');
    setReason('');
    setRecipient(null);
    setRecipientQuery('');
    setRecipientResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!recipient) return setError('Please search for and select a colleague to donate to.');
    if (!categoryId) return setError('Please select a leave type.');
    if (!days || Number(days) <= 0) return setError('Please enter how many days you want to donate.');
    if (availableInCategory != null && Number(days) > availableInCategory) {
      return setError(`You only have ${availableInCategory} day(s) available in this leave type.`);
    }

    setSubmitting(true);
    try {
      await apiService.createLeaveDonation({
        recipientId: recipient.id,
        categoryId: Number(categoryId),
        days: Number(days),
        reason: reason.trim() || undefined,
      });
      setSuccess(`Donation request sent — pending HR approval.`);
      resetForm();
      loadAll();
      setTab('sent');
    } catch (err) {
      setError(err.message || 'Failed to submit donation request.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderDonationRow = (d, perspective) => (
    <div key={d.id} className="donate-history-row">
      <div className="donate-history-main">
        <span className={`donate-status-badge status-${d.status.toLowerCase()}`}>{STATUS_LABEL[d.status]}</span>
        <span className="donate-history-days">{d.days} day(s)</span>
        <span className="donate-history-category">{d.categoryName}</span>
        <span className="donate-history-person">
          {perspective === 'sent' ? `to ${d.recipientName}` : `from ${d.donorName}`}
        </span>
      </div>
      {d.reason && <p className="donate-history-reason">"{d.reason}"</p>}
      <div className="donate-history-meta">
        <span>Requested {formatDateTime(d.requestedAt)}</span>
        {d.decidedAt && (
          <span>
            {' '}• {STATUS_LABEL[d.status]} {formatDateTime(d.decidedAt)}
            {d.decidedByName ? ` by ${d.decidedByName}` : ''}
          </span>
        )}
        {d.status === 'REJECTED' && d.decisionComments && (
          <span className="donate-history-rejection"> — "{d.decisionComments}"</span>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout
      title="Donate Leave"
      breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Donate Leave' }]}
      portalLabel={EMPLOYEE_PORTAL.portalLabel}
      navItems={EMPLOYEE_PORTAL.navItems}
      searchPlaceholder={EMPLOYEE_PORTAL.searchPlaceholder}
      dateLabel={formatToday()}
      user={user}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error}</div>}
      {success && <div className="dashboard-success-banner">{success}</div>}

      <div className="donate-leave-summary-row">
        <StatCard icon={GiftIcon} iconClass="icon-purple" label="Donated This Year" value={`${totalDonatedThisYear}d`} sublabel="Approved" />
        <StatCard icon={UsersIcon} iconClass="icon-green" label="Received This Year" value={`${totalReceivedThisYear}d`} sublabel="Approved" />
        <StatCard icon={ClockIcon} iconClass="icon-amber" label="Pending Requests" value={pendingSentCount} sublabel="Awaiting HR" />
      </div>

      <div className="donate-leave-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
            {t.label}
            {t.key === 'sent' && sent.length > 0 && <span className="donate-tab-count">{sent.length}</span>}
            {t.key === 'received' && received.length > 0 && <span className="donate-tab-count">{received.length}</span>}
          </button>
        ))}
      </div>

      {tab === 'donate' && (
        <div className="donate-leave-card">
          <p className="donate-leave-intro">
            Give some of your unused Casual or Sick Leave to a colleague going through a hardship. Your request
            needs HR approval before the days actually move — your balance isn't affected until then. The
            colleague must already be down to 2 days or fewer remaining in that leave type to qualify.
          </p>

          <form onSubmit={handleSubmit} className="donate-leave-form">
            <div className="form-field">
              <label>Donate to</label>
              {recipient ? (
                <div className="donate-recipient-chip">
                  <span>{recipient.fullName}</span>
                  {recipient.departmentName && <span className="donate-recipient-dept">{recipient.departmentName}</span>}
                  <button type="button" onClick={() => setRecipient(null)}>Change</button>
                </div>
              ) : (
                <div className="donate-recipient-search">
                  <SearchIcon width={15} height={15} />
                  <input
                    type="text"
                    placeholder="Search colleague by name..."
                    value={recipientQuery}
                    onChange={(e) => setRecipientQuery(e.target.value)}
                  />
                </div>
              )}
              {!recipient && recipientQuery.trim() && (
                <div className="donate-recipient-results">
                  {searching && <div className="donate-recipient-empty">Searching...</div>}
                  {!searching && recipientResults.length === 0 && (
                    <div className="donate-recipient-empty">No colleagues found.</div>
                  )}
                  {recipientResults.map((u) => (
                    <button
                      type="button"
                      key={u.id}
                      className="donate-recipient-result"
                      onClick={() => {
                        setRecipient(u);
                        setRecipientResults([]);
                      }}
                    >
                      <span>{u.fullName}</span>
                      <span className="donate-recipient-dept">{u.departmentName || u.employeeCode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="donate-leave-grid">
              <div className="form-field">
                <label>Leave Type</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">Select leave type</option>
                  {donatableLedger.map((l) => (
                    <option key={l.categoryId} value={l.categoryId}>
                      {l.categoryName} ({Number(l.availableBalance ?? l.closingBalance ?? 0)}d available)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Days to Donate</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="e.g. 2"
                />
                {availableInCategory != null && (
                  <span className="donate-available-hint">{availableInCategory} day(s) available</span>
                )}
              </div>
            </div>

            <div className="form-field">
              <label>Reason (optional)</label>
              <textarea
                rows={3}
                maxLength={500}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly explain the situation, if you'd like..."
              />
            </div>

            <button type="submit" className="donate-submit-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Send Donation Request'}
            </button>
          </form>
        </div>
      )}

      {tab === 'sent' && (
        <div className="donate-leave-card">
          {loading ? (
            <div className="donate-history-empty">Loading...</div>
          ) : sent.length === 0 ? (
            <div className="donate-history-empty">You haven't donated any leave yet.</div>
          ) : (
            sent.map((d) => renderDonationRow(d, 'sent'))
          )}
        </div>
      )}

      {tab === 'received' && (
        <div className="donate-leave-card">
          {loading ? (
            <div className="donate-history-empty">Loading...</div>
          ) : received.length === 0 ? (
            <div className="donate-history-empty">You haven't received any donated leave.</div>
          ) : (
            received.map((d) => renderDonationRow(d, 'received'))
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DonateLeave;
