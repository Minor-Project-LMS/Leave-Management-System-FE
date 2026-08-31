import { useState } from 'react';
import { XIcon } from '../icons/Icons';
import './CreateDelegationModal.css';

const toDateInput = (iso) => (iso ? iso.slice(0, 10) : '');

// editing: an existing Delegation to prefill (omit for create mode).
const CreateDelegationModal = ({ teamMembers = [], departments = [], categories = [], editing, onCancel, onSubmit, submitting }) => {
  const [delegateId, setDelegateId] = useState(editing?.delegateId ? String(editing.delegateId) : '');
  const [startDate, setStartDate] = useState(toDateInput(editing?.startDate));
  const [endDate, setEndDate] = useState(toDateInput(editing?.endDate));
  const [allDepartments, setAllDepartments] = useState(!editing?.departmentIds?.length);
  const [departmentIds, setDepartmentIds] = useState(editing?.departmentIds || []);
  const [allCategories, setAllCategories] = useState(!editing?.categoryIds?.length);
  const [categoryIds, setCategoryIds] = useState(editing?.categoryIds || []);
  const [error, setError] = useState('');

  const toggleDepartment = (id) => {
    setDepartmentIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  };

  const toggleCategory = (id) => {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const handleSubmit = () => {
    if (!delegateId) {
      setError('Please choose who to delegate to.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Please choose a start and end date.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be before the start date.');
      return;
    }

    onSubmit({
      delegateId: Number(delegateId),
      startDate,
      endDate,
      departmentIds: allDepartments ? [] : departmentIds,
      categoryIds: allCategories ? [] : categoryIds,
    });
  };

  return (
    <div className="delegation-modal-backdrop" onClick={onCancel}>
      <div className="delegation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delegation-modal-header">
          <h3>{editing ? 'Edit Delegation' : 'Create Delegation'}</h3>
          <button onClick={onCancel} aria-label="Close">
            <XIcon width={18} height={18} />
          </button>
        </div>

        {error && <div className="delegation-modal-error">{error}</div>}

        <div className="form-field">
          <label>Delegate To</label>
          <select value={delegateId} onChange={(e) => setDelegateId(e.target.value)} disabled={!!editing}>
            <option value="">Select a team member</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName} {m.designation ? `— ${m.designation}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="delegation-modal-dates">
          <div className="form-field">
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="form-field">
            <label>End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="delegation-modal-scope">
          <label className="delegation-modal-scope-label">Departments</label>
          <label className="delegation-modal-checkbox">
            <input type="checkbox" checked={allDepartments} onChange={(e) => setAllDepartments(e.target.checked)} />
            All Departments
          </label>
          {!allDepartments && (
            <div className="delegation-modal-chip-list">
              {departments.map((d) => (
                <label key={d.id} className="delegation-modal-checkbox">
                  <input
                    type="checkbox"
                    checked={departmentIds.includes(d.id)}
                    onChange={() => toggleDepartment(d.id)}
                  />
                  {d.departmentName || d.name}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="delegation-modal-scope">
          <label className="delegation-modal-scope-label">Leave Types</label>
          <label className="delegation-modal-checkbox">
            <input type="checkbox" checked={allCategories} onChange={(e) => setAllCategories(e.target.checked)} />
            All Leave Types
          </label>
          {!allCategories && (
            <div className="delegation-modal-chip-list">
              {categories.map((c) => (
                <label key={c.categoryId || c.id} className="delegation-modal-checkbox">
                  <input
                    type="checkbox"
                    checked={categoryIds.includes(c.categoryId ?? c.id)}
                    onChange={() => toggleCategory(c.categoryId ?? c.id)}
                  />
                  {c.categoryName}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="delegation-modal-actions">
          <button className="delegation-modal-cancel" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button className="delegation-modal-confirm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Create Delegation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDelegationModal;
