import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogoutIcon } from '../icons/Icons';
import './Sidebar.css';

const Sidebar = ({
  portalLabel = 'EMPLOYEE PORTAL',
  navItems = [],
  badgeCounts = {},
  onLogout,
  isOpen = false,
  onClose,
}) => {
  const location = useLocation();
  const [showContactModal, setShowContactModal] = useState(false);

  const handleContactUs = () => {
    setShowContactModal(true);
  };

  const handleCloseContactModal = () => {
    setShowContactModal(false);
  };

  const copyEmail = async (email) => {
    try {
      await navigator.clipboard.writeText(email);
    } catch (error) {
      console.error('Failed to copy email:', error);
    }
  };

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            LMS
          </div>

          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">
              LMS
            </span>

            <span className="sidebar-logo-subtitle">
              Leave Management System
            </span>
          </div>
        </div>

        {/* Portal Label */}
        {portalLabel && (
          <div className="sidebar-portal-label">
            {portalLabel}
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(
            ({
              label,
              path,
              icon: Icon,
              badgeKey,
              helpIcon: HelpIcon,
            }) => {
              const isActive = location.pathname === path;

              const badge = badgeKey
                ? badgeCounts[badgeKey] || 0
                : 0;

              return (
                <Link
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={`sidebar-nav-item ${
                    isActive ? 'active' : ''
                  }`}
                >
                  <Icon className="sidebar-nav-icon" />

                  <span>{label}</span>

                  {badge > 0 ? (
                    <span className="sidebar-nav-badge">
                      {badge}
                    </span>
                  ) : (
                    HelpIcon && (
                      <HelpIcon className="sidebar-help-icon" />
                    )
                  )}
                </Link>
              );
            }
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">

          {/* Help */}
          <div className="sidebar-help">
            <p>
              Need Help? Contact HR Support
            </p>

            <button
              type="button"
              className="sidebar-contact-btn"
              onClick={handleContactUs}
            >
              Contact Us
            </button>
          </div>

          {/* Logout */}
          <button
            type="button"
            className="sidebar-logout"
            onClick={onLogout}
          >
            <LogoutIcon />
            <span>Logout</span>
          </button>

        </div>
      </aside>

      {/* =========================================
          CONTACT SUPPORT MODAL
          ========================================= */}

      {showContactModal && (
        <div
          className="contact-modal-overlay"
          onClick={handleCloseContactModal}
        >
          <div
            className="contact-modal"
            onClick={(event) => event.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="contact-modal-header">
              <h2>Contact Support</h2>

              <button
                type="button"
                className="contact-modal-close"
                onClick={handleCloseContactModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="contact-modal-divider" />

            {/* Description */}
            <p className="contact-modal-description">
              If you're having trouble resetting your password,
              reach out directly to our support channels below:
            </p>

            {/* Technical Team */}
            <div className="contact-team-card">
              <div className="contact-team-info">

                <span className="contact-team-label">
                  TECHNICAL TEAM
                </span>

                <a href="mailto:lms-technical@mailinator.com">
                  lms-technical@mailinator.com
                </a>

              </div>

              <button
                type="button"
                className="contact-copy-btn"
                onClick={() =>
                  copyEmail('lms-technical@mailinator.com')
                }
              >
                <span className="copy-icon">
                  ▣
                </span>
                Copy
              </button>
            </div>

            {/* HR Team */}
            <div className="contact-team-card">
              <div className="contact-team-info">

                <span className="contact-team-label">
                  HR TEAM
                </span>

                <a href="mailto:lms-hr@mailinator.com">
                  lms-hr@mailinator.com
                </a>

              </div>

              <button
                type="button"
                className="contact-copy-btn"
                onClick={() =>
                  copyEmail('lms-hr@mailinator.com')
                }
              >
                <span className="copy-icon">
                  ▣
                </span>
                Copy
              </button>
            </div>

            {/* Modal Footer */}
            <div className="contact-modal-footer">
              <button
                type="button"
                className="contact-close-btn"
                onClick={handleCloseContactModal}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;