import type { User } from "@hunch/db";
import type { Deps } from "../deps.js";
import * as usersRepo from "../repos/users.js";

export async function ensureUser(deps: Deps, walletAddress: string): Promise<User> {
  return usersRepo.upsert(deps.db, { walletAddress });
}
