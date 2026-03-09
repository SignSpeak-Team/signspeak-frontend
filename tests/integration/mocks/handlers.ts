/**
 * tests/integration/mocks/handlers.ts
 *
 * Handlers de MSW que simulan las respuestas del backend de SignSpeak.
 * Cada handler replica exactamente el contrato de la API real.
 */

import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "../../../services/api-config";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Construye una URL completa del backend */
const url = (path: string) => `${API_BASE_URL}${path}`;

/** Landmarks de mano válidos (21 puntos [x, y, z]) */
export const VALID_LANDMARKS = Array.from({ length: 21 }, (_, i) => [
  i * 0.04,
  i * 0.04,
  0.0,
]);

// ── Handlers ──────────────────────────────────────────────────────────────────

export const handlers = [
  // ── GET /api/v1/health ────────────────────────────────────────────────────
  http.get(url("/api/v1/health"), () => {
    return HttpResponse.json(
      { status: "ok", service: "SignSpeak API Gateway" },
      { status: 200 },
    );
  }),

  // ── GET /api/v1/status ────────────────────────────────────────────────────
  http.get(url("/api/v1/status"), () => {
    return HttpResponse.json(
      {
        status: "ok",
        vision_service: "up",
        translation_service: "up",
      },
      { status: 200 },
    );
  }),

  // ── POST /api/v1/predict/static ───────────────────────────────────────────
  http.post(url("/api/v1/predict/static"), async ({ request }) => {
    const body = (await request.json()) as { landmarks?: unknown[] };

    // Simula validación del backend: landmarks requeridos
    if (!body?.landmarks || !Array.isArray(body.landmarks)) {
      return HttpResponse.json(
        { detail: "landmarks field is required" },
        { status: 422 },
      );
    }

    if (body.landmarks.length !== 21) {
      return HttpResponse.json(
        { detail: "Expected exactly 21 landmarks" },
        { status: 422 },
      );
    }

    return HttpResponse.json(
      {
        letter: "A",
        confidence: 92.5,
        type: "static",
        processing_time_ms: 18,
      },
      { status: 200 },
    );
  }),

  // ── POST /api/v1/predict/dynamic ─────────────────────────────────────────
  http.post(url("/api/v1/predict/dynamic"), async ({ request }) => {
    const body = (await request.json()) as { sequence?: unknown[] };

    if (!body?.sequence || body.sequence.length === 0) {
      return HttpResponse.json(
        { detail: "sequence field is required" },
        { status: 422 },
      );
    }

    return HttpResponse.json(
      {
        letter: "J",
        confidence: 85.0,
        type: "dynamic",
        processing_time_ms: 35,
      },
      { status: 200 },
    );
  }),

  // ── POST /api/v1/predict/words ────────────────────────────────────────────
  http.post(url("/api/v1/predict/words"), async ({ request }) => {
    const body = (await request.json()) as { sequence?: unknown[] };

    if (!body?.sequence) {
      return HttpResponse.json(
        { detail: "sequence field is required" },
        { status: 422 },
      );
    }

    return HttpResponse.json(
      {
        word: "HOLA",
        confidence: 78.3,
        phrase: "HOLA",
        accepted: true,
        processing_time_ms: 52,
      },
      { status: 200 },
    );
  }),
];

// ── Handlers especiales para escenarios de error ──────────────────────────────

/** Handler que devuelve 503 (backend caído) */
export const handlerServiceUnavailable = http.post(
  url("/api/v1/predict/static"),
  () => HttpResponse.json({ detail: "Service Unavailable" }, { status: 503 }),
);

/** Handler que devuelve 500 (error interno) */
export const handlerInternalServerError = http.post(
  url("/api/v1/predict/static"),
  () => HttpResponse.json({ detail: "Internal Server Error" }, { status: 500 }),
);

/** Handler que simula timeout/red caída */
export const handlerNetworkError = http.post(
  url("/api/v1/predict/static"),
  () => HttpResponse.error(),
);

/** Handler de health que devuelve 503 */
export const handlerHealthDown = http.get(url("/api/v1/health"), () =>
  HttpResponse.json({ status: "error" }, { status: 503 }),
);
