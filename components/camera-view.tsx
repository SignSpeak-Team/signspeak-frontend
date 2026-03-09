import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

interface CameraViewComponentProps {
  onCapture: (uri: string) => void;
  cameraType?: CameraType;
  flashEnabled?: boolean;
}

export interface CameraViewHandle {
  capture: () => Promise<void>;
}

const CameraViewComponent = forwardRef<
  CameraViewHandle,
  CameraViewComponentProps
>(({ onCapture, cameraType = "back", flashEnabled = false }, ref) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  useImperativeHandle(ref, () => ({
    capture: async () => {
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.8,
            shutterSound: false,
          });
          if (photo) {
            onCapture(photo.uri);
          }
        } catch (error) {
          console.error("Error taking picture:", error);
          Alert.alert("Error", "Failed to capture image. Please try again.");
        }
      }
    },
  }));

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading camera...</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.permissionContainer}>
          <ThemedText type="title" style={styles.permissionTitle}>
            📷 Camera Access
          </ThemedText>
          <ThemedText style={styles.permissionMessage}>
            SignSpeak needs access to your camera to capture and translate sign
            language.
          </ThemedText>
          <Pressable
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        flash={flashEnabled ? "on" : "off"}
      >
        {/* Overlay guide */}
        <View style={styles.overlay}>
          <View style={styles.guideContainer}>
            <View style={styles.guideBox} />
            <ThemedText style={styles.guideText}>
              Position your hand within the frame
            </ThemedText>
          </View>
        </View>
      </CameraView>
    </View>
  );
});

CameraViewComponent.displayName = "CameraViewComponent";

export default CameraViewComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionContainer: {
    alignItems: "center",
    maxWidth: 300,
  },
  permissionTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  permissionMessage: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.8,
  },
  permissionButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  cameraContainer: {
    flex: 1,
    width: "100%",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  guideContainer: {
    alignItems: "center",
  },
  guideBox: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: "rgba(74, 144, 226, 0.8)",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  guideText: {
    marginTop: 20,
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
