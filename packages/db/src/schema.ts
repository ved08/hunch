import {
  bigint,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

export const broadcastSide = pgEnum("broadcast_side", ["YES", "NO"]);
export const broadcastDepositMint = pgEnum("broadcast_deposit_mint", ["USDC", "JUPUSD"]);
export const broadcastKind = pgEnum("broadcast_kind", ["OPEN"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    walletAddress: text("wallet_address").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("users_wallet_address_idx").on(t.walletAddress)]
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jupiterEventId: text("jupiter_event_id").notNull().unique(),
    title: text("title").notNull(),
    slug: text("slug"),
    category: text("category"),
    imageUrl: text("image_url"),
    closesAt: timestamp("closes_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("events_category_idx").on(t.category)]
);

export const markets = pgTable(
  "markets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    jupiterMarketId: text("jupiter_market_id").notNull().unique(),
    question: text("question").notNull(),
    imageUrl: text("image_url"),
    closeTime: timestamp("close_time", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("markets_event_idx").on(t.eventId),
    index("markets_close_time_idx").on(t.closeTime),
  ]
);

export const broadcasts = pgTable(
  "broadcasts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    marketId: uuid("market_id")
      .notNull()
      .references(() => markets.id, { onDelete: "cascade" }),
    side: broadcastSide("side").notNull(),
    amountNative: bigint("amount_native", { mode: "bigint" }).notNull(),
    entryPriceNative: bigint("entry_price_native", { mode: "bigint" }).notNull(),
    depositMint: broadcastDepositMint("deposit_mint").notNull(),
    orderPubkey: text("order_pubkey").notNull().unique(),
    txSig: text("tx_sig").notNull().unique(),
    parentBroadcastId: uuid("parent_broadcast_id").references(
      (): AnyPgColumn => broadcasts.id,
      { onDelete: "set null" }
    ),
    kind: broadcastKind("kind").notNull().default("OPEN"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("broadcasts_created_at_idx").on(t.createdAt),
    index("broadcasts_user_idx").on(t.userId),
    index("broadcasts_market_idx").on(t.marketId),
    index("broadcasts_parent_idx").on(t.parentBroadcastId),
  ]
);

export const follows = pgTable(
  "follows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    broadcastId: uuid("broadcast_id")
      .notNull()
      .references(() => broadcasts.id, { onDelete: "cascade" }),
    followerBroadcastId: uuid("follower_broadcast_id")
      .notNull()
      .references(() => broadcasts.id, { onDelete: "cascade" }),
    attributedTo: uuid("attributed_to")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("follows_broadcast_idx").on(t.broadcastId),
    index("follows_attributed_idx").on(t.attributedTo),
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Market = typeof markets.$inferSelect;
export type NewMarket = typeof markets.$inferInsert;
export type Broadcast = typeof broadcasts.$inferSelect;
export type NewBroadcast = typeof broadcasts.$inferInsert;
export type Follow = typeof follows.$inferSelect;
export type NewFollow = typeof follows.$inferInsert;
