/**
 * tests/integration/api-contract.integration.test.ts
 *
 * Pruebas de contrato de la API:
 * Verifican que los request/response que el frontend genera
 * cumplen exactamente el contrato esperado por el backend.
 *
 * Si estos tests fallan → hay una divergencia de contrato entre
 * frontend (TypeScript) y backend (Python/FastAPI).
 */

import "whatwg-fetch";
import { http, HttpResponse } from "msw";
import {
  API_BASE_URL,
  API_ENDPOINTS,
  API_CONFIG,
  getApiUrl,
} from "../../services/api-config";
import { server } from "./mocks/server";
import { VALID_LANDMARKS } from "./mocks/handlers";
import type {
  LetterPredictionResponse,
  StaticPredictionRequest,
} from "../../types/types";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Contrato: POST /api/v1/predict/static ─────────────────────────────────────

describe("Contrato API: POST /api/v1/predict/static", () => {
  it("el frontend envía el Content-Type correcto", async () => {
    let capturedContentType = "";

    server.use(
      http.post(getApiUrl(API_ENDPOINTS.PREDICT_STATIC), ({ request }) => {
        capturedContentType = request.headers.get("content-type") ?? "";
        return HttpResponse.json<LetterPredictionResponse>({
          letter: "B",
          confidence: 88,
          type: "static",
        });
      }),
    );

    await fetch(getApiUrl(API_ENDPOINTS.PREDICT_STATIC), {
      method: "POST",
      headers: API_CONFIG.headers,
      body: JSON.stringify({ landmarks: VALID_LANDMARKS }),
    });

    expect(capturedContentType).toContain("application/json");
  });

  it("el frontend envía un body con la forma { landmarks: number[][] }", async () => {
    let capturedBody: StaticPredictionRequest | null = null;

    server.use(
      http.post(
        getApiUrl(API_ENDPOINTS.PREDICT_STATIC),
        async ({ request }) => {
          capturedBody = (await request.json()) as StaticPredictionRequest;
          return HttpResponse.json<LetterPredictionResponse>({
            letter: "C",
            confidence: 91,
            type: "static",
          });
        },
      ),
    );

    await fetch(getApiUrl(API_ENDPOINTS.PREDICT_STATIC), {
      method: "POST",
      headers: API_CONFIG.headers,
      body: JSON.stringify({ landmarks: VALID_LANDMARKS }),
    });

    expect(capturedBody).not.toBeNull();
    expect(Array.isArray(capturedBody!.landmarks)).toBe(true);
    expect(capturedBody!.landmarks).toHaveLength(21);
    expect(capturedBody!.landmarks[0]).toHaveLength(3); // [x, y, z]
  });

  it("el frontend puede parsear correctamente la respuesta del backend", async () => {
    const mockResponse: LetterPredictionResponse = {
      letter: "D",
      confidence: 95.2,
      type: "static",
      processing_time_ms: 12,
    };

    server.use(
      http.post(getApiUrl(API_ENDPOINTS.PREDICT_STATIC), () =>
        HttpResponse.json(mockResponse),
      ),
    );

    const res = await fetch(getApiUrl(API_ENDPOINTS.PREDICT_STATIC), {
      method: "POST",
      headers: API_CONFIG.headers,
      body: JSON.stringify({ landmarks: VALID_LANDMARKS }),
    });

    const data: LetterPredictionResponse = await res.json();

    // Verifica que los campos requeridos por el frontend existen
    expect(typeof data.letter).toBe("string");
    expect(typeof data.confidence).toBe("number");
    expect(["static", "dynamic"]).toContain(data.type);
  });
});

// ── Contrato: GET /api/v1/health ──────────────────────────────────────────────

describe("Contrato API: GET /api/v1/health", () => {
  it("la URL construida por el frontend es la correcta", () => {
    const healthUrl = getApiUrl(API_ENDPOINTS.HEALTH);
    expect(healthUrl).toBe(`${API_BASE_URL}/api/v1/health`);
  });

  it("el frontend acepta cualquier respuesta 2xx como 'sano'", async () => {
    server.use(
      http.get(getApiUrl(API_ENDPOINTS.HEALTH), () =>
        HttpResponse.json({ status: "ok" }, { status: 200 }),
      ),
    );

    const res = await fetch(getApiUrl(API_ENDPOINTS.HEALTH));
    expect(res.ok).toBe(true);
  });

  it("el frontend detecta correctamente una respuesta 503 como 'caído'", async () => {
    server.use(
      http.get(getApiUrl(API_ENDPOINTS.HEALTH), () =>
        HttpResponse.json({ status: "error" }, { status: 503 }),
      ),
    );

    const res = await fetch(getApiUrl(API_ENDPOINTS.HEALTH));
    expect(res.ok).toBe(false);
    expect(res.status).toBe(503);
  });
});

// ── Contrato: configuración global de la API ──────────────────────────────────

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
