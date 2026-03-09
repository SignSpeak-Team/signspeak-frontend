import { StorageService } from "../services/storage-service";
import { SignType, Translation } from "../types/types";

// jest-expo includes an AsyncStorage mock automatically via jest-expo preset
// but we reset state between tests

const makeTranslation = (id: string): Translation => ({
  id,
  imageUri: `file://image_${id}.jpg`,
  text: "A",
  signType: SignType.LETTER,
  confidence: 0.95,
  timestamp: Date.now(),
});

beforeEach(async () => {
  await StorageService.clearHistory();
});

describe("StorageService – Translation History", () => {
  it("should return an empty array when there is no history", async () => {
    const history = await StorageService.getHistory();
    expect(history).toEqual([]);
  });

  it("should save a translation and retrieve it", async () => {
    const translation = makeTranslation("t1");
    await StorageService.saveTranslation(translation);

    const history = await StorageService.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe("t1");
  });

  it("should prepend new translations so the latest is first", async () => {
    await StorageService.saveTranslation(makeTranslation("first"));
    await StorageService.saveTranslation(makeTranslation("second"));

    const history = await StorageService.getHistory();
    expect(history[0].id).toBe("second");
    expect(history[1].id).toBe("first");
  });

  it("should delete a translation by id", async () => {
    await StorageService.saveTranslation(makeTranslation("keep"));
    await StorageService.saveTranslation(makeTranslation("remove"));

    await StorageService.deleteTranslation("remove");

    const history = await StorageService.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe("keep");
  });

  it("should clear all history", async () => {
    await StorageService.saveTranslation(makeTranslation("a"));
    await StorageService.saveTranslation(makeTranslation("b"));

    await StorageService.clearHistory();

    const history = await StorageService.getHistory();
    expect(history).toHaveLength(0);
  });
});

describe("StorageService – App Settings", () => {
  it("should return null when no settings have been saved", async () => {
    const settings = await StorageService.getSettings();
    expect(settings).toBeNull();
  });

  it("should save and retrieve app settings", async () => {
    const newSettings = {
      apiEndpoint: "https://example.com",
      language: "es",
      cameraSettings: {
        flashEnabled: false,
        cameraType: "back" as const,
        resolution: "medium" as const,
      },
    };

    await StorageService.saveSettings(newSettings);
    const saved = await StorageService.getSettings();

    expect(saved).not.toBeNull();
    expect(saved?.language).toBe("es");
    expect(saved?.cameraSettings.resolution).toBe("medium");
  });
});
