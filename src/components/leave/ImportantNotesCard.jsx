import { CheckCircleIcon } from '../icons/Icons';
import './ImportantNotesCard.css';

const DEFAULT_NOTES = [
  'Your leave request will be sent to your manager for approval.',
  'You can track the status of your request in "My Requests".',
  'Approved leaves are non-refundable.',
  'Contact HR for any leave related queries.',
];

const ImportantNotesCard = ({ notes = DEFAULT_NOTES }) => (
  <div className="important-notes-card">
    <h4>Important Notes</h4>
    <ul>
      {notes.map((note) => (
        <li key={note}>
          <CheckCircleIcon width={15} height={15} />
          <span>{note}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default ImportantNotesCard;
