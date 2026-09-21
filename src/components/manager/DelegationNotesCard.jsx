import { InfoIcon } from '../icons/Icons';
import './DelegationNotesCard.css';

const NOTES = [
  'You remain responsible for all decisions made during the delegation period.',
  'Delegations automatically expire on the end date.',
  'You will be notified of all actions taken by your delegate.',
];

const DelegationNotesCard = () => (
  <div className="delegation-notes-card">
    <div className="widget-header">
      <h3>Important Notes</h3>
    </div>
    <ul className="delegation-notes-list">
      {NOTES.map((note) => (
        <li key={note}>
          <InfoIcon width={14} height={14} />
          <span>{note}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default DelegationNotesCard;
