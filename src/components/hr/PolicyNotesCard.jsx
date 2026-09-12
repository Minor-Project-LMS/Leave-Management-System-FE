import { InfoIcon } from '../icons/Icons';
import './PolicyNotesCard.css';

const NOTES = [
  'Policies define leave rules, accruals, carry forward and eligibility.',
  'Changes to active policies will apply from the next accrual cycle.',
  'Ensure policy approval before activating new or updated policies.',
];

const PolicyNotesCard = () => (
  <div className="policy-notes-card">
    <div className="widget-header">
      <h3>Important Notes</h3>
    </div>
    <ul className="policy-notes-list">
      {NOTES.map((note) => (
        <li key={note}>
          <InfoIcon width={14} height={14} />
          <span>{note}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default PolicyNotesCard;
