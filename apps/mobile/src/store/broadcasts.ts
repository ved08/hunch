import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

export type LocalBroadcast = {
  id: string;
  marketId: string;
  marketQuestion: string;
  side: "YES" | "NO";
  amountUsd: number;
  depositMint: "USDC" | "JUPUSD";
  txSig: string;
  orderPubkey: string;
  walletAddress: string;
  createdAt: string;
  entryPrice?: number; // 0..1
  status?: "live" | "won" | "lost";
};

type BroadcastsState = {
  items: LocalBroadcast[];
  seeded: boolean;
  add: (b: LocalBroadcast) => void;
  seedIfEmpty: (walletAddress: string) => void;
  clear: () => void;
};

function nowMinus(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function demoSeeds(walletAddress: string): LocalBroadcast[] {
  return [
    {
      id: "seed-btc-150k",
      marketId: "seed-mkt-btc-150k",
      marketQuestion: "Will BTC reach $150,000 by end of July?",
      side: "YES",
      amountUsd: 50,
      depositMint: "USDC",
      txSig: "4tH9bM2qXTPSiwQDmTKxBNTKaqJsq1zFkUH6nNgKvJpz",
      orderPubkey: "8kPzXTbHZNqV6rJ4XBmKw3CdEFGhJL9YqRsTuVwXyZA1",
      walletAddress,
      createdAt: nowMinus(18),
      entryPrice: 0.38,
      status: "live",
    },
    {
      id: "seed-fed-cut",
      marketId: "seed-mkt-fed-cut",
      marketQuestion: "Fed cuts rates by 50bps at June meeting?",
      side: "NO",
      amountUsd: 25,
      depositMint: "USDC",
      txSig: "5jY3pK8nQzWvR4XBmKw3CdEFGhJL9YqRsTuVwXyZA1bF",
      orderPubkey: "9mNqV6rJ4XBmKw3CdEFGhJL9YqRsTuVwXyZA1bFkPzXT",
      walletAddress,
      createdAt: nowMinus(95),
      entryPrice: 0.71,
      status: "live",
    },
    {
      id: "seed-eth-flip",
      marketId: "seed-mkt-eth-flip",
      marketQuestion: "ETH/BTC ratio above 0.06 by Friday?",
      side: "YES",
      amountUsd: 12,
      depositMint: "JUPUSD",
      txSig: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      orderPubkey: "3kPzXTbHZNqV6rJ4XBmKw3CdEFGhJL9YqRsTuVwXyZA2",
      walletAddress,
      createdAt: nowMinus(60 * 24),
      entryPrice: 0.42,
      status: "won",
    },
    {
      id: "seed-jup-token",
      marketId: "seed-mkt-jup-token",
      marketQuestion: "JUP closes above $1.20 this week?",
      side: "YES",
      amountUsd: 100,
      depositMint: "USDC",
      txSig: "2hT9bM2qXTPSiwQDmTKxBNTKaqJsq1zFkUH6nNgKvJp4",
      orderPubkey: "6mNqV6rJ4XBmKw3CdEFGhJL9YqRsTuVwXyZA1bFkPzX3",
      walletAddress,
      createdAt: nowMinus(60 * 30),
      entryPrice: 0.55,
      status: "lost",
    },
  ];
}

export const useBroadcasts = create<BroadcastsState>()(
  persist(
    (set, get) => ({
      items: [],
      seeded: false,
      add: (b) =>
        set((state) => ({
          items: [b, ...state.items].slice(0, 100),
        })),
      seedIfEmpty: (walletAddress: string) => {
        const s = get();
        if (s.seeded || s.items.length > 0) return;
        set({ items: demoSeeds(walletAddress), seeded: true });
      },
      clear: () => set({ items: [], seeded: false }),
    }),
    {
      name: "hunch.broadcasts.v2",
      storage: createJSONStorage(() => ({
        getItem: async (name) => (await SecureStore.getItemAsync(name)) ?? null,
        setItem: async (name, value) => {
          await SecureStore.setItemAsync(name, value);
        },
        removeItem: async (name) => {
          await SecureStore.deleteItemAsync(name);
        },
      })),
      partialize: (state) => ({ items: state.items, seeded: state.seeded }),
    }
  )
);
