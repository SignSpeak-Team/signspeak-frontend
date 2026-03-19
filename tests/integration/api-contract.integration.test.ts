/**
 * tests/integration/api-contract.integration.test.ts
 *
 * Pruebas de contrato de la API:
 * Verifican que los request/response que el frontend genera
 * cumplen exactamente el contrato esperado por el backend.
 *
 * Si estos tests fallan → hay una divergencia entre
 * frontend (TypeScript) y backend (Python/FastAPI).
 *
 * Usa jest.spyOn(global, 'fetch') para interceptar peticiones.
 */

import {
  API_BASE_URL,
  API_CONFIG,
  API_ENDPOINTS,
  getApiUrl,
} from "../../services/api-config";
import { TranslationService } from "../../services/translation-service";
import type {
  LetterPredictionResponse,
  StaticPredictionRequest,
  HandLandmarks,
} from "../../types/types";

// ── Landmarks válidos (21 puntos [x, y, z]) ─────────────────────────────────

const VALID_LANDMARKS: HandLandmarks = Array.from({ length: 21 }, (_, i) => [
  i * 0.05,
  i * 0.05,
  0,
]);

// ── Helper: crear un Response mock ──────────────────────────────────────────

function mockResponse(body: unknown, status = 200): Response {
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
});

// ── Contrato: POST /api/v1/predict/static ────────────────────────────────────

describe("Contrato API: POST /api/v1/predict/static", () => {
  const successResponse: LetterPredictionResponse = {
    letter: "B",
    confidence: 88,
    type: "static",
  };

  it("el frontend envía el Content-Type correcto (application/json)", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(successResponse));

    await TranslationService.predictStatic(VALID_LANDMARKS);

    const [, opts] = fetchSpy.mock.calls[0];
    expect((opts as RequestInit).headers).toMatchObject({
      "Content-Type": "application/json",
    });
  });

  it("el frontend envía un body con la forma { landmarks: number[][] }", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(successResponse));

    await TranslationService.predictStatic(VALID_LANDMARKS);

    const [, opts] = fetchSpy.mock.calls[0];
    const body: StaticPredictionRequest = JSON.parse(
      (opts as RequestInit).body as string
    );

    expect(Array.isArray(body.landmarks)).toBe(true);
    expect(body.landmarks).toHaveLength(21);
    expect(body.landmarks[0]).toHaveLength(3); // [x, y, z]
  });

  it("el frontend puede parsear correctamente la respuesta del backend", async () => {
    const fullResponse: LetterPredictionResponse = {
      letter: "D",
      confidence: 95.2,
      type: "static",
      processing_time_ms: 12,
    };
    fetchSpy.mockResolvedValueOnce(mockResponse(fullResponse));

    const data = await TranslationService.predictStatic(VALID_LANDMARKS);

    expect(typeof data!.letter).toBe("string");
    expect(typeof data!.confidence).toBe("number");
    expect(["static", "dynamic"]).toContain(data!.type);
  });

  it("el método HTTP usado es POST", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(successResponse));

    await TranslationService.predictStatic(VALID_LANDMARKS);

    const [, opts] = fetchSpy.mock.calls[0];
    expect((opts as RequestInit).method).toBe("POST");
  });

  it("la URL usada apunta al endpoint correcto", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse(successResponse));

    await TranslationService.predictStatic(VALID_LANDMARKS);

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toBe(getApiUrl(API_ENDPOINTS.PREDICT_STATIC));
  });
});

// ── Contrato: GET /api/v1/health ─────────────────────────────────────────────

describe("Contrato API: GET /api/v1/health", () => {
  it("la URL construida por el frontend es la correcta", () => {
    const healthUrl = getApiUrl(API_ENDPOINTS.HEALTH);
    expect(healthUrl).toBe(`${API_BASE_URL}/api/v1/health`);
  });

  it("el frontend acepta cualquier respuesta 2xx como 'sano'", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse({ status: "ok" }, 200));

    const result = await TranslationService.checkHealth();
    expect(result).toBe(true);
  });

  it("el frontend detecta correctamente una respuesta 503 como 'caído'", async () => {
    fetchSpy.mockResolvedValueOnce(mockResponse({ status: "error" }, 503));

    const result = await TranslationService.checkHealth();
    expect(result).toBe(false);
  });
});

// ── Contrato: configuración global de la API ─────────────────────────────────

describe("Contrato API: configuración (API_CONFIG)", () => {
  it("el timeout configurado es de 30 segundos (30000 ms)", () => {
    expect(API_CONFIG.timeout).toBe(30000);
  });

  it("los headers incluyen Content-Type: application/json", () => {
    expect(API_CONFIG.headers["Content-Type"]).toBe("application/json");
  });

  it("los headers incluyen Accept: application/json", () => {
    expect(API_CONFIG.headers["Accept"]).toBe("application/json");
  });

  it("la base URL no tiene trailing slash", () => {
    expect(API_BASE_URL.endsWith("/")).toBe(false);
  });

  it("todos los endpoints empiezan con /", () => {
    Object.values(API_ENDPOINTS).forEach((endpoint) => {
      expect(endpoint.startsWith("/")).toBe(true);
    });
  });
});
