import { XIcon, MinusIcon, PlusIcon } from '../icons/Icons';
import './DiffViewerModal.css';

const DiffViewerModal = ({ isOpen, onClose, entry, loading = false }) => {
  if (!isOpen) return null;

  const formatJSON = (obj) => {
    if (!obj) return null;
    try {
      return typeof obj === 'string' ? JSON.parse(obj) : obj;
    } catch {
      return obj;
    }
  };

  const beforeState = formatJSON(entry?.beforeState);
  const afterState = formatJSON(entry?.afterState);

  const renderJSONValue = (value) => {
    if (value === null) return <span className="json-null">null</span>;
    if (value === undefined) return <span className="json-undefined">undefined</span>;
    if (typeof value === 'boolean') return <span className="json-boolean">{String(value)}</span>;
    if (typeof value === 'number') return <span className="json-number">{value}</span>;
    if (typeof value === 'string') return <span className="json-string">"{value}"</span>;
    return String(value);
  };

  const renderJSONObject = (obj, depth = 0) => {
    if (obj === null || obj === undefined) {
      return <span className="json-null">null</span>;
    }

    if (typeof obj !== 'object') {
      return renderJSONValue(obj);
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return <span className="json-bracket">[]</span>;
      return (
        <span className="json-bracket">
          [
          {obj.map((item, index) => (
            <div key={index} className="json-array-item" style={{ paddingLeft: `${(depth + 1) * 20}px` }}>
              {renderJSONObject(item, depth + 1)}
              {index < obj.length - 1 && ','}
            </div>
          ))}
          <div style={{ paddingLeft: `${depth * 20}px` }}>]</div>
        </span>
      );
    }

    const keys = Object.keys(obj);
    if (keys.length === 0) return <span className="json-bracket">{{}}</span>;

    return (
      <span className="json-bracket">
        {'{'}
        {keys.map((key, index) => (
          <div key={key} className="json-object-item" style={{ paddingLeft: `${(depth + 1) * 20}px` }}>
            <span className="json-key">"{key}"</span>
            <span className="json-colon">: </span>
            {renderJSONObject(obj[key], depth + 1)}
            {index < keys.length - 1 && ','}
          </div>
        ))}
        <div style={{ paddingLeft: `${depth * 20}px` }}>{'}'}</div>
      </span>
    );
  };

  const compareAndRenderDiff = (before, after) => {
    if (!before && !after) {
      return <div className="diff-empty">No state changes recorded</div>;
    }

    if (!before) {
      return (
        <div className="diff-create">
          <div className="diff-indicator diff-create-indicator">
            <PlusIcon width={16} height={16} />
            <span>Initial State (New Record)</span>
          </div>
          <div className="json-viewer after-state">
            {renderJSONObject(after)}
          </div>
        </div>
      );
    }

    if (!after) {
      return (
        <div className="diff-delete">
          <div className="diff-indicator diff-delete-indicator">
            <MinusIcon width={16} height={16} />
            <span>Deleted State</span>
          </div>
          <div className="json-viewer before-state">
            {renderJSONObject(before)}
          </div>
        </div>
      );
    }

    // Simple diff comparison
    const changes = [];
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

    allKeys.forEach((key) => {
      const beforeValue = before[key];
      const afterValue = after[key];

      if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
        changes.push({
          key,
          before: beforeValue,
          after: afterValue,
          type: beforeValue === undefined ? 'added' : afterValue === undefined ? 'removed' : 'modified',
        });
      }
    });

    if (changes.length === 0) {
      return (
        <div className="diff-no-changes">
          <div className="diff-indicator diff-no-changes-indicator">
            <span>No changes detected</span>
          </div>
          <div className="json-viewer identical-state">
            {renderJSONObject(after)}
          </div>
        </div>
      );
    }

    return (
      <div className="diff-changes">
        {changes.map((change, index) => (
          <div key={index} className={`diff-change-item diff-${change.type}`}>
            <div className="diff-change-header">
              <span className="diff-change-key">"{change.key}"</span>
              <span className={`diff-change-type diff-${change.type}-badge`}>
                {change.type}
              </span>
            </div>
            <div className="diff-change-content">
              {change.before !== undefined && (
                <div className="diff-change-side before">
                  <div className="diff-change-label">Before:</div>
                  <div className="diff-change-value">{renderJSONObject(change.before)}</div>
                </div>
              )}
              {change.after !== undefined && (
                <div className="diff-change-side after">
                  <div className="diff-change-label">After:</div>
                  <div className="diff-change-value">{renderJSONObject(change.after)}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="diff-modal-overlay" onClick={onClose}>
      <div className="diff-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="diff-modal-header">
          <div className="diff-modal-title">
            <h2>State Changes</h2>
            {entry && (
              <div className="diff-modal-entry-info">
                <span className="diff-entry-action">{entry.action}</span>
                <span className="diff-entry-entity">{entry.entityType}</span>
                <span className="diff-entry-id">#{entry.entityId}</span>
              </div>
            )}
          </div>
          <button
            className="diff-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <XIcon width={20} height={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="diff-modal-content">
          {loading ? (
            <div className="diff-loading">
              <div className="diff-loading-spinner" />
              <p>Loading state changes...</p>
            </div>
          ) : (
            <div className="diff-viewer">
              {compareAndRenderDiff(beforeState, afterState)}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="diff-modal-footer">
          <div className="diff-legend">
            <div className="diff-legend-item">
              <div className="diff-legend-color added" />
              <span>Added</span>
            </div>
            <div className="diff-legend-item">
              <div className="diff-legend-color removed" />
              <span>Removed</span>
            </div>
            <div className="diff-legend-item">
              <div className="diff-legend-color modified" />
              <span>Modified</span>
            </div>
          </div>
          <button className="diff-modal-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiffViewerModal;