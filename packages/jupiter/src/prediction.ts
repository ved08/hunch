import type { JupiterClient } from "./client.js";
import type { JupiterResult } from "./errors.js";

export type Side = "YES" | "NO";
export type DepositMint = "USDC" | "JUPUSD";

export const MINT_ADDRESS: Record<DepositMint, string> = {
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  JUPUSD: "JuprjznTrTSp2UFa3ZBUFgwdAmtZCq4MQCwysN55USD",
};

export type PlaceOrderRequest = {
  marketId: string;
  side: Side;
  amountNative: string;
  depositMint: DepositMint;
  walletAddress: string;
};

export type PlaceOrderResponse = {
  unsignedTx: string;
  orderPubkey: string;
  [key: string]: unknown;
};

type JupiterCreateOrderBody = {
  isBuy: true;
  ownerPubkey: string;
  marketId: string;
  isYes: boolean;
  depositAmount: string;
  depositMint: string;
};

export class PredictionApi {
  constructor(private readonly client: JupiterClient) {}

  events(): Promise<JupiterResult<unknown>> {
    return this.client.request("/prediction/v1/events");
  }

  market(marketId: string): Promise<JupiterResult<unknown>> {
    return this.client.request(`/prediction/v1/markets/${encodeURIComponent(marketId)}`);
  }

  placeOrder(req: PlaceOrderRequest): Promise<JupiterResult<PlaceOrderResponse>> {
    const body: JupiterCreateOrderBody = {
      isBuy: true,
      ownerPubkey: req.walletAddress,
      marketId: req.marketId,
      isYes: req.side === "YES",
      depositAmount: req.amountNative,
      depositMint: MINT_ADDRESS[req.depositMint],
    };
    return this.client.request<PlaceOrderResponse>("/prediction/v1/orders", {
      method: "POST",
      body,
    });
  }

  orderStatus(pubkey: string): Promise<JupiterResult<unknown>> {
    return this.client.request(`/prediction/v1/orders/status/${encodeURIComponent(pubkey)}`);
  }
}
