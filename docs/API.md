# SignSpeak API - Especificación para React Native

> **Versión:** 1.0.0  
> **URL Base (Desarrollo):** `http://<TU_IP_LOCAL>:8000`  
> **URL Base (Producción):** Configurar según despliegue  
> **Formato:** JSON  
> **Content-Type:** `application/json`

---

## ⚠️ Configuración de Red (Desarrollo)

**No usar `localhost` en React Native**

```env
# ❌ NO FUNCIONA
API_URL=http://localhost:8000

# ✅ USA TU IP LOCAL
API_URL=http://192.168.1.50:8000
```

Para obtener tu IP:

- Windows: `ipconfig` → buscar IPv4
- Mac/Linux: `ifconfig` → buscar inet

---

## Resumen de Endpoints

| Método | Endpoint                      | Uso en App            |
| ------ | ----------------------------- | --------------------- |
| GET    | `/api/v1/health`              | Al iniciar app        |
| POST   | `/api/v1/predict/static`      | Modo letra estática   |
| POST   | `/api/v1/predict/dynamic`     | Modo letra dinámica   |
| POST   | `/api/v1/predict/words`       | Modo palabras         |
| POST   | `/api/v1/predict/holistic`    | Vocabulario médico    |
| POST   | `/api/v1/predict/words/clear` | Botón "limpiar frase" |

---

## 1. Health Check

### GET `/api/v1/health`

Verificar que el backend está disponible.

**Cuándo llamar:** Al abrir la app o cambiar de red.

**Response**

| Campo   | Tipo   | Valor           |
| ------- | ------ | --------------- |
| status  | string | `"healthy"`     |
| service | string | `"API Gateway"` |
| version | string | `"1.0.0"`       |

---

## 2. Predicción de Letras Estáticas

### POST `/api/v1/predict/static`

**Letras:** A, B, C, D, E, F, G, H, I, L, M, N, O, P, R, S, T, U, V, W, Y

**Request Body**

| Campo     | Tipo         | Descripción                         |
| --------- | ------------ | ----------------------------------- |
| landmarks | array[21][3] | Coordenadas de 21 puntos de la mano |

**Formato de landmarks:**

```
[
  [x, y, z],  // Punto 0: WRIST
  [x, y, z],  // Punto 1: THUMB_CMC
  ...         // 21 puntos total
]
```

- Valores: 0.0 a 1.0 (ya normalizados por MediaPipe)
- Origen: `handLandmarks[0]` de MediaPipe

**Response**

| Campo              | Tipo   | Descripción    |
| ------------------ | ------ | -------------- |
| letter             | string | Letra predicha |
| confidence         | float  | 0-100          |
| type               | string | `"static"`     |
| processing_time_ms | float  | Milisegundos   |

**Recomendación:** Solo mostrar si `confidence >= 70`

---

## 3. Predicción Dinámica/Palabras

### POST `/api/v1/predict/words`

**Vocabulario:** 249 palabras LSM

**Request Body**

| Campo    | Tipo             | Descripción            |
| -------- | ---------------- | ---------------------- |
| sequence | array[15][21][3] | 15 frames de landmarks |

**Cómo acumular frames:**

1. Capturar landmarks cada 33ms (30 FPS)
2. Guardar en buffer FIFO
3. Cuando buffer tenga 15 frames → enviar
4. Reiniciar buffer

**Response**

| Campo              | Tipo    | Descripción            |
| ------------------ | ------- | ---------------------- |
| word               | string  | Palabra detectada      |
| confidence         | float   | 0-100                  |
| phrase             | string  | Frase acumulada        |
| accepted           | boolean | Si pasó umbral interno |
| processing_time_ms | float   | Tiempo                 |

**Uso de `phrase`:**

- Si `accepted: true` → actualizar UI con `phrase`
- Si `accepted: false` → ignorar

---

## 4. Limpiar Buffer

### POST `/api/v1/predict/words/clear`

**Cuándo usar:** Botón "Nueva frase" o al cambiar de modo.

**Response**

| Campo   | Tipo   | Valor              |
| ------- | ------ | ------------------ |
| message | string | `"Buffer cleared"` |

---

## Extracción de Landmarks (MediaPipe)

### Estructura del resultado

MediaPipe retorna un objeto con:

```
HandLandmarkerResult {
  landmarks: [
    [
      {x: 0.5, y: 0.3, z: -0.02},  // Punto 0
      {x: 0.6, y: 0.4, z: -0.01},  // Punto 1
      ...                           // 21 puntos
    ]
  ]
}
```

### Conversión para API

```typescript
// INPUT: MediaPipe result
const mediapipeLandmarks = result.landmarks[0];

// OUTPUT: Array para API
const apiLandmarks = mediapipeLandmarks.map((lm) => [lm.x, lm.y, lm.z]);

// Ejemplo de 1 punto:
// MediaPipe: {x: 0.5, y: 0.3, z: -0.02}
// API:       [0.5, 0.3, -0.02]
```

---

## Índices de Landmarks

| Índice | Nombre     | Dedo    |
| ------ | ---------- | ------- |
| 0      | WRIST      | Muñeca  |
| 1-4    | THUMB\_\*  | Pulgar  |
| 5-8    | INDEX\_\*  | Índice  |
| 9-12   | MIDDLE\_\* | Medio   |
| 13-16  | RING\_\*   | Anular  |
| 17-20  | PINKY\_\*  | Meñique |

---

## Manejo de Errores

### Códigos HTTP

| Código | Causa                   | Acción en App                    |
| ------ | ----------------------- | -------------------------------- |
| 400    | JSON malformado         | Verificar estructura             |
| 422    | Landmarks insuficientes | Debe ser exactamente 21          |
| 502    | Backend no disponible   | Mostrar "Servicio no disponible" |
| 504    | Timeout                 | Reintentar                       |

### Formato de Error

```json
{
  "detail": "Descripción del error"
}
```

---

## Optimizaciones para Móvil

### Frecuencia de Requests

| Endpoint          | Frecuencia máxima |
| ----------------- | ----------------- |
| `/predict/static` | 2 por segundo     |
| `/predict/words`  | 1 cada 500ms      |

### Timeout Recomendado

```typescript
const API_TIMEOUT = 30000; // 30 segundos
```

### Caché

Usar TanStack Query con:

- `staleTime: 5000` (5 segundos)
- `retry: 2` (reintentar 2 veces)

---

## Flujo Recomendado

### Modo Letras Estáticas

```
1. MediaPipe detecta mano
2. Extraer landmarks
3. Si mano QUIETA por 500ms:
   → POST /predict/static
4. Mostrar letra si confidence > 70%
5. Acumular letras localmente
```

### Modo Palabras

```
1. Acumular 15 frames (buffer FIFO)
2. Cuando buffer lleno:
   → POST /predict/words
3. Si accepted: true
   → Actualizar phrase en UI
4. Reiniciar buffer
```

---

## Checklist de Integración

- [ ] Configurar `API_URL` con tu IP local
- [ ] Verificar `/health` al iniciar app
- [ ] Implementar buffer de 15 frames
- [ ] Convertir landmarks MediaPipe → array[21][3]
- [ ] Manejar estados loading/error
- [ ] Aplicar threshold de confidence
- [ ] Implementar debounce de 500ms
- [ ] Caché con TanStack Query

---

**Última actualización:** Enero 2026
