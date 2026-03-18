import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SignType } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function TranslationResultScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { imageUri, text, signType, confidence } = params as {
    imageUri: string;
    text: string;
    signType: SignType;
    confidence: string;
  };

  const confidenceNum = parseFloat(confidence);

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.9) {return "#4CAF50";}
    if (conf >= 0.7) {return "#FF9800";}
    return "#F44336";
  };

  const getSignTypeIcon = (type: SignType) => {
    switch (type) {
      case SignType.LETTER:
        return "🔤";
      case SignType.WORD:
        return "💬";
      case SignType.PHRASE:
        return "📝";
      default:
        return "✨";
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "#fff" : "#000"}
            />
          </Pressable>
          <ThemedText type="title">Translation Result</ThemedText>
          <View style={styles.placeholder} />
        </View>

        {/* Captured Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.signTypeBadge}>
            <ThemedText style={styles.badgeText}>
              {getSignTypeIcon(signType)} {signType}
            </ThemedText>
          </View>
        </View>

        {/* Translation Result */}
        <View
          style={[
            styles.resultCard,
            { backgroundColor: isDark ? "#1c1c1e" : "#fff" },
          ]}
        >
          <ThemedText style={styles.resultLabel}>Translated Text</ThemedText>
          <ThemedText style={styles.resultText}>{text}</ThemedText>

          <View style={styles.confidenceRow}>
            <View
              style={[
                styles.confidenceDot,
                { backgroundColor: getConfidenceColor(confidenceNum) },
              ]}
            />
            <ThemedText style={styles.confidenceText}>
              {Math.round(confidenceNum * 100)}% confidence
            </ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => router.push("/(tabs)")}
          >
            <Ionicons name="camera" size={24} color="#fff" />
            <ThemedText style={styles.primaryButtonText}>
              Translate Another
            </ThemedText>
          </Pressable>

          <View style={styles.secondaryActions}>
            <Pressable
              style={[
                styles.actionButton,
                styles.secondaryButton,
                { backgroundColor: isDark ? "#1c1c1e" : "#f5f5f5" },
              ]}
              onPress={() => {
                // TODO: Implement share functionality
                console.log("Share translation");
              }}
            >
              <Ionicons
                name="share-outline"
                size={24}
                color={isDark ? "#fff" : "#000"}
              />
              <ThemedText>Share</ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.actionButton,
                styles.secondaryButton,
                { backgroundColor: isDark ? "#1c1c1e" : "#f5f5f5" },
              ]}
              onPress={() => router.push("/(tabs)/explore")}
            >
              <Ionicons
                name="time-outline"
                size={24}
                color={isDark ? "#fff" : "#000"}
              />
              <ThemedText>View History</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Info Box */}
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: isDark
                ? "rgba(74, 144, 226, 0.1)"
                : "rgba(74, 144, 226, 0.1)",
            },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#4A90E2"
          />
          <ThemedText style={styles.infoText}>
            This translation is saved in your history. You can review it anytime
            in the History tab.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: 40,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 300,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e0e0e0",
  },
  signTypeBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(74, 144, 226, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  resultCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultLabel: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  confidenceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  confidenceText: {
    fontSize: 14,
    opacity: 0.8,
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: "#4A90E2",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
  },
  infoBox: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    opacity: 0.8,
  },
});
