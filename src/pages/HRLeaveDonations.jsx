import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import { GiftIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HR_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { env } from '../config/env';
import { formatToday } from '../utils/date';
import './HRLeaveDonations.css';

const USE_MOCK = env.useMockData;

const STATUS_TABS = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: '', label: 'All' },
];

const formatDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

const HRLeaveDonations = () => {
  const { user, logout } = useAuth();
  useRoleRedirect('hr');

  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [decidingId, setDecidingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectComment, setRejectComment] = useState('');

  const handleLogout = async () => {
    await logout();
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      setDonations([]);
      setLoading(false);
      return;
    }

    try {
      const res = await apiService.getAllLeaveDonations({ status: statusFilter || undefined, limit: 100 });
      setDonations(res?.data ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load leave donations.');
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const pendingCount = donations.filter((d) => d.status === 'PENDING').length;

  const handleApprove = async (donation) => {
    if (!window.confirm(`Approve ${donation.donorName}'s donation of ${donation.days} day(s) to ${donation.recipientName}?`)) return;

    setDecidingId(donation.id);
    setError('');
    setSuccess('');
    try {
      await apiService.decideLeaveDonation(donation.id, { decision: 'APPROVED' });
      setSuccess(`Approved — ${donation.days} day(s) moved from ${donation.donorName} to ${donation.recipientName}.`);
      load();
    } catch (err) {
      setError(err.message || 'Failed to approve donation.');
    } finally {
      setDecidingId(null);
    }
  };

  const handleRejectConfirm = async (donation) => {
    if (!rejectComment.trim()) return setError('A reason is required to reject a donation.');

    setDecidingId(donation.id);
    setError('');
    setSuccess('');
    try {
      await apiService.decideLeaveDonation(donation.id, { decision: 'REJECTED', comments: rejectComment.trim() });
      setSuccess('Donation request rejected.');
      setRejectingId(null);
      setRejectComment('');
      load();
    } catch (err) {
      setError(err.message || 'Failed to reject donation.');
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <DashboardLayout
      title="Leave Donations"
      breadcrumbs={[{ label: 'HR Dashboard', path: '/hr/dashboard' }, { label: 'Leave Donations' }]}
      portalLabel={HR_PORTAL.portalLabel}
      navItems={HR_PORTAL.navItems}
      searchPlaceholder={HR_PORTAL.searchPlaceholder}
      dateLabel={formatToday()}
      user={user}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error}</div>}
      {success && <div className="dashboard-success-banner">{success}</div>}

      <div className="hr-donations-summary-row">
        <StatCard icon={GiftIcon} iconClass="icon-purple" label="Pending Review" value={pendingCount} sublabel="Awaiting your decision" />
        <StatCard icon={ClockIcon} iconClass="icon-blue" label="Total Requests" value={donations.length} sublabel={statusFilter || 'All statuses'} />
      </div>

      <div className="hr-donations-card">
        <div className="hr-donations-tabs">
          {STATUS_TABS.map((t) => (
            <button key={t.key || 'all'} className={statusFilter === t.key ? 'active' : ''} onClick={() => setStatusFilter(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="hr-donations-empty">Loading...</div>
        ) : donations.length === 0 ? (
          <div className="hr-donations-empty">No {statusFilter ? statusFilter.toLowerCase() : ''} donation requests.</div>
        ) : (
          <div className="hr-donations-list">
            {donations.map((d) => (
              <div key={d.id} className="hr-donation-row">
                <div className="hr-donation-main">
                  <div className="hr-donation-transfer">
                    <span className="hr-donation-person">{d.donorName}</span>
                    <span className="hr-donation-arrow">→</span>
                    <span className="hr-donation-person">{d.recipientName}</span>
                  </div>
                  <span className="hr-donation-days">{d.days} day(s)</span>
                  <span className="hr-donation-category">{d.categoryName}</span>
                  <span className={`donate-status-badge status-${d.status.toLowerCase()}`}>{d.status}</span>
                </div>

                {d.reason && <p className="hr-donation-reason">"{d.reason}"</p>}

                <div className="hr-donation-meta">
                  Requested {formatDateTime(d.requestedAt)}
                  {d.decidedAt && ` • Decided ${formatDateTime(d.decidedAt)}${d.decidedByName ? ` by ${d.decidedByName}` : ''}`}
                  {d.status === 'REJECTED' && d.decisionComments && ` — "${d.decisionComments}"`}
                </div>

                {d.status === 'PENDING' && (
                  <div className="hr-donation-actions">
                    {rejectingId === d.id ? (
                      <div className="hr-donation-reject-box">
                        <textarea
                          rows={2}
                          placeholder="Reason for rejection..."
                          value={rejectComment}
                          onChange={(e) => setRejectComment(e.target.value)}
                          autoFocus
                        />
                        <div className="hr-donation-reject-actions">
                          <button
                            className="hr-donation-btn cancel"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectComment('');
                            }}
                            disabled={decidingId === d.id}
                          >
                            Cancel
                          </button>
                          <button
                            className="hr-donation-btn reject"
                            onClick={() => handleRejectConfirm(d)}
                            disabled={decidingId === d.id}
                          >
                            {decidingId === d.id ? 'Rejecting...' : 'Confirm Reject'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          className="hr-donation-btn approve"
                          onClick={() => handleApprove(d)}
                          disabled={decidingId === d.id}
                        >
                          <CheckCircleIcon width={15} height={15} />
                          {decidingId === d.id ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          className="hr-donation-btn reject-outline"
                          onClick={() => {
                            setRejectingId(d.id);
                            setRejectComment('');
                          }}
                          disabled={decidingId === d.id}
                        >
                          <XCircleIcon width={15} height={15} />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HRLeaveDonations;
