import type { JupiterError } from "@hunch/jupiter";

export class UpstreamError extends Error {
  readonly source: string;
  readonly cause: JupiterError;

  constructor(source: string, cause: JupiterError) {
    super(`upstream:${source}: ${cause.message} (${cause.code})`);
    this.source = source;
    this.cause = cause;
    this.name = "UpstreamError";
  }

  toJson() {
    return { source: this.source, code: this.cause.code, message: this.cause.message };
  }
}

export class MappingError extends Error {
  readonly source: string;
  readonly reason: string;

  constructor(source: string, reason: string) {
    super(`mapping:${source}: ${reason}`);
    this.source = source;
    this.reason = reason;
    this.name = "MappingError";
  }

  toJson() {
    return { source: this.source, code: "MAPPING_ERROR", message: this.reason };
  }
}
