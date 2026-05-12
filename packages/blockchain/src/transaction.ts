import { MAX_FUTURE_DRIFT_MS, type Transaction } from "@liquid/shared";

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
  const now = Date.now();

  const hasValidId = typeof transaction.id === "string" && transaction.id.trim() !== "";
  const hasValidFrom =
    typeof transaction.from === "string" && transaction.from.trim() !== "";
  const hasValidTo = typeof transaction.to === "string" && transaction.to.trim() !== "";
  const hasValidAmount =
    typeof transaction.amount === "number" &&
    Number.isFinite(transaction.amount) &&
    transaction.amount > 0;
  const hasValidTimestamp =
    typeof transaction.timestamp === "number" &&
    Number.isFinite(transaction.timestamp) &&
    transaction.timestamp > 0 &&
    transaction.timestamp <= now + MAX_FUTURE_DRIFT_MS;
  const hasValidSignature =
    transaction.signature === undefined ||
    (typeof transaction.signature === "string" && transaction.signature.trim() !== "");

  return (
    hasValidId &&
    hasValidFrom &&
    hasValidTo &&
    hasValidAmount &&
    hasValidTimestamp &&
    hasValidSignature &&
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
