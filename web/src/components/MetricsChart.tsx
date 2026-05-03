/**
 * MetricsChart Component
 * 
 * Visualizes blockchain simulation metrics using Recharts.
 * Supports multiple chart types: line, bar, area.
 */

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export interface MetricDataPoint {
  episode: number;
  reward?: number;
  consensus_time?: number;
  fork_count?: number;
  accuracy?: number;
  exploration_rate?: number;
}

interface MetricsChartProps {
  data: MetricDataPoint[];
  type?: 'line' | 'bar' | 'area';
  metrics?: string[];
  height?: number;
}

const COLORS = {
  reward: '#3b82f6',
  consensus_time: '#10b981',
  fork_count: '#ef4444',
  accuracy: '#f59e0b',
  exploration_rate: '#8b5cf6'
};

const METRIC_LABELS: Record<string, string> = {
  reward: 'Total Reward',
  consensus_time: 'Consensus Time (s)',
  fork_count: 'Fork Count',
  accuracy: 'Accuracy',
  exploration_rate: 'Exploration Rate'
};

export const MetricsChart: React.FC<MetricsChartProps> = ({
  data,
  type = 'line',
  metrics = ['reward', 'accuracy'],
  height = 300
}) => {
  const renderChart = () => {
    const chartProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    switch (type) {
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="episode" 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#f1f5f9' }}
              itemStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
            {metrics.map((metric) => (
              <Bar
                key={metric}
                type="monotone"
                dataKey={metric}
                name={METRIC_LABELS[metric] || metric}
                fill={COLORS[metric as keyof typeof COLORS] || '#3b82f6'}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...chartProps}>
            <defs>
              {metrics.map((metric) => (
                <linearGradient
                  key={metric}
                  id={`gradient-${metric}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={COLORS[metric as keyof typeof COLORS]}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLORS[metric as keyof typeof COLORS]}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="episode" 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#f1f5f9' }}
              itemStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
            {metrics.map((metric) => (
              <Area
                key={metric}
                type="monotone"
                dataKey={metric}
                name={METRIC_LABELS[metric] || metric}
                stroke={COLORS[metric as keyof typeof COLORS]}
                fill={`url(#gradient-${metric})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );

      default: // line
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="episode" 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#f1f5f9' }}
              itemStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
            {metrics.map((metric) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                name={METRIC_LABELS[metric] || metric}
                stroke={COLORS[metric as keyof typeof COLORS]}
                strokeWidth={2}
                dot={{ fill: COLORS[metric as keyof typeof COLORS], r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default MetricsChart;
