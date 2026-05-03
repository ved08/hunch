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
  [key: string]: unknown;
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
  warning?: string;
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
