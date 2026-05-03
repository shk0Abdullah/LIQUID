/**
 * Dashboard Component
 * 
 * Main dashboard for blockchain simulation visualization.
 * Displays:
 * - Summary statistics (cards)
 * - Metrics charts (trends over episodes)
 * - Episode details table
 * - Run simulation button
 */

import React, { useState, useEffect } from 'react';
import { MetricsChart, MetricDataPoint } from './MetricsChart';

// Types
interface SimulationSummary {
  total_episodes: number;
  avg_reward: number;
  avg_consensus_time: number;
  avg_accuracy: number;
  total_forks: number;
  training_duration: string;
}

interface EpisodeData {
  episode: number;
  total_reward: number;
  consensus_time: number;
  fork_count: number;
  blocks_accepted: number;
  blocks_rejected: number;
  accuracy: number;
  exploration_rate: number;
  timestamp: string;
}

interface MetricsData {
  metadata: {
    created: string;
    simulation_type: string;
    version: string;
  };
  summary: SimulationSummary;
  episodes: EpisodeData[];
  trends: MetricDataPoint[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [episodesInput, setEpisodesInput] = useState(50);

  // Load existing metrics on mount
  useEffect(() => {
    loadExistingMetrics();
  }, []);

  const loadExistingMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/metrics`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (err) {
      console.log('No existing metrics found');
    }
  };

  const runSimulation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/simulation/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodes: episodesInput })
      });

      if (!response.ok) {
        throw new Error('Simulation failed');
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals);
  };

  const formatPercent = (num: number) => {
    return `${(num * 100).toFixed(1)}%`;
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Blockchain Q-Learning Simulation</h1>
        <p>Adaptive consensus using reinforcement learning</p>
      </header>

      {/* Controls */}
      <div className="controls">
        <div className="input-group">
          <label htmlFor="episodes">Episodes:</label>
          <input
            id="episodes"
            type="number"
            min="1"
            max="1000"
            value={episodesInput}
            onChange={(e) => setEpisodesInput(Number(e.target.value))}
            disabled={loading}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={runSimulation}
          disabled={loading}
        >
          {loading && <span className="spinner" />}
          {loading ? 'Running...' : 'Run Simulation'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {/* Summary Cards */}
      {metrics && (
        <div className="summary-cards">
          <div className="card summary-card">
            <h3>Total Episodes</h3>
            <div className="metric-value">{metrics.summary.total_episodes}</div>
          </div>
          <div className="card summary-card">
            <h3>Avg Reward</h3>
            <div className="metric-value" style={{ color: 'var(--secondary-color)' }}>
              {formatNumber(metrics.summary.avg_reward)}
            </div>
          </div>
          <div className="card summary-card">
            <h3>Avg Consensus Time</h3>
            <div className="metric-value" style={{ color: 'var(--primary-color)' }}>
              {formatNumber(metrics.summary.avg_consensus_time)}s
            </div>
          </div>
          <div className="card summary-card">
            <h3>Avg Accuracy</h3>
            <div className="metric-value" style={{ color: 'var(--warning-color)' }}>
              {formatPercent(metrics.summary.avg_accuracy)}
            </div>
          </div>
          <div className="card summary-card">
            <h3>Total Forks</h3>
            <div className="metric-value" style={{ color: 'var(--danger-color)' }}>
              {metrics.summary.total_forks}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {metrics && (
        <div className="charts-section">
          <div className="card chart-card">
            <h2>Reward & Accuracy Trends</h2>
            <MetricsChart
              data={metrics.trends}
              type="line"
              metrics={['reward', 'accuracy']}
              height={350}
            />
          </div>

          <div className="card chart-card">
            <h2>Consensus Time & Forks</h2>
            <MetricsChart
              data={metrics.trends}
              type="area"
              metrics={['consensus_time', 'fork_count']}
              height={350}
            />
          </div>

          <div className="card chart-card">
            <h2>Exploration Rate Decay</h2>
            <MetricsChart
              data={metrics.trends}
              type="line"
              metrics={['exploration_rate']}
              height={300}
            />
          </div>
        </div>
      )}

      {/* Recent Episodes Table */}
      {metrics && metrics.episodes.length > 0 && (
        <div className="card episodes-table">
          <h2>Recent Episodes</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Episode</th>
                  <th>Reward</th>
                  <th>Consensus Time</th>
                  <th>Forks</th>
                  <th>Blocks (A/R)</th>
                  <th>Accuracy</th>
                  <th>Exploration</th>
                </tr>
              </thead>
              <tbody>
                {metrics.episodes.slice(-10).reverse().map((ep) => (
                  <tr key={ep.episode}>
                    <td>{ep.episode}</td>
                    <td className="numeric">{formatNumber(ep.total_reward)}</td>
                    <td className="numeric">{formatNumber(ep.consensus_time)}s</td>
                    <td className="numeric">{ep.fork_count}</td>
                    <td className="numeric">{ep.blocks_accepted}/{ep.blocks_rejected}</td>
                    <td className="numeric">{formatPercent(ep.accuracy)}</td>
                    <td className="numeric">{formatNumber(ep.exploration_rate, 3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No data message */}
      {!metrics && !loading && (
        <div className="card no-data">
          <p>No simulation data available.</p>
          <p>Click "Run Simulation" to generate metrics.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
