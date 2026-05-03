import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { JupiterError } from "@hunch/jupiter";

export function statusFor(error: JupiterError): ContentfulStatusCode {
  if (error.code === "RATE_LIMITED") return 429;
  if (typeof error.code === "number" && error.code >= 400 && error.code < 500) {
    return error.code as ContentfulStatusCode;
  }
  return 502;
}
