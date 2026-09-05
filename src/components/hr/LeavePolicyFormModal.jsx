import { useState } from 'react';
import { XIcon } from '../icons/Icons';
import './LeavePolicyFormModal.css';

const toDateInput = (iso) => (iso ? iso.slice(0, 10) : '');

const ACCRUAL_OPTIONS = [
  { value: 'ANNUAL', label: 'Yearly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
];

// editing: an existing LeavePolicy to prefill (omit for create mode).
const LeavePolicyFormModal = ({ categories = [], departments = [], editing, onCancel, onSubmit, submitting }) => {
  const [form, setForm] = useState({
    policyName: editing?.policyName || '',
    policyCode: editing?.policyCode || '',
    categoryId: editing?.categoryId || '',
    departmentId: editing?.departmentId || '',
    annualQuota: editing?.annualQuota ?? '',
    maxCarryForward: editing?.maxCarryForward ?? '',
    minNoticeDays: editing?.minNoticeDays ?? '',
    maxConsecutiveDays: editing?.maxConsecutiveDays ?? '',
    accrualFrequency: editing?.accrualFrequency || 'MONTHLY',
    effectiveFrom: toDateInput(editing?.effectiveFrom) || toDateInput(new Date().toISOString()),
    status: editing?.status || 'DRAFT',
  });
  const [error, setError] = useState('');

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.categoryId) return setError('Please select a leave type.');
    if (form.annualQuota === '') return setError('Please enter an annual quota.');
    if (!form.effectiveFrom) return setError('Please select an effective-from date.');

    setError('');
    onSubmit({
      policyName: form.policyName.trim() || undefined,
      policyCode: form.policyCode.trim() || undefined,
      categoryId: Number(form.categoryId),
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      annualQuota: Number(form.annualQuota),
      maxCarryForward: form.maxCarryForward === '' ? undefined : Number(form.maxCarryForward),
      minNoticeDays: form.minNoticeDays === '' ? undefined : Number(form.minNoticeDays),
      maxConsecutiveDays: form.maxConsecutiveDays === '' ? undefined : Number(form.maxConsecutiveDays),
      accrualFrequency: form.accrualFrequency,
      effectiveFrom: form.effectiveFrom,
      status: form.status,
    });
  };

  return (
    <div className="policy-modal-backdrop" onClick={onCancel}>
      <div className="policy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="policy-modal-header">
          <h3>{editing ? 'Edit Policy' : 'Create New Policy'}</h3>
          <button onClick={onCancel} aria-label="Close">
            <XIcon width={18} height={18} />
          </button>
        </div>

        {error && <div className="policy-modal-error">{error}</div>}

        <div className="policy-modal-grid">
          <div className="form-field">
            <label>Policy Name</label>
            <input
              type="text"
              placeholder="e.g. Casual Leave Policy"
              value={form.policyName}
              onChange={(e) => set('policyName', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Policy Code</label>
            <input
              type="text"
              placeholder="e.g. PCL-CL-002"
              value={form.policyCode}
              onChange={(e) => set('policyCode', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Leave Type</label>
            <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
              <option value="">Select leave type</option>
              {categories.map((c) => (
                <option key={c.id || c.categoryId} value={c.id || c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Department (optional)</label>
            <select value={form.departmentId} onChange={(e) => set('departmentId', e.target.value)}>
              <option value="">Organization-wide</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.departmentName || d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Annual Quota (days)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={form.annualQuota}
              onChange={(e) => set('annualQuota', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Accrual Frequency</label>
            <select value={form.accrualFrequency} onChange={(e) => set('accrualFrequency', e.target.value)}>
              {ACCRUAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Max Carry Forward (days)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={form.maxCarryForward}
              onChange={(e) => set('maxCarryForward', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Max Consecutive Days</label>
            <input
              type="number"
              min="0"
              value={form.maxConsecutiveDays}
              onChange={(e) => set('maxConsecutiveDays', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Min Notice (days)</label>
            <input
              type="number"
              min="0"
              value={form.minNoticeDays}
              onChange={(e) => set('minNoticeDays', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Effective From</label>
            <input type="date" value={form.effectiveFrom} onChange={(e) => set('effectiveFrom', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <div className="policy-modal-actions">
          <button className="policy-modal-cancel" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button className="policy-modal-confirm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Create Policy'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeavePolicyFormModal;
