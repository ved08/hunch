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
};

type BroadcastsState = {
  items: LocalBroadcast[];
  add: (b: LocalBroadcast) => void;
  clear: () => void;
};

export const useBroadcasts = create<BroadcastsState>()(
  persist(
    (set) => ({
      items: [],
      add: (b) =>
        set((state) => ({
          items: [b, ...state.items].slice(0, 100),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "hunch.broadcasts.v1",
      storage: createJSONStorage(() => ({
        getItem: async (name) => (await SecureStore.getItemAsync(name)) ?? null,
        setItem: async (name, value) => {
          await SecureStore.setItemAsync(name, value);
        },
        removeItem: async (name) => {
          await SecureStore.deleteItemAsync(name);
        },
      })),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
