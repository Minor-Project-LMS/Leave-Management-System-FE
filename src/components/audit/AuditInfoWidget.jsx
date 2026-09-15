import { ShieldIcon, ClockIcon, DatabaseIcon, RefreshCwIcon } from '../icons/Icons';
import './AuditInfoWidget.css';

const AuditInfoWidget = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="audit-info-widget loading">
        <div className="widget-header">
          <h3>Audit Info</h3>
        </div>
        <div className="audit-info-skeleton">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="audit-info-skeleton-item" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="audit-info-widget">
      <div className="widget-header">
        <h3>Audit Info</h3>
      </div>

      <div className="audit-info-content">
        <div className="audit-info-item">
          <div className="audit-info-icon">
            <ClockIcon width={18} height={18} />
          </div>
          <div className="audit-info-details">
            <div className="audit-info-label">Retention Period</div>
            <div className="audit-info-value">{data.retentionPeriod} Days</div>
          </div>
        </div>

        <div className="audit-info-item">
          <div className="audit-info-icon">
            <ShieldIcon width={18} height={18} />
          </div>
          <div className="audit-info-details">
            <div className="audit-info-label">Log Integrity</div>
            <div className={`audit-info-value ${data.logIntegrity ? 'enabled' : 'disabled'}`}>
              {data.logIntegrity ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>

        <div className="audit-info-item">
          <div className="audit-info-icon">
            <DatabaseIcon width={18} height={18} />
          </div>
          <div className="audit-info-details">
            <div className="audit-info-label">Last Backup</div>
            <div className="audit-info-value">{formatDate(data.lastBackup)}</div>
          </div>
        </div>

        <div className="audit-info-item">
          <div className="audit-info-icon">
            <RefreshCwIcon width={18} height={18} />
          </div>
          <div className="audit-info-details">
            <div className="audit-info-label">Next Backup</div>
            <div className="audit-info-value">{formatDate(data.nextBackup)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditInfoWidget;