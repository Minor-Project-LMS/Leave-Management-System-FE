import { InfoIcon } from '../icons/Icons';
import './NoteCard.css';

const NoteCard = ({ children }) => (
  <div className="note-card">
    <InfoIcon className="note-card-icon" width={18} height={18} />
    <p>{children}</p>
  </div>
);

export default NoteCard;
