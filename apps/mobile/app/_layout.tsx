import "react-native-get-random-values";
import { Buffer } from "buffer";
if (typeof global.Buffer === "undefined") {
  (global as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
}

import React, { useEffect } from "react";
import { ActivityIndicator, AppState, StyleSheet, View } from "react-native";
import type { AppStateStatus } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";
import {
  useFonts as useSerifFonts,
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from "@expo-google-fonts/instrument-serif";
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
} from "@expo-google-fonts/geist";
import {
  GeistMono_400Regular,
  GeistMono_500Medium,
} from "@expo-google-fonts/geist-mono";
import { WalletProvider, useWallet } from "../src/wallet/provider";
import { colors } from "../src/theme/index";
import { OnboardingProvider, useOnboarding } from "../src/onboarding/state";
import { useBroadcasts } from "../src/store/broadcasts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

function onAppStateChange(status: AppStateStatus) {
  focusManager.setFocused(status === "active");
}

function DemoSeeder() {
  const { isDemo, pubkey } = useWallet();
  const seedIfEmpty = useBroadcasts((s) => s.seedIfEmpty);
  useEffect(() => {
    if (isDemo && pubkey) seedIfEmpty(pubkey.toBase58());
  }, [isDemo, pubkey, seedIfEmpty]);
  return null;
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { status } = useOnboarding();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (status === "unknown") return;
    const inOnboarding = segments[0] === "onboarding";
    if (status === "needed" && !inOnboarding) {
      router.replace("/onboarding/welcome");
    }
  }, [status, segments, router]);

  if (status === "unknown") {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.fg} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  useEffect(() => {
    const sub = AppState.addEventListener("change", onAppStateChange);
    return () => sub.remove();
  }, []);

  const [fontsLoaded] = useSerifFonts({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    GeistMono_400Regular,
    GeistMono_500Medium,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.fg} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <WalletProvider>
            <OnboardingProvider>
              <StatusBar style="light" />
              <DemoSeeder />
              <OnboardingGate>
                <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.bg },
                  animation: "fade",
                }}
              >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="onboarding"
                  options={{ animation: "fade" }}
                />
                <Stack.Screen
                  name="market/[id]"
                  options={{
                    presentation: "modal",
                    animation: "slide_from_bottom",
                  }}
                />
                </Stack>
              </OnboardingGate>
            </OnboardingProvider>
          </WalletProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
});
