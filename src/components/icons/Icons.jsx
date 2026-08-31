// Lightweight inline SVG icon set for the dashboard.
// Kept dependency-free (no icon library) to match the current project setup.

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const CalendarIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

export const ClockIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

export const HourglassIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M6 3h12M6 21h12M7 3c0 5 5 5 5 9s-5 4-5 9M17 3c0 5-5 5-5 9s5 4 5 9" />
  </svg>
);

export const CoffeeIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12h8M12 8v8" />
  </svg>
);

export const BellIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

export const SearchIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

export const ChevronLeftIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const ChevronRightIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export const GridIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

export const PlusCircleIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

export const FileTextIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6M8 13h8M8 17h5" />
  </svg>
);

export const ListIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
);

export const BookIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);

export const UserIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

export const LogoutIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </svg>
);

export const CheckCircleIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12l3 3 5-6" />
  </svg>
);

export const XCircleIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15 9l-6 6M9 9l6 6" />
  </svg>
);

export const UsersIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5" />
    <path d="M16 8.5a3 3 0 110-5.99M21.5 20c0-2.8-2-4.5-4.5-5.2" />
  </svg>
);

export const InboxIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 12h4l2 3h4l2-3h4" />
    <path d="M5.5 5h13l2.5 7v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7z" />
  </svg>
);

export const ClipboardListIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="5" y="4" width="14" height="18" rx="2" />
    <path d="M9 2h6v3H9zM8 10h8M8 14h8M8 18h5" />
  </svg>
);

export const BarChartIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 20V10M12 20V4M20 20v-7" />
  </svg>
);

export const SettingsIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

export const InfoIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

export const ChevronRightSmallIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export const TrendUpIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />
  </svg>
);

export const TrendDownIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 7l6 6 4-4 8 8M15 17h6v-6" />
  </svg>
);

export const DownloadIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
  </svg>
);

export const HistoryIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
    <path d="M3 3v5h5M12 7v5l4 2" />
  </svg>
);

export const EyeIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const PaperclipIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M21 11.5L12.5 20a4.5 4.5 0 01-6.36-6.36L14.5 5.28a3 3 0 014.24 4.24L10.4 17.86a1.5 1.5 0 01-2.12-2.12l7.78-7.78" />
  </svg>
);

export const FilterIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 5h16M7 12h10M10 19h4" />
  </svg>
);

export const ChevronDownIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const CheckIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const XIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export const HeadsetIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 13a9 9 0 0118 0" />
    <path d="M21 13v4a2 2 0 01-2 2h-1v-6h1a2 2 0 012 2zM3 13v4a2 2 0 002 2h1v-6H5a2 2 0 00-2 2z" />
    <path d="M12 19v1a2 2 0 002 2h1" />
  </svg>
);

export const PalmTreeIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 22V12M12 12c-2-3-6-3-8-1 2 1 4 1 5 0M12 12c2-3 6-3 8-1-2 1-4 1-5 0M12 12c-1-3 0-6 2-8-1 2-1 4 0 6M12 12c1-3 0-6-2-8 1 2 1 4 0 6" />
  </svg>
);

export const HeartPulseIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
    <path d="M6 12h2l1.5-3L11 15l1.5-4H16" />
  </svg>
);

export const BriefcaseIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16M2 13h20" />
  </svg>
);

export const PlusIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const UploadIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 21V9M7 14l5-5 5 5M4 21h16" />
  </svg>
);

export const MoreVerticalIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export const EditIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const ShieldIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6Z" />
    <path d="M9.5 12l1.8 1.8L14.5 10" />
  </svg>
);

export const CameraIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="14" r="3.5" />
  </svg>
);

export const EyeOffIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 3l18 18" />
    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
    <path d="M9.5 5.4A10.4 10.4 0 0 1 12 5c5 0 9 4.5 10 7-0.4 1-1.3 2.5-2.6 3.9M6.2 6.2C4 7.6 2.4 9.7 2 12c1 2.5 5 7 10 7 1.2 0 2.4-.2 3.4-.6" />
  </svg>
);

export const ArrowLeftIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const MessageSquareIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

export const BuildingIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 2v20M15 2v20M4 10h16M4 16h16M8 6h2M14 6h2M8 12h2M14 12h2M8 18h2M14 18h2" />
  </svg>
);

export const AlertCircleIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

export const SwapIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M7 3v14M7 3l-4 4M7 3l4 4" />
    <path d="M17 21V7M17 21l-4-4M17 21l4-4" />
  </svg>
);
