import { InfoIcon, PlusIcon } from '../icons/Icons';
import './DelegationInfoBanner.css';

const DelegationInfoBanner = ({ onCreate }) => (
  <div className="delegation-info-banner">
    <div className="delegation-info-banner-left">
      <span className="delegation-info-banner-icon">
        <InfoIcon width={18} height={18} />
      </span>
      <div>
        <strong>What is Delegation?</strong>
        <p>Delegate approval rights temporarily to Manager or HR when out of office or unavailable.</p>
      </div>
    </div>
    <button className="delegation-create-btn" onClick={onCreate}>
      <PlusIcon width={16} height={16} />
      Create Delegation
    </button>
  </div>
);

export default DelegationInfoBanner;
