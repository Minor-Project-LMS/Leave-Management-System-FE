import { Link } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = ({ 
  children, 
  sideImage, 
  title, 
  subtitle, 
  showBackLink = false,
  backLinkText = 'Back to Login',
  backLinkPath = '/login'
}) => {
  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        {/* Left Side Panel */}
        <div className="auth-side-panel">
          <div className="auth-side-content">
            {/* Logo */}
            <div className="auth-logo">
              <div className="logo-icon">LMS</div>
              <div className="logo-text">Leave Management System</div>
            </div>

            {/* Side Image */}
            {sideImage && (
              <div className="auth-side-image">
                <img src={sideImage} alt="Authentication illustration" />
              </div>
            )}

            {/* Title and Subtitle */}
            {title && (
              <div className="auth-side-text">
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
              </div>
            )}

            {/* Footer */}
            <div className="auth-side-footer">
              <p>© 2026 Leave Management System. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* Right Side Panel - Form */}
        <div className="auth-form-panel">
          <div className="auth-form-content">
            {/* Back Link */}
            {showBackLink && (
              <Link to={backLinkPath} className="auth-back-link">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {backLinkText}
              </Link>
            )}

            {/* Form Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;