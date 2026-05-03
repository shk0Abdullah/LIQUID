import { initTRPC } from '@trpc/server';
import { z } from 'zod';

/**
 * tRPC Router Setup
 * 
 * Defines the API schema for the blockchain simulation:
 * - runSimulation: Execute Python simulation and return metrics
 * - getMetrics: Retrieve existing metrics from file
 */

const t = initTRPC.create();

// Metric data schema
const MetricsSchema = z.object({
  metadata: z.object({
    created: z.string(),
    simulation_type: z.string(),
    version: z.string()
  }),
  summary: z.object({
    total_episodes: z.number(),
    avg_reward: z.number(),
    avg_consensus_time: z.number(),
    avg_accuracy: z.number(),
    total_forks: z.number(),
    training_duration: z.string()
  }),
  episodes: z.array(z.object({
    episode: z.number(),
    total_reward: z.number(),
    consensus_time: z.number(),
    fork_count: z.number(),
    blocks_accepted: z.number(),
    blocks_rejected: z.number(),
    accuracy: z.number(),
    exploration_rate: z.number(),
    timestamp: z.string()
  })),
  trends: z.array(z.object({
    episode: z.number(),
    reward: z.number(),
    consensus_time: z.number(),
    fork_count: z.number(),
    accuracy: z.number(),
    exploration_rate: z.number()
  }))
});

export type MetricsData = z.infer<typeof MetricsSchema>;

// Simulation parameters schema
const SimulationParamsSchema = z.object({
  episodes: z.number().min(1).max(1000).default(50)
});

export type SimulationParams = z.infer<typeof SimulationParamsSchema>;

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  // Run the simulation
  runSimulation: publicProcedure
    .input(SimulationParamsSchema)
    .output(MetricsSchema)
    .mutation(async ({ input }) => {
      // Import here to avoid circular dependency
      const { runSimulation } = await import('./simulation');
      return runSimulation(input.episodes);
    }),
  
  // Get existing metrics
  getMetrics: publicProcedure
    .output(MetricsSchema.nullable())
    .query(async () => {
      const { getMetrics } = await import('./simulation');
      return getMetrics();
    })
});

export type AppRouter = typeof appRouter;
