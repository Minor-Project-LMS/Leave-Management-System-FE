import { InfoIcon } from '../icons/Icons';
import './InsightsCard.css';

// insights: string[] — from ReportSummary.insights, per the spec an
// "Auto-generated narrative bullets" field the backend is meant to compute.
const InsightsCard = ({ insights = [] }) => {
  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="insights-card">
      <div className="insights-card-header">
        <InfoIcon width={16} height={16} />
        <h3>Insights &amp; Observations</h3>
      </div>
      <ul className="insights-card-list">
        {insights.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
};

export default InsightsCard;
