import React from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "./Text";
import { MarketPill } from "./MarketPill";
import { colors, radii, space } from "../theme/index";
import { formatVolume, relativeTime } from "../utils/format";
import type { NormalizedEvent } from "../api/normalize";

type Props = {
  event: NormalizedEvent;
  onSelectMarket: (marketId: string) => void;
};

export function EventCard({ event, onSelectMarket }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]}>
            <Text family="serifItalic" variant="headline" tone="fgFaint">
              ·
            </Text>
          </View>
        )}
        <View style={{ flex: 1, marginLeft: space.md }}>
          <Text
            variant="headline"
            family="serif"
            numberOfLines={2}
            style={{ marginBottom: 2 }}
          >
            {event.title}
          </Text>
          <View style={styles.metaRow}>
            {event.isLive ? (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text variant="caption" family="sansMedium" tone="accent" style={styles.liveText}>
                  LIVE
                </Text>
              </View>
            ) : null}
            <Text variant="caption" family="mono" tone="fgMuted">
              {formatVolume(event.volumeUsd)}
            </Text>
            {event.closesAt ? (
              <>
                <Text variant="caption" tone="fgFaint">
                  ·
                </Text>
                <Text variant="caption" family="sans" tone="fgMuted">
                  {relativeTime(event.closesAt)}
                </Text>
              </>
            ) : null}
          </View>
        </View>
      </View>

      {event.markets.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
        >
          {event.markets.map((m) => (
            <MarketPill
              key={m.jupiterMarketId}
              market={m}
              onPress={() => onSelectMarket(m.jupiterMarketId)}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: space.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceElevated,
  },
  thumbFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    flexWrap: "wrap",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  liveText: {
    letterSpacing: 1.2,
  },
  rail: {
    gap: space.md,
    paddingRight: space.sm,
  },
});
