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
