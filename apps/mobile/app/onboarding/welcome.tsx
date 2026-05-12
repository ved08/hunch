import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Text } from "../../src/components/Text";
import { colors, radii, space } from "../../src/theme/index";
import { useOnboarding } from "../../src/onboarding/state";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { markComplete } = useOnboarding();

  async function onGetStarted() {
    Haptics.selectionAsync().catch(() => {});
    router.push("/onboarding/connect");
  }

  async function onSkip() {
    Haptics.selectionAsync().catch(() => {});
    await markComplete();
    router.replace("/");
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.xl }]}>
      <StatusBar style="light" />

      <View style={styles.heroBlock}>
        <Image
          source={require("../../assets/brand/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textBlock}>
        <Text
          variant="display"
          family="sansSemibold"
          align="center"
          style={styles.tagline}
        >
          TRUST YOUR HUNCH
        </Text>
        <Text
          variant="callout"
          family="serifItalic"
          align="center"
          style={styles.sub}
        >
          Social prediction markets on Solana.{"\n"}Bet on what comes next.
        </Text>
      </View>

      <View style={[styles.actions, { paddingBottom: insets.bottom + space.xl }]}>
        <Pressable
          onPress={onGetStarted}
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text variant="body" family="sansSemibold" style={styles.primaryLabel}>
            Get started
          </Text>
        </Pressable>

        <Pressable
          onPress={onSkip}
          style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.7 }]}
        >
          <Text variant="callout" family="sansMedium" style={styles.ghostLabel}>
            Just looking around
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.brand,
    paddingHorizontal: space.xl,
  },
  heroBlock: {
    flex: 1.2,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 260,
    height: 260,
  },
  textBlock: {
    alignItems: "center",
    paddingHorizontal: space.lg,
  },
  tagline: {
    color: "#FFE7B0",
    letterSpacing: 2.5,
    fontSize: 30,
    lineHeight: 34,
    textShadowColor: colors.brandDeep,
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 0,
  },
  sub: {
    color: "rgba(255,255,255,0.85)",
    marginTop: space.md,
    fontSize: 16,
    lineHeight: 22,
  },
  actions: {
    paddingTop: space.xxl,
    gap: space.md,
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
