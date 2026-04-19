export type Config = {
  jupiterApiKey: string;
  jupiterApiUrl: string;
  solanaRpcUrl: string;
  port: number;
};

export function loadConfig(): Config {
  const jupiterApiKey = process.env.JUPITER_API_KEY;
  if (!jupiterApiKey) {
    throw new Error("JUPITER_API_KEY is required (get one at https://portal.jup.ag/)");
  }
  const solanaRpcUrl = process.env.SOLANA_RPC_URL;
  if (!solanaRpcUrl) {
    throw new Error("SOLANA_RPC_URL is required");
  }

  return {
    jupiterApiKey,
    jupiterApiUrl: process.env.JUPITER_API_URL ?? "https://api.jup.ag",
    solanaRpcUrl,
    port: Number(process.env.API_PORT ?? 3000),
  };
}
