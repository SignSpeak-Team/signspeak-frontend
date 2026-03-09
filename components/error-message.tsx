import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

interface ErrorMessageProps {
  title: string;
  message: string;
  onRetry?: () => void;
  type?: "camera" | "network" | "api" | "general";
}

export default function ErrorMessage({
  title,
  message,
  onRetry,
  type = "general",
}: ErrorMessageProps) {
  const getIcon = () => {
    switch (type) {
      case "camera":
        return "📷";
      case "network":
        return "📡";
      case "api":
        return "⚠️";
      default:
        return "❌";
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.icon}>{getIcon()}</ThemedText>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText style={styles.message}>{message}</ThemedText>

        {onRetry && (
          <Pressable
            style={styles.retryButton}
            onPress={onRetry}
            android_ripple={{ color: "rgba(255, 255, 255, 0.3)" }}
          >
            <ThemedText style={styles.retryText}>Try Again</ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
