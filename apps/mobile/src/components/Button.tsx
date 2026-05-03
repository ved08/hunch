import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Text } from "./Text";
import { colors, radii, space } from "../theme/index";

type Variant = "primary" | "ghost" | "yes" | "no";
type Size = "sm" | "md" | "lg";

type Props = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  haptic?: boolean;
  style?: ViewStyle;
  leading?: React.ReactNode;
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  haptic = true,
  onPress,
  style,
  leading,
  ...rest
}: Props) {
  const bg = variantBg(variant);
  const fg = variantFg(variant);
  const border = variantBorder(variant);
  const padV = size === "sm" ? 10 : size === "md" ? 14 : 18;
  const padH = size === "sm" ? 14 : size === "md" ? 20 : 24;
  const font = size === "lg" ? "sansSemibold" : "sansMedium";

  return (
    <Pressable
      {...rest}
      onPress={(e) => {
        if (haptic) Haptics.selectionAsync().catch(() => {});
        onPress?.(e);
      }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor: border,
          paddingVertical: padV,
          paddingHorizontal: padH,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.inner}>
          {leading ? <View style={{ marginRight: space.sm }}>{leading}</View> : null}
          <Text
            family={font as "sansMedium" | "sansSemibold"}
            variant={size === "lg" ? "body" : size === "md" ? "callout" : "footnote"}
            style={{ color: fg }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function variantBg(v: Variant): string {
  switch (v) {
    case "primary":
      return colors.fg;
    case "ghost":
      return "transparent";
    case "yes":
      return colors.yesSoft;
    case "no":
      return colors.noSoft;
  }
}

function variantFg(v: Variant): string {
  switch (v) {
    case "primary":
      return colors.bg;
    case "ghost":
      return colors.fg;
    case "yes":
      return colors.yes;
    case "no":
      return colors.no;
  }
}

function variantBorder(v: Variant): string {
  switch (v) {
    case "primary":
      return colors.fg;
    case "ghost":
      return colors.border;
    case "yes":
      return colors.yes;
    case "no":
      return colors.no;
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
  },
});
