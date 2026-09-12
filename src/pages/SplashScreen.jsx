import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashScreen.css';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    let animationFrameId;

    // 1. Smooth 60fps frame loop that runs over 1 second
    const updateProgress = () => {
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;

      if (current < target) {
        // High-speed interpolation to reach target smoothly within the 1-second window
        const step = Math.max(0.8, (target - current) * 0.2);
        const next = Math.min(current + step, target);

        currentProgressRef.current = next;
        setProgress(next);
      }

      if (isMountedRef.current) {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    // 2. Async loader fast-tracked for 1 second total execution
    const loadAppData = async () => {
      try {
        targetProgressRef.current = 35;
        await checkAppConfig();

        if (!isMountedRef.current) return;
        targetProgressRef.current = 75;
        const isAuthenticated = await checkAuthStatus();

        if (!isMountedRef.current) return;
        targetProgressRef.current = 100;

        // Small grace period for visual completion at 100%
        setTimeout(() => {
          if (isMountedRef.current) {
            navigate(isAuthenticated ? '/dashboard' : '/login');
          }
        }, 150);
      } catch (error) {
        console.error('Initialization error:', error);
        if (isMountedRef.current) navigate('/login');
      }
    };

    loadAppData();

    return () => {
      isMountedRef.current = false;
      cancelAnimationFrame(animationFrameId);
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
                  transition: 'stroke-dashoffset 0.016s linear',
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

// Simulated tasks capped at 300ms each so the whole sequence fits in ~1 second
const checkAppConfig = () => new Promise((res) => setTimeout(res, 250));
const checkAuthStatus = () => new Promise((res) => setTimeout(res, 350));

export default SplashScreen;