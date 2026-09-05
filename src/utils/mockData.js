// Mock payloads mirroring the shape of the real /api/dashboard/* responses.
// Swap out once the backend endpoints in api.js are live (see VITE_USE_MOCK_DATA in .env).

export const mockSummary = {
  availableLeave: 18.5,
  usedLeave: 7.5,
  pendingRequests: 2,
  compOffBalance: 1.0,
};

export const mockTrend = [
  { month: 'Jan', days: 2 },
  { month: 'Feb', days: 3 },
  { month: 'Mar', days: 1 },
  { month: 'Apr', days: 4 },
  { month: 'May', days: 3 },
  { month: 'Jun', days: 5 },
  { month: 'Jul', days: 4 },
  { month: 'Aug', days: 6 },
  { month: 'Sep', days: 5 },
  { month: 'Oct', days: 7 },
  { month: 'Nov', days: 6 },
  { month: 'Dec', days: 8 },
];

export const mockDistribution = [
  { label: 'Casual Leave', value: 6, color: '#2563eb' },
  { label: 'Sick Leave', value: 4, color: '#10b981' },
  { label: 'Earned Leave', value: 3, color: '#f59e0b' },
  { label: 'Comp-Off', value: 2, color: '#a855f7' },
];

export const mockRecentRequests = [
  { id: 'LR-2024-125', type: 'Casual Leave', dateRange: '10 Aug - 14 Aug 2024', status: 'Pending' },
  { id: 'LR-2024-118', type: 'Sick Leave', dateRange: '24 Jul - 25 Jul 2024', status: 'Approved' },
  { id: 'LR-2024-110', type: 'Earned Leave', dateRange: '10 Jul - 12 Jul 2024', status: 'Approved' },
  { id: 'LR-2024-095', type: 'Casual Leave', dateRange: '28 Jun - 29 Jun 2024', status: 'Rejected' },
];

export const mockHolidays = [
  { name: 'Buddha Purnima', date: '2024-05-15', day: 'Wed' },
  { name: 'Id-ul-Zuha', date: '2024-05-17', day: 'Fri' },
  { name: 'Possible Day', date: '2024-05-30', day: 'Thu' },
];

export const mockActivity = [
  { id: 1, text: 'Your leave request LR-2024-125 is pending', timestamp: '2024-08-10T09:15:00Z' },
  { id: 2, text: 'Comp-off request CO-2024-014 was approved', timestamp: '2024-08-09T14:02:00Z' },
  { id: 3, text: 'Leave request LR-2024-118 was approved', timestamp: '2024-08-08T11:30:00Z' },
  { id: 4, text: "Policy 'Earned Leave' was updated by HR", timestamp: '2024-08-05T08:00:00Z' },
  { id: 5, text: "Holiday 'Id-ul-Zuha' was added to calendar", timestamp: '2024-08-04T10:00:00Z' },
];

// --- Manager Dashboard mocks ---

export const mockManagerSummary = {
  totalTeamSize: 28,
  activeEmployees: 26,
  pendingApprovals: 5,
  pendingUrgent: true,
  leavesThisMonth: 18,
  leavesThisMonthChangePct: 12,
  availableBalanceAvg: 16.2,
};

export const mockManagerTrend = [
  { month: 'Dec\'23', days: 12 },
  { month: 'Jan\'24', days: 18 },
  { month: 'Feb\'24', days: 15 },
  { month: 'Mar\'24', days: 22 },
  { month: 'Apr\'24', days: 30 },
  { month: 'May\'24', days: 24 },
];

export const mockManagerDistribution = [
  { label: 'Casual Leave', value: 8, color: '#2563eb' },
  { label: 'Sick Leave', value: 5, color: '#10b981' },
  { label: 'Earned Leave', value: 3, color: '#f59e0b' },
  { label: 'Comp-Off', value: 2, color: '#a855f7' },
];

export const mockPendingApprovals = [
  { id: 'LR-2024-201', name: 'Priya Sharma', type: 'Casual Leave', dateRange: '20 May 2024', days: 1 },
  { id: 'LR-2024-202', name: 'Rahul Verma', type: 'Sick Leave', dateRange: '24 May 2024', days: 1 },
  { id: 'LR-2024-203', name: 'Sneha Patel', type: 'Earned Leave', dateRange: '27 May - 29 May 2024', days: 3 },
  { id: 'LR-2024-204', name: 'Vikram Singh', type: 'Casual Leave', dateRange: '30 May 2024', days: 1 },
  { id: 'LR-2024-205', name: 'Anjali Mehta', type: 'Comp-Off Leave', dateRange: '31 May 2024', days: 1 },
];

export const mockTeamLeaveOverview = [
  { department: 'Engineering', totalMembers: 14, onLeaveToday: 2, leavesThisMonth: 8, availableBalanceAvg: 15.6 },
  { department: 'Product', totalMembers: 4, onLeaveToday: 1, leavesThisMonth: 3, availableBalanceAvg: 17.5 },
  { department: 'Design', totalMembers: 6, onLeaveToday: 1, leavesThisMonth: 5, availableBalanceAvg: 18.2 },
  { department: 'QA', totalMembers: 4, onLeaveToday: 0, leavesThisMonth: 2, availableBalanceAvg: 15.8 },
];

export const mockUpcomingTeamLeaves = [
  { day: '27', month: 'MAY', name: 'Sneha Patel', type: 'Earned Leave', dateRange: '27 May - 29 May 2024' },
  { day: '30', month: 'MAY', name: 'Vikram Singh', type: 'Casual Leave', dateRange: '30 May 2024' },
  { day: '03', month: 'JUN', name: 'Karan Mehta', type: 'Sick Leave', dateRange: '03 Jun - 04 Jun 2024' },
];

// --- Team Calendar (MGR-04) mocks ---

export const mockDepartments = [
  { id: 1, departmentName: 'Engineering', memberCount: 14 },
  { id: 2, departmentName: 'Product', memberCount: 4 },
  { id: 3, departmentName: 'Design', memberCount: 6 },
  { id: 4, departmentName: 'QA', memberCount: 4 },
  { id: 5, departmentName: 'Business Analysis', memberCount: 1 },
];

export const mockLeaveSummaryCategories = [
  { categoryId: 1, categoryName: 'Casual Leave', categoryCode: 'CL', totalDays: 8.0 },
  { categoryId: 2, categoryName: 'Sick Leave', categoryCode: 'SL', totalDays: 6.0 },
  { categoryId: 3, categoryName: 'Earned Leave', categoryCode: 'EL', totalDays: 10.0 },
  { categoryId: 4, categoryName: 'Comp-Off', categoryCode: 'CO', totalDays: 4.0 },
];

// Matches TeamCalendarDay[] — one entry per day that has at least one leave
// or a holiday. Days not listed here render as plain empty cells.
export const mockTeamCalendarDays = [
  {
    date: '2024-05-06',
    entries: [{ userId: 102, fullName: 'Rahul Verma', avatarUrl: null, categoryId: 2, categoryName: 'Sick Leave', categoryCode: 'SL', sessionType: 'FULL_DAY' }],
  },
  {
    date: '2024-05-07',
    entries: [{ userId: 101, fullName: 'Priya Sharma', avatarUrl: null, categoryId: 1, categoryName: 'Casual Leave', categoryCode: 'CL', sessionType: 'FULL_DAY' }],
  },
  {
    date: '2024-05-08',
    entries: [{ userId: 102, fullName: 'Rahul Verma', avatarUrl: null, categoryId: 2, categoryName: 'Sick Leave', categoryCode: 'SL', sessionType: 'FULL_DAY' }],
  },
  {
    date: '2024-05-13',
    entries: [{ userId: 101, fullName: 'Priya Sharma', avatarUrl: null, categoryId: 1, categoryName: 'Casual Leave', categoryCode: 'CL', sessionType: 'FULL_DAY' }],
  },
  {
    date: '2024-05-14',
    entries: [{ userId: 104, fullName: 'Vikram Singh', avatarUrl: null, categoryId: 1, categoryName: 'Casual Leave', categoryCode: 'CL', sessionType: 'FULL_DAY' }],
  },
  {
    date: '2024-05-16',
    entries: [{ userId: 103, fullName: 'Sneha Patel', avatarUrl: null, categoryId: 3, categoryName: 'Earned Leave', categoryCode: 'EL', sessionType: 'FULL_DAY' }],
  },
  {
    date: '2024-05-17',
    entries: [{ userId: 105, fullName: 'Anjali Mehta', avatarUrl: null, categoryId: 4, categoryName: 'Comp-Off', categoryCode: 'CO', sessionType: 'FULL_DAY' }],
  },
  {
    date: '2024-05-21',
    entries: [{ userId: 102, fullName: 'Rahul Verma', avatarUrl: null, categoryId: 2, categoryName: 'Sick Leave', categoryCode: 'SL', sessionType: 'FULL_DAY' }],
  },
  {
    date: '2024-05-23',
    entries: [{ userId: 104, fullName: 'Vikram Singh', avatarUrl: null, categoryId: 1, categoryName: 'Casual Leave', categoryCode: 'CL', sessionType: 'FULL_DAY' }],
  },
  {
    date: '2024-05-24',
    entries: [{ userId: 105, fullName: 'Anjali Mehta', avatarUrl: null, categoryId: 4, categoryName: 'Comp-Off', categoryCode: 'CO', sessionType: 'FULL_DAY' }],
  },
  {
    date: '2024-05-27',
    holiday: { name: 'Memorial Day' },
    entries: [],
  },
];

export const mockTeamCalendarUpcoming = [
  { day: '21', month: 'MAY', name: 'Rahul Verma', type: 'Sick Leave (SL)', dateRange: '1 Day' },
  { day: '23', month: 'MAY', name: 'Vikram Singh', type: 'Casual Leave (CL)', dateRange: '1 Day' },
  { day: '24', month: 'MAY', name: 'Anjali Mehta', type: 'Comp-Off (CO)', dateRange: '1 Day' },
];

// --- Team Members (MGR-05) mocks ---

export const mockTeamMembersStats = {
  totalMembers: 28,
  onLeaveToday: 4,
  availableToday: 24,
  departments: 5,
};

export const mockTeamMembers = [
  { id: 1, employeeCode: 'EMP0047', fullName: 'Rahul Verma', departmentId: 1, departmentName: 'Engineering', designation: 'Senior Developer', email: 'rahul.verma@lms.com', phone: '+91 90945 43210', status: 'AVAILABLE', avatarUrl: null },
  { id: 2, employeeCode: 'EMP0045', fullName: 'Priya Sharma', departmentId: 2, departmentName: 'Product', designation: 'Team Lead', email: 'priya.sharma@lms.com', phone: '+91 91234 56789', status: 'AVAILABLE', avatarUrl: null },
  { id: 3, employeeCode: 'EMP0039', fullName: 'Sneha Patel', departmentId: 3, departmentName: 'Design', designation: 'UI/UX Designer', email: 'sneha.patel@lms.com', phone: '+91 93887 65432', status: 'ON_LEAVE', avatarUrl: null },
  { id: 4, employeeCode: 'EMP0038', fullName: 'Vikram Singh', departmentId: 2, departmentName: 'Product', designation: 'Product Manager', email: 'vikram.singh@lms.com', phone: '+91 90311 22334', status: 'AVAILABLE', avatarUrl: null },
  { id: 5, employeeCode: 'EMP0038', fullName: 'Anjali Mehta', departmentId: 4, departmentName: 'QA', designation: 'QA Engineer', email: 'anjali.mehta@lms.com', phone: '+91 93555 77889', status: 'ON_LEAVE', avatarUrl: null },
  { id: 6, employeeCode: 'EMP0028', fullName: 'Neha Gupta', departmentId: 1, departmentName: 'Engineering', designation: 'Developer', email: 'neha.gupta@lms.com', phone: '+91 87654 32198', status: 'HALF_DAY', avatarUrl: null },
  { id: 7, employeeCode: 'EMP0023', fullName: 'Arjun Kumar', departmentId: 1, departmentName: 'Engineering', designation: 'DevOps Engineer', email: 'arjun.kumar@lms.com', phone: '+91 88997 71233', status: 'AVAILABLE', avatarUrl: null },
  { id: 8, employeeCode: 'EMP0021', fullName: 'Karan Mehta', departmentId: 1, departmentName: 'Engineering', designation: 'Backend Developer', email: 'karan.mehta@lms.com', phone: '+91 89665 43120', status: 'AVAILABLE', avatarUrl: null },
];

// GET /delegations/eligible-delegates — the org's HR admin(s), used for the
// Delegation "Delegate To" picker. Shape is UserDto as returned by that
// endpoint: { id, name, designation, role } — note `name`, not `fullName`
// like mockTeamMembers above; these are genuinely different DTO shapes.
export const mockEligibleDelegates = [
  { id: 501, name: 'Anita Desai', designation: 'HR Manager', role: 'HR_ADMIN' },
];

// --- Delegations (MGR-06) mock ---
// designation/employeeCode on delegateName aren't part of the Delegation
// schema — enriched client-side from mockTeamMembers where possible, same
// as the real page does with the fetched team member list.

export const mockDelegations = [
  {
    id: 1,
    delegatorId: 501,
    delegatorName: 'Alex Johnson',
    delegateId: 2,
    delegateName: 'Priya Sharma',
    startDate: '2024-05-20',
    endDate: '2024-05-24',
    isActive: true,
    computedStatus: 'ACTIVE',
    departmentIds: [1, 2],
    categoryIds: [],
    createdAt: '2024-05-15T09:00:00Z',
  },
  {
    id: 2,
    delegatorId: 501,
    delegatorName: 'Alex Johnson',
    delegateId: 1,
    delegateName: 'Rahul Verma',
    startDate: '2024-05-27',
    endDate: '2024-05-31',
    isActive: true,
    computedStatus: 'UPCOMING',
    departmentIds: [1],
    categoryIds: [1, 2],
    createdAt: '2024-05-16T09:00:00Z',
  },
  {
    id: 3,
    delegatorId: 501,
    delegatorName: 'Alex Johnson',
    delegateId: 2,
    delegateName: 'Priya Sharma',
    startDate: '2024-06-03',
    endDate: '2024-06-07',
    isActive: true,
    computedStatus: 'UPCOMING',
    departmentIds: [1, 3],
    categoryIds: [1],
    createdAt: '2024-05-20T09:00:00Z',
  },
  {
    id: 4,
    delegatorId: 501,
    delegatorName: 'Alex Johnson',
    delegateId: 4,
    delegateName: 'Vikram Singh',
    startDate: '2024-04-10',
    endDate: '2024-04-14',
    isActive: false,
    computedStatus: 'PAST',
    departmentIds: [2],
    categoryIds: [],
    createdAt: '2024-04-01T09:00:00Z',
  },
  {
    id: 5,
    delegatorId: 501,
    delegatorName: 'Alex Johnson',
    delegateId: 7,
    delegateName: 'Arjun Kumar',
    startDate: '2024-03-05',
    endDate: '2024-03-09',
    isActive: false,
    computedStatus: 'PAST',
    departmentIds: [1],
    categoryIds: [2, 3],
    createdAt: '2024-02-25T09:00:00Z',
  },
];

// --- Profile (EMP-09) mock ---

export const mockUserProfile = {
  id: 1042,
  employeeCode: 'EMP00038',
  fullName: 'John Doe',
  email: 'john.doe@company.com',
  phone: '+1 98765 43210',
  role: 'EMPLOYEE',
  departmentId: 1,
  departmentName: 'Engineering',
  designation: 'Software Engineer',
  reportsTo: 201,
  reportsToName: 'Alex Johnson',
  dateOfJoining: '2022-01-15',
  employmentStatus: 'ACTIVE',
  workLocation: 'Bangalore, India',
  employmentType: 'Full Time',
  avatarUrl: null,
  dateOfBirth: '1996-03-12',
  gender: 'Male',
  bloodGroup: 'O+',
  address: '27, Park Street, Bangalore, Karnataka - 560001, India',
  emergencyContact: {
    name: 'Jane Doe',
    relationship: 'Sister',
    phone: '+91 91234 56789',
    email: 'jane.doe@email.com',
  },
  username: 'johndoe123',
  lastLoginAt: '2024-05-24T09:15:00Z',
  createdAt: '2022-01-15T10:30:00Z',
  updatedAt: '2024-05-20T00:00:00Z',
};

// --- Employee Management (HR-01) mock ---

export const mockEmployeeStats = {
  totalEmployees: 128,
  activeEmployees: 118,
  onLeaveToday: 16,
  inactiveEmployees: 10,
  newJoinersThisMonth: 6,
};

export const mockEmployees = [
  { id: 1, employeeCode: 'EMP0047', fullName: 'Rahul Verma', departmentId: 1, departmentName: 'Engineering', designation: 'Senior Developer', email: 'rahul.verma@lms.com', phone: '+91 98765 43210', employmentStatus: 'ACTIVE', dateOfJoining: '2020-01-15', avatarUrl: null },
  { id: 2, employeeCode: 'EMP0045', fullName: 'Priya Sharma', departmentId: 2, departmentName: 'Product', designation: 'Team Lead', email: 'priya.sharma@lms.com', phone: '+91 91234 56789', employmentStatus: 'ACTIVE', dateOfJoining: '2021-03-01', avatarUrl: null },
  { id: 3, employeeCode: 'EMP0039', fullName: 'Sneha Patel', departmentId: 3, departmentName: 'Design', designation: 'UI/UX Designer', email: 'sneha.patel@lms.com', phone: '+91 98887 66554', employmentStatus: 'ON_LEAVE', dateOfJoining: '2021-07-10', avatarUrl: null },
  { id: 4, employeeCode: 'EMP0031', fullName: 'Vikram Singh', departmentId: 2, departmentName: 'Product', designation: 'Product Manager', email: 'vikram.singh@lms.com', phone: '+91 90311 22334', employmentStatus: 'ACTIVE', dateOfJoining: '2019-11-20', avatarUrl: null },
  { id: 5, employeeCode: 'EMP0025', fullName: 'Anjali Mehta', departmentId: 4, departmentName: 'QA', designation: 'QA Engineer', email: 'anjali.mehta@lms.com', phone: '+91 93555 77889', employmentStatus: 'ON_LEAVE', dateOfJoining: '2022-02-15', avatarUrl: null },
  { id: 6, employeeCode: 'EMP0022', fullName: 'Karan Mehta', departmentId: 1, departmentName: 'Engineering', designation: 'Backend Developer', email: 'karan.mehta@lms.com', phone: '+91 93455 78901', employmentStatus: 'ACTIVE', dateOfJoining: '2020-02-28', avatarUrl: null },
  { id: 7, employeeCode: 'EMP0018', fullName: 'Neha Gupta', departmentId: 5, departmentName: 'Business Analysis', designation: 'Business Analyst', email: 'neha.gupta@lms.com', phone: '+91 87654 32109', employmentStatus: 'ACTIVE', dateOfJoining: '2023-09-18', avatarUrl: null },
  { id: 8, employeeCode: 'EMP0011', fullName: 'Arjun Kumar', departmentId: 1, departmentName: 'Engineering', designation: 'DevOps Engineer', email: 'arjun.kumar@lms.com', phone: '+91 88997 71233', employmentStatus: 'SEPARATED', dateOfJoining: '2020-04-11', avatarUrl: null },
];

// --- Leave Policies (HR-02) mock ---

export const mockPolicyStats = {
  totalPolicies: 6,
  activePolicies: 5,
  draftPolicies: 1,
  archivedPolicies: 0,
};

export const mockHRLeavePolicies = [
  {
    id: 1,
    policyName: 'Casual Leave Policy',
    policyCode: 'PCL-CL-001',
    isDefault: true,
    categoryId: 1,
    categoryName: 'Casual Leave',
    categoryCode: 'CL',
    departmentId: null,
    departmentName: null,
    applicableTo: 'All Employees',
    annualQuota: 12,
    accrualFrequency: 'MONTHLY',
    accrualCaption: '1.5 days/month',
    maxCarryForward: 5,
    carryForwardCaption: 'Max 5 days',
    minNoticeDays: 1,
    maxConsecutiveDays: 3,
    status: 'ACTIVE',
    effectiveFrom: '2024-01-21',
  },
  {
    id: 2,
    policyName: 'Sick Leave Policy',
    policyCode: 'PCL-SL-001',
    isDefault: true,
    categoryId: 2,
    categoryName: 'Sick Leave',
    categoryCode: 'SL',
    departmentId: null,
    departmentName: null,
    applicableTo: 'All Employees',
    annualQuota: 10,
    accrualFrequency: 'MONTHLY',
    accrualCaption: '1.2 days/month',
    maxCarryForward: 10,
    carryForwardCaption: 'Max 10 days',
    minNoticeDays: 0,
    maxConsecutiveDays: 7,
    status: 'ACTIVE',
    effectiveFrom: '2024-01-21',
  },
  {
    id: 3,
    policyName: 'Earned Leave Policy',
    policyCode: 'PCL-EL-001',
    isDefault: true,
    categoryId: 3,
    categoryName: 'Earned Leave',
    categoryCode: 'EL',
    departmentId: null,
    departmentName: null,
    applicableTo: 'All Employees',
    annualQuota: 21,
    accrualFrequency: 'MONTHLY',
    accrualCaption: '1.75 days/month',
    maxCarryForward: 15,
    carryForwardCaption: 'Max 15 days',
    minNoticeDays: 7,
    maxConsecutiveDays: 15,
    status: 'ACTIVE',
    effectiveFrom: '2024-01-21',
  },
  {
    id: 4,
    policyName: 'Comp-Off Policy',
    policyCode: 'PCL-CO-001',
    isDefault: true,
    categoryId: 4,
    categoryName: 'Comp-Off',
    categoryCode: 'CO',
    departmentId: null,
    departmentName: null,
    applicableTo: 'All Employees',
    annualQuota: null,
    accrualFrequency: 'QUARTERLY',
    accrualCaption: 'As and when earned',
    maxCarryForward: 0,
    carryForwardCaption: 'Must be used within 3 months',
    minNoticeDays: 0,
    maxConsecutiveDays: 2,
    status: 'ACTIVE',
    effectiveFrom: '2024-01-21',
  },
  {
    id: 5,
    policyName: 'Paternity Leave Policy',
    policyCode: 'PCL-PL-001',
    isDefault: false,
    categoryId: 5,
    categoryName: 'Paternity Leave',
    categoryCode: 'PL',
    departmentId: null,
    departmentName: null,
    applicableTo: 'Male Employees',
    annualQuota: 5,
    accrualFrequency: 'ANNUAL',
    accrualCaption: '5 days/year',
    maxCarryForward: 0,
    carryForwardCaption: 'Non-cumulative',
    minNoticeDays: 15,
    maxConsecutiveDays: 5,
    status: 'ACTIVE',
    effectiveFrom: '2024-04-21',
  },
  {
    id: 6,
    policyName: 'Maternity Leave Policy',
    policyCode: 'PCL-ML-001',
    isDefault: false,
    categoryId: 6,
    categoryName: 'Maternity Leave',
    categoryCode: 'ML',
    departmentId: null,
    departmentName: null,
    applicableTo: 'Female Employees',
    annualQuota: 180,
    accrualFrequency: 'ANNUAL',
    accrualCaption: '180 days/year',
    maxCarryForward: 0,
    carryForwardCaption: 'Non-cumulative',
    minNoticeDays: 30,
    maxConsecutiveDays: 180,
    status: 'DRAFT',
    effectiveFrom: '2024-04-21',
  },
];

// --- HR Dashboard mocks ---

export const mockHRSummary = {
  totalEmployees: 248,
  totalEmployeesChangePct: 4.2,
  onLeaveToday: 18,
  onLeaveTodayChangePct: 7.3,
  pendingRequests: 27,
  leaveUtilizationPct: 64,
};

// Dual-series: Requests vs Approved, last 6 months.
// NOTE: the OpenAPI spec's /reports/leave-trend returns a single {month,days}
// series (LeaveTrendPoint) — it doesn't define a documented way to get both
// "requests" and "approved" series separately. This mock models the shape
// the UI needs; confirm with backend whether that endpoint can return both,
// or if a param (e.g. status=APPROVED) needs to be added.
export const mockHRLeaveTrend = [
  { month: 'Mar', requests: 12, approved: 3 },
  { month: 'Apr', requests: 18, approved: 5 },
  { month: 'May', requests: 22, approved: 6 },
  { month: 'Jun', requests: 27, approved: 8 },
  { month: 'Jul', requests: 24, approved: 9 },
  { month: 'Aug', requests: 42, approved: 10 },
];

export const mockHRDistribution = [
  { label: 'Earned', value: 42, color: '#2563eb' },
  { label: 'Casual', value: 25, color: '#a855f7' },
  { label: 'Sick', value: 18, color: '#10b981' },
  { label: 'Other', value: 15, color: '#cbd5e1' },
];
export const mockHRDistributionTotal = 1286;

export const mockDepartmentSummary = [
  { departmentName: 'Engineering', totalEmployees: 82, totalLeaveDays: 41, utilizationPct: 8.5 },
  { departmentName: 'Sales', totalEmployees: 54, totalLeaveDays: 29, utilizationPct: 9.1 },
  { departmentName: 'Operations', totalEmployees: 61, totalLeaveDays: 35, utilizationPct: 10.4 },
  { departmentName: 'HR & Admin', totalEmployees: 24, totalLeaveDays: 12, utilizationPct: 8.1 },
  { departmentName: 'Finance', totalEmployees: 27, totalLeaveDays: 15, utilizationPct: 9.7 },
];

export const mockHRPendingApprovals = [
  { id: 'LR-2024-301', name: 'Amit Joshi', type: 'Earned', days: 3 },
  { id: 'LR-2024-302', name: 'Riya Shah', type: 'Casual', days: 2 },
  { id: 'LR-2024-303', name: 'Manoj Kumar', type: 'Sick', days: 1 },
];

// --- Approval Inbox mocks ---

const baseApprovals = [
  {
    id: 1,
    requestId: 4001,
    approverId: 9,
    approverName: 'Alex Johnson',
    actingAsDelegateFor: null,
    level: 1,
    decision: null,
    decidedAt: null,
    comments: null,
  },
];

export const mockApprovalInboxCounts = { all: 5, pending: 5, approved: 0, rejected: 0 };

export const mockApprovalInbox = [
  {
    id: 4001,
    displayId: 'LR-2024-201',
    userId: 101,
    employeeName: 'Priya Sharma',
    departmentName: 'Product Team',
    categoryId: 1,
    categoryName: 'Casual Leave',
    categoryCode: 'CL',
    startDate: '2024-05-20',
    endDate: '2024-05-20',
    sessionType: 'FULL_DAY',
    totalDays: 1,
    reason: 'Personal work',
    status: 'PENDING_L1',
    currentApproverId: 9,
    currentApproverName: 'Alex Johnson',
    appliedAt: '2024-05-24T10:15:00Z',
    updatedAt: '2024-05-24T10:15:00Z',
  },
  {
    id: 4002,
    displayId: 'LR-2024-202',
    userId: 102,
    employeeName: 'Rahul Verma',
    departmentName: 'Engineering Team',
    categoryId: 2,
    categoryName: 'Sick Leave',
    categoryCode: 'SL',
    startDate: '2024-05-24',
    endDate: '2024-05-24',
    sessionType: 'FULL_DAY',
    totalDays: 1,
    reason: 'Fever and cold',
    status: 'PENDING_L1',
    currentApproverId: 9,
    currentApproverName: 'Alex Johnson',
    appliedAt: '2024-05-24T09:45:00Z',
    updatedAt: '2024-05-24T09:45:00Z',
  },
  {
    id: 4003,
    displayId: 'LR-2024-203',
    userId: 103,
    employeeName: 'Sneha Patel',
    departmentName: 'Design Team',
    categoryId: 3,
    categoryName: 'Earned Leave',
    categoryCode: 'EL',
    startDate: '2024-05-27',
    endDate: '2024-05-29',
    sessionType: 'FULL_DAY',
    totalDays: 3,
    reason: 'Family function',
    status: 'PENDING_L1',
    currentApproverId: 9,
    currentApproverName: 'Alex Johnson',
    appliedAt: '2024-05-23T16:30:00Z',
    updatedAt: '2024-05-23T16:30:00Z',
  },
  {
    id: 4004,
    displayId: 'LR-2024-204',
    userId: 104,
    employeeName: 'Vikram Singh',
    departmentName: 'Engineering Team',
    categoryId: 1,
    categoryName: 'Casual Leave',
    categoryCode: 'CL',
    startDate: '2024-05-30',
    endDate: '2024-05-30',
    sessionType: 'FULL_DAY',
    totalDays: 1,
    reason: 'Personal work',
    status: 'PENDING_L1',
    currentApproverId: 9,
    currentApproverName: 'Alex Johnson',
    appliedAt: '2024-05-23T22:00:00Z',
    updatedAt: '2024-05-23T22:00:00Z',
  },
  {
    id: 4005,
    displayId: 'LR-2024-205',
    userId: 105,
    employeeName: 'Anjali Mehta',
    departmentName: 'QA Team',
    categoryId: 4,
    categoryName: 'Comp-Off',
    categoryCode: 'CO',
    startDate: '2024-05-31',
    endDate: '2024-05-31',
    sessionType: 'FULL_DAY',
    totalDays: 1,
    reason: 'Compensatory off',
    status: 'PENDING_L1',
    currentApproverId: 9,
    currentApproverName: 'Alex Johnson',
    appliedAt: '2024-05-23T11:10:00Z',
    updatedAt: '2024-05-23T11:10:00Z',
  },
];

// Keyed detail objects — matches LeaveRequestDetail shape (LeaveRequest +
// employee/attachments/approvals/balance). Used by the request-detail panel.
export const mockApprovalDetails = {
  4001: {
    ...mockApprovalInbox[0],
    contactNumber: '+91 98765 43210',
    addressDuringLeave: 'Local, no travel',
    handoverTo: null,
    handoverToName: null,
    handoverNotes: null,
    employee: {
      id: 101,
      employeeCode: 'EMP-0101',
      fullName: 'Priya Sharma',
      departmentName: 'Product Team',
      designation: 'Product Analyst',
    },
    attachments: [
      {
        id: 1,
        entityType: 'LEAVE_REQUEST',
        entityId: 4001,
        fileName: 'Personal_Work_Details.pdf',
        contentType: 'application/pdf',
        sizeBytes: 204800,
        storageProvider: 'S3',
        status: 'ACTIVE',
        blobUrl: 'https://example-bucket.s3.amazonaws.com/attachments/Personal_Work_Details.pdf',
        downloadUrl: 'https://example-bucket.s3.amazonaws.com/attachments/Personal_Work_Details.pdf?presigned=true',
        uploadedBy: 101,
        uploadedAt: '2024-05-24T10:32:00Z',
      },
    ],
    approvals: [
      {
        id: 1,
        requestId: 4001,
        approverId: null,
        approverName: 'Priya Sharma',
        level: 1,
        decision: 'REQUESTED',
        decidedAt: '2024-05-24T10:15:00Z',
        comments: null,
      },
    ],
  },
};

// --- Apply Leave (EMP-02) mocks ---

export const mockLeaveCategories = [
  { id: 1, categoryName: 'Casual Leave', categoryCode: 'CL', categoryType: 'STANDARD', isPaid: true, requiresDocument: false },
  { id: 2, categoryName: 'Sick Leave', categoryCode: 'SL', categoryType: 'STANDARD', isPaid: true, requiresDocument: true },
  { id: 3, categoryName: 'Earned Leave', categoryCode: 'EL', categoryType: 'ACCRUAL', isPaid: true, requiresDocument: false },
  { id: 4, categoryName: 'Comp-Off', categoryCode: 'CO', categoryType: 'COMPENSATORY', isPaid: true, requiresDocument: false },
  { id: 5, categoryName: 'Paternity Leave', categoryCode: 'PL', categoryType: 'STANDARD', isPaid: true, requiresDocument: false },
  { id: 6, categoryName: 'Maternity Leave', categoryCode: 'ML', categoryType: 'STANDARD', isPaid: true, requiresDocument: false },
];

// Keyed by categoryId — matches LeavePolicy shape.
export const mockLeavePolicies = {
  1: { id: 1, categoryId: 1, categoryName: 'Casual Leave', annualQuota: 15, maxCarryForward: 5, maxConsecutiveDays: 5, minNoticeDays: 1, applicableTo: 'ALL_EMPLOYEES' },
  2: { id: 2, categoryId: 2, categoryName: 'Sick Leave', annualQuota: 10, maxCarryForward: 0, maxConsecutiveDays: 7, minNoticeDays: 0, applicableTo: 'ALL_EMPLOYEES' },
  3: { id: 3, categoryId: 3, categoryName: 'Earned Leave', annualQuota: 20, maxCarryForward: 10, maxConsecutiveDays: 15, minNoticeDays: 7, applicableTo: 'ALL_EMPLOYEES' },
  4: { id: 4, categoryId: 4, categoryName: 'Comp-Off', annualQuota: 5, maxCarryForward: 0, maxConsecutiveDays: 2, minNoticeDays: 1, applicableTo: 'ALL_EMPLOYEES' },
};

// Matches LeaveLedgerSummary[] shape. "Total" shown in the UI is computed
// client-side as openingBalance + accrued + carriedForward, since the schema
// doesn't expose a single "total allocated" field directly — see
// LeaveBalanceSummary.jsx.
export const mockLeaveLedger = [
  { categoryId: 1, categoryName: 'Casual Leave', openingBalance: 18, accrued: 0, used: 5.5, carriedForward: 0, availableBalance: 12.5 },
  { categoryId: 2, categoryName: 'Sick Leave', openingBalance: 10, accrued: 0, used: 2, carriedForward: 0, availableBalance: 8.0 },
  { categoryId: 3, categoryName: 'Earned Leave', openingBalance: 20, accrued: 0, used: 2, carriedForward: 0, availableBalance: 18.0 },
  { categoryId: 4, categoryName: 'Comp-Off', openingBalance: 5, accrued: 0, used: 4, carriedForward: 0, availableBalance: 1.0 },
];

// --- My Requests (EMP-03) mocks ---

export const mockMyRequests = [
  {
    id: 'LR-2024-125',
    type: 'Casual Leave',
    typeIcon: 'CL',
    startDate: '2024-05-20',
    endDate: '2024-05-22',
    dateRange: '20 May 2024 - 22 May 2024 (3 Days)',
    totalDays: 3.0,
    status: 'Pending',
    approverName: 'Alex Johnson',
    approverRole: 'Team Lead',
    approverInitials: 'AJ',
    appliedOn: '2024-05-18T10:30:00Z',
  },
  {
    id: 'LR-2024-119',
    type: 'Sick Leave',
    typeIcon: 'SL',
    startDate: '2024-04-24',
    endDate: '2024-04-26',
    dateRange: '24 Apr 2024 - 26 Apr 2024 (3 Days)',
    totalDays: 3.0,
    status: 'Approved',
    approverName: 'Alex Johnson',
    approverRole: 'Team Lead',
    approverInitials: 'AJ',
    appliedOn: '2024-04-22T09:15:00Z',
  },
  {
    id: 'LR-2024-115',
    type: 'Earned Leave',
    typeIcon: 'EL',
    startDate: '2024-04-10',
    endDate: '2024-04-12',
    dateRange: '10 Apr 2024 - 12 Apr 2024 (3 Days)',
    totalDays: 3.0,
    status: 'Approved',
    approverName: 'Alex Johnson',
    approverRole: 'Team Lead',
    approverInitials: 'AJ',
    appliedOn: '2024-04-08T14:20:00Z',
  },
  {
    id: 'LR-2024-108',
    type: 'Casual Leave',
    typeIcon: 'CL',
    startDate: '2024-03-28',
    endDate: '2024-03-29',
    dateRange: '28 Mar 2024 - 29 Mar 2024 (2 Days)',
    totalDays: 2.0,
    status: 'Rejected',
    approverName: 'Alex Johnson',
    approverRole: 'Team Lead',
    approverInitials: 'AJ',
    appliedOn: '2024-03-25T11:45:00Z',
  },
  {
    id: 'LR-2024-095',
    type: 'Comp-Off',
    typeIcon: 'CO',
    startDate: '2024-03-15',
    endDate: '2024-03-15',
    dateRange: '15 Mar 2024 (1 Day)',
    totalDays: 1.0,
    status: 'Approved',
    approverName: 'Alex Johnson',
    approverRole: 'Team Lead',
    approverInitials: 'AJ',
    appliedOn: '2024-03-12T16:00:00Z',
  },
  {
    id: 'LR-2024-088',
    type: 'Sick Leave',
    typeIcon: 'SL',
    startDate: '2024-02-20',
    endDate: '2024-02-21',
    dateRange: '20 Feb 2024 - 21 Feb 2024 (2 Days)',
    totalDays: 2.0,
    status: 'Cancelled',
    approverName: 'Alex Johnson',
    approverRole: 'Team Lead',
    approverInitials: 'AJ',
    appliedOn: '2024-02-18T09:30:00Z',
  },
  {
    id: 'LR-2024-075',
    type: 'Earned Leave',
    typeIcon: 'EL',
    startDate: '2024-01-25',
    endDate: '2024-01-26',
    dateRange: '25 Jan 2024 - 26 Jan 2024 (2 Days)',
    totalDays: 2.0,
    status: 'Approved',
    approverName: 'Alex Johnson',
    approverRole: 'Team Lead',
    approverInitials: 'AJ',
    appliedOn: '2024-01-22T13:15:00Z',
  },
];

// --- Request Details (EMP-04) mocks ---

export const mockRequestDetails = {
  'LR-2024-125': {
    id: 'LR-2024-125',
    type: 'Casual Leave',
    typeIcon: 'CL',
    startDate: '2024-05-20',
    endDate: '2024-05-22',
    dateRange: '20 May 2024 - 22 May 2024',
    totalDays: 3.0,
    status: 'Pending',
    reason: 'Personal work to attend family function',
    sessionType: 'FULL_DAY',
    appliedOn: '2024-05-18T10:30:00Z',
    appliedOnFormatted: '18 May 2024 10:30 AM',
    
    // Current approver
    approverName: 'Alex Johnson',
    approverRole: 'Team Lead',
    approverInitials: 'AJ',
    
    // Employee details
    employee: {
      name: 'John Doe',
      employeeCode: 'EMP-001',
      designation: 'Software Engineer',
      department: 'Engineering',
      email: 'john.doe@company.com',
      phone: '+91 98765 43210',
    },
    
    // Leave balance at time of request
    leaveBalance: {
      available: 12.5,
      used: 5.5,
      total: 18.0,
    },
    
    // Approval timeline
    approvals: [
      {
        id: 1,
        level: 1,
        approverName: 'John Doe',
        decision: 'REQUESTED',
        decidedAt: '2024-05-18T10:30:00Z',
        decidedAtFormatted: '18 May 2024 10:30 AM',
        comments: null,
      },
      {
        id: 2,
        level: 1,
        approverName: 'Alex Johnson',
        decision: 'PENDING',
        decidedAt: null,
        decidedAtFormatted: null,
        comments: null,
      },
    ],
    
    // Attachments
    attachments: [
      {
        id: 1,
        entityType: 'LEAVE_REQUEST',
        entityId: 125,
        fileName: 'family_invitation.pdf',
        contentType: 'application/pdf',
        sizeBytes: 251658,
        storageProvider: 'S3',
        status: 'ACTIVE',
        blobUrl: 'https://example-bucket.s3.amazonaws.com/attachments/family_invitation.pdf',
        downloadUrl: 'https://example-bucket.s3.amazonaws.com/attachments/family_invitation.pdf?presigned=true',
        uploadedBy: 101,
        uploadedAt: '2024-05-18T10:32:00Z',
      },
    ],
    
    // Comments
    comments: [
      {
        id: 1,
        author: 'John Doe',
        authorInitials: 'JD',
        message: 'Please approve this request as I need to attend an important family function.',
        timestamp: '2024-05-18T10:35:00Z',
        timestampFormatted: '18 May 2024 10:35 AM',
      },
    ],
  },
  'LR-2024-119': {
    id: 'LR-2024-119',
    displayId: 'LR-2024-119',
    type: 'Sick Leave',
    typeIcon: 'SL',
    categoryName: 'Sick Leave',
    categoryCode: 'SL',
    startDate: '2024-04-24',
    endDate: '2024-04-26',
    dateRange: '24 Apr 2024 - 26 Apr 2024',
    totalDays: 3.0,
    status: 'Approved',
    reason: 'I am not feeling well and need rest for recovery.',
    sessionType: 'FULL_DAY',
    appliedOn: '2024-04-19T10:30:00Z',
    appliedOnFormatted: '19 Apr 2024, 10:30 AM',
    updatedAt: '2024-04-22T15:45:00Z',
    updatedAtFormatted: '22 Apr 2024, 03:45 PM',
    
    // Contact and handover details
    contactNumber: '+1 98196 43210',
    addressDuringLeave: '21, Talk Street, Bangalore, Karnataka - 560001',
    handoverTo: null,
    handoverToName: 'Available on phone',
    handoverNotes: null,
    
    // Current approver
    approverName: 'Alex Johnson',
    approverRole: 'Team Lead',
    approverInitials: 'AJ',
    
    // Employee details
    employee: {
      fullName: 'John Doe',
      name: 'John Doe',
      employeeCode: 'EMP00123',
      designation: 'Software Engineer',
      department: 'Engineering',
      email: 'johndoe@company.com',
      phone: '+1 98755 43210',
      managerName: 'Alex Johnson',
    },
    
    // Leave balance at time of request - multiple leave types
    balanceAsOfRequestDate: [
      {
        categoryId: 2,
        categoryName: 'Sick Leave',
        categoryCode: 'SL',
        openingBalance: 10,
        accrued: 0,
        carriedForward: 0,
        availableBalance: 8.0,
        used: 2.0,
      },
      {
        categoryId: 1,
        categoryName: 'Casual Leave',
        categoryCode: 'CL',
        openingBalance: 15,
        accrued: 0,
        carriedForward: 0,
        availableBalance: 12.5,
        used: 2.5,
      },
      {
        categoryId: 3,
        categoryName: 'Earned Leave',
        categoryCode: 'EL',
        openingBalance: 15,
        accrued: 3,
        carriedForward: 0,
        availableBalance: 18.0,
        used: 0,
      },
      {
        categoryId: 4,
        categoryName: 'Comp-Off',
        categoryCode: 'CO',
        openingBalance: 5,
        accrued: 0,
        carriedForward: 0,
        availableBalance: 1.0,
        used: 4.0,
      },
    ],
    
    // Approval timeline - matching the image exactly
    approvals: [
      {
        id: 1,
        level: 0,
        approverName: 'John Doe',
        decision: 'REQUESTED',
        decidedAt: '2024-04-19T10:30:00Z',
        decidedAtFormatted: '19 Apr 2024, 10:30 AM',
        comments: 'Request requested successfully.',
      },
      {
        id: 2,
        level: 1,
        approverName: 'John Doe',
        approverRole: 'Now',
        decision: 'APPROVED',
        decidedAt: '2024-04-22T11:15:00Z',
        decidedAtFormatted: '22 Apr 2024, 11:15 AM',
        comments: 'Your care and get well week.',
      },
      {
        id: 3,
        level: 2,
        approverName: 'Alex Johnson',
        approverRole: 'Toom Load',
        decision: 'APPROVED',
        decidedAt: '2024-04-22T14:30:00Z',
        decidedAtFormatted: '22 Apr 2024, 02:30 PM',
        comments: 'Approved as per company policy.',
      },
      {
        id: 4,
        level: 3,
        approverName: 'Sarah Williams',
        approverRole: 'HR Manager',
        decision: 'APPROVED',
        decidedAt: '2024-04-22T15:45:00Z',
        decidedAtFormatted: '22 Apr 2024, 03:45 PM',
        comments: 'Latest request has been fully approved.',
      },
    ],
    
    // Attachments
    attachments: [
      {
        id: 1,
        fileName: 'medical_report.pdf',
        size: '156 KB',
        uploadedAt: '2024-04-19T10:32:00Z',
        downloadUrl: '#',
      },
    ],
    
    // Comments
    comments: [
      {
        id: 1,
        author: 'John Doe',
        authorInitials: 'JD',
        message: 'Please find attached medical certificate for reference.',
        timestamp: '2024-04-19T10:35:00Z',
        timestampFormatted: '19 Apr 2024, 10:35 AM',
      },
      {
        id: 2,
        author: 'Alex Johnson',
        authorInitials: 'AJ',
        message: 'Medical certificate verified. Leave approved.',
        timestamp: '2024-04-22T11:20:00Z',
        timestampFormatted: '22 Apr 2024, 11:20 AM',
      },
    ],
  },
};
