import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StorageService } from "@/services/storage-service";
import { AppSettings } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [apiEndpoint, setApiEndpoint] = useState(
    "https://api.signspeak.example.com/v1",
  );
  const [language, setLanguage] = useState("en");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameraType, setCameraType] = useState<"front" | "back">("back");
  const [resolution, setResolution] = useState<"low" | "medium" | "high">(
    "medium",
  );

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await StorageService.getSettings();
    if (settings) {
      setApiEndpoint(settings.apiEndpoint);
      setLanguage(settings.language);
      setFlashEnabled(settings.cameraSettings.flashEnabled);
      setCameraType(settings.cameraSettings.cameraType);
      setResolution(settings.cameraSettings.resolution);
    }
  };

  const saveSettings = async () => {
    const settings: AppSettings = {
      apiEndpoint,
      language,
      cameraSettings: {
        flashEnabled,
        cameraType,
        resolution,
      },
    };

    try {
      await StorageService.saveSettings(settings);
      Alert.alert("Success", "Settings saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save settings");
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all translation history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await StorageService.clearHistory();
              Alert.alert("Success", "History cleared successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to clear history");
            }
          },
        },
      ],
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title">Settings</ThemedText>
        </View>

        {/* API Configuration Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cloud-outline" size={24} color="#4A90E2" />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              API Configuration
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Backend API Endpoint</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#1c1c1e" : "#f5f5f5",
                  color: isDark ? "#fff" : "#000",
                },
              ]}
              value={apiEndpoint}
              onChangeText={setApiEndpoint}
              placeholder="https://api.example.com/v1"
              placeholderTextColor={isDark ? "#8e8e93" : "#8e8e93"}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <ThemedText style={styles.hint}>
              💡 Update this URL when your backend is ready
            </ThemedText>
          </View>
        </View>

        {/* Camera Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="camera-outline" size={24} color="#4A90E2" />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Camera Settings
            </ThemedText>
          </View>

          <View style={styles.settingRow}>
            <ThemedText>Flash by Default</ThemedText>
            <Switch value={flashEnabled} onValueChange={setFlashEnabled} />
          </View>

          <View style={styles.settingRow}>
            <ThemedText>Default Camera</ThemedText>
            <Pressable
              style={[
                styles.pill,
                { backgroundColor: isDark ? "#1c1c1e" : "#f5f5f5" },
              ]}
              onPress={() =>
                setCameraType(cameraType === "back" ? "front" : "back")
              }
            >
              <ThemedText>
                {cameraType === "back" ? "Back" : "Front"}
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Image Quality</ThemedText>
            <View style={styles.pillGroup}>
              {(["low", "medium", "high"] as const).map((res) => (
                <Pressable
                  key={res}
                  style={[
                    styles.pill,
                    {
                      backgroundColor:
                        resolution === res
                          ? "#4A90E2"
                          : isDark
                            ? "#1c1c1e"
                            : "#f5f5f5",
                    },
                  ]}
                  onPress={() => setResolution(res)}
                >
                  <ThemedText
                    style={{
                      color:
                        resolution === res ? "#fff" : isDark ? "#fff" : "#000",
                    }}
                  >
                    {res.charAt(0).toUpperCase() + res.slice(1)}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Language Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="language-outline" size={24} color="#4A90E2" />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Language
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Translation Language</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#1c1c1e" : "#f5f5f5",
                  color: isDark ? "#fff" : "#000",
                },
              ]}
              value={language}
              onChangeText={setLanguage}
              placeholder="en"
              placeholderTextColor={isDark ? "#8e8e93" : "#8e8e93"}
              maxLength={2}
            />
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Pressable style={styles.saveButton} onPress={saveSettings}>
            <ThemedText style={styles.saveButtonText}>
              💾 Save Settings
            </ThemedText>
          </Pressable>

          <Pressable style={styles.dangerButton} onPress={handleClearHistory}>
            <ThemedText style={styles.dangerButtonText}>
              🗑️ Clear History
            </ThemedText>
          </Pressable>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#4A90E2"
            />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              About
            </ThemedText>
          </View>
          <ThemedText style={styles.aboutText}>
            SignSpeak v1.0.0{"\n"}A sign language translation app{"\n\n"}
            Made with ❤️ using Expo
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
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    flex: 1,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    opacity: 0.6,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillGroup: {
    flexDirection: "row",
    gap: 8,
  },
  saveButton: {
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  dangerButton: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F44336",
  },
  dangerButtonText: {
    color: "#F44336",
    fontWeight: "600",
    fontSize: 16,
  },
  aboutText: {
    opacity: 0.7,
    lineHeight: 22,
  },
});
