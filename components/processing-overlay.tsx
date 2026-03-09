import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

interface ProcessingOverlayProps {
  message?: string;
}

export default function ProcessingOverlay({
  message = "Detecting hand landmarks...",
}: ProcessingOverlayProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? "rgba(0, 0, 0, 0.85)"
            : "rgba(255, 255, 255, 0.95)",
        },
      ]}
    >
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <ThemedText style={styles.message}>{message}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
  },
});
