import {
  GridIcon,
  PlusCircleIcon,
  FileTextIcon,
  BookIcon,
  CoffeeIcon,
  CalendarIcon,
  BellIcon,
  UserIcon,
  InboxIcon,
  UsersIcon,
  ClipboardListIcon,
  BarChartIcon,
  SettingsIcon,
  HistoryIcon,
} from '../components/icons/Icons';

export const EMPLOYEE_PORTAL = {
  portalLabel: 'EMPLOYEE PORTAL',
  searchPlaceholder: 'Search anything...',
  navItems: [
    { label: 'Dashboard', path: '/dashboard', icon: GridIcon },
    { label: 'Apply Leave', path: '/apply-leave', icon: PlusCircleIcon },
    { label: 'My Requests', path: '/my-requests', icon: FileTextIcon },
    { label: 'Leave Ledger', path: '/leave-ledger', icon: BookIcon },
    { label: 'Comp-Off', path: '/comp-off', icon: CoffeeIcon },
    { label: 'Holiday Calendar', path: '/holiday-calendar', icon: CalendarIcon },
    { label: 'Notifications', path: '/notifications', icon: BellIcon, badgeKey: 'notifications' },
    { label: 'Profile', path: '/profile', icon: UserIcon },
  ],
};

export const MANAGER_PORTAL = {
  portalLabel: 'MANAGER PORTAL',
  searchPlaceholder: 'Search employees, requests...',
  navItems: [
    { label: 'Manager Dashboard', path: '/manager/dashboard', icon: GridIcon },
    { label: 'Approval Inbox', path: '/manager/approval-inbox', icon: InboxIcon, badgeKey: 'approvals' },
    { label: 'Team Calendar', path: '/manager/team-calendar', icon: CalendarIcon },
    { label: 'Team Members', path: '/manager/team-members', icon: UsersIcon },
    { label: 'Delegation', path: '/manager/delegation', icon: ClipboardListIcon },
    { label: 'Profile', path: '/manager/profile', icon: UserIcon },
  ],
};

export const HR_PORTAL = {
  portalLabel: 'HR PORTAL',
  searchPlaceholder: 'Search employees, requests, reports...',
  navItems: [
    { label: 'Dashboard', path: '/hr/dashboard', icon: GridIcon },
    { label: 'Employee Management', path: '/hr/employees', icon: UsersIcon },
    { label: 'Leave Policies', path: '/hr/leave-policies', icon: BookIcon },
    { label: 'Leave Categories', path: '/hr/leave-categories', icon: ClipboardListIcon },
    { label: 'Holiday Calendar', path: '/hr/holiday-calendar', icon: CalendarIcon },
    { label: 'Reports & Analytics', path: '/hr/reports', icon: BarChartIcon },
    { label: 'Audit Trail', path: '/hr/audit-trail', icon: HistoryIcon },
    { label: 'Notification Queue', path: '/hr/notification-queue', icon: BellIcon, badgeKey: 'notifications' },
    { label: 'Settings', path: '/hr/settings', icon: SettingsIcon },
  ],
};

// Matches the backend's Role enum exactly: [EMPLOYEE, MANAGER, HR_ADMIN]
// (confirmed against lms-openapi.yaml — components/schemas/Role).
export const isManagerRole = (role) => String(role).toUpperCase() === 'MANAGER';
export const isHRRole = (role) => String(role).toUpperCase() === 'HR_ADMIN';

// Single source of truth for "where should this user land after login /
// on reload" — used by Login.jsx and as a safety redirect inside every
// dashboard page in case someone bookmarks or is linked to the wrong portal.
export const getHomePathForRole = (role) => {
  if (isHRRole(role)) return '/hr/dashboard';
  if (isManagerRole(role)) return '/manager/dashboard';
  return '/dashboard';
};
