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

export type EventsQuery = {
  category?: string;
  subcategory?: string;
  filter?: string;
  provider?: string;
  sortBy?: string;
  sortDirection?: string;
  start?: number;
  end?: number;
  includeMarkets?: boolean;
};

export class PredictionApi {
  constructor(private readonly client: JupiterClient) {}

  events(query: EventsQuery = {}): Promise<JupiterResult<unknown>> {
    const q: Record<string, string | number | undefined> = {
      category: query.category,
      subcategory: query.subcategory,
      filter: query.filter,
      provider: query.provider,
      sortBy: query.sortBy,
      sortDirection: query.sortDirection,
      start: query.start,
      end: query.end,
      includeMarkets:
        query.includeMarkets === undefined ? undefined : String(query.includeMarkets),
    };
    return this.client.request("/prediction/v1/events", { query: q });
  }

  market(marketId: string): Promise<JupiterResult<unknown>> {
    return this.client.request(`/prediction/v1/markets/${encodeURIComponent(marketId)}`);
  }

  orderbook(marketId: string): Promise<JupiterResult<unknown>> {
    return this.client.request(
      `/prediction/v1/orderbook/${encodeURIComponent(marketId)}`
    );
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
