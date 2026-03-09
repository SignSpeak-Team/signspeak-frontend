/**
 * tests/integration/translation-service.integration.test.ts
 *
 * Pruebas de integración: TranslationService (frontend) ↔ Backend API
 *
 * Qué se prueba:
 *  - checkHealth()        → GET /api/v1/health
 *  - predictStatic()     → POST /api/v1/predict/static
 *  - translateSign()     → flujo completo (landmarks → backend → APIResponse)
 *  - Manejo de errores   → 503, 500, red caída
 */

import "whatwg-fetch"; // polyfill fetch para Jest/Node
import { TranslationService } from "../../services/translation-service";
import { LandmarkService } from "../../services/landmark-service";
import {
  handlerHealthDown,
  handlerInternalServerError,
  handlerNetworkError,
  handlerServiceUnavailable,
  VALID_LANDMARKS,
} from "./mocks/handlers";
import { server } from "./mocks/server";
import type { HandLandmarks } from "../../types/types";

// ── Ciclo de vida del servidor MSW ────────────────────────────────────────────

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Mock de LandmarkService.extractLandmarks ──────────────────────────────────
// En integración no procesamos imágenes reales: mockeamos sólo la capa
// de MediaPipe y testeamos todo lo demás de forma real.

jest.mock("../../services/landmark-service", () => ({
  LandmarkService: {
    extractLandmarks: jest.fn(),
    validateLandmarks: jest.requireActual("../../services/landmark-service")
      .LandmarkService.validateLandmarks,
  },
}));

const mockExtractLandmarks = LandmarkService.extractLandmarks as jest.Mock;

// ── Tests: checkHealth() ──────────────────────────────────────────────────────

describe("TranslationService.checkHealth() ↔ GET /api/v1/health", () => {
  it("devuelve true cuando el backend responde 200", async () => {
    const result = await TranslationService.checkHealth();
    expect(result).toBe(true);
  });

  it("devuelve false cuando el backend responde 503", async () => {
    server.use(handlerHealthDown);
    const result = await TranslationService.checkHealth();
    expect(result).toBe(false);
  });

  it("devuelve false cuando hay un error de red (fetch rechaza)", async () => {
    const { http, HttpResponse } = await import("msw");
    const { getApiUrl, API_ENDPOINTS } =
      await import("../../services/api-config");
    server.use(
      http.get(getApiUrl(API_ENDPOINTS.HEALTH), () => HttpResponse.error()),
    );
    const result = await TranslationService.checkHealth();
    expect(result).toBe(false);
  });
});

// ── Tests: predictStatic() ────────────────────────────────────────────────────

describe("TranslationService.predictStatic() ↔ POST /api/v1/predict/static", () => {
  it("devuelve la predicción cuando los landmarks son válidos (21 puntos)", async () => {
    const landmarks = VALID_LANDMARKS as HandLandmarks;
    const result = await TranslationService.predictStatic(landmarks);

    expect(result).not.toBeNull();
    expect(result!.letter).toBe("A");
    expect(result!.confidence).toBe(92.5);
    expect(result!.type).toBe("static");
  });

  it("lanza error cuando el backend devuelve 422 (landmarks inválidos)", async () => {
    // Enviamos sólo 5 landmarks — el handler devuelve 422
    const badLandmarks = Array.from({ length: 5 }, () => [
      0, 0, 0,
    ]) as HandLandmarks;

    await expect(
      TranslationService.predictStatic(badLandmarks),
    ).rejects.toThrow(/422/);
  });

  it("lanza error cuando el backend devuelve 503", async () => {
    server.use(handlerServiceUnavailable);
    const landmarks = VALID_LANDMARKS as HandLandmarks;

    await expect(TranslationService.predictStatic(landmarks)).rejects.toThrow(
      /503/,
    );
  });

  it("lanza error cuando el backend devuelve 500", async () => {
    server.use(handlerInternalServerError);
    const landmarks = VALID_LANDMARKS as HandLandmarks;

    await expect(TranslationService.predictStatic(landmarks)).rejects.toThrow(
      /500/,
    );
  });

  it("lanza error cuando hay un fallo de red (fetch rechaza)", async () => {
    server.use(handlerNetworkError);
    const landmarks = VALID_LANDMARKS as HandLandmarks;

    await expect(TranslationService.predictStatic(landmarks)).rejects.toThrow();
  });
});

// ── Tests: translateSign() — flujo completo ───────────────────────────────────

describe("TranslationService.translateSign() — flujo completo front↔back", () => {
  it("flujo exitoso: extrae landmarks → llama al backend → devuelve APIResponse", async () => {
    mockExtractLandmarks.mockResolvedValueOnce(VALID_LANDMARKS);

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
    server.use(handlerServiceUnavailable);

    const result = await TranslationService.translateSign("file://test.jpg");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/503|no está disponible|unavailable/i);
  });

  it("devuelve error descriptivo si el backend falla con 500", async () => {
    mockExtractLandmarks.mockResolvedValueOnce(VALID_LANDMARKS);
    server.use(handlerInternalServerError);

    const result = await TranslationService.translateSign("file://test.jpg");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/500|error interno/i);
  });

  it("devuelve error de red si fetch falla completamente", async () => {
    mockExtractLandmarks.mockResolvedValueOnce(VALID_LANDMARKS);
    server.use(handlerNetworkError);

    const result = await TranslationService.translateSign("file://test.jpg");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/conexión|network|timeout/i);
  });
});
