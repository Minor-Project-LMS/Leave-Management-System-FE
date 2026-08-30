import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from '../icons/Icons';
import './ChangePasswordCard.css';

const FIELD_DEFS = [
  { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
  { key: 'next', label: 'New Password', placeholder: 'Enter new password' },
  { key: 'confirm', label: 'Confirm New Password', placeholder: 'Confirm new password' },
];

const ChangePasswordCard = ({ onSubmit }) => {
  const [values, setValues] = useState({ current: '', next: '', confirm: '' });
  const [visible, setVisible] = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));
  const toggleVisible = (key) => setVisible((prev) => ({ ...prev, [key]: !prev[key] }));

  const validate = () => {
    if (!values.current) return 'Please enter your current password.';
    if (values.next.length < 8) return 'New password must be at least 8 characters.';
    if (values.next !== values.confirm) return 'New password and confirmation do not match.';
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setSuccess('');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await onSubmit(values.current, values.next);
      setSuccess('Password updated successfully.');
      setValues({ current: '', next: '', confirm: '' });
    } catch (err) {
      setError(err?.message || 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="change-password-card">
      <div className="widget-header">
        <h3>Change Password</h3>
      </div>

      {error && <div className="apply-leave-alert error">{error}</div>}
      {success && <div className="apply-leave-alert success">{success}</div>}

      <div className="change-password-grid">
        {FIELD_DEFS.map((field) => (
          <div className="form-field" key={field.key}>
            <label>{field.label}</label>
            <div className="change-password-input-wrap">
              <input
                type={visible[field.key] ? 'text' : 'password'}
                placeholder={field.placeholder}
                value={values[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
              <button
                type="button"
                className="change-password-toggle"
                onClick={() => toggleVisible(field.key)}
                aria-label={visible[field.key] ? 'Hide password' : 'Show password'}
              >
                {visible[field.key] ? <EyeOffIcon width={16} height={16} /> : <EyeIcon width={16} height={16} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="change-password-actions">
        <button className="change-password-submit" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordCard;
