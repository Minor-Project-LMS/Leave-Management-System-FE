import { PalmTreeIcon, HeartPulseIcon, BriefcaseIcon, ClockIcon } from '../icons/Icons';
import './LeaveBalanceSummary.css';

const CATEGORY_ICON = {
  CL: { icon: PalmTreeIcon, tone: 'green' },
  SL: { icon: HeartPulseIcon, tone: 'blue' },
  EL: { icon: BriefcaseIcon, tone: 'purple' },
  CO: { icon: ClockIcon, tone: 'amber' },
};

// ledger: LeaveLedgerSummary[] — "total" is computed as
// openingBalance + accrued + carriedForward (schema has no single
// "total allocated" field), "available" is availableBalance directly.
const LeaveBalanceSummary = ({ ledger = [], categoryCodeById = {} }) => (
  <div className="leave-balance-summary">
    <div className="widget-header">
      <h3>Leave Balance Summary</h3>
    </div>
    <ul className="leave-balance-list">
      {ledger.map((row) => {
        const code = categoryCodeById[row.categoryId] || row.categoryName?.slice(0, 2).toUpperCase();
        const { icon: Icon, tone } = CATEGORY_ICON[code] || { icon: ClockIcon, tone: 'blue' };
        const total = (row.openingBalance || 0) + (row.accrued || 0) + (row.carriedForward || 0);

        return (
          <li key={row.categoryId}>
            <span className={`leave-balance-icon tone-${tone}`}>
              <Icon width={18} height={18} />
            </span>
            <div className="leave-balance-info">
              <span className="leave-balance-name">{row.categoryName}</span>
              <span className="leave-balance-code">({code})</span>
            </div>
            <div className="leave-balance-value">
              <span className="leave-balance-available">
                {row.availableBalance}
                <span className="leave-balance-total">/{total}</span>
              </span>
              <span className="leave-balance-label">Days</span>
            </div>
          </li>
        );
      })}
    </ul>
  </div>
);

export default LeaveBalanceSummary;
