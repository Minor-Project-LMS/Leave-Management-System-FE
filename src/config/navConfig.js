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
    { label: 'Reports & Analytics', path: '/manager/reports', icon: BarChartIcon },
    { label: 'Settings', path: '/manager/settings', icon: SettingsIcon },
  ],
};

// Roles that should land on the Manager portal instead of the Employee one.
// Adjust these strings if your backend uses different role values.
const MANAGER_ROLES = ['MANAGER', 'ADMIN', 'HR', 'HR_ADMIN'];

export const isManagerRole = (role) =>
  !!role && MANAGER_ROLES.includes(String(role).toUpperCase());

// Single source of truth for "where should this user land after login /
// on reload" — used by Login.jsx and as a safety redirect inside both
// dashboard pages in case someone bookmarks or is linked to the wrong one.
export const getHomePathForRole = (role) =>
  isManagerRole(role) ? '/manager/dashboard' : '/dashboard';
