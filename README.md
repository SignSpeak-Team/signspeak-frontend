<div align="center">

# 🤟 SignSpeak — Mobile

### Aplicación móvil de traducción de Lenguaje de Señas Mexicano (LSM) a texto

[![CI](https://github.com/alanctinaDev/SignSpeak/actions/workflows/ci.yml/badge.svg)](https://github.com/alanctinaDev/SignSpeak/actions)
[![Expo](https://img.shields.io/badge/Expo-54.0-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)

</div>

---

## 📋 Tabla de contenidos

1. [Descripción](#-descripción)
2. [Demo & Screenshots](#-demo--screenshots)
3. [Stack tecnológico](#️-stack-tecnológico)
4. [Requisitos previos](#-requisitos-previos)
5. [Instalación](#-instalación)
6. [Ejecutar localmente](#-ejecutar-localmente)
7. [Variables de entorno](#-variables-de-entorno)
8. [Tests](#-tests)
9. [Estructura del proyecto](#-estructura-del-proyecto)
10. [Contrato de la API](#-contrato-de-la-api)
11. [Contribución](#-contribución)
12. [Licencia](#-licencia)
13. [Autores](#-autores)

---

## 📖 Descripción

**SignSpeak Mobile** es una aplicación cross-platform (iOS / Android) que convierte gestos de Lenguaje de Señas Mexicano en texto en tiempo real.

El flujo es:

1. El usuario captura un gesto con la cámara del dispositivo
2. **MediaPipe** detecta los 21 puntos (landmarks) de la mano en la imagen
3. Los landmarks se envían al [backend SignSpeak](../backend/signSpeak) vía REST
4. El backend devuelve la letra o palabra predicha con su nivel de confianza
5. La app muestra el resultado y lo guarda en el historial local

### ✨ Funcionalidades principales

| Feature                        | Descripción                                              |
| ------------------------------ | -------------------------------------------------------- |
| 📷 **Captura de cámara**       | Guías de encuadre en tiempo real para posicionar la mano |
| 🤖 **MediaPipe Hand Tracking** | Extracción de 21 landmarks `[x, y, z]` por fotograma     |
| 🔄 **Integración con backend** | Predicción de letras estáticas, dinámicas y palabras     |
| 📜 **Historial**               | Busca, filtra y gestiona traducciones anteriores         |
| ⚙️ **Configuración**           | Endpoint API, cámara (flash, resolución), idioma         |
| 🌓 **Tema claro/oscuro**       | Soporte nativo de `useColorScheme`                       |
| 💾 **Almacenamiento offline**  | Historial persistido con `AsyncStorage`                  |

---

## 🖼️ Demo & Screenshots

> La app captura la seña → MediaPipe analiza → el backend predice → se muestra la letra con confianza.

```
[Cámara] ──► [Landmarks] ──► [API] ──► [Resultado: "A" 92.5%]
```

---

## 🛠️ Stack tecnológico

| Categoría        | Tecnología                | Versión       |
| ---------------- | ------------------------- | ------------- |
| **Framework**    | Expo                      | ~54.0         |
| **UI**           | React Native              | 0.81          |
| **Lenguaje**     | TypeScript                | ~5.9          |
| **Navegación**   | Expo Router (file-based)  | ~6.0          |
| **Visión**       | MediaPipe Tasks Vision    | ^0.10.32      |
| **Cámara**       | expo-camera               | ^17.0         |
| **Persistencia** | AsyncStorage              | ^2.2          |
| **Animaciones**  | React Native Reanimated   | ~4.1          |
| **Testing**      | Jest + jest-expo          | ~29.7 / ~54.0 |
| **Mocks de red** | MSW (Mock Service Worker) | ^2.x          |
| **E2E**          | Maestro                   | latest        |
| **Linting**      | ESLint + expo flat config | ^9.x          |

---

## ✅ Requisitos previos

| Herramienta        | Versión mínima | Notas                                    |
| ------------------ | -------------- | ---------------------------------------- |
| **Node.js**        | 18 LTS         | Recomendado: `nvm use 18`                |
| **npm**            | 9+             | Incluido con Node.js                     |
| **Expo CLI**       | latest         | `npm i -g expo-cli`                      |
| **EAS CLI**        | latest         | `npm i -g eas-cli` — para builds nativos |
| **Android Studio** | Hedgehog+      | SDK 34, emulador o dispositivo físico    |
| **Xcode**          | 15+            | Solo macOS, para builds iOS              |
| **Maestro**        | latest         | Solo para tests E2E en dispositivo       |

> ⚠️ La app **no funciona en Expo Go** porque usa módulos nativos (MediaPipe). Necesitas un **custom development build**.

---

## 📦 Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/alanctinaDev/SignSpeak.git
cd SignSpeak

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno (opcional, para apuntar a un backend local)
cp .env.example .env
```

### Crear el custom development build

**Opción A — EAS Build (recomendado, no necesitas Android Studio)**

```bash
# Login a tu cuenta de Expo
eas login

# Build para Android
eas build --profile development --platform android

# Build para iOS (requiere Apple Developer account)
eas build --profile development --platform ios
```

**Opción B — Build local (requiere Android Studio / Xcode)**

```bash
# Generar carpetas nativas
npx expo prebuild

# Android
npx expo run:android

# iOS (solo macOS)
npx expo run:ios
```

---

## ▶️ Ejecutar localmente

```bash
# Iniciar el servidor Metro (bundler)
npm start

# O apuntar directamente a un dispositivo/emulador
npm run android
npm run ios
npm run web    # versión web (funcionalidad limitada, sin MediaPipe nativo)
```

> Escanea el QR con tu **custom development build** instalado en el dispositivo.
> Asegúrate de que el backend esté corriendo y actualiza `EXPO_PUBLIC_API_BASE_URL` si es local.

---

## 🔐 Variables de entorno

Copia `.env.example` a `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

| Variable                   | Descripción          | Ejemplo                                            |
| -------------------------- | -------------------- | -------------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL` | URL base del backend | `https://signspeak-production-1f68.up.railway.app` |

> Las variables prefijadas con `EXPO_PUBLIC_` son expuestas al bundle de la app.
> Nunca pongas secrets en variables `EXPO_PUBLIC_`.

Para cambiar el endpoint en tiempo de ejecución, ve a la pantalla de **Configuración** de la app.

---

## 🧪 Tests

El proyecto usa **Jest + jest-expo** para tests unitarios y de integración, y **Maestro** para E2E.

### Tests unitarios

```bash
npm run test:unit
```

Cubre: `api-config`, `landmark-service`, `storage-service`.

### Tests de integración (front ↔ backend)

```bash
npm run test:integration
```

Usa **MSW (Mock Service Worker)** para interceptar `fetch` y simular las respuestas del backend sin necesitar que esté corriendo.

Cubre:

- `TranslationService.checkHealth()` → `GET /api/v1/health`
- `TranslationService.predictStatic()` → `POST /api/v1/predict/static`
- Flujo completo `translateSign()` incluyendo manejo de errores (503, 500, red caída)
- Contrato de la API (shape del request/response)

### Tests E2E (Maestro — requiere dispositivo)

```bash
# Instalar Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Correr flujos individuales
npm run maestro:camera    # flujo de captura
npm run maestro:history   # flujo de historial
npm run maestro:settings  # flujo de configuración
```

### Todos los tests

```bash
npm run test:all
```

---

## 📂 Estructura del proyecto

> Ver el archivo [`STRUCTURE.md`](STRUCTURE.md) para la descripción detallada de cada archivo.

```
SignSpeak/
├── app/                   # Pantallas (Expo Router — file-based)
│   └── (tabs)/            # index.tsx · explore.tsx · settings.tsx
├── components/            # UI reutilizable + primitivos (ui/)
├── constants/             # Tokens de diseño y tema
├── hooks/                 # Custom hooks (useColorScheme, useThemeColor)
├── services/              # Capa de comunicación
│   ├── api-config.ts      # URL base, endpoints, config HTTP
│   ├── landmark-service.ts# Extracción de landmarks con MediaPipe
│   ├── translation-service.ts  # Orquesta landmarks → API → respuesta
│   └── storage-service.ts # AsyncStorage: historial y settings
├── tests/
│   └── integration/       # MSW handlers + tests front↔back
├── e2e/maestro/           # Flujos Maestro (YAML)
├── types/types.ts         # Tipos TypeScript compartidos
├── .env.example
├── eslint.config.js
└── tsconfig.json
```

---

## 📡 Contrato de la API

### `POST /api/v1/predict/static`

**Request:**

```json
{
  "landmarks": [
    [0.5, 0.5, 0.0],
    [0.45, 0.4, 0.0],
    "... 19 landmarks más (total 21 × [x, y, z])"
  ]
}
```

**Response:**

```json
{
  "letter": "A",
  "confidence": 92.5,
  "type": "static",
  "processing_time_ms": 18
}
```

| Endpoint                        | Descripción                          |
| ------------------------------- | ------------------------------------ |
| `GET  /api/v1/health`           | Health check del backend             |
| `GET  /api/v1/status`           | Estado de los servicios internos     |
| `POST /api/v1/predict/static`   | Letra estática (21 landmarks)        |
| `POST /api/v1/predict/dynamic`  | Letra dinámica (secuencia 15 frames) |
| `POST /api/v1/predict/words`    | Palabra LSM (vocabulario 249)        |
| `POST /api/v1/predict/holistic` | Palabra médica (vocabulario 150)     |

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Sigue estos pasos:

1. **Forkea** el repositorio
2. Crea una branch desde `develop`:
   ```bash
   git checkout -b feat/nombre-de-tu-feature
   ```
3. Haz tus cambios y **asegúrate de que los tests pasen**:
   ```bash
   npm run test:all
   npm run lint
   ```
4. Commitea con [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: agregar soporte para letras dinámicas
   fix: corregir validación de landmarks en edge cases
   ```
5. Abre un **Pull Request** hacia `develop` usando la [plantilla](.github/PULL_REQUEST_TEMPLATE.md)

### Convenciones de código

- **TypeScript estricto** — no uses `any` sin justificación
- **ESLint** debe pasar sin warnings nuevos (`npm run lint`)
- **Componentes**: usa `components/ui/` para primitivos, `components/` para compuestos
- **Servicios**: toda la lógica de red va en `services/`, los componentes no hacen `fetch` directamente

---

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Ver [`LICENSE`](LICENSE) para más detalles.

---

## 👥 Autores

| Nombre                | GitHub                                           | Rol            |
| --------------------- | ------------------------------------------------ | -------------- |
| **Alan Lopez Cetina** | [@alanctinaDev](https://github.com/alanctinaDev) | Fullstack / ML |

---

<div align="center">

Hecho con ❤️ usando **Expo** & **React Native**

[🐛 Reportar un bug](https://github.com/alanctinaDev/SignSpeak/issues) · [💡 Solicitar feature](https://github.com/alanctinaDev/SignSpeak/issues)

</div>
