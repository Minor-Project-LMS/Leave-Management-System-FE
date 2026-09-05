import { useState } from 'react';
import { EditIcon } from '../icons/Icons';
import './EditableInfoCard.css';

// fields: [{ key, label, type ('text' | 'date' | 'select'), options? }]
// values: { [key]: value }. onSave(values) -> Promise
const EditableInfoCard = ({ title, fields, values, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(values);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const startEdit = () => {
    setDraft(values);
    setError('');
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(values);
    setError('');
    setEditing(false);
  };

  const handleChange = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await onSave(draft);
      setEditing(false);
    } catch (err) {
      setError(err?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="editable-info-card">
      <div className="widget-header">
        <h3>{title}</h3>
        {!editing && (
          <button className="editable-info-edit-btn" onClick={startEdit}>
            <EditIcon width={14} height={14} />
            Edit
          </button>
        )}
      </div>

      {error && <div className="editable-info-error">{error}</div>}

      <dl className="editable-info-list">
        {fields.map((field) => (
          <div className="editable-info-row" key={field.key}>
            <dt>{field.label}</dt>
            {editing ? (
              field.type === 'select' ? (
                <select value={draft[field.key] ?? ''} onChange={(e) => handleChange(field.key, e.target.value)}>
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  value={draft[field.key] ?? ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              )
            ) : (
              <dd>{(field.format ? field.format(values[field.key]) : values[field.key]) || '—'}</dd>
            )}
          </div>
        ))}
      </dl>

      {editing && (
        <div className="editable-info-actions">
          <button className="editable-info-btn cancel" onClick={cancelEdit} disabled={saving}>
            Cancel
          </button>
          <button className="editable-info-btn save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
};

export default EditableInfoCard;
