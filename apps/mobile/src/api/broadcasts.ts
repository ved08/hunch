import { apiFetch } from "./client";
import type { Side, DepositMint } from "./bet";

export type RemoteBroadcast = {
  id: string;
  side: Side;
  amountNative: string;
  entryPriceNative: string;
  depositMint: DepositMint;
  orderPubkey: string;
  txSig: string;
  kind: string;
  createdAt: string;
  market: {
    id: string;
    jupiterMarketId: string;
    question: string;
  };
  user: {
    id: string;
    walletAddress: string;
  };
};

type ListBroadcastsParams = {
  wallet?: string;
  marketId?: string;
  limit?: number;
};

export async function listBroadcasts(
  params: ListBroadcastsParams = {}
): Promise<RemoteBroadcast[]> {
  const search = new URLSearchParams();
  if (params.wallet) search.set("wallet", params.wallet);
  if (params.marketId) search.set("marketId", params.marketId);
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  const path = qs ? `/broadcasts?${qs}` : "/broadcasts";
  const res = await apiFetch<{ data: RemoteBroadcast[] }>(path);
  return res.data;
}
