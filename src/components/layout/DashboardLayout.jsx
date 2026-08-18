import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './DashboardLayout.css';

const DashboardLayout = ({ title, subtitle, user, notificationCount, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        notificationCount={notificationCount}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-shell-main">
        <Topbar
          title={title}
          subtitle={subtitle}
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
