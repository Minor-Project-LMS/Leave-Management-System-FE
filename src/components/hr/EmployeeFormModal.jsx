import { useState } from 'react';
import { XIcon } from '../icons/Icons';
import './EmployeeFormModal.css';

const toDateInput = (iso) => (iso ? iso.slice(0, 10) : '');

const ROLES = ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'];
const EMPLOYMENT_TYPES = ['Full Time', 'Part Time', 'Contract', 'Intern'];
const STATUSES = ['ACTIVE', 'ON_LEAVE', 'SEPARATED'];

// editing: an existing Employee to prefill (omit for create mode).
const EmployeeFormModal = ({ departments = [], managers = [], editing, onCancel, onSubmit, submitting }) => {
  const [form, setForm] = useState({
    fullName: editing?.fullName || '',
    email: editing?.email || '',
    phone: editing?.phone || '',
    role: editing?.role || 'EMPLOYEE',
    departmentId: editing?.departmentId || '',
    designation: editing?.designation || '',
    reportsTo: editing?.reportsTo || '',
    dateOfJoining: toDateInput(editing?.dateOfJoining) || toDateInput(new Date().toISOString()),
    employmentStatus: editing?.employmentStatus || 'ACTIVE',
    workLocation: editing?.workLocation || '',
    employmentType: editing?.employmentType || 'Full Time',
  });
  const [error, setError] = useState('');

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.fullName.trim()) return setError('Please enter the employee\u2019s full name.');
    if (!form.email.trim()) return setError('Please enter an email address.');
    if (!form.departmentId) return setError('Please select a department.');
    if (!form.dateOfJoining) return setError('Please select a date of joining.');

    setError('');
    onSubmit({
      ...form,
      departmentId: Number(form.departmentId),
      reportsTo: form.reportsTo ? Number(form.reportsTo) : null,
    });
  };

  return (
    <div className="employee-modal-backdrop" onClick={onCancel}>
      <div className="employee-modal" onClick={(e) => e.stopPropagation()}>
        <div className="employee-modal-header">
          <h3>{editing ? 'Edit Employee' : 'Add Employee'}</h3>
          <button onClick={onCancel} aria-label="Close">
            <XIcon width={18} height={18} />
          </button>
        </div>

        {error && <div className="employee-modal-error">{error}</div>}

        <div className="employee-modal-grid">
          <div className="form-field">
            <label>Full Name</label>
            <input type="text" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Email Address</label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Phone Number</label>
            <input type="text" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Role</label>
            <select value={form.role} onChange={(e) => set('role', e.target.value)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Department</label>
            <select value={form.departmentId} onChange={(e) => set('departmentId', e.target.value)}>
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.departmentName || d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Designation</label>
            <input type="text" value={form.designation} onChange={(e) => set('designation', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Reporting Manager</label>
            <select value={form.reportsTo} onChange={(e) => set('reportsTo', e.target.value)}>
              <option value="">None</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Date of Joining</label>
            <input type="date" value={form.dateOfJoining} onChange={(e) => set('dateOfJoining', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Employment Status</label>
            <select value={form.employmentStatus} onChange={(e) => set('employmentStatus', e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Work Location</label>
            <input type="text" value={form.workLocation} onChange={(e) => set('workLocation', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Employment Type</label>
            <select value={form.employmentType} onChange={(e) => set('employmentType', e.target.value)}>
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="employee-modal-actions">
          <button className="employee-modal-cancel" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button className="employee-modal-confirm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Add Employee'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFormModal;
