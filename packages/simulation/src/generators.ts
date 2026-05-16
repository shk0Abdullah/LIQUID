// Transaction generator for simulation
import { getRNG } from "./random.js";
import { generateAddressPool, AddressPool } from "./addresses.js";
import { pickWeightedPattern, TransactionPattern } from "./patterns.js";
import type { Transaction } from "@liquid/shared";

export interface TransactionBatch {
  transactions: Transaction[];
  timestamp: number;
  count: number;
  totalValue: number;
}

export interface GeneratorConfig {
  addressPoolSize: number;
  seed?: number;
}

export class TransactionGenerator {
  private addressPool: AddressPool;
  private config: GeneratorConfig;

  constructor(config: Partial<GeneratorConfig> = {}) {
    this.config = {
      addressPoolSize: 50,
      ...config,
    };

    if (this.config.seed !== undefined) {
      getRNG().reset();
      // Re-seed if needed
    }

    this.addressPool = generateAddressPool(this.config.addressPoolSize);
  }

  // Generate a single transaction
  generateOne(timestamp?: number): Transaction {
    const ts = timestamp ?? Date.now();
    const pattern = pickWeightedPattern();
    const { from, to, amount } = pattern.generate(this.addressPool, ts);

    return {
      id: this.generateTxId(),
      from,
      to,
      amount,
      timestamp: ts,
    };
  }

  // Generate a batch of transactions
  generateBatch(count: number, timestamp?: number): TransactionBatch {
    const ts = timestamp ?? Date.now();
    const transactions: Transaction[] = [];
    let totalValue = 0;

    for (let i = 0; i < count; i++) {
      const tx = this.generateOne(ts + i);
      transactions.push(tx);
      totalValue += tx.amount;
    }

    return {
      transactions,
      timestamp: ts,
      count,
      totalValue: Math.round(totalValue * 100) / 100,
    };
  }

  // Generate transactions following a specific pattern (e.g., burst, steady)
  generateWithPattern(
    pattern: "burst" | "steady" | "random" | "ramp",
    durationMs: number,
    baseRate: number, // transactions per second
  ): TransactionBatch[] {
    const batches: TransactionBatch[] = [];
    const startTime = Date.now();
    const rng = getRNG();

    let currentTime = startTime;
    const endTime = startTime + durationMs;

    while (currentTime < endTime) {
      let txCount = 0;

      switch (pattern) {
        case "steady":
          // Constant rate with small variance
          txCount = Math.max(
            1,
            Math.floor(baseRate + (rng.next() - 0.5) * baseRate * 0.2),
          );
          break;

        case "burst":
          // Mostly 0, occasional large spikes
          if (rng.next() < 0.1) {
            txCount = Math.floor(baseRate * 10 * rng.next());
          } else {
            txCount = Math.floor(baseRate * 0.1);
          }
          break;

        case "ramp":
          // Gradually increasing rate
          const progress = (currentTime - startTime) / durationMs;
          txCount = Math.floor(baseRate * (0.5 + progress * 1.5));
          break;

        case "random":
        default:
          // Random rate between 0 and 2x base
          txCount = Math.floor(rng.next() * baseRate * 2);
          break;
      }

      if (txCount > 0) {
        batches.push(this.generateBatch(txCount, currentTime));
      }

      // Advance time by 1 second
      currentTime += 1000;
    }

    return batches;
  }

  // Generate realistic daily pattern (low at night, high during day)
  generateDailyPattern(
    dayTimestamp: number,
    baseRate: number = 10,
  ): TransactionBatch[] {
    const batches: TransactionBatch[] = [];
    const rng = getRNG();

    // Generate for 24 hours
    for (let hour = 0; hour < 24; hour++) {
      const hourTimestamp = dayTimestamp + hour * 3600 * 1000;

      // Calculate activity multiplier based on hour (0-23)
      // Peak at hours 10-18 (business hours), low at night
      let multiplier = 0.2; // base at night
      if (hour >= 6 && hour < 10) {
        multiplier = 0.5 + (hour - 6) * 0.15; // morning ramp
      } else if (hour >= 10 && hour < 18) {
        multiplier = 1.2; // peak business hours
      } else if (hour >= 18 && hour < 22) {
        multiplier = 1.0 - (hour - 18) * 0.2; // evening decline
      }

      const txsPerSecond = baseRate * multiplier;
      const txsPerHour = Math.floor(
        txsPerSecond * 3600 * (0.8 + rng.next() * 0.4),
      );

      if (txsPerHour > 0) {
        batches.push(this.generateBatch(txsPerHour, hourTimestamp));
      }
    }

    return batches;
  }

  private generateTxId(): string {
    const rng = getRNG();
    const prefix = "0x";
    const hash = Array(64)
      .fill(0)
      .map(() => Math.floor(rng.next() * 16).toString(16))
      .join("");
    return prefix + hash;
  }

  getAddressPool(): AddressPool {
    return this.addressPool;
  }
}
