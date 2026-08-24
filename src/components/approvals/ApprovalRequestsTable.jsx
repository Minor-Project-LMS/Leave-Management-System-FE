import StatusBadge from '../dashboard/StatusBadge';
import LeaveTypeBadge from './LeaveTypeBadge';
import { getAvatarColor, getInitials } from '../../utils/avatarColor';
import { CheckIcon, XIcon } from '../icons/Icons';
import './ApprovalRequestsTable.css';

const STATUS_DISPLAY = {
  PENDING_L1: 'Pending',
  PENDING_L2: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const formatDateRange = (start, end) => {
  const opts = { day: '2-digit', month: 'short', year: 'numeric' };
  const s = new Date(start).toLocaleDateString('en-US', opts);
  if (start === end) return s;
  const e = new Date(end).toLocaleDateString('en-US', opts);
  return `${s} - ${e}`;
};

const ApprovalRequestsTable = ({
  requests = [],
  selectedId,
  onSelect,
  onApprove,
  onReject,
  page,
  totalPages,
  totalCount,
  onPageChange,
}) => {
  if (requests.length === 0) {
    return <p className="widget-empty">No requests in this view.</p>;
  }

  return (
    <div className="approval-table-wrap">
      <table className="approval-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Leave Type</th>
            <th>Dates</th>
            <th>Days</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => {
            const color = getAvatarColor(req.employeeName);
            const isPending = req.status === 'PENDING_L1' || req.status === 'PENDING_L2';
            const isSelected = selectedId === req.id;

            return (
              <tr
                key={req.id}
                className={isSelected ? 'row-selected' : ''}
                onClick={() => onSelect(req.id)}
              >
                <td>
                  <div className="approval-table-employee">
                    <span
                      className="approval-table-avatar"
                      style={{ background: color.bg, color: color.fg }}
                    >
                      {getInitials(req.employeeName)}
                    </span>
                    <div className="approval-table-employee-info">
                      <span className="approval-table-name">{req.employeeName}</span>
                      <span className="approval-table-team">{req.departmentName}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <LeaveTypeBadge categoryCode={req.categoryCode} categoryName={req.categoryName} />
                </td>
                <td className="approval-table-dates">{formatDateRange(req.startDate, req.endDate)}</td>
                <td>{req.totalDays}</td>
                <td className="approval-table-reason" title={req.reason}>
                  {req.reason}
                </td>
                <td>
                  <StatusBadge status={STATUS_DISPLAY[req.status] || req.status} />
                </td>
                <td>
                  <div className="approval-table-actions" onClick={(e) => e.stopPropagation()}>
                    {isPending && (
                      <>
                        <button
                          className="approval-action-btn approve"
                          title="Approve"
                          onClick={() => onApprove(req)}
                        >
                          <CheckIcon width={15} height={15} />
                        </button>
                        <button
                          className="approval-action-btn reject"
                          title="Reject"
                          onClick={() => onReject(req)}
                        >
                          <XIcon width={15} height={15} />
                        </button>
                      </>
                    )}
                    <button className="approval-action-link" onClick={() => onSelect(req.id)}>
                      View
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="approval-table-footer">
        <span className="approval-table-count">
          Showing {requests.length === 0 ? 0 : (page - 1) * requests.length + 1} to{' '}
          {(page - 1) * requests.length + requests.length} of {totalCount} requests
        </span>
        {totalPages > 1 && (
          <div className="approval-table-pagination">
            <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalRequestsTable;
