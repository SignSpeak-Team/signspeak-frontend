import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

function CameraTabIcon({ color }: { color: string }) {
  return <IconSymbol size={28} name="camera.fill" color={color} />;
}

function HistoryTabIcon({ color }: { color: string }) {
  return <IconSymbol size={28} name="clock.fill" color={color} />;
}

function SettingsTabIcon({ color }: { color: string }) {
  return <IconSymbol size={28} name="gear" color={color} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Camera",
          tabBarIcon: CameraTabIcon,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "History",
          tabBarIcon: HistoryTabIcon,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: SettingsTabIcon,
        }}
      />
    </Tabs>
  );
}
