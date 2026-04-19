export type RpcError = { code: number; message: string; data?: unknown };
export type RpcResult<T> = { ok: true; result: T } | { ok: false; error: RpcError };

type JsonRpcResponse<T> = {
  jsonrpc: "2.0";
  id: string | number;
  result?: T;
  error?: RpcError;
};

export class SolanaRpc {
  constructor(private readonly url: string) {}

  async sendTransaction(signedTxBase64: string): Promise<RpcResult<string>> {
    return this.call<string>("sendTransaction", [
      signedTxBase64,
      { encoding: "base64", skipPreflight: true, maxRetries: 0 },
    ]);
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
