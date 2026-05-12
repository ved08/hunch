import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./Text";
import { colors, radii, space } from "../theme/index";
import { truncatePubkey } from "../utils/format";
import { useWallet } from "../wallet/provider";

export function WalletPill() {
  const { pubkey, connect, isConnecting } = useWallet();

  return (
    <Pressable
      onPress={connect}
      disabled={isConnecting}
      style={({ pressed }) => [styles.pill, pressed && { opacity: 0.8 }]}
    >
      {pubkey ? (
        <>
          <View style={styles.dot} />
          <Text variant="footnote" family="mono" tone="fg">
            {truncatePubkey(pubkey.toBase58(), 4, 4)}
          </Text>
        </>
      ) : (
        <Text variant="footnote" family="sansMedium" tone="fg">
          {isConnecting ? "Connecting…" : "Connect"}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
});
