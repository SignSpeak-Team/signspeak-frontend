import {
  API_BASE_URL,
  API_CONFIG,
  API_ENDPOINTS,
  getApiUrl,
} from "../services/api-config";

describe("API Config", () => {
  describe("getApiUrl()", () => {
    it("should concatenate base URL with a given endpoint", () => {
      const url = getApiUrl("/api/v1/health");
      expect(url).toBe(`${API_BASE_URL}/api/v1/health`);
    });

    it("should build the correct predict/static URL", () => {
      const url = getApiUrl(API_ENDPOINTS.PREDICT_STATIC);
      expect(url).toBe(
        "https://signspeak-production-1f68.up.railway.app/api/v1/predict/static",
      );
    });

    it("should build the correct health URL", () => {
      const url = getApiUrl(API_ENDPOINTS.HEALTH);
      expect(url).toBe(
        "https://signspeak-production-1f68.up.railway.app/api/v1/health",
      );
    });
  });

  describe("API_CONFIG", () => {
    it("should have a timeout of 30 seconds", () => {
      expect(API_CONFIG.timeout).toBe(30000);
    });

    it("should include application/json Content-Type header", () => {
      expect(API_CONFIG.headers["Content-Type"]).toBe("application/json");
    });

    it("should include application/json Accept header", () => {
      expect(API_CONFIG.headers["Accept"]).toBe("application/json");
    });
  });

  describe("API_ENDPOINTS", () => {
    it("should define a PREDICT_STATIC endpoint", () => {
      expect(API_ENDPOINTS.PREDICT_STATIC).toBeDefined();
      expect(typeof API_ENDPOINTS.PREDICT_STATIC).toBe("string");
    });

    it("should define a HEALTH endpoint", () => {
      expect(API_ENDPOINTS.HEALTH).toBeDefined();
      expect(typeof API_ENDPOINTS.HEALTH).toBe("string");
    });
  });
});
