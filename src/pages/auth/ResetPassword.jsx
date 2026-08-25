import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/auth/Input';
import Button from '../../components/auth/Button';
import { apiService } from '../../services/api';
import { handleApiError } from '../../utils/errorHandler';
import resetPasswordSideImage from '../../assets/reset-password-side.png';
import './ResetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email || '';

  const [formData, setFormData] = useState({
    email: emailFromState,
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [resendTimer, setResendTimer] = useState(46);
  const [canResend, setCanResend] = useState(false);

  // ============================================================
  // RESEND OTP TIMER
  // ============================================================
  useEffect(() => {
    let timer;

    if (resendTimer > 0 && !canResend) {
      timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0 && !canResend) {
      setCanResend(true);
    }

    return () => clearTimeout(timer);
  }, [resendTimer, canResend]);

  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Clear API error
    setApiError('');
  };

  // ============================================================
  // RESEND OTP
  // ============================================================
  const handleResendCode = async () => {
    if (!canResend) return;

    try {
      await apiService.forgotPassword(formData.email);

      setResendTimer(46);
      setCanResend(false);
      setApiError('');
    } catch (error) {
      handleApiError(error);

      setApiError(
        error.message || 'Failed to resend code. Please try again.'
      );
    }
  };

  // ============================================================
  // FORM VALIDATION
  // ============================================================
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // OTP validation
    if (!formData.otp) {
      newErrors.otp = 'Verification code is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'Please enter a valid 6-digit code';
    }

    // Password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword =
        'Password must be at least 8 characters';
    } else if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
      newErrors.newPassword =
        'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[0-9])/.test(formData.newPassword)) {
      newErrors.newPassword =
        'Password must contain at least one number';
    } else if (!/(?=.*[!@#$%^])/.test(formData.newPassword)) {
      newErrors.newPassword =
        'Password must contain at least one special character';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (
      formData.newPassword !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // SUBMIT RESET PASSWORD
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      /*
       * Backend returns HTTP 204 No Content when the password
       * is successfully reset.
       *
       * Therefore, DO NOT check:
       *
       *     response.success
       *
       * because a 204 response does not contain a response body.
       */

      await apiService.resetPassword(
        formData.email,
        formData.otp,
        formData.newPassword
      );

      /*
       * If resetPassword() completes without throwing an error,
       * the password reset was successful.
       *
       * Redirect to login and pass the success message through
       * React Router state.
       */
      navigate('/login', {
        replace: true,
        state: {
          message:
            'Password has been reset successfully. Please login with your new password.',
        },
      });
    } catch (error) {
      handleApiError(error);

      setApiError(
        error.message || 'Password reset failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // EMAIL ICON
  // ============================================================
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

  // ============================================================
  // OTP ICON
  // ============================================================
  const otpIcon = (
    <svg
      className="input-icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // ============================================================
  // PASSWORD ICON
  // ============================================================
  const passwordIcon = (
    <svg
      className="input-icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="11"
        width="18"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="16"
        r="1"
        fill="currentColor"
      />
    </svg>
  );

  // ============================================================
  // PASSWORD STRENGTH
  // ============================================================
  const getPasswordStrength = (password) => {
    if (!password) {
      return {
        strength: 0,
        label: '',
      };
    }

    let strength = 0;

    if (password.length >= 8) {
      strength++;
    }

    if (/[A-Z]/.test(password)) {
      strength++;
    }

    if (/[0-9]/.test(password)) {
      strength++;
    }

    if (/[!@#$%^]/.test(password)) {
      strength++;
    }

    const labels = [
      '',
      'Weak',
      'Fair',
      'Good',
      'Strong',
    ];

    return {
      strength,
      label: labels[strength],
    };
  };

  const passwordStrength = getPasswordStrength(
    formData.newPassword
  );

  // ============================================================
  // FORMAT TIMER
  // ============================================================
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins
      .toString()
      .padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // ============================================================
  // UI
  // ============================================================
  return (
    <AuthLayout
      sideImage={resetPasswordSideImage}
      title="Reset Your Password"
      subtitle="Create a new strong password to secure your account."
      showBackLink
      backLinkText="Back to Login"
      backLinkPath="/login"
    >
      <div className="reset-password-form">

        {/* Header */}
        <div className="reset-password-header">
          <h1>Reset Password</h1>

          <p>
            Enter the verification code sent to your email and
            create a new password.
          </p>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="error-banner">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="#ef4444"
                strokeWidth="2"
              />

              <path
                d="M10 6V10M10 14V14.01"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Email */}
          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            name="email"
            icon={emailIcon}
            error={errors.email}
          />

          {/* OTP */}
          <div className="otp-input-group">
            <label className="input-label">
              Verification Code (OTP)
            </label>

            <div className="otp-wrapper">

              <div className="otp-icon">
                {otpIcon}
              </div>

              <input
                type="text"
                className="otp-input"
                placeholder="Enter 6-digit code"
                value={formData.otp}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, '')
                    .slice(0, 6);

                  setFormData((prev) => ({
                    ...prev,
                    otp: value,
                  }));

                  if (errors.otp) {
                    setErrors((prev) => ({
                      ...prev,
                      otp: '',
                    }));
                  }

                  setApiError('');
                }}
                maxLength={6}
              />

              <button
                type="button"
                className="resend-button"
                onClick={handleResendCode}
                disabled={!canResend}
              >
                {canResend
                  ? 'Resend Code'
                  : `Resend Code (${formatTime(
                      resendTimer
                    )})`}
              </button>

            </div>

            {errors.otp && (
              <div className="input-error">
                {errors.otp}
              </div>
            )}
          </div>

          {/* New Password */}
          <Input
            type="password"
            label="New Password"
            placeholder="Create a new password"
            value={formData.newPassword}
            onChange={handleChange}
            name="newPassword"
            icon={passwordIcon}
            showToggle
            error={errors.newPassword}
          />

          {/* Password Strength */}
          {formData.newPassword && (
            <>
              <div className="password-strength">

                <div className="strength-bar">
                  <div
                    className={`strength-fill strength-${passwordStrength.strength}`}
                    style={{
                      width: `${passwordStrength.strength * 25}%`,
                    }}
                  />
                </div>

                <span
                  className={`strength-label strength-${passwordStrength.strength}`}
                >
                  {passwordStrength.label}
                </span>

              </div>

              {/* Password Requirements */}
              <div className="password-requirements">

                {/* 8 Characters */}
                <div
                  className={`requirement ${
                    formData.newPassword.length >= 8
                      ? 'met'
                      : ''
                  }`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  At least 8 characters
                </div>

                {/* Uppercase */}
                <div
                  className={`requirement ${
                    /[A-Z]/.test(formData.newPassword)
                      ? 'met'
                      : ''
                  }`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  One uppercase letter (A-Z)
                </div>

                {/* Number */}
                <div
                  className={`requirement ${
                    /[0-9]/.test(formData.newPassword)
                      ? 'met'
                      : ''
                  }`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  One number (0-9)
                </div>

                {/* Special Character */}
                <div
                  className={`requirement ${
                    /[!@#$%^]/.test(formData.newPassword)
                      ? 'met'
                      : ''
                  }`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  One special character (!@#$%^)
                </div>

              </div>
            </>
          )}

          {/* Confirm Password */}
          <Input
            type="password"
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            name="confirmPassword"
            icon={passwordIcon}
            showToggle
            error={errors.confirmPassword}
          />

          {/* Password Match */}
          {formData.confirmPassword &&
            formData.newPassword ===
              formData.confirmPassword && (
              <div className="password-match">

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                Passwords match

              </div>
            )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle
                  cx="12"
                  cy="16"
                  r="1"
                  fill="currentColor"
                />
              </svg>
            }
          >
            Reset Password
          </Button>

        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;