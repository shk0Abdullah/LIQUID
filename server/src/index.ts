/**
 * Main Server Entry Point
 * 
 * Sets up Express server with tRPC and CORS for the blockchain simulation API.
 */

import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'blockchain-sim-server'
  });
});

// tRPC endpoint
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({})
  })
);

// REST endpoint for running simulation (alternative to tRPC)
app.post('/simulation/run', async (req, res) => {
  try {
    const episodes = req.body.episodes || 50;
    const { runSimulation } = await import('./simulation');
    const metrics = await runSimulation(episodes);
    res.json(metrics);
  } catch (error) {
    console.error('[API] Simulation error:', error);
    res.status(500).json({
      error: 'Simulation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get existing metrics via REST
app.get('/metrics', async (req, res) => {
  try {
    const { getMetrics } = await import('./simulation');
    const metrics = await getMetrics();
    if (metrics) {
      res.json(metrics);
    } else {
      res.status(404).json({ error: 'No metrics found' });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to read metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('BLOCKCHAIN SIMULATION API SERVER');
  console.log('='.repeat(60));
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET  /health           - Health check`);
  console.log(`  GET  /metrics          - Get simulation metrics`);
  console.log(`  POST /simulation/run   - Run simulation (body: { episodes: number })`);
  console.log(`  POST /trpc/*           - tRPC endpoints`);
  console.log('='.repeat(60));
});
