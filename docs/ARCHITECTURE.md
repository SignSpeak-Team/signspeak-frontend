# SignSpeak Mobile - Arquitectura React Native

> **Framework:** React Native + Expo  
> **Lenguaje:** TypeScript  
> **Target:** iOS + Android

---

## Stack Tecnológico

| Librería                   | Versión | Propósito             |
| -------------------------- | ------- | --------------------- |
| `expo`                     | ~51.0.0 | Framework base        |
| `react-native`             | 0.74.x  | Core de RN            |
| `expo-camera`              | ~15.0.0 | Acceso a cámara       |
| `@mediapipe/tasks-vision`  | ^0.10.0 | Detección de manos    |
| `@react-navigation/native` | ^6.0.0  | Navegación            |
| `@tanstack/react-query`    | ^5.0.0  | Estado servidor/cache |
| `zustand`                  | ^4.0.0  | Estado global         |
| `axios`                    | ^1.6.0  | HTTP client           |

---

## Arquitectura General

```
┌─────────────────────────────────────────────────┐
│           React Native App (Móvil)              │
│                                                 │
│  ┌──────────────┐      ┌─────────────────┐    │
│  │   Cámara     │ ───► │   MediaPipe     │    │
│  │ expo-camera  │      │ Hand Detection  │    │
│  └──────────────┘      └─────────────────┘    │
│                              │                  │
│                              ▼                  │
│                        21 Landmarks             │
│                              │                  │
│                              ▼                  │
│                     ┌────────────────┐         │
│                     │  API Service   │         │
│                     │  (axios)       │         │
│                     └────────────────┘         │
└─────────────────────────│───────────────────────┘
                          │ HTTP/JSON
                          ▼
              ┌────────────────────────┐
              │    API Gateway :8000   │
              │           ▼            │
              │  Vision Service :8002  │
              └────────────────────────┘
```

---

## Estructura de Carpetas

```
SignSpeakApp/
├── app.json                    # Configuración Expo
├── package.json
├── tsconfig.json
├── .env.development
├── .env.production
│
└── src/
    ├── features/
    │   ├── camera/
    │   │   ├── screens/
    │   │   │   └── CameraScreen.tsx
    │   │   ├── components/
    │   │   │   ├── HandOverlay.tsx
    │   │   │   ├── LandmarkVisualizer.tsx
    │   │   │   └── CameraControls.tsx
    │   │   ├── hooks/
    │   │   │   ├── useCamera.ts
    │   │   │   ├── useHandDetection.ts
    │   │   │   └── useFrameProcessor.ts
    │   │   └── utils/
    │   │       └── landmarkExtractor.ts
    │   │
    │   ├── prediction/
    │   │   ├── screens/
    │   │   │   ├── LetterModeScreen.tsx
    │   │   │   └── WordModeScreen.tsx
    │   │   ├── components/
    │   │   │   ├── PredictionDisplay.tsx
    │   │   │   ├── ConfidenceBar.tsx
    │   │   │   └── PhraseAccumulator.tsx
    │   │   └── hooks/
    │   │       ├── usePrediction.ts
    │   │       └── useFrameBuffer.ts
    │   │
    │   └── settings/
    │       ├── screens/
    │       │   └── SettingsScreen.tsx
    │       └── components/
    │           └── APIConfig.tsx
    │
    ├── shared/
    │   ├── components/
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   └── LoadingSpinner.tsx
    │   ├── hooks/
    │   │   ├── useAPI.ts
    │   │   └── useAppState.ts
    │   ├── services/
    │   │   ├── api.ts              # Base API client
    │   │   ├── signAPI.ts          # Endpoints específicos
    │   │   └── errorHandler.ts
    │   ├── store/
    │   │   └── useAppStore.ts      # Zustand store
    │   └── utils/
    │       ├── constants.ts
    │       └── validators.ts
    │
    ├── navigation/
    │   ├── RootNavigator.tsx
    │   ├── AppNavigator.tsx
    │   └── types.ts
    │
    ├── config/
    │   ├── api.ts                  # API URLs
    │   ├── mediapipe.ts            # MediaPipe config
    │   └── camera.ts               # Camera settings
    │
    ├── theme/
    │   ├── colors.ts
    │   ├── typography.ts
    │   └── spacing.ts
    │
    ├── types/
    │   ├── api.ts                  # API types
    │   ├── landmarks.ts            # MediaPipe types
    │   └── navigation.ts
    │
    ├── App.tsx
    └── index.tsx
```

---

## Flujo de Datos

### 1. Captura y Detección

```
expo-camera (60 FPS)
    ↓
Frame a procesar (cada 100-200ms)
    ↓
MediaPipe Hand Detection
    ↓
21 Landmarks [x, y, z]
    ↓
Normalización (0.0 - 1.0)
```

### 2. Modo Letra Estática

```
Landmarks (último frame)
    ↓
POST /api/v1/predict/static
    ↓
{letter, confidence}
    ↓
UI muestra letra
```

### 3. Modo Letra Dinámica/Palabras

```
Frame Buffer (15 frames, ~0.5s)
    ↓
Cuando buffer lleno
    ↓
POST /api/v1/predict/words
    ↓
{word, confidence, phrase}
    ↓
UI actualiza frase
```

---

## Componentes Principales

### CameraScreen.tsx

- Renderiza `expo-camera`
- Captura frames a 60 FPS
- Pasa frames a MediaPipe
- Dibuja landmarks sobre video

### useHandDetection.ts (Custom Hook)

- Inicializa MediaPipe
- Procesa frames
- Retorna landmarks detectados

### useFrameBuffer.ts

- Acumula 15 frames de landmarks
- Notifica cuando está lleno
- Permite limpiar buffer

### usePrediction.ts

- Llama API con landmarks
- Maneja loading/error states
- Cachea resultados con TanStack Query

---

## Estado Global (Zustand)

```typescript
interface AppStore {
  // Modo de predicción
  mode: "static" | "dynamic" | "words" | "holistic";
  setMode: (mode: string) => void;

  // Frase acumulada
  phrase: string;
  addWord: (word: string) => void;
  clearPhrase: () => void;

  // Configuración
  apiUrl: string;
  confidenceThreshold: number;
}
```

---

## Configuración de MediaPipe

### Modelo a usar

- **Hand Landmarker** (detección de manos)
- Modelo: `hand_landmarker.task` (~12MB)
- Descarga: Durante el primer inicio de la app

### Opciones recomendadas

```typescript
{
  numHands: 1,              // Solo una mano
  minHandDetectionConfidence: 0.7,
  minHandPresenceConfidence: 0.7,
  minTrackingConfidence: 0.5,
  runningMode: 'VIDEO'      // Para frames continuos
}
```

---

## Performance

### Optimizaciones

| Aspecto                   | Estrategia                                 |
| ------------------------- | ------------------------------------------ |
| **FPS de procesamiento**  | Procesar 1 de cada 3-6 frames (~10-20 FPS) |
| **Envío a API**           | Máximo 2 requests/segundo                  |
| **Cache de predicciones** | TanStack Query con 5s stale time           |
| **Debounce**              | 500ms entre predicciones                   |

### Memoria

- MediaPipe: ~50MB RAM
- Frame buffer: ~1MB
- Total esperado: ~100-150MB

---

## Variables de Entorno

```env
# .env.development
API_URL=http://192.168.1.X:8000
API_TIMEOUT=30000

# .env.production
API_URL=https://api.signspeak.com
API_TIMEOUT=30000
```

**Nota:** Para desarrollo, usa tu IP local (no localhost).

---

## Navegación

### Estructura de pantallas

```
Stack Navigator
├── Home (selección de modo)
├── CameraScreen (predicción en vivo)
├── ResultsScreen (historial)
└── Settings
```

---

## Consideraciones Técnicas

### Permisos necesarios

- 📷 Cámara (obligatorio)
- 📁 Almacenamiento (para guardar historial, opcional)

### Plataforma-específico

| Feature               | iOS         | Android |
| --------------------- | ----------- | ------- |
| Camera API            | ✅          | ✅      |
| MediaPipe             | ✅          | ✅      |
| Background processing | ⚠️ Limitado | ✅      |

### Limitaciones conocidas

- MediaPipe no funciona en background
- Requiere buena iluminación
- Rendimiento depende del dispositivo

---

## Próximos Pasos

1. ✅ Inicializar proyecto Expo
2. ✅ Instalar dependencias
3. ✅ Configurar estructura de carpetas
4. ⏳ Implementar CameraScreen básico
5. ⏳ Integrar MediaPipe
6. ⏳ Conectar con API

**Última actualización:** Enero 2026
