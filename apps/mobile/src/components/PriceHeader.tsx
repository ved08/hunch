import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "./Text";
import { colors, radii, space } from "../theme/index";
import { formatPercent } from "../utils/format";

type Props = {
  yesPrice: string | null | undefined;
  noPrice: string | null | undefined;
};

export function PriceHeader({ yesPrice, noPrice }: Props) {
  const yesPct = parsePrice(yesPrice);
  const noPct = yesPct != null ? 1 - yesPct : parsePrice(noPrice);
  const split = yesPct != null ? Math.max(0.02, Math.min(0.98, yesPct)) : 0.5;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text variant="caption" family="sansMedium" tone="fgMuted" style={styles.label}>
            YES
          </Text>
          <Text variant="display" family="mono" tone="yes">
            {formatPercent(yesPrice)}
          </Text>
        </View>
        <View style={[styles.col, { alignItems: "flex-end" }]}>
          <Text variant="caption" family="sansMedium" tone="fgMuted" style={styles.label}>
            NO
          </Text>
          <Text variant="display" family="mono" tone="no">
            {formatPercent(noPrice ?? (yesPct != null ? String(1 - yesPct) : null))}
          </Text>
        </View>
      </View>
      <View style={styles.bar}>
        <View
          style={[
            styles.barYes,
            { flex: Math.round(split * 1000), backgroundColor: colors.yes },
          ]}
        />
        <View
          style={[
            styles.barNo,
            { flex: Math.round((1 - split) * 1000), backgroundColor: colors.no },
          ]}
        />
      </View>
    </View>
  );
}

function parsePrice(v: string | null | undefined): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (!Number.isFinite(n)) return null;
  if (n > 1) return n / 100; // treat "65" as 0.65
  return n;
}

const styles = StyleSheet.create({
  wrap: {
    gap: space.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  col: {
    flex: 1,
  },
  label: {
    letterSpacing: 2,
    marginBottom: 4,
  },
  bar: {
    flexDirection: "row",
    height: 4,
    borderRadius: radii.pill,
    overflow: "hidden",
    backgroundColor: colors.border,
  },
  barYes: {
    height: "100%",
  },
  barNo: {
    height: "100%",
  },
});
