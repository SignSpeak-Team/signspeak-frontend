# SignSpeak Mobile App

Aplicación móvil para traducción en tiempo real de Lenguaje de Señas Mexicano (LSM).

## Descripción

SignSpeak es una aplicación React Native que detecta gestos de manos en tiempo real usando la cámara del dispositivo. Mediante MediaPipe, extrae landmarks de las manos y los envía al backend, donde modelos de machine learning los traducen a letras, palabras y frases del Lenguaje de Señas Mexicano.

## Stack Tecnológico

- **React Native** con **Expo** (~54.0)
- **TypeScript** para type safety
- **MediaPipe** para detección de landmarks de manos
- **React Navigation** para navegación entre pantallas
- **TanStack Query** para manejo de estado del servidor
- **Zustand** para estado global
- **Axios** para comunicación HTTP con el API Gateway

## Estructura del Proyecto

El proyecto sigue una arquitectura **Feature-Based** donde el código se organiza por funcionalidad en lugar de tipo de archivo:

```
src/
├── features/        # Módulos organizados por característica
│   ├── camera/      # Captura y detección de manos
│   ├── prediction/  # Predicciones y resultados
│   └── settings/    # Configuración de usuario
├── shared/          # Código compartido entre features
│   ├── components/  # Componentes reutilizables
│   ├── hooks/       # Custom hooks
│   ├── services/    # Servicios y API client
│   ├── store/       # Estado global (Zustand)
│   └── utils/       # Utilidades
├── navigation/      # Configuración de navegación
├── config/          # Configuración de app (API URLs, etc)
├── theme/           # Sistema de diseño (colores, tipografía)
└── types/           # Definiciones de TypeScript
```

## Instalación

### Prerrequisitos

- Node.js >= 20.19.4
- npm o yarn
- Expo Go app (para pruebas en dispositivo físico)

### Configuración

1. Clonar el repositorio:

```bash
git clone https://github.com/alanctinaDev/Front-signSpeak.git
cd Front-signSpeak
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:

```bash
# Crear archivo .env.local
# API_URL debe apuntar a tu API Gateway (usar IP local, no localhost)
```

4. Iniciar servidor de desarrollo:

```bash
npm start
```

## Scripts Disponibles

| Comando           | Descripción              |
| ----------------- | ------------------------ |
| `npm start`       | Inicia Metro Bundler     |
| `npm run android` | Abre en emulador Android |
| `npm run ios`     | Abre en simulador iOS    |
| `npm run web`     | Abre versión web         |

## Comunicación con Backend

La app se comunica con el API Gateway que procesa las predicciones mediante el Vision Service. Ver documentación interna para especificaciones de endpoints.

## Desarrollo

### Agregar una nueva feature

1. Crear carpeta en `src/features/nombre-feature/`
2. Incluir subcarpetas: `screens/`, `components/`, `hooks/`
3. Mantener todo el código relacionado dentro del feature

### Convenciones

- Usar TypeScript para todos los archivos nuevos
- Nombrar componentes con PascalCase
- Nombrar archivos igual que el componente que exportan
- Mantener componentes pequeños y con responsabilidad única
- Extraer lógica a custom hooks cuando sea posible

## Estado del Proyecto

**Fase actual:** Configuración inicial de proyecto

**Completado:**

- ✅ Estructura base de carpetas
- ✅ Configuración de TypeScript
- ✅ Setup de Expo

**Pendiente:**

- Implementación de features
- Integración con MediaPipe
- Conexión con API Gateway
- UI/UX design

## Contribuir

Este proyecto está en desarrollo activo. Para colaborar:

1. Revisar la estructura del proyecto
2. Seguir las convenciones establecidas
3. Mantener código limpio y documentado
4. Hacer commits descriptivos

## Licencia

Proyecto privado - SignSpeak Team
