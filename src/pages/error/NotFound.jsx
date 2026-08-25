import { Link } from 'react-router-dom';
import Button from '../../components/auth/Button';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        {/* 404 Illustration */}
        <div className="not-found-illustration">
          <div className="number-404">
            <span className="number">4</span>
            <div className="zero-circle">
              <div className="zero-inner">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path d="M40 60L55 75L80 45" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <span className="number">4</span>
          </div>
          
          {/* Character */}
          <div className="not-found-character">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Body */}
              <ellipse cx="100" cy="140" rx="40" ry="50" fill="var(--primary-blue)" opacity="0.8"/>
              
              {/* Head */}
              <circle cx="100" cy="70" r="35" fill="var(--primary-blue)"/>
              
              {/* Eyes */}
              <circle cx="88" cy="65" r="8" fill="white"/>
              <circle cx="112" cy="65" r="8" fill="white"/>
              <circle cx="88" cy="65" r="4" fill="var(--text-primary)"/>
              <circle cx="112" cy="65" r="4" fill="var(--text-primary)"/>
              
              {/* Eyebrows (confused look) */}
              <path d="M80 55Q88 50 96 55" stroke="var(--text-primary)" strokeWidth="3" strokeLinecap="round"/>
              <path d="M104 55Q112 50 120 55" stroke="var(--text-primary)" strokeWidth="3" strokeLinecap="round"/>
              
              {/* Mouth */}
              <path d="M90 82Q100 78 110 82" stroke="var(--text-primary)" strokeWidth="3" strokeLinecap="round"/>
              
              {/* Arms */}
              <path d="M60 130Q40 120 35 100" stroke="var(--primary-blue)" strokeWidth="8" strokeLinecap="round"/>
              <path d="M140 130Q160 120 165 100" stroke="var(--primary-blue)" strokeWidth="8" strokeLinecap="round"/>
              
              {/* Magnifying glass */}
              <g transform="translate(140, 80) rotate(-30)">
                <circle cx="20" cy="20" r="15" stroke="var(--primary-dark)" strokeWidth="4" fill="rgba(37, 99, 235, 0.2)"/>
                <path d="M32 32L45 45" stroke="var(--primary-dark)" strokeWidth="4" strokeLinecap="round"/>
              </g>
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="not-found-message">
          <h1>Page Not Found</h1>
          <p>
            Oops! The page you're looking for seems to have wandered off. 
            Don't worry, let's get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="not-found-actions">
          <Button
            variant="primary"
            size="large"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          
          <Button
            variant="outline"
            size="large"
            onClick={() => window.location.href = '/login'}
          >
            Go to Login
          </Button>
        </div>

        {/* Help Text */}
        <div className="not-found-help">
          <p>
            If you believe this is an error, please contact our 
            <a href="mailto:support@lms.com"> support team</a>
          </p>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="not-found-bg">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
      </div>
    </div>
  );
};

export default NotFound;