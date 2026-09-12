import { UsersIcon, CheckCircleIcon, XCircleIcon, TrendUpIcon } from '../icons/Icons';
import './ActivitySummaryWidget.css';

const ActivitySummaryWidget = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="activity-summary-widget loading">
        <div className="widget-header">
          <h3>Activity Summary</h3>
        </div>
        <div className="activity-summary-skeleton">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="activity-skeleton-item" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const successRate = data.totalActivities > 0 
    ? ((data.successful / data.totalActivities) * 100).toFixed(1)
    : 0;

  return (
    <div className="activity-summary-widget">
      <div className="widget-header">
        <h3>Activity Summary</h3>
        <select className="activity-timeframe-select">
          <option>This Year</option>
          <option>This Month</option>
          <option>This Week</option>
          <option>Today</option>
        </select>
      </div>

      <div className="activity-summary-content">
        <div className="activity-summary-total">
          <div className="activity-total-label">Total Activities</div>
          <div className="activity-total-value">{data.totalActivities.toLocaleString()}</div>
        </div>

        <div className="activity-summary-stats">
          <div className="activity-stat-item success">
            <div className="activity-stat-icon">
              <CheckCircleIcon width={20} height={20} />
            </div>
            <div className="activity-stat-info">
              <div className="activity-stat-value">{data.successful.toLocaleString()}</div>
              <div className="activity-stat-label">Successful</div>
            </div>
          </div>

          <div className="activity-stat-item failed">
            <div className="activity-stat-icon">
              <XCircleIcon width={20} height={20} />
            </div>
            <div className="activity-stat-info">
              <div className="activity-stat-value">{data.failed.toLocaleString()}</div>
              <div className="activity-stat-label">Failed</div>
            </div>
          </div>

          <div className="activity-stat-item users">
            <div className="activity-stat-icon">
              <UsersIcon width={20} height={20} />
            </div>
            <div className="activity-stat-info">
              <div className="activity-stat-value">{data.uniqueUsers.toLocaleString()}</div>
              <div className="activity-stat-label">Unique Users</div>
            </div>
          </div>
        </div>

        <div className="activity-summary-rate">
          <div className="activity-rate-label">Success Rate</div>
          <div className="activity-rate-bar">
            <div 
              className="activity-rate-fill"
              style={{ width: `${successRate}%` }}
            />
          </div>
          <div className="activity-rate-value">{successRate}%</div>
        </div>
      </div>
    </div>
  );
};

export default ActivitySummaryWidget;