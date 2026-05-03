import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./Text";
import { colors, radii, space } from "../theme/index";
import { formatPercent } from "../utils/format";
import type { NormalizedMarket } from "../api/normalize";

type Props = {
  market: NormalizedMarket;
  onPress?: () => void;
};

export function MarketPill({ market, onPress }: Props) {
  const yesIndex = market.outcomes.findIndex(
    (o) => o.toLowerCase() === "yes" || o.toLowerCase() === "true"
  );
  const yesPrice =
    yesIndex >= 0 ? market.outcomePrices[yesIndex] : market.outcomePrices[0];
  const noPrice =
    yesIndex >= 0
      ? market.outcomePrices[1 - yesIndex]
      : market.outcomePrices[1];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <Text
        variant="footnote"
        family="sans"
        tone="fgMuted"
        numberOfLines={2}
        style={{ marginBottom: space.sm }}
      >
        {market.question}
      </Text>
      <View style={styles.row}>
        <View style={[styles.side, { backgroundColor: colors.yesSoft }]}>
          <Text variant="caption" family="sans" tone="fgMuted" style={styles.sideLabel}>
            YES
          </Text>
          <Text variant="callout" family="mono" tone="yes">
            {formatPercent(yesPrice)}
          </Text>
        </View>
        <View style={[styles.side, { backgroundColor: colors.noSoft }]}>
          <Text variant="caption" family="sans" tone="fgMuted" style={styles.sideLabel}>
            NO
          </Text>
          <Text variant="callout" family="mono" tone="no">
            {formatPercent(noPrice)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    padding: space.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    gap: space.sm,
  },
  side: {
    flex: 1,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radii.sm,
  },
  sideLabel: {
    letterSpacing: 1.5,
    marginBottom: 2,
  },
});
