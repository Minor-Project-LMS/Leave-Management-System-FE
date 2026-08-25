import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './DashboardLayout.css';

const DashboardLayout = ({
  title,
  subtitle,
  breadcrumbs,
  dateLabel,
  portalLabel,
  navItems,
  searchPlaceholder,
  user,
  notificationCount = 0,
  badgeCounts,
  onLogout,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        portalLabel={portalLabel}
        navItems={navItems}
        badgeCounts={badgeCounts}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-shell-main">
        <Topbar
          title={title}
          subtitle={subtitle}
          breadcrumbs={breadcrumbs}
          dateLabel={dateLabel}
          searchPlaceholder={searchPlaceholder}
          user={user}
          notificationCount={notificationCount}
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="app-shell-content">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
