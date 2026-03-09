import { useColorScheme } from "@/hooks/use-color-scheme";
import { Translation } from "@/types/types";
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

interface TranslationCardProps {
  translation: Translation;
  onPress?: () => void;
}

export default function TranslationCard({
  translation,
  onPress,
}: TranslationCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "#4CAF50";
    if (confidence >= 0.7) return "#FF9800";
    return "#F44336";
  };

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <ThemedView
        style={[
          styles.card,
          {
            backgroundColor: isDark ? "#1c1c1e" : "#fff",
            shadowColor: isDark ? "#000" : "#000",
          },
        ]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: translation.imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.signTypeBadge}>
            <ThemedText style={styles.signTypeText}>
              {translation.signType}
            </ThemedText>
          </View>
        </View>

        <View style={styles.content}>
          <ThemedText type="defaultSemiBold" style={styles.translationText}>
            {translation.text}
          </ThemedText>

          <View style={styles.footer}>
            <ThemedText style={styles.timestamp}>
              {formatDate(translation.timestamp)}
            </ThemedText>
            <View style={styles.confidenceContainer}>
              <View
                style={[
                  styles.confidenceDot,
                  {
                    backgroundColor: getConfidenceColor(translation.confidence),
                  },
                ]}
              />
              <ThemedText style={styles.confidence}>
                {Math.round(translation.confidence * 100)}% confident
              </ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e0e0e0",
  },
  signTypeBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(74, 144, 226, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  signTypeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  translationText: {
    fontSize: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confidence: {
    fontSize: 12,
    opacity: 0.8,
  },
});
