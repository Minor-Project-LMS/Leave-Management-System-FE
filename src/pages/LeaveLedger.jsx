import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import LeaveBalanceSummary from '../components/leave/LeaveBalanceSummary';
import { DownloadIcon, ChevronLeftIcon, ChevronRightIcon, BookIcon } from '../components/icons/Icons';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EMPLOYEE_PORTAL } from '../config/navConfig';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import { env } from '../config/env';
import './LeaveLedger.css';

const USE_MOCK = env.useMockData;

const mockBalanceSummary = [
  { categoryId: 1, categoryName: 'Casual Leave', fiscalYear: 2024, openingBalance: 15.0, accrued: 3.75, used: 6.25, encashed: 0, carriedForward: 0, closingBalance: 12.5, availableBalance: 12.5 },
  { categoryId: 2, categoryName: 'Sick Leave', fiscalYear: 2024, openingBalance: 10.0, accrued: 0, used: 2.0, encashed: 0, carriedForward: 0, closingBalance: 8.0, availableBalance: 8.0 },
  { categoryId: 3, categoryName: 'Earned Leave', fiscalYear: 2024, openingBalance: 20.0, accrued: 0, used: 2.0, encashed: 0, carriedForward: 0, closingBalance: 18.0, availableBalance: 18.0 },
  { categoryId: 4, categoryName: 'Comp-Off', fiscalYear: 2024, openingBalance: 5.0, accrued: 0, used: 4.0, encashed: 0, carriedForward: 0, closingBalance: 1.0, availableBalance: 1.0 },
];

const mockTransactions = [
  { id: 1, date: '2024-04-01', categoryId: 1, categoryName: 'Casual Leave', description: 'Opening Balance', credit: 15.0, debit: null, runningBalance: 15.0, referenceType: 'SYSTEM', referenceId: null },
  { id: 2, date: '2024-04-10', categoryId: 1, categoryName: 'Casual Leave', description: 'Leave Applied (10 Apr - 12 Apr)', credit: null, debit: 3.0, runningBalance: 12.0, referenceType: 'LEAVE_REQUEST', referenceId: 108 },
  { id: 3, date: '2024-05-01', categoryId: 1, categoryName: 'Casual Leave', description: 'Monthly Accrual', credit: 1.25, debit: null, runningBalance: 13.25, referenceType: 'SYSTEM', referenceId: null },
  { id: 4, date: '2024-05-15', categoryId: 1, categoryName: 'Casual Leave', description: 'Leave Applied (15 May - 16 May)', credit: null, debit: 2.0, runningBalance: 11.25, referenceType: 'LEAVE_REQUEST', referenceId: 112 },
  { id: 5, date: '2024-06-01', categoryId: 1, categoryName: 'Casual Leave', description: 'Monthly Accrual', credit: 1.25, debit: null, runningBalance: 12.5, referenceType: 'SYSTEM', referenceId: null },
  { id: 6, date: '2024-04-01', categoryId: 2, categoryName: 'Sick Leave', description: 'Opening Balance', credit: 10.0, debit: null, runningBalance: 10.0, referenceType: 'SYSTEM', referenceId: null },
  { id: 7, date: '2024-04-20', categoryId: 2, categoryName: 'Sick Leave', description: 'Leave Applied (20 Apr)', credit: null, debit: 1.0, runningBalance: 9.0, referenceType: 'LEAVE_REQUEST', referenceId: 110 },
  { id: 8, date: '2024-05-10', categoryId: 2, categoryName: 'Sick Leave', description: 'Leave Applied (10 May)', credit: null, debit: 1.0, runningBalance: 8.0, referenceType: 'LEAVE_REQUEST', referenceId: 115 },
  { id: 9, date: '2024-04-01', categoryId: 3, categoryName: 'Earned Leave', description: 'Opening Balance', credit: 20.0, debit: null, runningBalance: 20.0, referenceType: 'SYSTEM', referenceId: null },
  { id: 10, date: '2024-04-15', categoryId: 3, categoryName: 'Earned Leave', description: 'Leave Applied (15 Apr - 17 Apr)', credit: null, debit: 2.0, runningBalance: 18.0, referenceType: 'LEAVE_REQUEST', referenceId: 109 },
];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getCurrentDateLabel = () => {
  const date = new Date();
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

const LeaveLedger = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useRoleRedirect('employee');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [balanceSummary, setBalanceSummary] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const years = [2024, 2023, 2022, 2021];

  const loadLedgerData = useCallback(async () => {
    setLoading(true);
    setError('');

    if (USE_MOCK) {
      setBalanceSummary(mockBalanceSummary);
      setTransactions(mockTransactions);
      setPagination({ page: 1, limit: 10, total: mockTransactions.length, totalPages: 1 });
      setLoading(false);
      return;
    }

    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        apiService.getLeaveLedger(selectedYear),
        apiService.getLeaveLedgerTransactions({ year: selectedYear, page: pagination.page, limit: pagination.limit })
      ]);

      const balanceData = balanceRes?.data ?? balanceRes ?? [];
      const transactionsData = transactionsRes?.data ?? transactionsRes ?? [];
      const paginationData = transactionsRes?.pagination ?? { page: 1, limit: 10, total: transactionsData.length, totalPages: 1 };

      setBalanceSummary(balanceData);
      setTransactions(transactionsData);
      setPagination(paginationData);
    } catch (err) {
      console.error('Error loading ledger data:', err);
      setError(err.message || 'Failed to load ledger data. Using sample data for demonstration.');
      setBalanceSummary(mockBalanceSummary);
      setTransactions(mockTransactions);
      setPagination({ page: 1, limit: 10, total: mockTransactions.length, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [selectedYear, pagination.page, pagination.limit]);

  useEffect(() => {
    loadLedgerData();
  }, [loadLedgerData]);

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExport = async () => {
    try {
      const response = await apiService.exportLeaveLedger({ year: selectedYear, format: 'csv' });
      
      // Create download link
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leave-ledger-${selectedYear}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export ledger. Please try again.');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Category code mapping for balance summary
  const categoryCodeById = {
    1: 'CL',
    2: 'SL',
    3: 'EL',
    4: 'CO'
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading Leave Ledger...</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Leave Ledger"
      breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Leave Ledger' }]}
      portalLabel={EMPLOYEE_PORTAL.portalLabel}
      navItems={EMPLOYEE_PORTAL.navItems}
      searchPlaceholder={EMPLOYEE_PORTAL.searchPlaceholder}
      user={user}
      onLogout={handleLogout}
    >
      {error && <div className="dashboard-error-banner">{error} - Showing sample data for demonstration.</div>}

      <div className="leave-ledger-container">
        {/* Balance Summary Cards */}
        <div className="balance-cards-section">
          <div className="balance-cards-header">
            <h3>Leave Balance Summary</h3>
            <span className="balance-date-label">Leave balance as on {getCurrentDateLabel()}</span>
          </div>
          <div className="balance-cards-grid">
            {balanceSummary.map((balance) => {
              const code = categoryCodeById[balance.categoryId] || balance.categoryName?.slice(0, 2).toUpperCase();
              const total = (balance.openingBalance || 0) + (balance.accrued || 0) + (balance.carriedForward || 0);
              
              return (
                <div key={balance.categoryId} className="balance-card">
                  <div className="balance-card-header">
                    <span className="balance-card-code">{code}</span>
                    <span className="balance-card-name">{balance.categoryName}</span>
                  </div>
                  <div className="balance-card-values">
                    <div className="balance-card-available">
                      {balance.availableBalance.toFixed(1)}
                      <span className="balance-card-total">/{total.toFixed(1)}</span>
                    </div>
                    <span className="balance-card-label">Available / Total Days</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="ledger-main-content">
          {/* Transactions Table */}
          <div className="transactions-section">
            <div className="transactions-header">
              <h3>Leave Transaction History</h3>
              <div className="transactions-controls">
                <select 
                  className="year-selector"
                  value={selectedYear}
                  onChange={handleYearChange}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <button className="btn-export" onClick={handleExport}>
                  <DownloadIcon width={16} height={16} />
                  Export
                </button>
              </div>
            </div>

            <div className="transactions-table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Leave Type</th>
                    <th>Description</th>
                    <th>Credits (Days)</th>
                    <th>Debits (Days)</th>
                    <th>Balance (Days)</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-transactions">
                        No transactions found for the selected year.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="transaction-date">{formatDate(transaction.date)}</td>
                        <td className="transaction-type">
                          <span className="leave-type-badge">{transaction.categoryName}</span>
                        </td>
                        <td className="transaction-description">{transaction.description}</td>
                        <td className="transaction-credits">
                          {transaction.credit !== null ? (
                            <span className="credit-value">+{transaction.credit.toFixed(1)}</span>
                          ) : (
                            <span className="dash">-</span>
                          )}
                        </td>
                        <td className="transaction-debits">
                          {transaction.debit !== null ? (
                            <span className="debit-value">-{transaction.debit.toFixed(1)}</span>
                          ) : (
                            <span className="dash">-</span>
                          )}
                        </td>
                        <td className="transaction-balance">
                          <span className="balance-value">{transaction.runningBalance.toFixed(1)}</span>
                        </td>
                        <td className="transaction-reference">
                          {transaction.referenceType === 'LEAVE_REQUEST' ? (
                            <span className="reference-link">LR-{transaction.referenceId}</span>
                          ) : (
                            <span className="reference-system">System</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="transactions-pagination">
                <div className="pagination-info">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                </div>
                <div className="pagination-controls">
                  <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeftIcon width={16} height={16} />
                    <ChevronLeftIcon width={16} height={16} />
                  </button>
                  <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeftIcon width={16} height={16} />
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        className={`pagination-btn ${pagination.page === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    <ChevronRightIcon width={16} height={16} />
                  </button>
                  <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    <ChevronRightIcon width={16} height={16} />
                    <ChevronRightIcon width={16} height={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar with Balance Summary */}
          <div className="ledger-sidebar">
            <LeaveBalanceSummary ledger={balanceSummary} categoryCodeById={categoryCodeById} />
            
            {/* Legend */}
            <div className="ledger-legend">
              <div className="widget-header">
                <h3>Legend</h3>
              </div>
              <div className="legend-items">
                <div className="legend-item">
                  <span className="legend-indicator credit-indicator" />
                  <span className="legend-text">Credits: Leave added to your balance</span>
                </div>
                <div className="legend-item">
                  <span className="legend-indicator debit-indicator" />
                  <span className="legend-text">Debits: Leave deducted from your balance</span>
                </div>
                <div className="legend-item">
                  <span className="legend-indicator balance-indicator" />
                  <span className="legend-text">Balance: Leave balance after transaction</span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="ledger-note">
              <div className="note-icon">
                <BookIcon width={20} height={20} />
              </div>
              <p>Leave balance will be updated after HR Manager approval.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeaveLedger;