const SCALE = 1_000_000n;

export function usdToNative(usd: number): string {
  if (!Number.isFinite(usd) || usd < 0) return "0";
  const cents = Math.round(usd * 1_000_000);
  return BigInt(cents).toString();
}

export function nativeToUsd(native: string | bigint): number {
  const big = typeof native === "bigint" ? native : BigInt(native);
  const whole = big / SCALE;
  const frac = big % SCALE;
  return Number(whole) + Number(frac) / Number(SCALE);
}

export function nativeStrToUsd(native: string): number {
  if (!/^\d+$/.test(native)) return 0;
  return nativeToUsd(native);
}
