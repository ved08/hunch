import React from "react";
import { Stack } from "expo-router";
import { colors } from "../../src/theme/index";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.brand },
        animation: "fade",
      }}
    />
  );
}
