// Main simulation runner that executes scenarios
import { TransactionGenerator, TransactionBatch } from "./generators.js";
import { Scenario, ScenarioResult } from "./scenarios.js";
import { setGlobalSeed } from "./random.js";

export interface SimulationConfig {
  scenario: Scenario;
  seed?: number;
  onBatchGenerated?: (batch: TransactionBatch, index: number) => void;
  onStepComplete?: (
    step: number,
    totalSteps: number,
    metrics: SimulationMetrics,
  ) => void;
}

export interface SimulationMetrics {
  step: number;
  totalSteps: number;
  transactionsGenerated: number;
  transactionsSubmitted: number;
  blocksMined: number;
  averageBlockTime: number;
  currentDifficulty: number;
  mempoolSize: number;
  tps: number;
}

export class SimulationRunner {
  private config: SimulationConfig;
  private metrics: SimulationMetrics;
  private startTime: number = 0;

  constructor(config: SimulationConfig) {
    if (config.seed) {
      setGlobalSeed(config.seed);
    }

    this.config = config;
    this.metrics = {
      step: 0,
      totalSteps: 0,
      transactionsGenerated: 0,
      transactionsSubmitted: 0,
      blocksMined: 0,
      averageBlockTime: 0,
      currentDifficulty: 2,
      mempoolSize: 0,
      tps: 0,
    };
  }

  // Run the simulation and return results
  async run(): Promise<ScenarioResult> {
    this.startTime = Date.now();
    const result = this.config.scenario.run();

    this.metrics.totalSteps = result.batches.length;

    // Process each batch
    for (let i = 0; i < result.batches.length; i++) {
      const batch = result.batches[i];

      this.metrics.step = i + 1;
      this.metrics.transactionsGenerated += batch.count;

      // Callback for batch generation
      if (this.config.onBatchGenerated) {
        this.config.onBatchGenerated(batch, i);
      }

      // Simulate processing time
      await this.delay(10);

      // Callback for step completion
      if (this.config.onStepComplete) {
        this.updateMetrics(batch);
        this.config.onStepComplete(i + 1, result.batches.length, {
          ...this.metrics,
        });
      }
    }

    return result;
  }

  // Run with real-time simulation (for demonstration)
  async runRealtime(): Promise<ScenarioResult> {
    this.startTime = Date.now();
    const steps = this.config.scenario.getSteps();

    this.metrics.totalSteps = steps.length;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      this.metrics.step = i + 1;
      this.metrics.transactionsGenerated += step.incomingTxs;

      // Generate transactions for this step
      if (step.incomingTxs > 0) {
        const generator = new TransactionGenerator();
        const batch = generator.generateBatch(step.incomingTxs, step.timestamp);

        if (this.config.onBatchGenerated) {
          this.config.onBatchGenerated(batch, i);
        }
      }

      // Wait for real-time progression (1 second = 1 step)
      await this.delay(100);

      if (this.config.onStepComplete) {
        this.metrics.tps = step.incomingTxs;
        this.config.onStepComplete(i + 1, steps.length, { ...this.metrics });
      }
    }

    return {
      batches: [],
      totalTransactions: this.metrics.transactionsGenerated,
      totalValue: 0,
      averageTps: this.metrics.transactionsGenerated / steps.length,
      peakTps: Math.max(...steps.map((s) => s.incomingTxs)),
      config: {
        name: "realtime",
        description: "Real-time simulation",
        durationMs: steps.length * 1000,
        nodeCount: 3,
        initialDifficulty: 2,
      },
    };
  }

  // Get current metrics
  getMetrics(): SimulationMetrics {
    return { ...this.metrics };
  }

  // Get elapsed time
  getElapsedTime(): number {
    return Date.now() - this.startTime;
  }

  private updateMetrics(batch: TransactionBatch): void {
    // Update metrics based on batch
    this.metrics.mempoolSize += batch.count;

    // Simulate some transactions being confirmed
    const confirmed = Math.floor(batch.count * 0.7);
    this.metrics.transactionsSubmitted += confirmed;
    this.metrics.mempoolSize -= confirmed;

    // Simulate blocks being mined
    if (
      this.metrics.transactionsSubmitted > 0 &&
      this.metrics.transactionsSubmitted % 10 === 0
    ) {
      this.metrics.blocksMined++;
    }

    // Calculate TPS
    const elapsed = this.getElapsedTime() / 1000;
    this.metrics.tps =
      elapsed > 0 ? this.metrics.transactionsGenerated / elapsed : 0;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Helper to run simulation with logging
export async function runSimulationWithLogging(
  scenarioName: string,
  seed?: number,
): Promise<ScenarioResult> {
  const { createScenario } = await import("./scenarios.js");
  const scenario = createScenario(scenarioName, { seed });

  const runner = new SimulationRunner({
    scenario,
    seed,
    onBatchGenerated: (batch, index) => {
      console.log(
        `[Batch ${index + 1}] Generated ${batch.count} transactions, total value: ${batch.totalValue.toFixed(2)}`,
      );
    },
    onStepComplete: (step, total, metrics) => {
      if (step % 10 === 0 || step === total) {
        console.log(
          `[Step ${step}/${total}] TPS: ${metrics.tps.toFixed(2)}, Mempool: ${metrics.mempoolSize}, Blocks: ${metrics.blocksMined}`,
        );
      }
    },
  });

  console.log(`Starting simulation: ${scenarioName}`);
  console.log("=".repeat(50));

  const result = await runner.run();

  console.log("=".repeat(50));
  console.log("Simulation complete!");
  console.log(`Total transactions: ${result.totalTransactions}`);
  console.log(`Total value: ${result.totalValue.toFixed(2)}`);
  console.log(`Average TPS: ${result.averageTps.toFixed(2)}`);
  console.log(`Peak TPS: ${result.peakTps.toFixed(2)}`);

  return result;
}
