import ErrorMessage from "@/components/error-message";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import TranslationCard from "@/components/translation-card";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StorageService } from "@/services/storage-service";
import { type Translation } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

export default function HistoryScreen() {
  const [history, setHistory] = useState<Translation[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<Translation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    // Filter history based on search query
    if (searchQuery.trim() === "") {
      setFilteredHistory(history);
    } else {
      const filtered = history.filter((item) =>
        item.text.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredHistory(filtered);
    }
  }, [searchQuery, history]);

  const loadHistory = async () => {
    try {
      const data = await StorageService.getHistory();
      setHistory(data);
      setFilteredHistory(data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Translation",
      "Are you sure you want to delete this translation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await StorageService.deleteTranslation(id);
              await loadHistory();
            } catch {
              Alert.alert("Error", "Failed to delete translation");
            }
          },
        },
      ],
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All History",
      "Are you sure you want to delete all translation history? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await StorageService.clearHistory();
              await loadHistory();
            } catch {
              Alert.alert("Error", "Failed to clear history");
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Loading history...</ThemedText>
      </ThemedView>
    );
  }

  if (history.length === 0) {
    return (
      <ErrorMessage
        title="No History Yet"
        message="Your translation history will appear here. Start by capturing a sign on the Camera tab!"
        type="general"
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header with search and clear */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Translation History
        </ThemedText>

        <View
          style={[
            styles.searchContainer,
            { backgroundColor: isDark ? "#1c1c1e" : "#f5f5f5" },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={isDark ? "#8e8e93" : "#8e8e93"}
          />
          <TextInput
            style={[styles.searchInput, { color: isDark ? "#fff" : "#000" }]}
            placeholder="Search translations..."
            placeholderTextColor={isDark ? "#8e8e93" : "#8e8e93"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={isDark ? "#8e8e93" : "#8e8e93"}
              />
            </Pressable>
          )}
        </View>

        {history.length > 0 && (
          <Pressable style={styles.clearButton} onPress={handleClearAll}>
            <Ionicons name="trash-outline" size={20} color="#F44336" />
            <ThemedText style={styles.clearButtonText}>Clear All</ThemedText>
          </Pressable>
        )}
      </View>

      {/* History list */}
      {filteredHistory.length === 0 ? (
        <View style={styles.centered}>
          <ThemedText>No results found for &quot;{searchQuery}&quot;</ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={({ item }) => (
            <View>
              <TranslationCard translation={item} />
              <Pressable
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#F44336" />
              </Pressable>
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    paddingTop: 60,
    gap: 12,
  },
  title: {
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  clearButtonText: {
    color: "#F44336",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 20,
  },
  deleteButton: {
    position: "absolute",
    top: 16,
    right: 24,
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    padding: 10,
    borderRadius: 20,
  },
});
