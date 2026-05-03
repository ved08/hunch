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

// When false, the wallet provider skips loading the MWA native module and
// serves a demo pubkey. Bet flow calls POST /bet/build (to prove the backend
// is reachable) but skips signing + POST /bet/submit.
export const WALLET_ENABLED = readBool(
  process.env.EXPO_PUBLIC_WALLET_ENABLED,
  false
);

// A valid base58 32-byte pubkey (the System Program) used as a stand-in when
// WALLET_ENABLED is false. Satisfies the API's `walletAddress: z.string().min(32)`
// check and is obviously fake.
export const DEMO_WALLET_ADDRESS = "11111111111111111111111111111111";
