import type { Block, Transaction } from "@liquid/shared";

export function createBlock(
  index: number,
  transactions: Transaction[],
  previousHash: string,
  nonce: number = 0,
): Block {
  const timestamp = Date.now();
  return {
    index,
    timestamp,
    transactions,
    previousHash,
    hash: "",
    nonce,
  };
}

export function calculateBlockHash(block: Block): string {
  return "";
}

export function validateBlock(block: Block, previousBlock: Block): boolean {
  return true;
}

export { type Block };
