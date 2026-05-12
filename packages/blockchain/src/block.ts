import {
  GENESIS_BLOCK_PREVIOUS_HASH,
  GENESIS_TIMESTAMP,
  MIN_DIFFICULTY,
  type Block,
  type MiningResult,
  type Transaction,
} from "@liquid/shared";
import { validateTransaction } from "./transaction.js";

export function createBlock(
  index: number,
  transactions: Transaction[],
  previousHash: string,
  nonce = 0,
  timestamp: number = Date.now(),
): Block {
  return {
    index,
    timestamp,
    transactions,
    previousHash,
    hash: "",
    nonce,
  };
}

function toCanonicalTransaction(transaction: Transaction): string {
  return JSON.stringify({
    id: transaction.id,
    from: transaction.from,
    to: transaction.to,
    amount: transaction.amount,
    timestamp: transaction.timestamp,
    signature: transaction.signature ?? "",
  });
}

function toCanonicalBlockPayload(block: Block): string {
  return JSON.stringify({
    index: block.index,
    timestamp: block.timestamp,
    previousHash: block.previousHash,
    nonce: block.nonce,
    transactions: block.transactions.map(toCanonicalTransaction),
  });
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function calculateBlockHash(block: Block): Promise<string> {
  const payload = toCanonicalBlockPayload(block);
  const encodedPayload = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", encodedPayload);
  return bytesToHex(new Uint8Array(digest));
}

export function validateDifficulty(difficulty: number): boolean {
  return (
    typeof difficulty === "number" &&
    Number.isInteger(difficulty) &&
    difficulty >= MIN_DIFFICULTY
  );
}

export function isValidProofOfWork(hash: string, difficulty: number): boolean {
  if (!validateDifficulty(difficulty)) {
    return false;
  }

  return hash.startsWith("0".repeat(difficulty));
}

export async function mineBlock(
  candidateBlock: Block,
  difficulty: number,
): Promise<MiningResult> {
  if (!validateDifficulty(difficulty)) {
    throw new Error("Invalid mining difficulty");
  }

  const start = Date.now();
  let iterations = 0;
  let nonce = candidateBlock.nonce;

  for (;;) {
    const block: Block = {
      ...candidateBlock,
      nonce,
    };

    const hash = await calculateBlockHash(block);
    iterations += 1;

    if (isValidProofOfWork(hash, difficulty)) {
      return {
        block: {
          ...block,
          hash,
        },
        iterations,
        elapsedMs: Date.now() - start,
      };
    }

    nonce += 1;
  }
}

export async function createGenesisBlock(difficulty: number): Promise<Block> {
  const genesisCandidate = createBlock(
    0,
    [],
    GENESIS_BLOCK_PREVIOUS_HASH,
    0,
    GENESIS_TIMESTAMP,
  );

  const minedGenesis = await mineBlock(genesisCandidate, difficulty);
  return minedGenesis.block;
}

export async function validateBlock(
  block: Block,
  previousBlock: Block,
  difficulty: number,
): Promise<boolean> {
  if (block.index !== previousBlock.index + 1) {
    return false;
  }

  if (block.previousHash !== previousBlock.hash) {
    return false;
  }

  if (!block.transactions.every(validateTransaction)) {
    return false;
  }

  const recalculatedHash = await calculateBlockHash(block);
  if (recalculatedHash !== block.hash) {
    return false;
  }

  return isValidProofOfWork(block.hash, difficulty);
}

export { type Block };
