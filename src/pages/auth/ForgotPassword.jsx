import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/auth/Input';
import Button from '../../components/auth/Button';
import { apiService } from '../../services/api';
import { getApiErrorMessage, handleApiError } from '../../utils/errorHandler';
import forgotPasswordSideImage from '../../assets/forgot-password-side.png';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      handleApiError(error);
      setError(getApiErrorMessage(error) || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const emailIcon = (
    <svg
      className="input-icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 6L12 13L2 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const infoIcon = (
    <svg
      className="info-icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 16V12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8H12.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const successIcon = (
    <svg
      className="success-icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="var(--accent-green)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke="var(--accent-green)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
              onClick={() => window.location.href = '/login'}
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
              onClick={() => {/* TODO: Implement contact support */}}
            >
              Need Help? Contact Support
            </Button>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;