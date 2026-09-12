import { ShieldIcon } from '../icons/Icons';
import './PrivacyBanner.css';

const PrivacyBanner = () => (
  <div className="privacy-banner">
    <div className="privacy-banner-left">
      <span className="privacy-banner-icon">
        <ShieldIcon width={16} height={16} />
      </span>
      <div>
        <strong>Privacy &amp; Security</strong>
        <p>Your data is secure and used only for managing leave and HR processes.</p>
      </div>
    </div>
    <a href="#" className="privacy-banner-link">
      Privacy Policy ↗
    </a>
  </div>
);

export default PrivacyBanner;
