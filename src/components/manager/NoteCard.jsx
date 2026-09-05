import { InfoIcon } from '../icons/Icons';
import './NoteCard.css';

// tone: 'amber' (default) | 'info' (blue) — 'info' used where a note is
// purely informational rather than a caution (e.g. Team Members sidebar).
const NoteCard = ({ children, tone = 'amber' }) => (
  <div className={`note-card note-card-${tone}`}>
    <InfoIcon className="note-card-icon" width={18} height={18} />
    <p>{children}</p>
  </div>
);

export default NoteCard;
