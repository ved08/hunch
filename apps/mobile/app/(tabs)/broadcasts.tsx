import React from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Text } from "../../src/components/Text";
import { EmptyState } from "../../src/components/EmptyState";
import { colors, radii, space } from "../../src/theme/index";
import { formatUsd, relativeTime, truncatePubkey } from "../../src/utils/format";
import { nativeStrToUsd } from "../../src/utils/native-amount";
import { useWallet } from "../../src/wallet/provider";
import { useBroadcasts, type LocalBroadcast } from "../../src/store/broadcasts";
import { listBroadcasts, type RemoteBroadcast } from "../../src/api/broadcasts";

type Row = {
  id: string;
  side: "YES" | "NO";
  amountUsd: number;
  depositMint: "USDC" | "JUPUSD";
  marketQuestion: string;
  walletAddress: string;
  createdAt: string;
  status?: "live" | "won" | "lost";
};

function fromRemote(b: RemoteBroadcast): Row {
  return {
    id: b.id,
    side: b.side,
    amountUsd: nativeStrToUsd(b.amountNative),
    depositMint: b.depositMint,
    marketQuestion: b.market.question,
    walletAddress: b.user.walletAddress,
    createdAt: b.createdAt,
  };
}

function fromLocal(b: LocalBroadcast): Row {
  return {
    id: b.id,
    side: b.side,
    amountUsd: b.amountUsd,
    depositMint: b.depositMint,
    marketQuestion: b.marketQuestion,
    walletAddress: b.walletAddress,
    createdAt: b.createdAt,
    status: b.status,
  };
}

export default function BroadcastsScreen() {
  const insets = useSafeAreaInsets();
  const { pubkey, isDemo } = useWallet();
  const localItems = useBroadcasts((s) => s.items);

  const wallet = !isDemo && pubkey ? pubkey.toBase58() : undefined;

  const remote = useQuery({
    queryKey: ["broadcasts", { wallet }],
    queryFn: () => listBroadcasts({ wallet, limit: 50 }),
    enabled: Boolean(wallet),
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  const rows: Row[] = isDemo
    ? localItems.map(fromLocal)
    : (remote.data ?? []).map(fromRemote);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text variant="footnote" family="sansMedium" tone="fgMuted" style={styles.kicker}>
          EVERY TRADE, ON THE RECORD
        </Text>
        <Text variant="title" family="serif" tone="fg">
          Public receipts
        </Text>
      </View>

      {!isDemo && !wallet ? (
        <EmptyState
          title="Connect to see receipts"
          body="Connect your Solana wallet to view your on-chain hunches."
        />
      ) : !isDemo && remote.isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.fgMuted} />
        </View>
      ) : !isDemo && remote.error ? (
        <EmptyState
          title="Couldn't load your receipts"
          body={(remote.error as Error)?.message ?? "Try pulling to refresh."}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No receipts yet"
          body="Place your first hunch on a market. Every trade broadcasts here."
        />
      ) : (
        <FlatList<Row>
          data={rows}
          keyExtractor={(r) => r.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          refreshControl={
            !isDemo ? (
              <RefreshControl
                refreshing={remote.isRefetching}
                onRefresh={remote.refetch}
                tintColor={colors.fgMuted}
              />
            ) : undefined
          }
          ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
          renderItem={({ item }) => <BroadcastRow item={item} />}
        />
      )}
    </View>
  );
}

function BroadcastRow({ item }: { item: Row }) {
  const sideColor = item.side === "YES" ? colors.yes : colors.no;
  const statusLabel =
    item.status === "won" ? "WON" : item.status === "lost" ? "LOST" : null;
  const statusColor =
    item.status === "won" ? colors.yes : item.status === "lost" ? colors.no : null;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: "row", gap: space.sm, alignItems: "center" }}>
          <View
            style={[
              styles.sideBadge,
              {
                backgroundColor:
                  item.side === "YES" ? colors.yesSoft : colors.noSoft,
                borderColor: sideColor,
              },
            ]}
          >
            <Text
              variant="caption"
              family="sansSemibold"
              style={{ color: sideColor, letterSpacing: 1.5 }}
            >
              {item.side}
            </Text>
          </View>
          {statusLabel && statusColor ? (
            <View
              style={[
                styles.statusBadge,
                { borderColor: statusColor },
              ]}
            >
              <Text
                variant="caption"
                family="sansSemibold"
                style={{ color: statusColor, letterSpacing: 1.5 }}
              >
                {statusLabel}
              </Text>
            </View>
          ) : null}
        </View>
        <Text variant="footnote" family="mono" tone="fgMuted">
          {formatUsd(item.amountUsd)} · {item.depositMint}
        </Text>
      </View>
      <Text
        variant="body"
        family="serif"
        numberOfLines={2}
        style={{ marginTop: space.sm }}
      >
        {item.marketQuestion}
      </Text>
      <View style={styles.cardFooter}>
        <Text variant="caption" family="mono" tone="fgFaint">
          {truncatePubkey(item.walletAddress, 4, 4)}
        </Text>
        <Text variant="caption" family="sans" tone="fgFaint">
          {relativeTime(item.createdAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.lg,
  },
  kicker: {
    letterSpacing: 2,
    marginBottom: 2,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingHorizontal: space.lg,
  },
  card: {
    padding: space.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideBadge: {
    paddingHorizontal: space.md,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statusBadge: {
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardFooter: {
    marginTop: space.md,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
