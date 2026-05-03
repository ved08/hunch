import { createDb, type Db } from "@hunch/db";
import { JupiterClient, PredictionApi } from "@hunch/jupiter";
import type { Config } from "./config.js";
import { SolanaRpc } from "./rpc.js";

export type Deps = {
  db: Db;
  prediction: PredictionApi;
  rpc: SolanaRpc;
};

export function createDeps(config: Config): Deps {
  const db = createDb(config.databaseUrl);
  const jupiter = new JupiterClient({
    apiKey: config.jupiterApiKey,
    baseUrl: config.jupiterApiUrl,
  });
  const prediction = new PredictionApi(jupiter);
  const rpc = new SolanaRpc(config.solanaRpcUrl);
  return { db, prediction, rpc };
}
