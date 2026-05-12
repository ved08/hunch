import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Text } from "../../src/components/Text";
import { colors, radii, space } from "../../src/theme/index";
import { useWallet } from "../../src/wallet/provider";
import { useOnboarding } from "../../src/onboarding/state";

export default function ConnectScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const wallet = useWallet();
  const { markComplete } = useOnboarding();
  // In demo mode pubkey is set at provider init, so we gate the auto-navigate
  // on the user actually pressing Connect first.
  const [hasInitiatedConnect, setHasInitiatedConnect] = useState(false);

  useEffect(() => {
    if (!hasInitiatedConnect) return;
    if (wallet.pubkey) {
      (async () => {
        await markComplete();
        router.replace("/");
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.pubkey, hasInitiatedConnect]);

  async function onConnect() {
    Haptics.selectionAsync().catch(() => {});
    setHasInitiatedConnect(true);
    await wallet.connect();
  }

  async function onSkip() {
    Haptics.selectionAsync().catch(() => {});
    await markComplete();
    router.replace("/");
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.lg }]}>
      <StatusBar style="light" />

      <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
        <Text variant="callout" family="sansMedium" style={styles.backLabel}>
          ← Back
        </Text>
      </Pressable>

      <View style={styles.hero}>
        <Image
          source={require("../../assets/brand/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.copy}>
        <Text variant="title" family="serif" align="center" style={styles.title}>
          Bring your wallet
        </Text>
        <Text
          variant="callout"
          family="sans"
          align="center"
          style={styles.body}
        >
          Connect any Solana wallet you already have. Phantom, Solflare, Backpack —
          all work. Your keys stay in your wallet; we only ask you to sign each bet.
        </Text>
      </View>

      <View style={styles.featureRow}>
        <Feature label="On-chain receipts" />
        <Feature label="No new account" />
        <Feature label="One-tap signing" />
      </View>

      {wallet.error ? (
        <View style={styles.errorBox}>
          <Text variant="footnote" family="sans" style={styles.errorText}>
            {wallet.error}
          </Text>
        </View>
      ) : null}

      <View style={[styles.actions, { paddingBottom: insets.bottom + space.xl }]}>
        <Pressable
          onPress={onConnect}
          disabled={wallet.isConnecting}
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && { opacity: 0.9 },
            wallet.isConnecting && { opacity: 0.7 },
          ]}
        >
          <Text variant="body" family="sansSemibold" style={styles.primaryLabel}>
            {wallet.isConnecting ? "Opening your wallet…" : "Connect wallet"}
          </Text>
        </Pressable>

        <Pressable
          onPress={onSkip}
          style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.7 }]}
        >
          <Text variant="callout" family="sansMedium" style={styles.ghostLabel}>
            Skip for now — I just want to browse
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Feature({ label }: { label: string }) {
  return (
    <View style={styles.feature}>
      <Text variant="footnote" family="sansMedium" style={styles.featureLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.brand,
    paddingHorizontal: space.xl,
  },
  backBtn: {
    alignSelf: "flex-start",
    paddingVertical: space.sm,
  },
  backLabel: {
    color: "rgba(255,255,255,0.85)",
  },
  hero: {
    alignItems: "center",
    marginTop: space.lg,
  },
  logo: {
    width: 140,
    height: 140,
  },
  copy: {
    paddingHorizontal: space.md,
    marginTop: space.lg,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 36,
  },
  body: {
    color: "rgba(255,255,255,0.85)",
    marginTop: space.md,
    fontSize: 15,
    lineHeight: 22,
  },
  featureRow: {
    marginTop: space.xl,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: space.sm,
  },
  feature: {
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.25)",
  },
  featureLabel: {
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  errorBox: {
    marginTop: space.lg,
    padding: space.md,
    borderRadius: radii.md,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.2)",
  },
  errorText: {
    color: "#FFE0E0",
  },
  actions: {
    marginTop: "auto",
    paddingTop: space.xl,
    gap: space.sm,
  },
  primaryBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.pill,
    paddingVertical: 18,
    alignItems: "center",
  },
  primaryLabel: {
    color: colors.brandDeep,
    letterSpacing: 0.3,
  },
  ghostBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
  ghostLabel: {
    color: "rgba(255,255,255,0.75)",
  },
});
