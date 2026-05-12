import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Text } from "../../src/components/Text";
import { Button } from "../../src/components/Button";
import { EmptyState } from "../../src/components/EmptyState";
import { colors, radii, space } from "../../src/theme/index";
import { formatUsd, truncatePubkey } from "../../src/utils/format";
import { nativeStrToUsd } from "../../src/utils/native-amount";
import { useWallet } from "../../src/wallet/provider";
import { useBroadcasts } from "../../src/store/broadcasts";
import { listBroadcasts } from "../../src/api/broadcasts";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { pubkey, connect, disconnect, isConnecting, error, isDemo } = useWallet();
  const localBroadcasts = useBroadcasts((s) => s.items);

  const wallet = !isDemo && pubkey ? pubkey.toBase58() : undefined;
  const remote = useQuery({
    queryKey: ["broadcasts", { wallet }],
    queryFn: () => listBroadcasts({ wallet, limit: 100 }),
    enabled: Boolean(wallet),
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  const count = isDemo
    ? localBroadcasts.length
    : (remote.data?.length ?? 0);
  const totalStaked = isDemo
    ? localBroadcasts.reduce((acc, b) => acc + b.amountUsd, 0)
    : (remote.data ?? []).reduce(
        (acc, b) => acc + nativeStrToUsd(b.amountNative),
        0
      );

  const wins = isDemo
    ? localBroadcasts.filter((b) => b.status === "won").length
    : 0;
  const losses = isDemo
    ? localBroadcasts.filter((b) => b.status === "lost").length
    : 0;
  const resolved = wins + losses;
  const accuracy = resolved > 0 ? Math.round((wins / resolved) * 100) : null;

  async function copy() {
    if (!pubkey) return;
    await Clipboard.setStringAsync(pubkey.toBase58()).catch(() => {});
    Alert.alert("Copied", "Wallet address copied.");
  }

  if (!pubkey) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <EmptyState
          title="You're off the record"
          body="Connect a Solana wallet to leave receipts."
          ornament="§"
        />
        <View style={{ padding: space.lg, paddingBottom: insets.bottom + 100 }}>
          <Button
            label={isConnecting ? "Connecting…" : "Connect wallet"}
            onPress={connect}
            loading={isConnecting}
            size="lg"
          />
          {error ? (
            <Text variant="footnote" tone="danger" align="center" style={{ marginTop: space.md }}>
              {error}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
    >
      <View style={styles.header}>
        <Text variant="footnote" family="sansMedium" tone="fgMuted" style={styles.kicker}>
          YOUR LEDGER
        </Text>
        <Pressable onPress={copy}>
          <Text variant="title" family="mono" tone="fg">
            {truncatePubkey(pubkey.toBase58(), 6, 6)}
          </Text>
          <Text variant="caption" family="sans" tone="fgFaint" style={{ marginTop: 2 }}>
            tap to copy
          </Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text variant="caption" family="sansMedium" tone="fgMuted" style={styles.statLabel}>
            HUNCHES
          </Text>
          <Text variant="title" family="mono" tone="fg">
            {count}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text variant="caption" family="sansMedium" tone="fgMuted" style={styles.statLabel}>
            AT STAKE
          </Text>
          <Text variant="title" family="mono" tone="fg">
            {formatUsd(totalStaked)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text variant="caption" family="sansMedium" tone="fgMuted" style={styles.statLabel}>
            ACCURACY
          </Text>
          <Text variant="title" family="mono" tone="fg">
            {accuracy != null ? `${accuracy}%` : "—"}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: space.lg, marginTop: space.xxl }}>
        <Button label="Disconnect" variant="ghost" onPress={disconnect} />
      </View>
    </ScrollView>
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
    marginBottom: space.sm,
  },
  statsRow: {
    marginHorizontal: space.lg,
    padding: space.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    letterSpacing: 2,
    marginBottom: 4,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: colors.border,
    marginHorizontal: space.md,
  },
});
