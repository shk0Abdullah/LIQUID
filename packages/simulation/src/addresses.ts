// Fake address generators for simulation
import { getRNG } from "./random.js";

const ADDR_PREFIXES = [
  "0x7a",
  "0x3f",
  "0x9b",
  "0x2c",
  "0x5d",
  "0x1e",
  "0x8a",
  "0x4b",
];

const ADDR_SUFFIXES = [
  "dead",
  "beef",
  "cafe",
  "face",
  "babe",
  "fade",
  "acab",
  "1234",
  "abcd",
  "efgh",
  "ijkl",
  "mnop",
  "qrst",
  "uvwx",
  "yz12",
  "3456",
];

const USER_NAMES = [
  "alice",
  "bob",
  "charlie",
  "dave",
  "eve",
  "frank",
  "grace",
  "heidi",
  "ivan",
  "judy",
  "kevin",
  "laura",
  "mallory",
  "nancy",
  "oscar",
  "peggy",
  "quinn",
  "rupert",
  "sybil",
  "ted",
  "ursula",
  "victor",
  "wendy",
  "xavier",
  "yolanda",
  "zack",
  "miner",
  "exchange",
  "wallet",
  "contract",
];

const MERCHANT_NAMES = [
  "amazon",
  "ebay",
  "shopify",
  "stripe",
  "coinbase",
  "binance",
  "kraken",
  "uniswap",
  "aave",
  "compound",
  "maker",
  "curve",
  "sushi",
  "pancake",
  "opensea",
  "blur",
  "looks",
  "x2y2",
  "foundation",
  "superrare",
  "zora",
];

export interface AddressPool {
  users: string[];
  merchants: string[];
  contracts: string[];
}

export function generateAddress(): string {
  const rng = getRNG();
  const prefix = rng.pick(ADDR_PREFIXES);
  const middle = Array(32)
    .fill(0)
    .map(() => Math.floor(rng.next() * 16).toString(16))
    .join("");
  const suffix = rng.pick(ADDR_SUFFIXES);
  return `${prefix}${middle}${suffix}`;
}

export function generateNamedAddress(name: string): string {
  const rng = new SeededRandom(stringToSeed(name));
  const prefix = rng.pick(ADDR_PREFIXES);
  const middle = Array(24)
    .fill(0)
    .map(() => Math.floor(rng.next() * 16).toString(16))
    .join("");
  return `${prefix}${middle}${name.padEnd(8, "0")}`;
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function generateAddressPool(count: number = 50): AddressPool {
  const rng = getRNG();

  const users = USER_NAMES.slice(0, Math.min(count / 2, USER_NAMES.length)).map(
    (name) => generateNamedAddress(name),
  );

  const merchants = MERCHANT_NAMES.slice(
    0,
    Math.min(count / 4, MERCHANT_NAMES.length),
  ).map((name) => generateNamedAddress(name));

  const contracts = Array(Math.floor(count / 4))
    .fill(0)
    .map(() => generateAddress());

  return { users, merchants, contracts };
}

export function pickRandomAddress(pool: AddressPool): string {
  const rng = getRNG();
  const all = [...pool.users, ...pool.merchants, ...pool.contracts];
  return rng.pick(all);
}

export function pickUserAddress(pool: AddressPool): string {
  return getRNG().pick(pool.users);
}

export function pickMerchantAddress(pool: AddressPool): string {
  return getRNG().pick(pool.merchants);
}

import { SeededRandom } from "./random.js";
