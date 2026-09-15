import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/auth/Input';
import Button from '../../components/auth/Button';
import { apiService } from '../../services/api';
import { handleApiError } from '../../utils/errorHandler';
import forgotPasswordSideImage from '../../assets/forgot-password-side.png';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Support Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(null);

  const handleCopy = (emailText) => {
    navigator.clipboard.writeText(emailText);
    setCopiedEmail(emailText);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.forgotPassword(email);
      if (response.success || response.message) {
        navigate('/reset-password', { state: { email } });
      }
    } catch (err) {
      handleApiError(err);
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const emailIcon = (
    <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const infoIcon = (
    <svg className="info-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const successIcon = (
    <svg className="success-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="var(--accent-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12L11 14L15 10" stroke="var(--accent-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const copyIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );

  const checkIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  return (
    <AuthLayout
      sideImage={forgotPasswordSideImage}
      title="Smart Leave Management Made Simple"
      subtitle="Efficiently manage your team's leave requests and approvals."
      showBackLink
      backLinkText="Back to Login"
      backLinkPath="/login"
    >
      <div className="forgot-password-form">
        <div className="forgot-password-header">
          <h1>Forgot Password?</h1>
          <p>Enter your registered email address and we will send you a link to reset your password.</p>
        </div>

        {success ? (
          <div className="success-message">
            <div className="success-icon">{successIcon}</div>
            <h2>Reset Link Sent!</h2>
            <p>We've sent a password reset link to your email address. Please check your inbox and spam folder.</p>
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={() => (window.location.href = '/login')}
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <>
            {error && (
              <div className="error-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8V12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16H12.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email address"
                name="email"
                value={email}
                onChange={handleChange}
                icon={emailIcon}
                error={error}
                autoFocus
              />

              <div className="info-box">
                <div className="info-icon">{infoIcon}</div>
                <p>We'll send a password reset link to your email address. Please check your inbox and spam folder.</p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                loading={loading}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
              >
                Send Reset Link
              </Button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            <Button
              variant="secondary"
              size="medium"
              fullWidth
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              onClick={() => setIsModalOpen(true)}
            >
              Need Help? Contact Support
            </Button>
          </>
        )}
      </div>

      {/* Support Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Contact Support</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)} aria-label="Close modal">
                &times;
              </button>
            </div>
            
            <p className="modal-description">
              If you're having trouble resetting your password, reach out directly to our support channels below:
            </p>

            <div className="support-list">
              {/* Technical Team */}
              <div className="support-card">
                <div className="support-info">
                  <span className="support-label">Technical Team</span>
                  <a href="mailto:lms-technical@mailnator.com" className="support-email">
                    lms-technical@mailnator.com
                  </a>
                </div>
                <button
                  className={`copy-btn ${copiedEmail === 'lms-technical@mailnator.com' ? 'copied' : ''}`}
                  onClick={() => handleCopy('lms-technical@mailnator.com')}
                >
                  {copiedEmail === 'lms-technical@mailnator.com' ? (
                    <>
                      {checkIcon}
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      {copyIcon}
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* HR Team */}
              <div className="support-card">
                <div className="support-info">
                  <span className="support-label">HR Team</span>
                  <a href="mailto:lms-hr@mailnator.com" className="support-email">
                    lms-hr@mailnator.com
                  </a>
                </div>
                <button
                  className={`copy-btn ${copiedEmail === 'lms-hr@mailnator.com' ? 'copied' : ''}`}
                  onClick={() => handleCopy('lms-hr@mailnator.com')}
                >
                  {copiedEmail === 'lms-hr@mailnator.com' ? (
                    <>
                      {checkIcon}
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      {copyIcon}
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <Button variant="secondary" size="medium" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;