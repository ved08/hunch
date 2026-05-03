const NATIVE_PER_USD = 1_000_000n;

export function formatUsd(value: number | bigint, opts?: { maxDecimals?: number }): string {
  const n = typeof value === "bigint" ? Number(value) : value;
  const max = opts?.maxDecimals ?? 2;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: max,
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

export function formatVolume(volumeUsd: number | bigint | null | undefined): string {
  if (volumeUsd == null) return "—";
  const n = typeof volumeUsd === "bigint" ? Number(volumeUsd) : volumeUsd;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function formatPercent(price: string | number | null | undefined): string {
  if (price == null || price === "") return "—";
  const n = typeof price === "string" ? parseFloat(price) : price;
  if (!Number.isFinite(n)) return "—";
  return `${Math.round(n * 100)}%`;
}

export function truncatePubkey(pubkey: string | null | undefined, head = 4, tail = 4): string {
  if (!pubkey) return "";
  if (pubkey.length <= head + tail + 1) return pubkey;
  return `${pubkey.slice(0, head)}…${pubkey.slice(-tail)}`;
}

export function relativeTime(input: string | number | Date | null | undefined): string {
  if (input == null) return "";
  const target = new Date(input).getTime();
  if (!Number.isFinite(target)) return "";
  const diffMs = target - Date.now();
  const abs = Math.abs(diffMs);
  const sec = Math.round(abs / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  let body: string;
  if (sec < 60) body = `${sec}s`;
  else if (min < 60) body = `${min}m`;
  else if (hr < 48) body = `${hr}h`;
  else body = `${day}d`;
  return diffMs >= 0 ? `closes in ${body}` : `${body} ago`;
}

export { NATIVE_PER_USD };
