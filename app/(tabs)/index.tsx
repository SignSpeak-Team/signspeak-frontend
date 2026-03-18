import CameraViewComponent, {
  type CameraViewHandle,
} from "@/components/camera-view";
import ProcessingOverlay from "@/components/processing-overlay";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import CaptureButton from "@/components/ui/capture-button";
import { StorageService } from "@/services/storage-service";
import { TranslationService } from "@/services/translation-service";
import { type Translation } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

export default function CameraScreen() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameraType, setCameraType] = useState<"front" | "back">("back");
  const cameraRef = useRef<CameraViewHandle>(null);

  const handleCapture = async (imageUri: string) => {
    setIsProcessing(true);

    try {
      // Call translation service
      const result = await TranslationService.translateSign(imageUri);

      if (result.success && result.data) {
        // Create translation object
        const translation: Translation = {
          id: Date.now().toString(),
          imageUri,
          text: result.data.text,
          signType: result.data.signType,
          confidence: result.data.confidence,
          timestamp: Date.now(),
        };

        // Save to history
        await StorageService.saveTranslation(translation);

        // Navigate to results screen
        router.push({
          pathname: "/translation-result",
          params: {
            translationId: translation.id,
            imageUri: translation.imageUri,
            text: translation.text,
            signType: translation.signType,
            confidence: translation.confidence.toString(),
          },
        });
      } else {
        Alert.alert(
          "Translation Failed",
          result.error || "Unable to translate sign. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error processing translation:", error);
      Alert.alert(
        "Error",
        "An error occurred while processing the image. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  const toggleCamera = () => {
    setCameraType(cameraType === "back" ? "front" : "back");
  };

  const handleCapturePress = () => {
    if (cameraRef.current) {
      cameraRef.current.capture();
    }
  };

  return (
    <ThemedView style={styles.container}>
      {isProcessing && (
        <ProcessingOverlay message="Detecting hand and translating..." />
      )}

      <CameraViewComponent
        ref={cameraRef}
        onCapture={handleCapture}
        cameraType={cameraType}
        flashEnabled={flashEnabled}
      />

      {/* Controls overlay */}
      <View style={styles.controlsContainer}>
        {/* Top controls */}
        <View style={styles.topControls}>
          <Pressable style={styles.iconButton} onPress={toggleFlash}>
            <Ionicons
              name={flashEnabled ? "flash" : "flash-off"}
              size={28}
              color="#fff"
            />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={toggleCamera}>
            <Ionicons name="camera-reverse" size={28} color="#fff" />
          </Pressable>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          <View style={styles.captureButtonContainer}>
            <CaptureButton
              onPress={handleCapturePress}
              isProcessing={isProcessing}
            />
          </View>
          <ThemedText style={styles.instructions}>
            Position your hand in the frame and tap to capture
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 60,
  },
  bottomControls: {
    alignItems: "center",
    paddingBottom: 40,
    gap: 16,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureButtonContainer: {
    alignItems: "center",
  },
  instructions: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
