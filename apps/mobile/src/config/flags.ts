// Feature flags. All default to off; flip via EXPO_PUBLIC_* env vars in .env.
// Anything read from process.env here must start with EXPO_PUBLIC_ so Expo
// inlines it at bundle time.

function readBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  const v = value.toLowerCase().trim();
  if (v === "1" || v === "true" || v === "yes") return true;
  if (v === "0" || v === "false" || v === "no") return false;
  return fallback;
}

// Showcase mode: fake wallet auto-connected, bets are local-only (no backend,
// no chain). Broadcasts/profile read from a local zustand store seeded with
// sample data. See memory/project_demo_mode.md for the design rationale.
export const DEMO_MODE = readBool(process.env.EXPO_PUBLIC_DEMO_MODE, false);

// SecureStore key for the chosen demo pubkey (stable across launches).
export const DEMO_PUBKEY_KEY = "hunch.demo.pubkey.v1";

// Pool of real valid Solana pubkeys (pre-generated, no private keys retained).
// Demo mode picks one at random per install — avoids any runtime crypto
// dependency on @solana/web3.js Keypair.generate.
export const DEMO_PUBKEY_POOL = [
  "8ZpZFEcn36UpbPUzTyXbmZpX98zCpdfCAHBgY2tA9gnh",
  "BwYtV5VmsTjGWZkAV574xXbkj8Ki3cw1HoAnr1n6FBTG",
  "3ZKgdiNbW6YUQwBHQ5M52dTf4Nwvha1jPskgaKGpFN7S",
  "BDLrVXZp9VUUrnc8gq17fm81PppRy9NNg5hdJjZnRXWW",
  "JxcTje6fPYE34JEJ4VvNBdEoQ7VXRsjsPo4YzEAV9Tk",
  "3AUnhbdaMNZ3XzbaKwUrFPqpbBkPqoDecFkQAuyupyNp",
  "CdcP1eskfy2KE4fUFdtcmVLwTXxCijqJirKGYkZwbxzU",
  "9APPuPViVEdrKRr3spZFkRoC3zp9HALFa9LnLnrRmxEi",
] as const;
