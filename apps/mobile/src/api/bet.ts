import { apiFetch } from "./client";

export type Side = "YES" | "NO";
export type DepositMint = "USDC" | "JUPUSD";

export type BuildBetRequest = {
  marketId: string;
  side: Side;
  amountNative: string;
  depositMint: DepositMint;
  walletAddress: string;
};

export type BuildBetResponse = {
  unsignedTx: string;
  orderPubkey: string;
  blockhash: string | null;
  lastValidBlockHeight: number | null;
  externalOrderId: string | null;
  requiredSigners: string[];
  order: Record<string, unknown>;
};

export type SubmitBetRequest = {
  signedTx: string;
  marketId: string;
  side: Side;
  amountNative: string;
  entryPriceNative: string;
  depositMint: DepositMint;
  orderPubkey: string;
  walletAddress: string;
};

export type SubmitBetResponse = {
  sig: string;
  broadcastId: string | null;
  confirmation: "confirmed" | "pending";
  warning?: "CONFIRM_TIMEOUT" | "PERSIST_FAILED";
  idempotent?: boolean;
};

export function buildBet(req: BuildBetRequest): Promise<BuildBetResponse> {
  return apiFetch<BuildBetResponse>("/bet/build", {
    method: "POST",
    body: req,
  });
}

export function submitBet(req: SubmitBetRequest): Promise<SubmitBetResponse> {
  return apiFetch<SubmitBetResponse>("/bet/submit", {
    method: "POST",
    body: req,
  });
}
