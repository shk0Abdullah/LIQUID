// Deterministic pseudo-random number generator for reproducible simulations
export class SeededRandom {
  private seed: number;
  private originalSeed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
    this.originalSeed = seed;
  }

  // Linear congruential generator
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  // Get integer in range [min, max]
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Get random item from array
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  // Pick n random items from array
  pickMany<T>(arr: T[], n: number): T[] {
    const shuffled = [...arr].sort(() => this.next() - 0.5);
    return shuffled.slice(0, n);
  }

  // Reset to original seed
  reset(): void {
    this.seed = this.originalSeed;
  }

  // Get current seed
  getSeed(): number {
    return this.originalSeed;
  }
}

// Global RNG instance
let globalRNG: SeededRandom | null = null;

export function setGlobalSeed(seed: number): void {
  globalRNG = new SeededRandom(seed);
}

export function getRNG(): SeededRandom {
  if (!globalRNG) {
    globalRNG = new SeededRandom();
  }
  return globalRNG;
}
