import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashScreen.css';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    // Navigate to login after 3 seconds (regardless of auth state)
    // This ensures users can always reach login even if backend is down
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        {/* Logo Animation */}
        <div className="splash-logo">
          <div className="logo-pulse">
            <div className="logo-icon">LMS</div>
          </div>
          <div className="logo-text">
            <h1>Leave Management System</h1>
            <p>Smart Leave Management for Modern Teams</p>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="splash-loader">
          <div className="loader-circle">
            <svg className="loader-svg" viewBox="0 0 50 50">
              <circle
                className="loader-bg"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="3"
              />
              <circle
                className="loader-progress"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                style={{
                  strokeDasharray: '125.6',
                  strokeDashoffset: 125.6 - (125.6 * progress) / 100,
                }}
              />
            </svg>
            <div className="loader-percentage">{Math.round(progress)}%</div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="splash-text">
          <p>Loading your experience...</p>
        </div>

        {/* Animated Dots */}
        <div className="splash-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="splash-bg-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </div>
  );
};

export default SplashScreen;