/**
 * App Component
 * 
 * Root component that renders the blockchain simulation dashboard.
 */

import React from 'react';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  return (
    <div className="app">
      <Dashboard />
      
      {/* Dashboard-specific styles */}
      <style>{`
        .app {
          min-height: 100vh;
          background: var(--bg-color);
          color: var(--text-primary);
        }

        .dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .dashboard-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .dashboard-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dashboard-header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: var(--card-bg);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .input-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .input-group label {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .input-group input {
          width: 80px;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-color);
          color: var(--text-primary);
          font-size: 1rem;
          text-align: center;
        }

        .input-group input:focus {
          outline: none;
          border-color: var(--primary-color);
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--danger-color);
          color: var(--danger-color);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          text-align: center;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          text-align: center;
          padding: 1.5rem 1rem;
        }

        .summary-card h3 {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .charts-section {
          display: grid;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .chart-card {
          padding: 1.5rem;
        }

        .chart-card h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .episodes-table {
          padding: 1.5rem;
        }

        .episodes-table h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .table-container {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        th {
          font-weight: 600;
          color: var(--text-secondary);
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        td {
          color: var(--text-primary);
        }

        td.numeric {
          font-family: 'Monaco', 'Consolas', monospace;
          text-align: right;
        }

        tr:hover td {
          background: rgba(59, 130, 246, 0.1);
        }

        .no-data {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
        }

        .no-data p {
          margin: 0.5rem 0;
        }

        @media (max-width: 768px) {
          .dashboard-header h1 {
            font-size: 1.75rem;
          }

          .controls {
            flex-direction: column;
          }

          .summary-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
