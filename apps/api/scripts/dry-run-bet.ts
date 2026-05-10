import { JupiterClient, PredictionApi } from "@hunch/jupiter";
import { VersionedTransaction, Transaction } from "@solana/web3.js";
import { Buffer } from "node:buffer";

const WALLET = process.argv[2] ?? "GkDVxN3GJ1b2w5dahGGCtzqD4NK9V4UobMsXFUS4Btwy";
const SIDE = (process.argv[3] as "YES" | "NO") ?? "YES";
const MINT = (process.argv[4] as "USDC" | "JUPUSD") ?? "USDC";
const USD = Number(process.argv[5] ?? "5");
// USDC + JUPUSD are both 6-decimal mints.
const AMOUNT_NATIVE = String(Math.round(USD * 1_000_000));

function unwrap<T>(label: string, r: { ok: true; result: T } | { ok: false; error: unknown }): T {
  if (!r.ok) {
    console.error(`[${label}] failed:`, JSON.stringify(r.error, null, 2));
    process.exit(1);
  }
  return r.result;
}

function describeTx(b64: string) {
  const bytes = Buffer.from(b64, "base64");
  try {
    const vtx = VersionedTransaction.deserialize(bytes);
    const msg = vtx.message;
    const keys = msg.staticAccountKeys.map((k) => k.toBase58());
    return {
      kind: "VersionedTransaction",
      version: msg.version,
      numSignatures: vtx.signatures.length,
      numRequiredSignatures: msg.header.numRequiredSignatures,
      numReadonlySignedAccounts: msg.header.numReadonlySignedAccounts,
      numReadonlyUnsignedAccounts: msg.header.numReadonlyUnsignedAccounts,
      recentBlockhash: msg.recentBlockhash,
      staticAccountKeys: keys,
      addressTableLookups: msg.addressTableLookups.map((l) => ({
        accountKey: l.accountKey.toBase58(),
        writableIndexes: l.writableIndexes,
        readonlyIndexes: l.readonlyIndexes,
      })),
      instructions: msg.compiledInstructions.map((ix, i) => ({
        idx: i,
        programId: keys[ix.programIdIndex] ?? `idx:${ix.programIdIndex}`,
        accountIndexes: ix.accountKeyIndexes,
        dataLen: ix.data.length,
      })),
      sigPlaceholders: vtx.signatures.map((s, i) => {
        const empty = s.every((b) => b === 0);
        return { idx: i, signer: keys[i] ?? "?", empty };
      }),
    };
  } catch {
    const legacy = Transaction.from(bytes);
    return {
      kind: "LegacyTransaction",
      numSignatures: legacy.signatures.length,
      feePayer: legacy.feePayer?.toBase58() ?? null,
      recentBlockhash: legacy.recentBlockhash,
      instructions: legacy.instructions.map((ix, i) => ({
        idx: i,
        programId: ix.programId.toBase58(),
        keys: ix.keys.map((k) => ({
          pubkey: k.pubkey.toBase58(),
          isSigner: k.isSigner,
          isWritable: k.isWritable,
        })),
        dataLen: ix.data.length,
      })),
      sigPlaceholders: legacy.signatures.map((s) => ({
        signer: s.publicKey.toBase58(),
        empty: s.signature == null,
      })),
    };
  }
}

async function main() {
  const apiKey = process.env.JUPITER_API_KEY;
  if (!apiKey) {
    console.error("JUPITER_API_KEY missing (run via bun --env-file=../../.env).");
    process.exit(1);
  }

  const jupiter = new JupiterClient({
    apiKey,
    baseUrl: process.env.JUPITER_API_URL ?? "https://api.jup.ag",
  });
  const prediction = new PredictionApi(jupiter);

  console.log("== fetching live events ==");
  const eventsRaw = unwrap(
    "events",
    await prediction.events({ includeMarkets: true, end: 10 })
  ) as {
    data?: Array<{
      eventId: string;
      metadata?: { title?: string };
      markets?: Array<{
        marketId: string;
        title?: string;
        status?: string;
        closeTime?: number | string | null;
      }>;
    }>;
  };

  const firstMarket = (() => {
    const evs = eventsRaw?.data ?? [];
    for (const ev of evs) {
      for (const m of ev.markets ?? []) {
        if (m.marketId && (m.status ?? "open") === "open") {
          return { ...m, eventTitle: ev.metadata?.title };
        }
      }
    }
    return null;
  })();

  if (!firstMarket) {
    console.error(
      "No open markets returned from Jupiter — payload:",
      JSON.stringify(eventsRaw, null, 2).slice(0, 600)
    );
    process.exit(1);
  }

  console.log("picked market:", {
    marketId: firstMarket.marketId,
    title: firstMarket.title,
    event: firstMarket.eventTitle,
    closeTime: firstMarket.closeTime ?? null,
  });

  console.log("\n== build params ==");
  const req = {
    walletAddress: WALLET,
    marketId: firstMarket.marketId,
    side: SIDE,
    amountNative: AMOUNT_NATIVE,
    depositMint: MINT,
  } as const;
  console.log(req);

  console.log("\n== calling /prediction/v1/orders ==");
  const placed = unwrap("placeOrder", await prediction.placeOrder(req)) as {
    unsignedTx: string;
    orderPubkey: string;
    [k: string]: unknown;
  };

  console.log("\norderPubkey:", placed.orderPubkey);
  console.log("\nFull Jupiter response keys:", Object.keys(placed));
  for (const [k, v] of Object.entries(placed)) {
    if (k === "unsignedTx") continue;
    console.log(`  ${k}:`, typeof v === "string" ? v : JSON.stringify(v));
  }

  console.log("\n== unsignedTx (base64) ==");
  console.log(placed.unsignedTx);

  console.log("\n== decoded tx ==");
  console.log(JSON.stringify(describeTx(placed.unsignedTx), null, 2));
}

main().catch((err) => {
  console.error("dry-run failed:", err);
  process.exit(1);
});
