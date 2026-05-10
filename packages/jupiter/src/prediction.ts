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
  blockhash: string | null;
  lastValidBlockHeight: number | null;
  externalOrderId: string | null;
  requiredSigners: string[];
  order: Record<string, unknown>;
};

type JupiterCreateOrderBody = {
  isBuy: true;
  ownerPubkey: string;
  marketId: string;
  isYes: boolean;
  depositAmount: string;
  depositMint: string;
};

type JupiterCreateOrderResponse = {
  transaction: string;
  txMeta?: { blockhash?: string; lastValidBlockHeight?: number };
  externalOrderId?: string;
  requiredSigners?: string[];
  order: { orderPubkey: string; [k: string]: unknown };
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

  async placeOrder(
    req: PlaceOrderRequest
  ): Promise<JupiterResult<PlaceOrderResponse>> {
    const body: JupiterCreateOrderBody = {
      isBuy: true,
      ownerPubkey: req.walletAddress,
      marketId: req.marketId,
      isYes: req.side === "YES",
      depositAmount: req.amountNative,
      depositMint: MINT_ADDRESS[req.depositMint],
    };
    const res = await this.client.request<JupiterCreateOrderResponse>(
      "/prediction/v1/orders",
      { method: "POST", body }
    );
    if (!res.ok) return res;
    const r = res.result;
    if (!r?.transaction || !r?.order?.orderPubkey) {
      return {
        ok: false,
        error: {
          code: "PARSE_ERROR",
          message: "Jupiter response missing transaction or order.orderPubkey",
          retryable: false,
        },
      };
    }
    return {
      ok: true,
      result: {
        unsignedTx: r.transaction,
        orderPubkey: r.order.orderPubkey,
        blockhash: r.txMeta?.blockhash ?? null,
        lastValidBlockHeight: r.txMeta?.lastValidBlockHeight ?? null,
        externalOrderId: r.externalOrderId ?? null,
        requiredSigners: r.requiredSigners ?? [],
        order: r.order,
      },
    };
  }

  orderStatus(pubkey: string): Promise<JupiterResult<unknown>> {
    return this.client.request(`/prediction/v1/orders/status/${encodeURIComponent(pubkey)}`);
  }
}
