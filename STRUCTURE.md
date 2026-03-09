# 📁 Estructura del Proyecto — SignSpeak Frontend

Aplicación móvil cross-platform construida con **Expo + React Native + TypeScript**.

```
SignSpeak/
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md     # Plantilla estándar para Pull Requests
│
├── app/                             # Rutas de la app (Expo Router — file-based routing)
│   ├── (tabs)/                      # Grupo de rutas con tab bar inferior
│   │   ├── _layout.tsx              # Configuración del tab navigator
│   │   ├── index.tsx                # 📷 Pantalla principal — cámara y captura
│   │   ├── explore.tsx              # 📖 Historial de traducciones
│   │   └── settings.tsx             # ⚙️  Configuración de la app
│   ├── _layout.tsx                  # Layout raíz — providers, fuentes, splash
│   ├── modal.tsx                    # Modal reutilizable
│   └── translation-result.tsx       # Pantalla de resultado de traducción
│
├── assets/
│   └── images/                      # Recursos gráficos (íconos, splash, logo)
│
├── components/                      # Componentes React Native reutilizables
│   ├── ui/                          # Primitivos de UI
│   │   ├── capture-button.tsx       # Botón de captura con animación
│   │   ├── collapsible.tsx          # Acordeón expandible
│   │   ├── icon-symbol.ios.tsx      # Íconos SF Symbols (iOS)
│   │   └── icon-symbol.tsx          # Íconos (Android/Web)
│   ├── camera-view.tsx              # Wrapper de expo-camera con permisos
│   ├── error-message.tsx            # Componente de error con icono
│   ├── external-link.tsx            # Link que abre el navegador
│   ├── haptic-tab.tsx               # Tab con feedback háptico
│   ├── hello-wave.tsx               # Animación de saludo
│   ├── parallax-scroll-view.tsx     # Scroll con header parallax
│   ├── processing-overlay.tsx       # Overlay de carga en traducción
│   ├── themed-text.tsx              # Text con tema claro/oscuro
│   ├── themed-view.tsx              # View con tema claro/oscuro
│   └── translation-card.tsx         # Tarjeta de resultado de traducción
│
├── constants/
│   └── theme.ts                     # Colores, tipografía y tokens de diseño
│
├── hooks/                           # Custom React Hooks
│   ├── use-color-scheme.ts          # Detecta el esquema de color del sistema
│   ├── use-color-scheme.web.ts      # Variante web del hook anterior
│   └── use-theme-color.ts           # Retorna el color correcto según el tema
│
├── services/                        # Capa de comunicación con el backend
│   ├── api-config.ts                # URL base, endpoints y config HTTP
│   ├── landmark-service.ts          # Extracción de landmarks con MediaPipe
│   ├── storage-service.ts           # Persistencia local con AsyncStorage
│   └── translation-service.ts       # Lógica de traducción (landmarks → API → resultado)
│
├── tests/                           # Tests automatizados
│   ├── integration/                 # Tests de integración front ↔ backend
│   │   ├── mocks/
│   │   │   ├── handlers.ts          # Handlers MSW — simulan las respuestas del backend
│   │   │   └── server.ts            # Servidor MSW para el entorno Jest/Node
│   │   ├── api-contract.integration.test.ts   # Verifica contrato de la API
│   │   └── translation-service.integration.test.ts  # Flujo completo de traducción
│   ├── api-config.test.ts           # Tests unitarios de api-config
│   ├── landmark-service.test.ts     # Tests unitarios de landmark-service
│   ├── navigation.e2e.test.tsx      # Tests E2E de navegación
│   └── storage-service.test.ts      # Tests unitarios de storage-service
│
├── e2e/
│   └── maestro/                     # Tests de UI con Maestro (dispositivo real)
│       ├── camera_screen.yaml       # Flujo de captura de cámara
│       ├── history_screen.yaml      # Flujo de pantalla de historial
│       └── settings_flow.yaml       # Flujo de configuración
│
├── scripts/
│   └── reset-project.js             # Script de reinicio del proyecto Expo
│
├── types/
│   └── types.ts                     # Todos los tipos TypeScript compartidos
│
├── .env.example                     # Variables de entorno de ejemplo
├── .gitignore
├── app.json                         # Configuración de Expo (nombre, íconos, permisos)
├── babel.config.js                  # Configuración de Babel para Expo
├── eslint.config.js                 # Reglas ESLint (TypeScript + React + Hooks)
├── expo-env.d.ts                    # Tipos de variables de entorno Expo
├── package.json                     # Dependencias y scripts npm
└── tsconfig.json                    # Configuración de TypeScript
```

---

## 🧩 Descripción de capas

| Capa             | Directorio                    | Responsabilidad                                         |
| ---------------- | ----------------------------- | ------------------------------------------------------- |
| **Rutas**        | `app/`                        | Pantallas y navegación basada en archivos (Expo Router) |
| **Componentes**  | `components/`                 | UI reutilizable, agnóstica de la lógica de negocio      |
| **Servicios**    | `services/`                   | Comunicación con el backend y MediaPipe                 |
| **Estado local** | `services/storage-service.ts` | Historial y configuración vía AsyncStorage              |
| **Diseño**       | `constants/theme.ts`          | Tokens de colores y tipografía                          |
| **Tests**        | `tests/`                      | Unitarios (Jest), integración (MSW) y E2E (Maestro)     |

## 🔗 Flujo de datos principal

```
Camera (expo-camera)
    │
    ▼
LandmarkService        ← MediaPipe detecta los 21 puntos de la mano
    │
    ▼
TranslationService     ← POST /api/v1/predict/static  →  Backend Python
    │
    ▼
StorageService         ← guarda la traducción en AsyncStorage
    │
    ▼
translation-result.tsx ← muestra letra, confianza e imagen
```
