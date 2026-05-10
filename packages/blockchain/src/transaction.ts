import type { Transaction } from "@liquid/shared";

export function createTransaction(
  from: string,
  to: string,
  amount: number,
): Transaction {
  return {
    id: crypto.randomUUID(),
    from,
    to,
    amount,
    timestamp: Date.now(),
  };
}

export function validateTransaction(transaction: Transaction): boolean {
  return (
    transaction.amount > 0 &&
    transaction.from !== "" &&
    transaction.to !== "" &&
    transaction.from !== transaction.to
  );
}

export function signTransaction(
  transaction: Transaction,
  privateKey: string,
): Transaction {
  return {
    ...transaction,
    signature: privateKey,
  };
}

export { type Transaction };
