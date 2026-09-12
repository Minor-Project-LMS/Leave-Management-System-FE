import './TeamCalendarFilters.css';

const TeamCalendarFilters = ({
  departments = [],
  categories = [],
  departmentId,
  categoryId,
  showWeekends,
  onDepartmentChange,
  onCategoryChange,
  onShowWeekendsChange,
}) => (
  <div className="team-calendar-filters">
    <div className="widget-header">
      <h3>Filters</h3>
    </div>

    <div className="team-calendar-filter-field">
      <label htmlFor="tc-department">Department</label>
      <select
        id="tc-department"
        value={departmentId ?? ''}
        onChange={(e) => onDepartmentChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">All Departments</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.departmentName}
          </option>
        ))}
      </select>
    </div>

    <div className="team-calendar-filter-field">
      <label htmlFor="tc-category">Leave Type</label>
      <select
        id="tc-category"
        value={categoryId ?? ''}
        onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">All Leave Types</option>
        {categories.map((c) => (
          <option key={c.categoryId} value={c.categoryId}>
            {c.categoryName}
          </option>
        ))}
      </select>
    </div>

    <label className="team-calendar-filter-checkbox">
      <input
        type="checkbox"
        checked={showWeekends}
        onChange={(e) => onShowWeekendsChange(e.target.checked)}
      />
      Show Weekends
    </label>
  </div>
);

export default TeamCalendarFilters;
