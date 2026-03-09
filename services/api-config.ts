// API Configuration for SignSpeak

// Production backend URL
export const API_BASE_URL = "https://signspeak-production-1f68.up.railway.app";

export const API_ENDPOINTS = {
  // Prediction endpoints
  PREDICT_STATIC: "/api/v1/predict/static",
  PREDICT_DYNAMIC: "/api/v1/predict/dynamic",
  PREDICT_WORDS: "/api/v1/predict/words",
  PREDICT_HOLISTIC: "/api/v1/predict/holistic",

  // Translation endpoint (legacy)
  TRANSLATE: "/api/v1/translate/",

  // Health check
  HEALTH: "/api/v1/health",
  STATUS: "/api/v1/status",
};

export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
