import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/auth/Input';
import Button from '../../components/auth/Button';
import { handleApiError } from '../../utils/errorHandler';
import { useAuth } from '../../context/AuthContext';
import { getHomePathForRole } from '../../config/navConfig';
import loginSideImage from '../../assets/login-side.png';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // One-time cleanup: earlier builds stored the raw password, and later the
    // full JWT/user object, directly in localStorage. Purge all of it for
    // anyone returning with those already set.
    localStorage.removeItem('rememberedPassword');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';

    if (rememberMe && rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }

    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setShowSuccessModal(true);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setApiError('');
    
    try {
      // login() calls POST /auth/login with credentials:'include' so the
      // backend's Set-Cookie response sets the httpOnly refresh-token cookie;
      // the access token it returns is kept in memory only (never localStorage).
      const { profile } = await login(formData.email, formData.password);

      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedEmail');
      }

      navigate(getHomePathForRole(profile?.role));
    } catch (error) {
      handleApiError(error);
      setApiError(error.message || 'Login failed. Please try again.');
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

  const googleIcon = (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2C17.64 8.78 17.6 8.36 17.53 7.96H10V10.33H14.28C14.15 11.13 13.73 11.77 13.11 12.21V13.82H15.49C16.85 12.57 17.64 10.73 17.64 9.2Z" fill="#4285F4"/>
      <path d="M10 15.5C11.92 15.5 13.54 14.81 14.7 13.68L12.32 12.07C11.63 12.53 10.75 12.8 9.7 12.8C7.84 12.8 6.28 11.57 5.72 9.87H3.26V11.54C4.4 13.87 6.8 15.5 10 15.5Z" fill="#34A853"/>
      <path d="M5.72 9.87C5.46 9.17 5.46 8.4 5.72 7.7V6.03H3.26C2.46 7.63 2.46 9.37 3.26 10.97L5.72 9.87Z" fill="#FBBC05"/>
      <path d="M10 4.3C11.12 4.3 12.13 4.72 12.9 5.48L15.02 3.36C13.54 1.98 11.45 1.2 10 1.2C6.8 1.2 4.4 2.83 3.26 5.16L5.72 6.83C6.28 5.13 7.84 3.9 10 4.3Z" fill="#EA4335"/>
    </svg>
  );

  const microsoftIcon = (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="8" height="8" fill="#F25022"/>
      <rect x="11" y="1" width="8" height="8" fill="#7FBA00"/>
      <rect x="1" y="11" width="8" height="8" fill="#00A4EF"/>
      <rect x="11" y="11" width="8" height="8" fill="#FFB900"/>
    </svg>
  );

  return (
    <AuthLayout
      sideImage={loginSideImage}
      title="Smart Leave Management for Modern Teams"
      subtitle="Streamline your leave requests, approvals, and tracking with our intelligent system."
    >
      <div className="login-form">
        {showSuccessModal && (
          <div className="success-modal-overlay" onClick={() => setShowSuccessModal(false)}>
            <div className="success-modal" onClick={(e) => e.stopPropagation()}>
              <div className="success-modal-icon">✓</div>
              <h2>Password reset successful</h2>
              <p>{successMessage}</p>
              <Button
                type="button"
                variant="primary"
                size="medium"
                fullWidth
                onClick={() => setShowSuccessModal(false)}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        <div className="login-header">
          <h1>Welcome Back!</h1>
          <p>Sign in to continue to your account</p>
        </div>

        {apiError && (
          <div className="error-banner">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" stroke="#ef4444" strokeWidth="2"/>
              <path d="M10 6V10M10 14V14.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            label="Email Address"
            placeholder="john.doe@company.com"
            value={formData.email}
            onChange={handleChange}
            name="email"
            icon={emailIcon}
            error={errors.email}
            autoFocus
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            name="password"
            icon={passwordIcon}
            showToggle
            error={errors.password}
          />

          <div className="login-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              Remember Me
            </label>

            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
          >
            Login
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;