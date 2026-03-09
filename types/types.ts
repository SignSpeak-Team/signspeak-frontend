// Type definitions for SignSpeak app

export enum SignType {
  LETTER = "LETTER",
  WORD = "WORD",
  PHRASE = "PHRASE",
}

export interface Translation {
  id: string;
  imageUri: string;
  text: string;
  signType: SignType;
  confidence: number;
  timestamp: number;
}

// API Response types (legacy)
export interface APIResponse {
  success: boolean;
  data?: {
    text: string;
    signType: SignType;
    confidence: number;
  };
  error?: string;
}

export interface APIError {
  message: string;
  code?: string;
  details?: any;
}

// MediaPipe Landmark types
export type Landmark = [number, number, number]; // [x, y, z]
export type HandLandmarks = Landmark[]; // 21 landmarks

// Backend API Request types
export interface StaticPredictionRequest {
  landmarks: HandLandmarks;
}

export interface SequencePredictionRequest {
  sequence: HandLandmarks[]; // 15 frames
}

// Backend API Response types
export interface LetterPredictionResponse {
  letter: string;
  confidence: number; // 0-100
  type: "static" | "dynamic";
  processing_time_ms?: number;
}

export interface WordPredictionResponse {
  word: string;
  confidence: number; // 0-100
  phrase?: string;
  accepted?: boolean;
  processing_time_ms?: number;
}

// App Settings
export interface CameraSettings {
  flashEnabled: boolean;
  cameraType: "front" | "back";
  resolution: "low" | "medium" | "high";
}

export interface AppSettings {
  apiEndpoint: string;
  language: string;
  cameraSettings: CameraSettings;
}
