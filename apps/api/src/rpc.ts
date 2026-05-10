export type RpcError = { code: number; message: string; data?: unknown };
export type RpcResult<T> = { ok: true; result: T } | { ok: false; error: RpcError };

export type Commitment = "processed" | "confirmed" | "finalized";

type JsonRpcResponse<T> = {
  jsonrpc: "2.0";
  id: string | number;
  result?: T;
  error?: RpcError;
};

export type SignatureStatus = {
  slot: number;
  confirmations: number | null;
  err: unknown | null;
  confirmationStatus?: Commitment;
};

type SignatureStatusesResult = {
  context: { slot: number };
  value: Array<SignatureStatus | null>;
};

export type ConfirmResult =
  | { ok: true; status: SignatureStatus }
  | { ok: false; reason: "timeout" }
  | { ok: false; reason: "failed"; err: unknown };

const COMMITMENT_ORDER: Record<Commitment, number> = {
  processed: 1,
  confirmed: 2,
  finalized: 3,
};

export type SendTxOpts = {
  skipPreflight?: boolean;
  preflightCommitment?: Commitment;
  maxRetries?: number;
};

export class SolanaRpc {
  constructor(private readonly url: string) {}

  async sendTransaction(
    signedTxBase64: string,
    opts: SendTxOpts = {}
  ): Promise<RpcResult<string>> {
    return this.call<string>("sendTransaction", [
      signedTxBase64,
      {
        encoding: "base64",
        skipPreflight: opts.skipPreflight ?? false,
        preflightCommitment: opts.preflightCommitment ?? "processed",
        maxRetries: opts.maxRetries ?? 3,
      },
    ]);
  }

  async getSignatureStatuses(
    signatures: string[],
    searchTransactionHistory = false
  ): Promise<RpcResult<SignatureStatusesResult>> {
    return this.call<SignatureStatusesResult>("getSignatureStatuses", [
      signatures,
      { searchTransactionHistory },
    ]);
  }

  async confirmTransaction(
    signature: string,
    opts: { timeoutMs?: number; commitment?: Commitment; intervalMs?: number } = {}
  ): Promise<ConfirmResult> {
    const commitment = opts.commitment ?? "confirmed";
    const timeoutMs = opts.timeoutMs ?? 15_000;
    const intervalMs = opts.intervalMs ?? 750;
    const need = COMMITMENT_ORDER[commitment];
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const res = await this.getSignatureStatuses([signature]);
      if (res.ok) {
        const s = res.result.value[0];
        if (s) {
          if (s.err != null) {
            return { ok: false, reason: "failed", err: s.err };
          }
          const got = s.confirmationStatus
            ? COMMITMENT_ORDER[s.confirmationStatus]
            : 0;
          if (got >= need) return { ok: true, status: s };
        }
      }
      const remaining = deadline - Date.now();
      if (remaining <= 0) break;
      await new Promise((r) => setTimeout(r, Math.min(intervalMs, remaining)));
    }
    return { ok: false, reason: "timeout" };
  }

  private async call<T>(method: string, params: unknown[]): Promise<RpcResult<T>> {
    const body = { jsonrpc: "2.0", id: 1, method, params };
    const res = await fetch(this.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return { ok: false, error: { code: res.status, message: `HTTP_${res.status}` } };
    }
    const parsed = (await res.json()) as JsonRpcResponse<T>;
    if (parsed.error) return { ok: false, error: parsed.error };
    if (parsed.result === undefined) {
      return { ok: false, error: { code: -1, message: "RPC returned no result" } };
    }
    return { ok: true, result: parsed.result };
  }
}
