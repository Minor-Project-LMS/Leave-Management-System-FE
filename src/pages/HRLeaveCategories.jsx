import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { HR_PORTAL } from '../config/navConfig';
import { env } from '../config/env';
import { apiService } from '../services/api';
import {
  ArchiveIcon,
  CheckCircleIcon,
  ClipboardListIcon,
  EditIcon,
  FilterIcon,
  MoreVerticalIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  UsersIcon,
  XIcon,
} from '../components/icons/Icons';
import './HRLeaveCategories.css';

const PAGE_SIZE = 8;
const USE_MOCK = env.useMockData;

const SAMPLE_CATEGORIES = [
  { id: 1, categoryName: 'Casual Leave', categoryCode: 'CL', categoryType: 'STANDARD', applicableTo: 'ALL_EMPLOYEES', isPaid: true, status: 'ACTIVE', isSystem: true, requiresDocument: false, description: 'Leave for personal or short-term needs.' },
  { id: 2, categoryName: 'Sick Leave', categoryCode: 'SL', categoryType: 'STANDARD', applicableTo: 'ALL_EMPLOYEES', isPaid: true, status: 'ACTIVE', isSystem: true, requiresDocument: true, description: 'Leave for illness or medical treatment.' },
  { id: 3, categoryName: 'Earned Leave', categoryCode: 'EL', categoryType: 'ACCRUAL', applicableTo: 'ALL_EMPLOYEES', isPaid: true, status: 'ACTIVE', isSystem: true, requiresDocument: false, description: 'Accrued leave earned through service.' },
  { id: 4, categoryName: 'Comp-Off', categoryCode: 'CO', categoryType: 'COMPENSATORY', applicableTo: 'ALL_EMPLOYEES', isPaid: true, status: 'ACTIVE', isSystem: true, requiresDocument: false, description: 'Leave granted for approved extra working days.' },
  { id: 5, categoryName: 'Paternity Leave', categoryCode: 'PL', categoryType: 'SPECIAL', applicableTo: 'MALE_EMPLOYEES', isPaid: true, status: 'ACTIVE', isSystem: true, requiresDocument: false, description: 'Leave available to eligible fathers.' },
  { id: 6, categoryName: 'Maternity Leave', categoryCode: 'ML', categoryType: 'SPECIAL', applicableTo: 'FEMALE_EMPLOYEES', isPaid: true, status: 'ACTIVE', isSystem: true, requiresDocument: false, description: 'Leave available for maternity and related care.' },
  { id: 7, categoryName: 'Unpaid Leave', categoryCode: 'UL', categoryType: 'STANDARD', applicableTo: 'ALL_EMPLOYEES', isPaid: false, status: 'INACTIVE', isSystem: false, requiresDocument: false, description: 'Leave without salary deduction from leave balance.' },
  { id: 8, categoryName: 'Loss of Pay', categoryCode: 'LOP', categoryType: 'STANDARD', applicableTo: 'ALL_EMPLOYEES', isPaid: false, status: 'INACTIVE', isSystem: false, requiresDocument: false, description: 'Leave recorded when paid leave balance is unavailable.' },
  { id: 9, categoryName: 'Bereavement Leave', categoryCode: 'BL', categoryType: 'SPECIAL', applicableTo: 'ALL_EMPLOYEES', isPaid: true, status: 'ACTIVE', isSystem: false, requiresDocument: true, description: 'Leave following the loss of an immediate family member.' },
  { id: 10, categoryName: 'Work From Home', categoryCode: 'WFH', categoryType: 'SPECIAL', applicableTo: 'ALL_EMPLOYEES', isPaid: true, status: 'ACTIVE', isSystem: false, requiresDocument: false, description: 'Approved remote-work category.' },
  { id: 11, categoryName: 'Study Leave', categoryCode: 'STL', categoryType: 'SPECIAL', applicableTo: 'ALL_EMPLOYEES', isPaid: true, status: 'ACTIVE', isSystem: false, requiresDocument: true, description: 'Leave for approved education or certification programs.' },
  { id: 12, categoryName: 'Volunteer Leave', categoryCode: 'VL', categoryType: 'SPECIAL', applicableTo: 'ALL_EMPLOYEES', isPaid: true, status: 'ACTIVE', isSystem: false, requiresDocument: false, description: 'Leave for approved volunteering activities.' },
];

const normalizeCategories = (items) => (Array.isArray(items) ? items : []).map((item, index) => ({
  id: item.id ?? index + 1,
  categoryName: item.categoryName ?? item.name ?? 'Untitled Category',
  categoryCode: item.categoryCode ?? item.code ?? '-',
  categoryType: item.categoryType ?? item.type ?? 'STANDARD',
  applicableTo: item.applicableTo ?? 'ALL_EMPLOYEES',
  isPaid: item.isPaid ?? item.paid ?? true,
  status: item.status ?? 'ACTIVE',
  isSystem: item.isSystem ?? item.systemCategory ?? false,
  requiresDocument: item.requiresDocument ?? false,
  description: item.description ?? '',
}));

const displayApplicableTo = (value) => ({
  ALL_EMPLOYEES: 'All Employees',
  MALE_EMPLOYEES: 'Male Employees',
  FEMALE_EMPLOYEES: 'Female Employees',
  DEPARTMENT_SPECIFIC: 'Department Specific',
})[value] || String(value || '').replaceAll('_', ' ');

const displayType = (value) => ({
  STANDARD: 'Standard',
  ACCRUAL: 'Accrual',
  COMPENSATORY: 'Compensatory',
  SPECIAL: 'Special',
})[value] || value;

const emptyForm = {
  categoryName: '',
  categoryCode: '',
  categoryType: 'STANDARD',
  applicableTo: 'ALL_EMPLOYEES',
  isPaid: true,
  requiresDocument: false,
  description: '',
};

const StatTile = ({ icon: Icon, tone, label, value, sublabel }) => (
  <div className="category-stat-card">
    <div className={`category-stat-icon ${tone || ''}`}><Icon width={20} height={20} /></div>
    <div className="category-stat-copy">
      <span className="category-stat-label">{label}</span>
      <strong>{value}</strong>
      <span className="category-stat-sub">{sublabel}</span>
    </div>
  </div>
);

const CategoryModal = ({ editing, form, setForm, onClose, onSave }) => (
  <div className="category-modal-overlay" onMouseDown={onClose}>
    <form className="category-modal" onSubmit={onSave} onMouseDown={(e) => e.stopPropagation()}>
      <div className="category-modal-header">
        <div>
          <h2>{editing ? 'Edit Leave Category' : 'Add New Category'}</h2>
          <p>Configure the leave category details and eligibility.</p>
        </div>
        <button type="button" className="category-modal-close" onClick={onClose} aria-label="Close"><XIcon width={18} height={18} /></button>
      </div>
      <div className="category-form-grid">
        <label>Category Name<input required value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} placeholder="e.g. Casual Leave" /></label>
        <label>Category Code<input required maxLength={8} value={form.categoryCode} onChange={(e) => setForm({ ...form, categoryCode: e.target.value.toUpperCase() })} placeholder="e.g. CL" /></label>
        <label>Category Type<select value={form.categoryType} onChange={(e) => setForm({ ...form, categoryType: e.target.value })}><option value="STANDARD">Standard</option><option value="ACCRUAL">Accrual</option><option value="COMPENSATORY">Compensatory</option><option value="SPECIAL">Special</option></select></label>
        <label>Applicable To<select value={form.applicableTo} onChange={(e) => setForm({ ...form, applicableTo: e.target.value })}><option value="ALL_EMPLOYEES">All Employees</option><option value="MALE_EMPLOYEES">Male Employees</option><option value="FEMALE_EMPLOYEES">Female Employees</option><option value="DEPARTMENT_SPECIFIC">Department Specific</option></select></label>
        <label className="category-check"><input type="checkbox" checked={form.isPaid} onChange={(e) => setForm({ ...form, isPaid: e.target.checked })} /> Paid Leave</label>
        <label className="category-check"><input type="checkbox" checked={form.requiresDocument} onChange={(e) => setForm({ ...form, requiresDocument: e.target.checked })} /> Requires Document</label>
        <label className="category-textarea">Description<textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description for HR and employees" /></label>
      </div>
      <div className="category-modal-footer"><button type="button" className="category-secondary-btn" onClick={onClose}>Cancel</button><button type="submit" className="category-primary-btn">{editing ? 'Save Changes' : 'Add Category'}</button></div>
    </form>
  </div>
);

const HRLeaveCategories = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState(SAMPLE_CATEGORIES);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [applicableTo, setApplicableTo] = useState('ALL');
  const [page, setPage] = useState(1);
  const [menuId, setMenuId] = useState(null);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    if (USE_MOCK) return undefined;
    setLoading(true);
    apiService.getLeaveCategories('ALL')
      .then((res) => {
        const data = res?.data ?? res;
        if (mounted && Array.isArray(data) && data.length) setCategories(normalizeCategories(data));
      })
      .catch(() => { if (mounted) setError('Could not load categories from the server. Showing sample data.'); })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const stats = useMemo(() => ({
    total: categories.length,
    active: categories.filter((c) => c.status === 'ACTIVE').length,
    inactive: categories.filter((c) => c.status !== 'ACTIVE').length,
    system: categories.filter((c) => c.isSystem).length,
  }), [categories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories.filter((c) => {
      const matchesSearch = !q || [c.categoryName, c.categoryCode, c.description].some((v) => String(v || '').toLowerCase().includes(q));
      const matchesStatus = status === 'ALL' || c.status === status;
      const matchesType = type === 'ALL' || c.categoryType === type;
      const matchesApplicable = applicableTo === 'ALL' || c.applicableTo === applicableTo;
      return matchesSearch && matchesStatus && matchesType && matchesApplicable;
    });
  }, [categories, search, status, type, applicableTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (category) => {
    setEditing(category);
    setForm({ categoryName: category.categoryName, categoryCode: category.categoryCode, categoryType: category.categoryType, applicableTo: category.applicableTo, isPaid: category.isPaid, requiresDocument: category.requiresDocument, description: category.description || '' });
    setModal(true);
    setMenuId(null);
  };

  const saveCategory = (event) => {
    event.preventDefault();
    if (editing) {
      setCategories((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...form } : c));
    } else {
      setCategories((prev) => [...prev, { ...form, id: Date.now(), status: 'ACTIVE', isSystem: false }]);
    }
    setModal(false);
  };

  const toggleStatus = (category) => {
    setCategories((prev) => prev.map((c) => c.id === category.id ? { ...c, status: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : c));
    setMenuId(null);
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const clearFilters = () => { setSearch(''); setStatus('ALL'); setType('ALL'); setApplicableTo('ALL'); setPage(1); };

  return (
    <DashboardLayout title="Leave Categories" breadcrumbs={[{ label: 'HR Dashboard', path: '/hr/dashboard' }, { label: 'Leave Categories' }]} portalLabel={HR_PORTAL.portalLabel} navItems={HR_PORTAL.navItems} searchPlaceholder={HR_PORTAL.searchPlaceholder} user={user} onLogout={handleLogout}>
      <div className="leave-category-page" onClick={() => menuId && setMenuId(null)}>
        {error && <div className="category-error">{error}</div>}

        <div className="category-top-row">
          <div className="category-stat-grid">
            <StatTile icon={ClipboardListIcon} label="Total Categories" value={stats.total} sublabel="All Leave Categories" />
            <StatTile icon={CheckCircleIcon} tone="green" label="Active Categories" value={stats.active} sublabel="Currently Active" />
            <StatTile icon={ArchiveIcon} tone="amber" label="Inactive Categories" value={stats.inactive} sublabel="Currently Inactive" />
            <StatTile icon={ShieldIcon} tone="purple" label="System Categories" value={stats.system} sublabel="Protected by System" />
          </div>
          <button className="category-add-btn" onClick={openCreate}><PlusIcon width={15} height={15} /> Add New Category</button>
        </div>

        <div className="category-filter-bar">
          <div className="category-search"><SearchIcon width={15} height={15} /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by category name or code..." /></div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="ALL">Status: All</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}><option value="ALL">Type: All</option><option value="STANDARD">Standard</option><option value="ACCRUAL">Accrual</option><option value="COMPENSATORY">Compensatory</option><option value="SPECIAL">Special</option></select>
          <select value={applicableTo} onChange={(e) => { setApplicableTo(e.target.value); setPage(1); }}><option value="ALL">Applicable To: All</option><option value="ALL_EMPLOYEES">All Employees</option><option value="MALE_EMPLOYEES">Male Employees</option><option value="FEMALE_EMPLOYEES">Female Employees</option><option value="DEPARTMENT_SPECIFIC">Department Specific</option></select>
          <button className="category-filter-btn" onClick={clearFilters}><FilterIcon width={14} height={14} /> Filter</button>
        </div>

        <div className="category-content-grid">
          <section className="category-table-panel">
            <div className="category-table-wrap">
              <table className="category-table">
                <thead><tr><th>Category Name</th><th>Code</th><th>Category Type</th><th>Applicable To</th><th>Paid / Unpaid</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan="7" className="category-empty">Loading categories...</td></tr> : visible.map((category) => (
                    <tr key={category.id}>
                      <td><div className="category-name-cell"><span className={`category-code-avatar code-${category.categoryCode.toLowerCase()}`}>{category.categoryCode}</span><div><strong>{category.categoryName}</strong><small>{category.description || (category.requiresDocument ? 'Supporting document may be required.' : 'Standard leave category.')}</small></div></div></td>
                      <td><span className="category-code-text">{category.categoryCode}</span></td>
                      <td><span className={`category-type-pill type-${category.categoryType.toLowerCase()}`}>{displayType(category.categoryType)}</span></td>
                      <td><span className="category-applicable">{displayApplicableTo(category.applicableTo)}</span></td>
                      <td><span className={`paid-pill ${category.isPaid ? 'paid' : 'unpaid'}`}>{category.isPaid ? 'Paid' : 'Unpaid'}</span></td>
                      <td><span className={`status-pill ${category.status === 'ACTIVE' ? 'active' : 'inactive'}`}>{category.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span></td>
                      <td><div className="category-actions"><button aria-label={`Actions for ${category.categoryName}`} onClick={(e) => { e.stopPropagation(); setMenuId(menuId === category.id ? null : category.id); }}><MoreVerticalIcon width={16} height={16} /></button>{menuId === category.id && <div className="category-action-menu" onClick={(e) => e.stopPropagation()}><button onClick={() => openEdit(category)}><EditIcon width={14} height={14} /> Edit</button><button onClick={() => toggleStatus(category)}><ArchiveIcon width={14} height={14} /> {category.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button></div>}</div></td>
                    </tr>
                  ))}
                  {!loading && !visible.length && <tr><td colSpan="7" className="category-empty">No categories match the selected filters.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="category-table-footer"><span>Showing {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} categories</span><div className="category-pagination"><button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>{Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 2), page + 1).map((p) => <button key={p} className={p === page ? 'current' : ''} onClick={() => setPage(p)}>{p}</button>)}<button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button></div></div>
          </section>

          <aside className="category-side-column">
            <div className="category-side-card">
              <div className="category-side-title"><h3>Category Overview</h3></div>
              <div className="category-donut-wrap"><div className="category-donut" style={{ '--standard-end': `${stats.total ? (categories.filter(c => c.categoryType === 'STANDARD').length / stats.total) * 100 : 0}%`, '--accrual-end': `${stats.total ? ((categories.filter(c => c.categoryType === 'STANDARD').length + categories.filter(c => c.categoryType === 'ACCRUAL').length) / stats.total) * 100 : 0}%`, '--comp-end': `${stats.total ? ((categories.filter(c => c.categoryType === 'STANDARD').length + categories.filter(c => c.categoryType === 'ACCRUAL').length + categories.filter(c => c.categoryType === 'COMPENSATORY').length) / stats.total) * 100 : 0}%` }}><div><strong>{stats.total}</strong><span>Categories</span></div></div><div className="category-legend"><span><i className="dot standard" />Standard <b>{categories.filter(c => c.categoryType === 'STANDARD').length}</b></span><span><i className="dot accrual" />Accrual <b>{categories.filter(c => c.categoryType === 'ACCRUAL').length}</b></span><span><i className="dot compensatory" />Compensatory <b>{categories.filter(c => c.categoryType === 'COMPENSATORY').length}</b></span><span><i className="dot special" />Special <b>{categories.filter(c => c.categoryType === 'SPECIAL').length}</b></span></div></div>
            </div>

            <div className="category-side-card"><h3>Applicable To</h3><div className="applicable-list"><div><UsersIcon width={15} height={15} /><span>All Employees</span><b>{categories.filter(c => c.applicableTo === 'ALL_EMPLOYEES').length}</b></div><div><UsersIcon width={15} height={15} /><span>Male Employees</span><b>{categories.filter(c => c.applicableTo === 'MALE_EMPLOYEES').length}</b></div><div><UsersIcon width={15} height={15} /><span>Female Employees</span><b>{categories.filter(c => c.applicableTo === 'FEMALE_EMPLOYEES').length}</b></div><div><UsersIcon width={15} height={15} /><span>Department Specific</span><b>{categories.filter(c => c.applicableTo === 'DEPARTMENT_SPECIFIC').length}</b></div></div></div>

            <div className="category-side-card quick-actions"><h3>Quick Actions</h3><button onClick={openCreate}><PlusIcon width={14} height={14} /> Add New Category <span>›</span></button><button onClick={() => setType(type === 'SPECIAL' ? 'ALL' : 'SPECIAL')}><ClipboardListIcon width={14} height={14} /> Bulk Update Categories <span>›</span></button><button onClick={() => setStatus('INACTIVE')}><ArchiveIcon width={14} height={14} /> Import Categories <span>›</span></button><button onClick={() => window.print()}><EditIcon width={14} height={14} /> Category Report <span>›</span></button><button onClick={() => navigate('/hr/leave-policies')}><ShieldIcon width={14} height={14} /> Policy Settings <span>›</span></button></div>

            <div className="category-note"><strong>Note</strong><p>System categories cannot be deleted. You can deactivate them if required.</p></div>
          </aside>
        </div>
      </div>
      {modal && <CategoryModal editing={editing} form={form} setForm={setForm} onClose={() => setModal(false)} onSave={saveCategory} />}
    </DashboardLayout>
  );
};

export default HRLeaveCategories;
