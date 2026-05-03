import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Text } from "../../src/components/Text";
import { EventCard } from "../../src/components/EventCard";
import { WalletPill } from "../../src/components/WalletPill";
import { EmptyState } from "../../src/components/EmptyState";
import { colors, radii, space } from "../../src/theme/index";
import { listEvents } from "../../src/api/events";
import type { NormalizedEvent } from "../../src/api/normalize";

const ALL = "all";

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<string>(ALL);

  const { data, isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: ["events"],
    queryFn: listEvents,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  const categories = useMemo(() => {
    if (!data) return [ALL];
    const set = new Set<string>();
    for (const e of data) {
      if (e.category) set.add(e.category);
      for (const t of e.tags) set.add(t);
    }
    return [ALL, ...Array.from(set).sort().slice(0, 10)];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (category === ALL) return data;
    return data.filter(
      (e) => e.category === category || e.tags.includes(category)
    );
  }, [data, category]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <View>
          <Text variant="footnote" family="sansMedium" tone="fgMuted" style={styles.kicker}>
            PUBLIC RECEIPTS, LIVE
          </Text>
          <Text variant="display" family="serifItalic" tone="fg">
            hunch.
          </Text>
        </View>
        <WalletPill />
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.fgMuted} />
        </View>
      ) : error ? (
        <EmptyState
          title="Couldn't reach the tape"
          body={(error as Error)?.message ?? "Check your API connection and try again."}
        />
      ) : (
        <FlatList<NormalizedEvent>
          data={filtered}
          keyExtractor={(e) => e.jupiterEventId}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.fgMuted}
            />
          }
          ListHeaderComponent={
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {categories.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCategory(c)}
                  style={({ pressed }) => [
                    styles.chip,
                    category === c && styles.chipActive,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text
                    variant="footnote"
                    family={category === c ? "sansSemibold" : "sansMedium"}
                    tone={category === c ? "fg" : "fgMuted"}
                  >
                    {c === ALL ? "All" : c}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          }
          ItemSeparatorComponent={() => <View style={{ height: space.lg }} />}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onSelectMarket={(marketId) => router.push(`/market/${marketId}`)}
            />
          )}
          ListEmptyComponent={
            <EmptyState title="Nothing in this slice" body="Try a different tag or pull to refresh." />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerRow: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
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
  listContent: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  chipRow: {
    flexDirection: "row",
    gap: space.sm,
    paddingVertical: space.md,
    paddingRight: space.lg,
  },
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.fg,
    borderColor: colors.fg,
  },
});
