// Landmark extraction service using MediaPipe Hand Landmarker
import { HandLandmarks } from "@/types/types";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

/**
 * Service for extracting hand landmarks from images using MediaPipe
 */
export const LandmarkService = {
  handLandmarker: null as HandLandmarker | null,
  isInitialized: false,

  /**
   * Initialize MediaPipe Hand Landmarker
   * Must be called once before using extractLandmarks
   */
  async initialize(): Promise<void> {
    if (this.isInitialized && this.handLandmarker) {
      console.log("✅ HandLandmarker already initialized");
      return;
    }

    try {
      console.log("🔧 Initializing MediaPipe HandLandmarker...");

      // Load MediaPipe vision task files
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
      );

      // Create Hand Landmarker
      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU", // Use GPU acceleration
        },
        runningMode: "IMAGE", // Process single images
        numHands: 1, // Detect only one hand
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.isInitialized = true;
      console.log("✅ HandLandmarker initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize HandLandmarker:", error);
      throw new Error("Failed to initialize hand detection. Please try again.");
    }
  },

  /**
   * Extract hand landmarks from an image
   * @param imageUri - URI of the captured image
   * @returns Promise with array of 21 landmarks [x, y, z] or null if no hand detected
   */
  async extractLandmarks(imageUri: string): Promise<HandLandmarks | null> {
    try {
      console.log("📍 Extracting landmarks from image:", imageUri);

      // Initialize if not already done
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.handLandmarker) {
        throw new Error("HandLandmarker not initialized");
      }

      // Convert image URI to HTMLImageElement or ImageData
      // Note: In React Native, we need to handle this differently
      // We'll create an Image element from the URI
      const image = await this.loadImage(imageUri);

      // Detect landmarks
      console.log("🔍 Detecting hand in image...");
      const result = this.handLandmarker.detect(image);

      // Check if any hands were detected
      if (!result.landmarks || result.landmarks.length === 0) {
        console.warn("⚠️ No hand detected in image");
        return null;
      }

      // Get first hand's landmarks (we only detect 1 hand)
      const handLandmarks = result.landmarks[0];

      // Convert to our format: [[x, y, z], [x, y, z], ...]
      const landmarks: HandLandmarks = handLandmarks.map((landmark) => [
        landmark.x,
        landmark.y,
        landmark.z || 0, // z might be undefined
      ]);

      console.log("✅ Extracted", landmarks.length, "landmarks");
      console.log("📊 First landmark (wrist):", landmarks[0]);

      return landmarks;
    } catch (error) {
      console.error("❌ Error extracting landmarks:", error);
      throw new Error("Failed to extract hand landmarks from image");
    }
  },

  /**
   * Load image from URI
   * @param imageUri - URI of the image
   * @returns Promise with HTMLImageElement
   */
  async loadImage(imageUri: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";

      image.onload = () => {
        console.log("✅ Image loaded:", image.width, "x", image.height);
        resolve(image);
      };

      image.onerror = (error) => {
        console.error("❌ Failed to load image:", error);
        reject(new Error("Failed to load image"));
      };

      // Convert file:// URI to data URL if needed
      if (imageUri.startsWith("file://")) {
        // In React Native, we may need to fetch the image as a blob first
        fetch(imageUri)
          .then((response) => response.blob())
          .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              image.src = reader.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
          .catch(reject);
      } else {
        image.src = imageUri;
      }
    });
  },

  /**
   * Validate that landmarks are in correct format
   * @param landmarks - Landmarks to validate
   * @returns true if valid, false otherwise
   */
  validateLandmarks(landmarks: HandLandmarks): boolean {
    if (!Array.isArray(landmarks)) return false;
    if (landmarks.length !== 21) {
      console.warn(`⚠️ Expected 21 landmarks, got ${landmarks.length}`);
      return false;
    }

    // Check each landmark has [x, y, z] format
    const isValid = landmarks.every(
      (landmark) =>
        Array.isArray(landmark) &&
        landmark.length === 3 &&
        landmark.every((coord) => typeof coord === "number"),
    );

    if (!isValid) {
      console.warn("⚠️ Landmarks have invalid format");
    }

    return isValid;
  },

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
      this.isInitialized = false;
      console.log("🧹 HandLandmarker disposed");
    }
  },
};
