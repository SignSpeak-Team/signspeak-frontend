// Translation service with real backend API integration
import {
  APIResponse,
  HandLandmarks,
  LetterPredictionResponse,
  SignType,
  StaticPredictionRequest,
} from "@/types/types";
import { API_CONFIG, API_ENDPOINTS, getApiUrl } from "./api-config";
import { LandmarkService } from "./landmark-service";

export const TranslationService = {
  /**
   * Translates a sign from an image using hand landmarks
   * @param imageUri - URI of the captured image
   * @returns Promise with translation result
   */
  async translateSign(imageUri: string): Promise<APIResponse> {
    try {
      console.log("🔄 Starting translation process for:", imageUri);

      // Step 1: Extract hand landmarks from image
      console.log("📍 Step 1: Extracting hand landmarks...");
      const landmarks = await LandmarkService.extractLandmarks(imageUri);

      if (!landmarks) {
        return {
          success: false,
          error:
            "No hand detected in image. Please position your hand clearly in the frame.",
        };
      }

      // Validate landmarks
      if (!LandmarkService.validateLandmarks(landmarks)) {
        return {
          success: false,
          error: "Invalid landmarks detected. Please try again.",
        };
      }

      console.log("✅ Landmarks extracted successfully");

      // Step 2: Call backend API with landmarks
      console.log("📡 Step 2: Calling backend API...");
      const prediction = await this.predictStatic(landmarks);

      if (!prediction) {
        return {
          success: false,
          error: "Failed to get prediction from server.",
        };
      }

      console.log("✅ Prediction received:", prediction);

      // Step 3: Format response
      const confidence = prediction.confidence / 100; // Convert from 0-100 to 0-1

      return {
        success: true,
        data: {
          text: prediction.letter,
          signType: SignType.LETTER,
          confidence,
        },
      };
    } catch (error) {
      console.error("Translation error:", error);

      // Handle specific error types
      if (error instanceof Error) {
        // Check for specific HTTP errors
        if (error.message.includes("503")) {
          return {
            success: false,
            error:
              "El servicio de traducción no está disponible en este momento. Por favor, intenta de nuevo más tarde.",
          };
        }
        if (error.message.includes("500")) {
          return {
            success: false,
            error:
              "Error interno del servidor. Por favor, contacta al administrador.",
          };
        }
        if (
          error.message.includes("timeout") ||
          error.message.includes("Network")
        ) {
          return {
            success: false,
            error: "Sin conexión al servidor. Verifica tu conexión a internet.",
          };
        }
      }
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },

  /**
   * Predict a static letter from hand landmarks
   * @param landmarks - Array of 21 hand landmarks [x, y, z]
   * @returns Promise with letter prediction
   */
  async predictStatic(
    landmarks: HandLandmarks,
  ): Promise<LetterPredictionResponse | null> {
    try {
      const url = getApiUrl(API_ENDPOINTS.PREDICT_STATIC);
      console.log("🌐 POST", url);

      const requestBody: StaticPredictionRequest = {
        landmarks,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: API_CONFIG.headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", response.status, response.statusText);
        console.error("❌ Error details:", errorText);

        // Parse error message if JSON
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorJson.message || errorText;
        } catch {
          // Keep original error text if not JSON
        }

        throw new Error(`API returned ${response.status}: ${errorMessage}`);
      }

      const data: LetterPredictionResponse = await response.json();
      console.log("📬 API Response:", data);

      return data;
    } catch (error) {
      console.error("Error calling prediction API:", error);
      throw error;
    }
  },

  /**
   * Test API health
   * @returns Promise with health status
   */
  async checkHealth(): Promise<boolean> {
    try {
      const url = getApiUrl(API_ENDPOINTS.HEALTH);
      console.log("🏥 Checking API health:", url);

      const response = await fetch(url, {
        method: "GET",
      });

      const isHealthy = response.ok;
      console.log(isHealthy ? "✅ API is healthy" : "❌ API is down");

      return isHealthy;
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  },

  /**
   * Retries a failed translation
   * @param imageUri - URI of the image to retry
   */
  async retryTranslation(imageUri: string): Promise<APIResponse> {
    return this.translateSign(imageUri);
  },
};
