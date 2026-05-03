import React from "react";
import { StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";
import { Text } from "../../src/components/Text";
import { colors, space } from "../../src/theme/index";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.fg,
        tabBarInactiveTintColor: colors.fgFaint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Feed",
          tabBarIcon: ({ color }) => <TabDot color={color} />,
          tabBarLabel: ({ color }) => (
            <Text
              family="sansMedium"
              variant="caption"
              style={{ color, letterSpacing: 1, marginTop: 4 }}
            >
              FEED
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="broadcasts"
        options={{
          title: "Broadcasts",
          tabBarIcon: ({ color }) => <TabDot color={color} />,
          tabBarLabel: ({ color }) => (
            <Text
              family="sansMedium"
              variant="caption"
              style={{ color, letterSpacing: 1, marginTop: 4 }}
            >
              RECEIPTS
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabDot color={color} />,
          tabBarLabel: ({ color }) => (
            <Text
              family="sansMedium"
              variant="caption"
              style={{ color, letterSpacing: 1, marginTop: 4 }}
            >
              YOU
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}

function TabDot({ color }: { color: string }) {
  return (
    <View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: color,
        marginTop: space.sm,
      }}
    />
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    height: 72,
    paddingTop: 8,
  },
});
