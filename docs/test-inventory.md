# SignSpeak – Inventario de Pruebas

> **Comando unitarios:** `npm run test:unit` &nbsp;|&nbsp; **Comando integración:** `npm run test:int`

---

## 🔵 Pruebas Unitarias (22 tests)

### `tests/api-config.test.ts` — Módulo: `services/api-config.ts`

| # | Suite | Caso de prueba | Qué verifica |
|---|-------|----------------|--------------|
| 1 | `API Config › getApiUrl()` | should concatenate base URL with a given endpoint | Concatena correctamente `API_BASE_URL` + endpoint arbitrario |
| 2 | `API Config › getApiUrl()` | should build the correct predict/static URL | URL completa de `/api/v1/predict/static` es la esperada |
| 3 | `API Config › getApiUrl()` | should build the correct health URL | URL completa de `/api/v1/health` es la esperada |
| 4 | `API Config › API_CONFIG` | should have a timeout of 30 seconds | `API_CONFIG.timeout === 30000` ms |
| 5 | `API Config › API_CONFIG` | should include application/json Content-Type header | Header `Content-Type` es `application/json` |
| 6 | `API Config › API_CONFIG` | should include application/json Accept header | Header `Accept` es `application/json` |
| 7 | `API Config › API_ENDPOINTS` | should define a PREDICT_STATIC endpoint | `PREDICT_STATIC` existe y es string |
| 8 | `API Config › API_ENDPOINTS` | should define a HEALTH endpoint | `HEALTH` existe y es string |

---

### `tests/landmark-service.test.ts` — Módulo: `services/landmark-service.ts`

| # | Suite | Caso de prueba | Qué verifica |
|---|-------|----------------|--------------|
| 9 | `LandmarkService.validateLandmarks()` | should return true for a valid set of 21 landmarks | Retorna `true` con 21 landmarks bien formados |
| 10 | `LandmarkService.validateLandmarks()` | should return false when fewer than 21 landmarks are provided | Retorna `false` si hay menos de 21 puntos |
| 11 | `LandmarkService.validateLandmarks()` | should return false when more than 21 landmarks are provided | Retorna `false` si hay más de 21 puntos |
| 12 | `LandmarkService.validateLandmarks()` | should return false when a landmark has fewer than 3 coordinates | Retorna `false` si un punto tiene sólo `[x, y]` (falta z) |
| 13 | `LandmarkService.validateLandmarks()` | should return false when a landmark contains a non-numeric value | Retorna `false` si una coordenada no es número |
| 14 | `LandmarkService.validateLandmarks()` | should return false when the input is not an array | Retorna `false` para `null` y `string` |
| 15 | `LandmarkService.validateLandmarks()` | should accept landmarks with negative coordinate values | Retorna `true` con coordenadas negativas (válidas) |

---

### `tests/storage-service.test.ts` — Módulo: `services/storage-service.ts`

| # | Suite | Caso de prueba | Qué verifica |
|---|-------|----------------|--------------|
| 16 | `StorageService – Translation History` | should return an empty array when there is no history | `getHistory()` retorna `[]` en estado vacío |
| 17 | `StorageService – Translation History` | should save a translation and retrieve it | `saveTranslation()` persiste y `getHistory()` la devuelve |
| 18 | `StorageService – Translation History` | should prepend new translations so the latest is first | La más reciente es `history[0]` (orden LIFO) |
| 19 | `StorageService – Translation History` | should delete a translation by id | `deleteTranslation(id)` elimina sólo la entrada correcta |
| 20 | `StorageService – Translation History` | should clear all history | `clearHistory()` deja `history[]` vacío |
| 21 | `StorageService – App Settings` | should return null when no settings have been saved | `getSettings()` retorna `null` inicialmente |
| 22 | `StorageService – App Settings` | should save and retrieve app settings | `saveSettings()` persiste y `getSettings()` lo recupera |

---

## 🟠 Pruebas de Integración (26 tests)

### `tests/integration/translation-service.integration.test.ts`
> Prueba el flujo `TranslationService ↔ Backend API` mockeando `fetch` con `jest.spyOn`.  
> `LandmarkService.extractLandmarks` es mockeado (MediaPipe no disponible en Node).

| # | Suite | Caso de prueba | Qué verifica |
|---|-------|----------------|--------------|
| 1 | `checkHealth() ↔ GET /api/v1/health` | devuelve true cuando el backend responde 200 | Respuesta `ok: true` → `checkHealth() === true` |
| 2 | `checkHealth() ↔ GET /api/v1/health` | devuelve false cuando el backend responde 503 | Respuesta `ok: false` → `checkHealth() === false` |
| 3 | `checkHealth() ↔ GET /api/v1/health` | devuelve false cuando hay un error de red | `fetch` rechaza → `checkHealth() === false` |
| 4 | `predictStatic() ↔ POST /api/v1/predict/static` | devuelve la predicción cuando los landmarks son válidos | Respuesta `{letter, confidence, type}` es correcta |
| 5 | `predictStatic() ↔ POST /api/v1/predict/static` | verifica que el body enviado contiene los landmarks | Body tiene `landmarks[21][3]` |
| 6 | `predictStatic() ↔ POST /api/v1/predict/static` | lanza error cuando el backend devuelve 503 | Promesa rechaza con mensaje que incluye `503` |
| 7 | `predictStatic() ↔ POST /api/v1/predict/static` | lanza error cuando el backend devuelve 500 | Promesa rechaza con mensaje que incluye `500` |
| 8 | `predictStatic() ↔ POST /api/v1/predict/static` | lanza error cuando hay un fallo de red | `fetch` rechaza → servicio lanza excepción |
| 9 | `translateSign() — flujo completo` | flujo exitoso: landmarks → backend → APIResponse | `success: true`, `data.text`, `data.confidence` normalizada a 0–1 |
| 10 | `translateSign() — flujo completo` | devuelve error si no detecta mano | `extractLandmarks` retorna `null` → `success: false` |
| 11 | `translateSign() — flujo completo` | devuelve error descriptivo si el backend está caído (503) | `success: false`, mensaje menciona 503 o "no disponible" |
| 12 | `translateSign() — flujo completo` | devuelve error descriptivo si el backend falla con 500 | `success: false`, mensaje menciona 500 o "error interno" |
| 13 | `translateSign() — flujo completo` | devuelve error de red si fetch falla completamente | `success: false`, mensaje menciona "network" o "conexión" |

---

### `tests/integration/api-contract.integration.test.ts`
> Pruebas de **contrato de API**: verifican que los requests/responses del frontend  
> cumplen exactamente el contrato esperado por el backend (Python/FastAPI).

| # | Suite | Caso de prueba | Qué verifica |
|---|-------|----------------|--------------|
| 14 | `Contrato: POST /api/v1/predict/static` | el frontend envía el Content-Type correcto | Header `Content-Type: application/json` presente en el request |
| 15 | `Contrato: POST /api/v1/predict/static` | el frontend envía un body con la forma `{ landmarks: number[][] }` | Body tiene `landmarks` como array de 21 puntos de 3 coords |
| 16 | `Contrato: POST /api/v1/predict/static` | el frontend puede parsear correctamente la respuesta del backend | Campos `letter` (string), `confidence` (number), `type` (static/dynamic) |
| 17 | `Contrato: POST /api/v1/predict/static` | el método HTTP usado es POST | `fetch` es llamado con `method: "POST"` |
| 18 | `Contrato: POST /api/v1/predict/static` | la URL usada apunta al endpoint correcto | URL === `API_BASE_URL + /api/v1/predict/static` |
| 19 | `Contrato: GET /api/v1/health` | la URL construida por el frontend es la correcta | `getApiUrl(HEALTH) === API_BASE_URL + /api/v1/health` |
| 20 | `Contrato: GET /api/v1/health` | el frontend acepta cualquier respuesta 2xx como 'sano' | Status 200 → `checkHealth() === true` |
| 21 | `Contrato: GET /api/v1/health` | el frontend detecta correctamente una respuesta 503 como 'caído' | Status 503 → `checkHealth() === false` |
| 22 | `Contrato: configuración (API_CONFIG)` | el timeout configurado es de 30 segundos | `API_CONFIG.timeout === 30000` |
| 23 | `Contrato: configuración (API_CONFIG)` | los headers incluyen Content-Type: application/json | `API_CONFIG.headers["Content-Type"] === "application/json"` |
| 24 | `Contrato: configuración (API_CONFIG)` | los headers incluyen Accept: application/json | `API_CONFIG.headers["Accept"] === "application/json"` |
| 25 | `Contrato: configuración (API_CONFIG)` | la base URL no tiene trailing slash | `API_BASE_URL` no termina en `/` |
| 26 | `Contrato: configuración (API_CONFIG)` | todos los endpoints empiezan con `/` | Cada valor de `API_ENDPOINTS` inicia con `/` |

---

## 📊 Resumen

| Tipo | Archivos | Total de tests | Comando |
|------|----------|---------------|---------|
| **Unitarias** | 3 | **22** | `npm run test:unit` |
| **Integración** | 2 | **26** | `npm run test:int` |
| **Total** | 5 | **48** | `npm run test:all` |
