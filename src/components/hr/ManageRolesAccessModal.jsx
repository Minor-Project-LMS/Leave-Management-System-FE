import { useState, useEffect, useMemo } from 'react';
import { XIcon, SearchIcon, ShieldIcon } from '../icons/Icons';
import { getAvatarColor, getInitials } from '../../utils/avatarColor';
import { apiService } from '../../services/api';
import { env } from '../../config/env';
import { mockRoles, mockEmployees } from '../../utils/mockData';
import './ManageRolesAccessModal.css';

const USE_MOCK = env.useMockData;

const getErrorMessage = (err, fallback) => {
  if (typeof err === 'string') return err;
  if (err?.response?.data?.error?.message) return err.response.data.error.message;
  if (typeof err?.message === 'string') return err.message;
  return fallback;
};

// There's no granular permissions system on the backend — just a fixed set
// of system roles (EMPLOYEE/MANAGER/HR_ADMIN, via GET /roles) and a
// per-employee role field editable through PATCH /employees/{id}. This
// modal is built around what actually exists rather than a fictional
// permissions matrix: role reference cards up top, then a searchable list
// to reassign any employee's role.
const ManageRolesAccessModal = ({ onClose, onChanged }) => {
  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [pendingRole, setPendingRole] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [savedId, setSavedId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');

      if (USE_MOCK) {
        setRoles(mockRoles);
        setEmployees(mockEmployees.map((e) => ({ ...e })));
        setLoading(false);
        return;
      }

      try {
        const [rolesRes, employeesRes] = await Promise.all([
          apiService.getRoles(),
          apiService.getEmployees({ limit: 100 }),
        ]);
        if (cancelled) return;
        setRoles(rolesRes?.data ?? rolesRes ?? []);
        const data = (employeesRes?.data ?? []).map((e) => ({ ...e, fullName: e.fullName ?? e.name }));
        setEmployees(data);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err, 'Failed to load roles and employees.'));
        setRoles(mockRoles);
        setEmployees(mockEmployees.map((e) => ({ ...e })));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return employees;
    const q = search.trim().toLowerCase();
    return employees.filter(
      (e) =>
        e.fullName?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.employeeCode?.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const handleSave = async (employee) => {
    const newRole = pendingRole[employee.id];
    if (!newRole || newRole === employee.role) return;

    setSavingId(employee.id);
    setError('');
    try {
      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 400));
      } else {
        await apiService.updateEmployee(employee.id, { role: newRole });
      }
      setEmployees((prev) => prev.map((e) => (e.id === employee.id ? { ...e, role: newRole } : e)));
      setPendingRole((prev) => {
        const next = { ...prev };
        delete next[employee.id];
        return next;
      });
      setSavedId(employee.id);
      setTimeout(() => setSavedId((id) => (id === employee.id ? null : id)), 1500);
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err, `Failed to update ${employee.fullName}'s role.`));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="employee-modal-backdrop" onClick={onClose}>
      <div className="employee-modal roles-access-modal" onClick={(e) => e.stopPropagation()}>
        <div className="employee-modal-header">
          <h3>Manage Roles &amp; Access</h3>
          <button onClick={onClose} aria-label="Close">
            <XIcon width={18} height={18} />
          </button>
        </div>

        {error && <div className="employee-modal-error">{error}</div>}

        <div className="roles-access-role-cards">
          {roles.map((r) => (
            <div key={r.roleCode} className={`roles-access-role-card role-${r.roleCode.toLowerCase()}`}>
              <span className="roles-access-role-icon">
                <ShieldIcon width={16} height={16} />
              </span>
              <div>
                <strong>{r.roleCode.replace('_', ' ')}</strong>
                <p>{r.roleDescription}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="roles-access-search">
          <SearchIcon width={15} height={15} />
          <input
            type="text"
            placeholder="Search employees by name, ID or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="widget-empty">Loading employees...</p>
        ) : (
          <div className="roles-access-table-wrap">
            <table className="roles-access-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Current Role</th>
                  <th>Change To</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => {
                  const color = getAvatarColor(emp.fullName);
                  const draft = pendingRole[emp.id] ?? emp.role ?? '';
                  const isDirty = draft !== (emp.role ?? '');

                  return (
                    <tr key={emp.id}>
                      <td>
                        <div className="roles-access-person">
                          <span
                            className="roles-access-avatar"
                            style={{ background: color.bg, color: color.fg }}
                          >
                            {getInitials(emp.fullName)}
                          </span>
                          <div>
                            <span className="roles-access-name">{emp.fullName}</span>
                            <span className="roles-access-email">{emp.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`roles-access-badge role-${(emp.role || 'employee').toLowerCase()}`}>
                          {(emp.role || '—').replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <select
                          value={draft}
                          onChange={(e) =>
                            setPendingRole((prev) => ({ ...prev, [emp.id]: e.target.value }))
                          }
                        >
                          {roles.map((r) => (
                            <option key={r.roleCode} value={r.roleCode}>
                              {r.roleCode.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {isDirty && (
                          <button
                            className="roles-access-save-btn"
                            disabled={savingId === emp.id}
                            onClick={() => handleSave(emp)}
                          >
                            {savingId === emp.id ? 'Saving...' : 'Save'}
                          </button>
                        )}
                        {!isDirty && savedId === emp.id && <span className="roles-access-saved">Saved</span>}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="4" className="widget-empty">
                      No employees match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRolesAccessModal;
