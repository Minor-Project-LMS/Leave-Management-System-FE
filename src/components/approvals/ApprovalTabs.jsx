import { useState } from 'react';
import { FilterIcon, ChevronDownIcon } from '../icons/Icons';
import './ApprovalTabs.css';

const TABS = [
  { key: 'ALL', label: 'All Requests' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

const ApprovalTabs = ({ activeStatus, onStatusChange, counts, sort, onSortChange }) => {
  const [sortOpen, setSortOpen] = useState(false);

  const countKey = { ALL: 'all', PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected' };

  return (
    <div className="approval-tabs-row">
      <div className="approval-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`approval-tab ${activeStatus === tab.key ? 'active' : ''}`}
            onClick={() => onStatusChange(tab.key)}
          >
            {tab.label}
            <span className="approval-tab-count">{counts?.[countKey[tab.key]] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="approval-tabs-actions">
        <button className="approval-filter-btn">
          <FilterIcon width={15} height={15} />
          Filter
        </button>

        <div className="approval-sort-wrap">
          <button className="approval-sort-btn" onClick={() => setSortOpen((v) => !v)}>
            Sort By: {sort === 'oldest' ? 'Oldest' : 'Newest'}
            <ChevronDownIcon width={14} height={14} />
          </button>
          {sortOpen && (
            <div className="approval-sort-menu">
              <button
                onClick={() => {
                  onSortChange('newest');
                  setSortOpen(false);
                }}
              >
                Newest
              </button>
              <button
                onClick={() => {
                  onSortChange('oldest');
                  setSortOpen(false);
                }}
              >
                Oldest
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalTabs;
