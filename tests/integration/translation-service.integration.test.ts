/**
 * tests/integration/translation-service.integration.test.ts
 *
 * Pruebas de integración: TranslationService (frontend) ↔ Backend API
 *
 * Qué se prueba:
 *  - checkHealth()    → GET /api/v1/health
 *  - predictStatic()  → POST /api/v1/predict/static
 *  - translateSign()  → flujo completo (landmarks → backend → APIResponse)
 *  - Manejo de errores → 503, 500, red caída
 *
 * Usa jest.spyOn(global, 'fetch') en lugar de MSW para compatibilidad
 * con jest-expo (CJS / sin soporte ESM nativo).
 */

import { TranslationService } from "../../services/translation-service";
import { LandmarkService } from "../../services/landmark-service";
import type { HandLandmarks, LetterPredictionResponse } from "../../types/types";
import { API_ENDPOINTS, getApiUrl } from "../../services/api-config";

// ── Landmarks válidos (21 puntos [x, y, z]) ─────────────────────────────────

const VALID_LANDMARKS: HandLandmarks = Array.from({ length: 21 }, (_, i) => [
  i * 0.05,
  i * 0.05,
  0,
]);

// ── Mock de LandmarkService (capa MediaPipe — no disponible en Jest) ─────────

jest.mock("../../services/landmark-service", () => ({
  LandmarkService: {
    extractLandmarks: jest.fn(),
    validateLandmarks: jest.requireActual("../../services/landmark-service")
      .LandmarkService.validateLandmarks,
  },
}));

const mockExtractLandmarks = LandmarkService.extractLandmarks as jest.Mock;

// ── Helper: crear un Response mock ──────────────────────────────────────────

function mockResponse(
  body: unknown,
  status = 200
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

// ── Ciclo de vida del spy ────────────────────────────────────────────────────

let fetchSpy: jest.SpyInstance;

beforeEach(() => {
  fetchSpy = jest.spyOn(global, "fetch");
});

afterEach(() => {
  fetchSpy.mockRestore();
  jest.clearAllMocks();
});

// ── Tests: checkHealth() ─────────────────────────────────────────────────────

describe("TranslationService.checkHealth() ↔ GET /api/v1/health", () => {
  it("devuelve true cuando el backend responde 200", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse({ status: "ok" }, 200));

    const result = await TranslationService.checkHealth();
    expect(result).toBe(true);
    expect(fetchSpy).toHaveBeenCalledWith(
      getApiUrl(API_ENDPOINTS.HEALTH),
      expect.objectContaining({ method: "GET" })
    );
  });

  it("devuelve false cuando el backend responde 503", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse({ status: "error" }, 503));

    const result = await TranslationService.checkHealth();
    expect(result).toBe(false);
  });

  it("devuelve false cuando hay un error de red (fetch rechaza)", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("Network request failed"));

    const result = await TranslationService.checkHealth();
    expect(result).toBe(false);
  });
});

// ── Tests: predictStatic() ───────────────────────────────────────────────────

describe("TranslationService.predictStatic() ↔ POST /api/v1/predict/static", () => {
  const successPayload: LetterPredictionResponse = {
    letter: "A",
    confidence: 92.5,
    type: "static",
  };

  it("devuelve la predicción cuando los landmarks son válidos (21 puntos)", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(successPayload, 200));

    const result = await TranslationService.predictStatic(VALID_LANDMARKS);

    expect(result).not.toBeNull();
    expect(result!.letter).toBe("A");
    expect(result!.confidence).toBe(92.5);
    expect(result!.type).toBe("static");
  });

  it("verifica que el body enviado contiene los landmarks", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(successPayload, 200));

    await TranslationService.predictStatic(VALID_LANDMARKS);

    const [, fetchOptions] = fetchSpy.mock.calls[0];
    const body = JSON.parse(fetchOptions.body as string);
    expect(body.landmarks).toHaveLength(21);
    expect(body.landmarks[0]).toHaveLength(3); // [x, y, z]
  });

  it("lanza error cuando el backend devuelve 503", async () => {
    fetchSpy.mockResolvedValueOnce(
      mockResponse("Service Unavailable", 503)
    );

    await expect(
      TranslationService.predictStatic(VALID_LANDMARKS)
    ).rejects.toThrow(/503/);
  });

  it("lanza error cuando el backend devuelve 500", async () => {
    fetchSpy.mockResolvedValueOnce(
      mockResponse("Internal Server Error", 500)
    );

    await expect(
      TranslationService.predictStatic(VALID_LANDMARKS)
    ).rejects.toThrow(/500/);
  });

  it("lanza error cuando hay un fallo de red (fetch rechaza)", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("Network request failed"));

    await expect(
      TranslationService.predictStatic(VALID_LANDMARKS)
    ).rejects.toThrow();
  });
});

// ── Tests: translateSign() — flujo completo ──────────────────────────────────

describe("TranslationService.translateSign() — flujo completo front↔back", () => {
  const backendResponse: LetterPredictionResponse = {
    letter: "A",
    confidence: 92.5,
    type: "static",
  };

  it("flujo exitoso: extrae landmarks → llama al backend → devuelve APIResponse", async () => {
    mockExtractLandmarks.mockResolvedValueOnce(VALID_LANDMARKS);
    fetchSpy.mockResolvedValueOnce(mockResponse(backendResponse, 200));

    const result = await TranslationService.translateSign("file://test.jpg");

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.text).toBe("A");
    // confidence viene en 0-100 del backend, el servicio la normaliza a 0-1
    expect(result.data!.confidence).toBeCloseTo(0.925, 3);
  });

  it("devuelve error si LandmarkService no detecta mano", async () => {
    mockExtractLandmarks.mockResolvedValueOnce(null);

    const result = await TranslationService.translateSign("file://no-hand.jpg");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/no hand detected/i);
  });

  it("devuelve error descriptivo si el backend está caído (503)", async () => {
    mockExtractLandmarks.mockResolvedValueOnce(VALID_LANDMARKS);
    fetchSpy.mockResolvedValueOnce(mockResponse("Service Unavailable", 503));

    const result = await TranslationService.translateSign("file://test.jpg");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/503|no está disponible|unavailable/i);
  });

  it("devuelve error descriptivo si el backend falla con 500", async () => {
    mockExtractLandmarks.mockResolvedValueOnce(VALID_LANDMARKS);
    fetchSpy.mockResolvedValueOnce(
      mockResponse("Internal Server Error", 500)
    );

    const result = await TranslationService.translateSign("file://test.jpg");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/500|error interno/i);
  });

  it("devuelve error de red si fetch falla completamente", async () => {
    mockExtractLandmarks.mockResolvedValueOnce(VALID_LANDMARKS);
    fetchSpy.mockRejectedValueOnce(new Error("Network request failed"));

    const result = await TranslationService.translateSign("file://test.jpg");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/conexión|network|timeout/i);
  });
});
