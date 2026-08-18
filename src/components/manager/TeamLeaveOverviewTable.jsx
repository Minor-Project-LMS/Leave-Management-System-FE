import './TeamLeaveOverviewTable.css';

const TeamLeaveOverviewTable = ({ rows = [] }) => {
  const totals = rows.reduce(
    (acc, r) => ({
      totalMembers: acc.totalMembers + r.totalMembers,
      onLeaveToday: acc.onLeaveToday + r.onLeaveToday,
      leavesThisMonth: acc.leavesThisMonth + r.leavesThisMonth,
      balanceSum: acc.balanceSum + r.availableBalanceAvg,
    }),
    { totalMembers: 0, onLeaveToday: 0, leavesThisMonth: 0, balanceSum: 0 }
  );
  const avgBalance = rows.length ? (totals.balanceSum / rows.length).toFixed(1) : '0.0';

  return (
    <div className="team-overview">
      <div className="widget-header">
        <h3>Team Leave Overview</h3>
      </div>

      {rows.length === 0 ? (
        <p className="widget-empty">No team data yet.</p>
      ) : (
        <div className="team-overview-table-wrap">
          <table className="team-overview-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Total Members</th>
                <th>On Leave Today</th>
                <th>This Month</th>
                <th>Available Balance (Avg)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.department}>
                  <td className="team-overview-dept">{r.department}</td>
                  <td>{r.totalMembers}</td>
                  <td>{r.onLeaveToday}</td>
                  <td>{r.leavesThisMonth}</td>
                  <td>{r.availableBalanceAvg} Days</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="team-overview-dept">Total</td>
                <td>{totals.totalMembers}</td>
                <td>{totals.onLeaveToday}</td>
                <td>{totals.leavesThisMonth}</td>
                <td>{avgBalance} Days</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeamLeaveOverviewTable;
