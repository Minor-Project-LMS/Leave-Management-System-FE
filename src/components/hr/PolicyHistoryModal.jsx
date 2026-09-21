import { useEffect, useMemo, useState } from 'react';
import { HistoryIcon, XIcon } from '../icons/Icons';
import './PolicyHistoryModal.css';

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getHistoryItems = (response) => {
  const data = response?.data ?? response ?? [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.history)) return data.history;
  return [];
};

const getAction = (entry) => {
  const value = entry?.action ?? entry?.eventType ?? entry?.operation ?? entry?.changeType;
  if (!value) return 'UPDATED';
  return String(value).replaceAll('_', ' ');
};

const getChangedBy = (entry) =>
  entry?.performedByName ??
  entry?.changedByName ??
  entry?.userName ??
  entry?.createdByName ??
  entry?.changedBy?.fullName ??
  entry?.changedBy?.name ??
  entry?.performedBy?.fullName ??
  entry?.performedBy?.name ??
  entry?.createdBy?.fullName ??
  entry?.createdBy?.name ??
  'HR Admin';

const getDate = (entry) =>
  entry?.performedAt ?? entry?.changedAt ?? entry?.createdAt ?? entry?.updatedAt ?? entry?.timestamp;

// What actually changed, in plain language — e.g. "Updated Max Consecutive
// Days, Max Carry Forward." — rather than a version number, which said
// nothing about what happened and (before the backend fix) wasn't even a
// real version anyway.
const getSummary = (entry) => {
  if (entry?.summary) return entry.summary;
  if (Array.isArray(entry?.changedFields) && entry.changedFields.length > 0) {
    return `Updated ${entry.changedFields.join(', ')}.`;
  }
  return getAction(entry) === 'CREATED' ? 'Policy created.' : 'Policy updated.';
};

const PolicyHistoryModal = ({ isOpen, onClose, policies = [], selectedPolicy = null, onLoadHistory, loading = false, error = '' }) => {
  const [policyId, setPolicyId] = useState(selectedPolicy?.id ?? '');
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    setPolicyId(selectedPolicy?.id ?? policies[0]?.id ?? '');
  }, [isOpen, selectedPolicy, policies]);

  useEffect(() => {
    if (!isOpen || !policyId) {
      setItems([]);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const response = await onLoadHistory(policyId);
        if (!cancelled) setItems(getHistoryItems(response));
      } catch {
        if (!cancelled) setItems([]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isOpen, policyId, onLoadHistory]);

  const currentPolicy = useMemo(
    () => policies.find((policy) => String(policy.id) === String(policyId)) ?? selectedPolicy,
    [policies, policyId, selectedPolicy]
  );

  if (!isOpen) return null;

  return (
    <div className="policy-history-overlay" onClick={onClose}>
      <div className="policy-history-modal" onClick={(event) => event.stopPropagation()}>
        <div className="policy-history-header">
          <div className="policy-history-title-wrap">
            <div className="policy-history-icon"><HistoryIcon width={18} height={18} /></div>
            <div>
              <h2>Policy History</h2>
              <p>Review changes made to leave policies over time.</p>
            </div>
          </div>
          <button className="policy-history-close" onClick={onClose} aria-label="Close policy history">
            <XIcon width={20} height={20} />
          </button>
        </div>

        <div className="policy-history-toolbar">
          <label htmlFor="policy-history-select">Policy</label>
          <select
            id="policy-history-select"
            value={policyId}
            onChange={(event) => setPolicyId(event.target.value)}
          >
            <option value="">Select a policy</option>
            {policies.map((policy) => (
              <option key={policy.id} value={policy.id}>
                {policy.policyName || 'Untitled Policy'}{policy.policyCode ? ` (${policy.policyCode})` : ''}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="policy-history-error">{error}</div>}

        <div className="policy-history-content">
          {!policyId ? (
            <div className="policy-history-empty">Select a policy to view its history.</div>
          ) : loading ? (
            <div className="policy-history-loading"><span className="policy-history-spinner" />Loading policy history...</div>
          ) : items.length === 0 ? (
            <div className="policy-history-empty">
              <HistoryIcon width={24} height={24} />
              <strong>No history available</strong>
              <span>No recorded changes were returned for {currentPolicy?.policyName || 'this policy'}.</span>
            </div>
          ) : (
            <div className="policy-history-list">
              {items.map((entry, index) => {
                const action = getAction(entry);
                const changedBy = getChangedBy(entry);
                const changedAt = getDate(entry);
                const changedFields = Array.isArray(entry?.changedFields) ? entry.changedFields : [];
                const summary = getSummary(entry);

                return (
                  <div className="policy-history-item" key={entry?.id ?? `${changedAt}-${index}`}>
                    <div className="policy-history-marker" />
                    <div className="policy-history-card">
                      <div className="policy-history-card-top">
                        <span className={`policy-history-action-badge ${action === 'CREATED' ? 'created' : 'updated'}`}>{action}</span>
                        <span className="policy-history-date">{formatDateTime(changedAt)}</span>
                      </div>
                      {changedFields.length > 0 ? (
                        // One tag per changed field, so it's obvious at a
                        // glance whether one thing changed or several —
                        // rather than a single run-on "Updated A, B, C."
                        // sentence that's harder to scan.
                        <div className="policy-history-field-tags">
                          {changedFields.map((field) => (
                            <span className="policy-history-field-tag" key={field}>{field}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="policy-history-summary">{summary}</p>
                      )}
                      <div className="policy-history-meta">
                        <span><strong>Changed by:</strong> {changedBy}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="policy-history-footer">
          <span>{items.length} {items.length === 1 ? 'record' : 'records'}</span>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default PolicyHistoryModal;
