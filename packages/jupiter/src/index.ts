export { JupiterClient } from "./client.js";
export type { JupiterClientOptions, RequestOptions } from "./client.js";
export { PredictionApi, MINT_ADDRESS } from "./prediction.js";
export type {
  Side,
  DepositMint,
  PlaceOrderRequest,
  PlaceOrderResponse,
  EventsQuery,
} from "./prediction.js";
export { classifyError } from "./errors.js";
export type { JupiterError, JupiterResult } from "./errors.js";
