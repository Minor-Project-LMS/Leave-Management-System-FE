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
      { id: 1, fileName: 'Personal_Work_Details.pdf', contentType: 'application/pdf', sizeBytes: 204800, downloadUrl: '#' },
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
