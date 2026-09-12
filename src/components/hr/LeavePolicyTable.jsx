import { useState, useRef, useEffect } from 'react';
import StatusBadge from '../dashboard/StatusBadge';
import LeaveTypeBadge from '../approvals/LeaveTypeBadge';
import Pagination from '../common/Pagination';
import { MoreVerticalIcon, EditIcon, HistoryIcon, ArchiveIcon, CheckIcon } from '../icons/Icons';
import './LeavePolicyTable.css';

const STATUS_DISPLAY = {
  ACTIVE: 'Active',
  DRAFT: 'Draft',
  ARCHIVED: 'Archived',
};

const ACCRUAL_LABEL = {
  ANNUAL: 'Yearly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
};

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getStatusCaption = (policy) => {
  if (policy.status === 'ACTIVE') return `on ${formatDate(policy.effectiveFrom)}`;
  if (policy.status === 'DRAFT') return 'Under Review';
  return `Archived`;
};

const ActionsMenu = ({ policy, onEdit, onViewHistory, onToggleStatus }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="policy-actions-wrap" ref={ref}>
      <button className="policy-actions-btn" onClick={() => setOpen((v) => !v)} aria-label="More actions">
        <MoreVerticalIcon width={16} height={16} />
      </button>
      {open && (
        <div className="policy-actions-menu">
          <button onClick={() => { onEdit?.(policy); setOpen(false); }}>
            <EditIcon width={14} height={14} /> Edit
          </button>
          <button onClick={() => { onViewHistory?.(policy); setOpen(false); }}>
            <HistoryIcon width={14} height={14} /> View History
          </button>
          {policy.status === 'DRAFT' && (
            <button onClick={() => { onToggleStatus?.(policy, 'ACTIVE'); setOpen(false); }}>
              <CheckIcon width={14} height={14} /> Activate
            </button>
          )}
          {policy.status === 'ACTIVE' && (
            <button className="danger" onClick={() => { onToggleStatus?.(policy, 'ARCHIVED'); setOpen(false); }}>
              <ArchiveIcon width={14} height={14} /> Archive
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const LeavePolicyTable = ({
  policies = [],
  page,
  totalPages,
  totalCount,
  onPageChange,
  onEdit,
  onViewHistory,
  onToggleStatus,
}) => {
  if (policies.length === 0) {
    return <p className="widget-empty">No policies match your filters.</p>;
  }

  return (
    <div className="policy-table-wrap">
      <table className="policy-table">
        <thead>
          <tr>
            <th>Policy Name</th>
            <th>Leave Type</th>
            <th>Applicable To</th>
            <th>Accrual Frequency</th>
            <th>Carry Forward</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {policies.map((p) => (
            <tr key={p.id}>
              <td>
                <div className="policy-name-cell">
                  <span className="policy-name">{p.policyName}</span>
                  <span className="policy-code-row">
                    {p.policyCode}
                    <span className={`policy-default-tag ${p.isDefault ? 'default' : 'custom'}`}>
                      {p.isDefault ? 'Default' : 'Custom'}
                    </span>
                  </span>
                </div>
              </td>
              <td>
                <LeaveTypeBadge categoryCode={p.categoryCode} categoryName={p.categoryName} />
              </td>
              <td className="policy-muted">{p.applicableTo || (p.departmentName ? p.departmentName : 'All Employees')}</td>
              <td>
                <div className="policy-stacked-cell">
                  <span className="policy-primary-text">{ACCRUAL_LABEL[p.accrualFrequency] || p.accrualFrequency}</span>
                  <span className="policy-caption-text">{p.accrualCaption}</span>
                </div>
              </td>
              <td>
                <div className="policy-stacked-cell">
                  <span className="policy-primary-text">{p.maxCarryForward > 0 ? 'Yes' : 'No'}</span>
                  <span className="policy-caption-text">{p.carryForwardCaption}</span>
                </div>
              </td>
              <td>
                <div className="policy-stacked-cell">
                  <StatusBadge status={STATUS_DISPLAY[p.status] || p.status} />
                  <span className="policy-caption-text">{getStatusCaption(p)}</span>
                </div>
              </td>
              <td>
                <ActionsMenu
                  policy={p}
                  onEdit={onEdit}
                  onViewHistory={onViewHistory}
                  onToggleStatus={onToggleStatus}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="policy-table-footer">
        <span className="policy-table-count">
          Showing {policies.length === 0 ? 0 : (page - 1) * policies.length + 1} to{' '}
          {(page - 1) * policies.length + policies.length} of {totalCount} policies
        </span>
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
};

export default LeavePolicyTable;
