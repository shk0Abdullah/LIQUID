// Transaction patterns for simulation
import { getRNG } from "./random.js";
import {
  AddressPool,
  pickUserAddress,
  pickMerchantAddress,
} from "./addresses.js";

export interface TransactionPattern {
  name: string;
  generate: (
    pool: AddressPool,
    timestamp: number,
  ) => {
    from: string;
    to: string;
    amount: number;
  };
}

// Normal user-to-user transfers
export const p2pTransfer: TransactionPattern = {
  name: "p2p_transfer",
  generate: (pool, timestamp) => {
    const rng = getRNG();
    const from = pickUserAddress(pool);
    let to = pickUserAddress(pool);
    while (to === from) {
      to = pickUserAddress(pool);
    }
    // Amounts between 0.01 and 1000
    const amount = rng.next() * 1000 + 0.01;
    return { from, to, amount: Math.round(amount * 100) / 100 };
  },
};

// User buying from merchant
export const merchantPayment: TransactionPattern = {
  name: "merchant_payment",
  generate: (pool, timestamp) => {
    const rng = getRNG();
    const from = pickUserAddress(pool);
    const to = pickMerchantAddress(pool);
    // Amounts between 10 and 500
    const amount = rng.next() * 490 + 10;
    return { from, to, amount: Math.round(amount * 100) / 100 };
  },
};

// Large transfer (whale)
export const whaleTransfer: TransactionPattern = {
  name: "whale_transfer",
  generate: (pool, timestamp) => {
    const rng = getRNG();
    const from = pickUserAddress(pool);
    let to = pickUserAddress(pool);
    while (to === from) {
      to = pickUserAddress(pool);
    }
    // Large amounts between 1000 and 100000
    const amount = rng.next() * 99000 + 1000;
    return { from, to, amount: Math.round(amount * 100) / 100 };
  },
};

// Dust transaction (very small)
export const dustTransaction: TransactionPattern = {
  name: "dust",
  generate: (pool, timestamp) => {
    const rng = getRNG();
    const from = pickUserAddress(pool);
    const to = pickMerchantAddress(pool);
    // Very small amounts between 0.0001 and 0.01
    const amount = rng.next() * 0.0099 + 0.0001;
    return { from, to, amount: Math.round(amount * 100000) / 100000 };
  },
};

// All patterns with weights for frequency
export const TRANSACTION_PATTERNS = [
  { pattern: p2pTransfer, weight: 0.5 }, // 50% normal transfers
  { pattern: merchantPayment, weight: 0.3 }, // 30% merchant payments
  { pattern: whaleTransfer, weight: 0.15 }, // 15% whale transfers
  { pattern: dustTransaction, weight: 0.05 }, // 5% dust
];

export function pickWeightedPattern(): TransactionPattern {
  const rng = getRNG();
  const r = rng.next();
  let cumWeight = 0;

  for (const { pattern, weight } of TRANSACTION_PATTERNS) {
    cumWeight += weight;
    if (r <= cumWeight) {
      return pattern;
    }
  }

  return TRANSACTION_PATTERNS[0].pattern;
}
