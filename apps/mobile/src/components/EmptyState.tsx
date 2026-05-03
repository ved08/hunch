import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "./Text";
import { space } from "../theme/index";

type Props = {
  title: string;
  body?: string;
  ornament?: string;
};

export function EmptyState({ title, body, ornament = "·" }: Props) {
  return (
    <View style={styles.wrap}>
      <Text variant="display" family="serifItalic" tone="fgFaint" style={{ marginBottom: space.md }}>
        {ornament}
      </Text>
      <Text variant="headline" family="serif" align="center">
        {title}
      </Text>
      {body ? (
        <Text
          variant="callout"
          family="sans"
          tone="fgMuted"
          align="center"
          style={{ marginTop: space.sm, maxWidth: 280 }}
        >
          {body}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.xl,
    paddingVertical: space.xxl,
  },
});
