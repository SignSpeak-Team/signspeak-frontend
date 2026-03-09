// Local storage service for translation history
import { AppSettings, Translation } from "@/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_KEY = "@signspeak_history";
const SETTINGS_KEY = "@signspeak_settings";

export const StorageService = {
  // Translation History
  async saveTranslation(translation: Translation): Promise<void> {
    try {
      const history = await this.getHistory();
      const updatedHistory = [translation, ...history];
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Error saving translation:", error);
      throw error;
    }
  },

  async getHistory(): Promise<Translation[]> {
    try {
      const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error("Error getting history:", error);
      return [];
    }
  },

  async deleteTranslation(id: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const filteredHistory = history.filter((item) => item.id !== id);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error("Error deleting translation:", error);
      throw error;
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error("Error clearing history:", error);
      throw error;
    }
  },

  // App Settings
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
  },

  async getSettings(): Promise<AppSettings | null> {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
      return settingsJson ? JSON.parse(settingsJson) : null;
    } catch (error) {
      console.error("Error getting settings:", error);
      return null;
    }
  },
};
