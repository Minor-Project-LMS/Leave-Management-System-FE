import { Link } from 'react-router-dom';
import Button from '../../components/auth/Button';
import './ServerError.css';

const ServerError = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="server-error-page">
      <div className="server-error-content">
        {/* Error Illustration */}
        <div className="server-error-illustration">
          <div className="server-icon">
            <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Server rack */}
              <rect x="30" y="20" width="100" height="120" rx="8" fill="var(--primary-blue)" opacity="0.2"/>
              <rect x="30" y="20" width="100" height="120" rx="8" stroke="var(--primary-blue)" strokeWidth="3"/>
              
              {/* Server units */}
              <rect x="40" y="35" width="80" height="25" rx="4" fill="var(--primary-blue)" opacity="0.4"/>
              <rect x="40" y="70" width="80" height="25" rx="4" fill="var(--primary-blue)" opacity="0.4"/>
              <rect x="40" y="105" width="80" height="25" rx="4" fill="var(--primary-blue)" opacity="0.4"/>
              
              {/* Status lights */}
              <circle cx="50" cy="47" r="4" fill="#ef4444"/>
              <circle cx="60" cy="47" r="4" fill="#ef4444"/>
              <circle cx="70" cy="47" r="4" fill="#ef4444"/>
              
              <circle cx="50" cy="82" r="4" fill="#ef4444"/>
              <circle cx="60" cy="82" r="4" fill="#ef4444"/>
              <circle cx="70" cy="82" r="4" fill="#ef4444"/>
              
              <circle cx="50" cy="117" r="4" fill="#ef4444"/>
              <circle cx="60" cy="117" r="4" fill="#ef4444"/>
              <circle cx="70" cy="117" r="4" fill="#ef4444"/>
              
              {/* Warning icon */}
              <g transform="translate(100, 110)">
                <circle cx="25" cy="25" r="22" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3"/>
                <path d="M25 15V28" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="25" cy="35" r="2" fill="#f59e0b"/>
              </g>
              
              {/* Connection lines (broken) */}
              <path d="M10 80L25 80" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeDasharray="5,5"/>
              <path d="M135 80L150 80" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeDasharray="5,5"/>
            </svg>
          </div>
          
          {/* Animated waves */}
          <div className="connection-waves">
            <div className="wave wave-1"></div>
            <div className="wave wave-2"></div>
            <div className="wave wave-3"></div>
          </div>
        </div>

        {/* Error Message */}
        <div className="server-error-message">
          <div className="error-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17V17.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Connection Error
          </div>
          
          <h1>Server Not Reachable</h1>
          <p>
            We're having trouble connecting to our servers. This might be due to 
            a network issue or temporary server maintenance. Please check your 
            internet connection and try again.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="server-error-actions">
          <Button
            variant="primary"
            size="large"
            onClick={handleRetry}
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4V10H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10C20 14.4183 16.4183 18 12 18C10.4183 18 8.97027 17.4646 7.79289 16.5638" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          >
            Retry Connection
          </Button>
          
          <Button
            variant="outline"
            size="large"
            onClick={() => window.location.href = '/login'}
          >
            Go to Login
          </Button>
        </div>

        {/* Additional Help */}
        <div className="server-error-help">
          <div className="help-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2C6.68629 2 4 4.68629 4 8C4 11.3137 6.68629 14 10 14C13.3137 14 16 11.3137 16 8C16 4.68629 13.3137 2 10 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 14V18M10 18H6M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Check your internet connection</span>
          </div>
          
          <div className="help-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2H8C4.68629 2 2 4.68629 2 8V12C2 15.3137 4.68629 18 8 18H12C15.3137 18 18 15.3137 18 12V8C18 4.68629 15.3137 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 8H13M7 12H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Try again in a few minutes</span>
          </div>
          
          <div className="help-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2C6.68629 2 4 4.68629 4 8C4 11.3137 6.68629 14 10 14C13.3137 14 16 11.3137 16 8C16 4.68629 13.3137 2 10 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 14V18M10 18H6M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Contact support if the problem persists</span>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="server-error-bg">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
      </div>
    </div>
  );
};

export default ServerError;