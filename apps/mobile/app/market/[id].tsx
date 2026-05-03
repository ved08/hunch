import React, { useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Text } from "../../src/components/Text";
import { Button } from "../../src/components/Button";
import { BetSheet, type BetSheetHandle } from "../../src/components/BetSheet";
import { PriceHeader } from "../../src/components/PriceHeader";
import { EmptyState } from "../../src/components/EmptyState";
import { colors, radii, space } from "../../src/theme/index";
import { getMarket } from "../../src/api/events";
import { relativeTime } from "../../src/utils/format";

export default function MarketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BetSheetHandle>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["market", id],
    queryFn: () => getMarket(id),
    enabled: Boolean(id),
    staleTime: 5_000,
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
  });

  const { yesPrice, noPrice } = useMemo(() => {
    const m = data?.market;
    if (!m) return { yesPrice: null as string | null, noPrice: null as string | null };
    const yesIdx = m.outcomes.findIndex(
      (o) => o.toLowerCase() === "yes" || o.toLowerCase() === "true"
    );
    const yes = yesIdx >= 0 ? m.outcomePrices[yesIdx] : m.outcomePrices[0];
    const no =
      yesIdx >= 0 ? m.outcomePrices[1 - yesIdx] : m.outcomePrices[1];
    return { yesPrice: yes ?? null, noPrice: no ?? null };
  }, [data]);

  function onTake(side: "YES" | "NO") {
    if (!data?.market) return;
    sheetRef.current?.open({
      marketId: data.market.jupiterMarketId,
      marketQuestion: data.market.question,
      side,
      priceHint: side === "YES" ? yesPrice : noPrice,
    });
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}
          hitSlop={16}
        >
          <Text variant="body" family="serifItalic" tone="fgMuted">
            ← close
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.fgMuted} />
        </View>
      ) : error || !data ? (
        <EmptyState
          title="Market not found"
          body={(error as Error)?.message ?? "Couldn't load this market."}
        />
      ) : (
        <>
          <ScrollView
            contentContainerStyle={[
              styles.content,
              { paddingBottom: insets.bottom + 140 },
            ]}
          >
            {data.event ? (
              <Text variant="footnote" family="sansMedium" tone="fgMuted" style={styles.eventLabel}>
                {(data.event.category ?? "market").toUpperCase()}
              </Text>
            ) : null}

            <Text variant="title" family="serif" style={{ marginTop: 4 }}>
              {data.market.question}
            </Text>

            {data.market.closeTime ? (
              <Text variant="footnote" family="sans" tone="fgMuted" style={{ marginTop: space.sm }}>
                {relativeTime(data.market.closeTime)}
              </Text>
            ) : null}

            <View style={styles.priceCard}>
              <PriceHeader yesPrice={yesPrice} noPrice={noPrice} />
            </View>

            {data.market.rulesPrimary ? (
              <View style={styles.rules}>
                <Text
                  variant="caption"
                  family="sansMedium"
                  tone="fgMuted"
                  style={styles.rulesLabel}
                >
                  RULES
                </Text>
                <Text variant="footnote" family="sans" tone="fgMuted" style={{ marginTop: space.sm }}>
                  {data.market.rulesPrimary}
                </Text>
              </View>
            ) : null}
          </ScrollView>

          <View
            style={[
              styles.cta,
              { paddingBottom: insets.bottom + space.md },
            ]}
          >
            <Button
              label="Take YES"
              variant="yes"
              size="lg"
              style={{ flex: 1 }}
              onPress={() => onTake("YES")}
            />
            <Button
              label="Take NO"
              variant="no"
              size="lg"
              style={{ flex: 1 }}
              onPress={() => onTake("NO")}
            />
          </View>
        </>
      )}

      <BetSheet ref={sheetRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  nav: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.sm,
  },
  back: {
    alignSelf: "flex-start",
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
  eventLabel: {
    letterSpacing: 2,
  },
  priceCard: {
    marginTop: space.xl,
    padding: space.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rules: {
    marginTop: space.xl,
    padding: space.lg,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rulesLabel: {
    letterSpacing: 2,
  },
  cta: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    flexDirection: "row",
    gap: space.md,
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
