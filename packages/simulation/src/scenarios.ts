// Simulation scenarios for stress testing and RL training
import { TransactionGenerator, TransactionBatch } from "./generators.js";
import { SeededRandom, setGlobalSeed } from "./random.js";

export interface ScenarioConfig {
  name: string;
  description: string;
  durationMs: number;
  nodeCount: number;
  initialDifficulty: number;
  seed?: number;
}

export interface ScenarioResult {
  batches: TransactionBatch[];
  totalTransactions: number;
  totalValue: number;
  averageTps: number;
  peakTps: number;
  config: ScenarioConfig;
}

export interface ScenarioStep {
  timestamp: number;
  incomingTxs: number;
  description: string;
}

// Base scenario class
export abstract class Scenario {
  protected config: ScenarioConfig;
  protected generator: TransactionGenerator;

  constructor(config: Partial<ScenarioConfig> = {}) {
    if (config.seed) {
      setGlobalSeed(config.seed);
    }

    this.config = {
      name: "default",
      description: "Default scenario",
      durationMs: 60000, // 1 minute
      nodeCount: 3,
      initialDifficulty: 2,
      ...config,
    };

    this.generator = new TransactionGenerator({
      addressPoolSize: 50,
    });
  }

  abstract run(): ScenarioResult;

  // Get step-by-step instructions for RL
  abstract getSteps(): ScenarioStep[];
}

// Steady load scenario - constant transaction rate
export class SteadyLoadScenario extends Scenario {
  private tps: number;

  constructor(tps: number = 10, config: Partial<ScenarioConfig> = {}) {
    super({
      name: "steady_load",
      description: `Constant load at ${tps} TPS`,
      ...config,
    });
    this.tps = tps;
  }

  run(): ScenarioResult {
    const batches = this.generator.generateWithPattern(
      "steady",
      this.config.durationMs,
      this.tps,
    );

    const totalTransactions = batches.reduce((sum, b) => sum + b.count, 0);
    const totalValue = batches.reduce((sum, b) => sum + b.totalValue, 0);
    const durationSeconds = this.config.durationMs / 1000;

    return {
      batches,
      totalTransactions,
      totalValue,
      averageTps: totalTransactions / durationSeconds,
      peakTps: this.tps * 1.2,
      config: this.config,
    };
  }

  getSteps(): ScenarioStep[] {
    const steps: ScenarioStep[] = [];
    const durationSeconds = Math.floor(this.config.durationMs / 1000);

    for (let i = 0; i < durationSeconds; i++) {
      steps.push({
        timestamp: i * 1000,
        incomingTxs: this.tps,
        description: `Steady load: ${this.tps} TPS`,
      });
    }

    return steps;
  }
}

// Burst scenario - sudden spikes in transaction volume
export class BurstScenario extends Scenario {
  private baseTps: number;
  private burstMultiplier: number;

  constructor(
    baseTps: number = 5,
    burstMultiplier: number = 10,
    config: Partial<ScenarioConfig> = {},
  ) {
    super({
      name: "burst",
      description: `Base ${baseTps} TPS with ${burstMultiplier}x bursts`,
      ...config,
    });
    this.baseTps = baseTps;
    this.burstMultiplier = burstMultiplier;
  }

  run(): ScenarioResult {
    const batches = this.generator.generateWithPattern(
      "burst",
      this.config.durationMs,
      this.baseTps,
    );

    const totalTransactions = batches.reduce((sum, b) => sum + b.count, 0);
    const totalValue = batches.reduce((sum, b) => sum + b.totalValue, 0);
    const durationSeconds = this.config.durationMs / 1000;

    return {
      batches,
      totalTransactions,
      totalValue,
      averageTps: totalTransactions / durationSeconds,
      peakTps: this.baseTps * this.burstMultiplier,
      config: this.config,
    };
  }

  getSteps(): ScenarioStep[] {
    const steps: ScenarioStep[] = [];
    const durationSeconds = Math.floor(this.config.durationMs / 1000);
    const rng = new SeededRandom(this.config.seed ?? Date.now());

    for (let i = 0; i < durationSeconds; i++) {
      const isBurst = rng.next() < 0.1;
      steps.push({
        timestamp: i * 1000,
        incomingTxs: isBurst
          ? Math.floor(this.baseTps * this.burstMultiplier * rng.next())
          : Math.floor(this.baseTps * 0.1),
        description: isBurst
          ? "BURST: High transaction volume"
          : "Low activity",
      });
    }

    return steps;
  }
}

// Ramp scenario - gradually increasing load
export class RampScenario extends Scenario {
  private startTps: number;
  private endTps: number;

  constructor(
    startTps: number = 1,
    endTps: number = 100,
    config: Partial<ScenarioConfig> = {},
  ) {
    super({
      name: "ramp",
      description: `Ramp from ${startTps} to ${endTps} TPS`,
      ...config,
    });
    this.startTps = startTps;
    this.endTps = endTps;
  }

  run(): ScenarioResult {
    const batches = this.generator.generateWithPattern(
      "ramp",
      this.config.durationMs,
      (this.startTps + this.endTps) / 2,
    );

    const totalTransactions = batches.reduce((sum, b) => sum + b.count, 0);
    const totalValue = batches.reduce((sum, b) => sum + b.totalValue, 0);
    const durationSeconds = this.config.durationMs / 1000;

    return {
      batches,
      totalTransactions,
      totalValue,
      averageTps: totalTransactions / durationSeconds,
      peakTps: this.endTps,
      config: this.config,
    };
  }

  getSteps(): ScenarioStep[] {
    const steps: ScenarioStep[] = [];
    const durationSeconds = Math.floor(this.config.durationMs / 1000);

    for (let i = 0; i < durationSeconds; i++) {
      const progress = i / durationSeconds;
      const currentTps = Math.floor(
        this.startTps + (this.endTps - this.startTps) * progress,
      );
      steps.push({
        timestamp: i * 1000,
        incomingTxs: currentTps,
        description: `Ramp up: ${currentTps} TPS`,
      });
    }

    return steps;
  }
}

// Stress test scenario - maximum load
export class StressTestScenario extends Scenario {
  private maxTps: number;

  constructor(maxTps: number = 500, config: Partial<ScenarioConfig> = {}) {
    super({
      name: "stress_test",
      description: `Maximum load at ${maxTps} TPS`,
      ...config,
    });
    this.maxTps = maxTps;
  }

  run(): ScenarioResult {
    const batches = this.generator.generateWithPattern(
      "random",
      this.config.durationMs,
      this.maxTps,
    );

    const totalTransactions = batches.reduce((sum, b) => sum + b.count, 0);
    const totalValue = batches.reduce((sum, b) => sum + b.totalValue, 0);
    const durationSeconds = this.config.durationMs / 1000;

    return {
      batches,
      totalTransactions,
      totalValue,
      averageTps: totalTransactions / durationSeconds,
      peakTps: this.maxTps,
      config: this.config,
    };
  }

  getSteps(): ScenarioStep[] {
    const steps: ScenarioStep[] = [];
    const durationSeconds = Math.floor(this.config.durationMs / 1000);
    const rng = new SeededRandom(this.config.seed ?? Date.now());

    for (let i = 0; i < durationSeconds; i++) {
      steps.push({
        timestamp: i * 1000,
        incomingTxs: Math.floor(rng.next() * this.maxTps),
        description: `Stress test: Random load`,
      });
    }

    return steps;
  }
}

// Factory to create scenarios by name
export function createScenario(
  name: string,
  config: Partial<ScenarioConfig> = {},
): Scenario {
  switch (name) {
    case "steady":
      return new SteadyLoadScenario(10, config);
    case "burst":
      return new BurstScenario(5, 10, config);
    case "ramp":
      return new RampScenario(1, 100, config);
    case "stress":
      return new StressTestScenario(500, config);
    default:
      return new SteadyLoadScenario(10, config);
  }
}

export const AVAILABLE_SCENARIOS = [
  "steady",
  "burst",
  "ramp",
  "stress",
] as const;

export type ScenarioName = (typeof AVAILABLE_SCENARIOS)[number];
