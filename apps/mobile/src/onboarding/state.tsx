import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { DEMO_MODE } from "../config/flags";

const KEY = "hunch.onboarded.v1";

export type OnboardingStatus = "unknown" | "needed" | "complete";

type Ctx = {
  status: OnboardingStatus;
  markComplete: () => Promise<void>;
  reset: () => Promise<void>;
};

const OnboardingContext = createContext<Ctx | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  // In demo mode the onboarding flag is never persisted, so every cold start
  // walks through the welcome → connect flow.
  const [status, setStatus] = useState<OnboardingStatus>(
    DEMO_MODE ? "needed" : "unknown"
  );

  useEffect(() => {
    if (DEMO_MODE) return;
    let cancelled = false;
    (async () => {
      const v = await SecureStore.getItemAsync(KEY).catch(() => null);
      if (cancelled) return;
      setStatus(v === "1" ? "complete" : "needed");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const markComplete = useCallback(async () => {
    if (DEMO_MODE) {
      setStatus("complete");
      return;
    }
    await SecureStore.setItemAsync(KEY, "1").catch(() => {});
    setStatus("complete");
  }, []);

  const reset = useCallback(async () => {
    if (DEMO_MODE) {
      setStatus("needed");
      return;
    }
    await SecureStore.deleteItemAsync(KEY).catch(() => {});
    setStatus("needed");
  }, []);

  return (
    <OnboardingContext.Provider value={{ status, markComplete, reset }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): Ctx {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used inside <OnboardingProvider>");
  return ctx;
}
