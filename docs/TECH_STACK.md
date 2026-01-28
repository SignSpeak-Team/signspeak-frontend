# Stack Tecnológico - Explicación Detallada

## Core Framework

### 1. Expo

**¿Qué es?** Framework que facilita el desarrollo en React Native

**Para qué lo usamos:**

- Simplifica la configuración inicial (sin configurar Android Studio/Xcode)
- Provee APIs nativas listas (cámara, permisos, sensores)
- Hot reload automático
- Permite probar en tu teléfono escaneando un QR

**Alternativa:** React Native CLI (más complejo, más control)

---

### 2. React Native

**¿Qué es?** Framework para crear apps móviles con JavaScript/TypeScript

**Para qué lo usamos:**

- Escribir código una vez, funciona en iOS y Android
- UI nativa (no es un webview)
- Rendimiento cercano a apps nativas

**Componentes básicos:**

- `<View>` en lugar de `<div>`
- `<Text>` en lugar de `<p>`
- `<TouchableOpacity>` en lugar de `<button>`

---

### 3. TypeScript

**¿Qué es?** JavaScript con tipos estáticos

**Para qué lo usamos:**

- Detectar errores antes de ejecutar
- Autocompletado inteligente
- Documentación automática del código

**Ejemplo:**

```typescript
// Sin TypeScript (JavaScript)
function suma(a, b) {
  return a + b;
}
suma("5", 3); // ❌ Error en runtime

// Con TypeScript
function suma(a: number, b: number): number {
  return a + b;
}
suma("5", 3); // ✅ Error detectado al escribir
```

---

## Detección de Manos

### 4. expo-camera

**¿Qué es?** API de Expo para acceso a la cámara

**Para qué lo usamos:**

- Capturar video en tiempo real
- Manejar permisos de cámara
- Controlar flash, zoom, etc.

**Por qué no `react-native-camera`:** expo-camera está optimizado para Expo y es más fácil de configurar.

---

### 5. @mediapipe/tasks-vision

**¿Qué es?** Librería de Google para computer vision

**Para qué lo usamos:**

- Detectar 21 puntos de la mano en cada frame
- Obtener coordenadas normalizadas (0.0-1.0)
- Funciona offline (modelo descargado en el dispositivo)

**Qué detecta:**

- Posición de cada dedo
- Orientación de la mano
- Profundidad (z-axis)

**Alternativa:** TensorFlow Lite (más complejo)

---

## Navegación

### 6. @react-navigation/native

**¿Qué es?** Librería para navegación entre pantallas

**Para qué lo usamos:**

- Movernos entre pantallas (Home → Cámara → Resultados)
- Stack navigation (como browser history)
- Transiciones suaves

**Tipos de navegadores:**

- Stack: Pantallas apiladas con botón "atrás"
- Tab: Tabs en la parte inferior
- Drawer: Menú lateral

---

## Estado y Datos

### 7. @tanstack/react-query (antes React Query)

**¿Qué es?** Librería para manejo de estado del servidor

**Para qué lo usamos:**

- **Caché inteligente:** No repite llamadas innecesarias al API
- **Auto-retry:** Reintenta si falla
- **Loading states:** Sabe cuándo está cargando
- **Optimistic updates:** UI responde antes de confirmar

**Ejemplo de uso:**

```typescript
// Sin React Query - código complejo
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  fetch("/api")
    .then((res) => res.json())
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);

// Con React Query - simple
const { data, loading, error } = useQuery("/api", fetchData);
```

---

### 8. Zustand

**¿Qué es?** Librería minimalista para estado global

**Para qué lo usamos:**

- Compartir datos entre pantallas
- Guardar configuración del usuario
- Mantener la frase acumulada

**Por qué Zustand y no Redux:**

- Mucho más simple (menos código)
- Sin boilerplate
- Mejor performance

**Ejemplo:**

```typescript
// Crear store
const useAppStore = create((set) => ({
  phrase: "",
  addWord: (word) =>
    set((state) => ({
      phrase: state.phrase + " " + word,
    })),
}));

// Usar en cualquier componente
const { phrase, addWord } = useAppStore();
```

---

## HTTP Cliente

### 9. axios

**¿Qué es?** Librería para hacer peticiones HTTP

**Para qué lo usamos:**

- Llamar a tu API Gateway
- Manejar timeouts
- Interceptar requests/responses

**Por qué Axios y no fetch:**

- Manejo automático de JSON
- Cancelación de requests
- Timeouts configurables
- Mejores mensajes de error

---

## Estilos (Opcional)

### 10. NativeWind (si decides usarlo)

**¿Qué es?** Tailwind CSS para React Native

**Para qué lo usamos:**

- Estilos rápidos con clases utilitarias
- Consistencia en diseño
- Responsive automático

**Ejemplo:**

```typescript
// Con NativeWind
<View className="flex-1 bg-blue-500 p-4">

// Sin NativeWind (StyleSheet)
<View style={styles.container}>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
    padding: 16
  }
});
```

---

## Resumen Visual

```
┌─────────────────────────────────────────────┐
│         Tu App React Native                 │
├─────────────────────────────────────────────┤
│                                             │
│  Expo (Framework base)                      │
│    ├── TypeScript (Tipos)                   │
│    ├── React Navigation (Pantallas)         │
│    └── expo-camera (Cámara)                 │
│                                             │
│  MediaPipe (Detección de manos)             │
│                                             │
│  Estado:                                    │
│    ├── TanStack Query (API/servidor)        │
│    └── Zustand (Estado global)              │
│                                             │
│  HTTP: axios (Llamadas a API)               │
│                                             │
│  Estilos: NativeWind o StyleSheet           │
│                                             │
└─────────────────────────────────────────────┘
              ↕️ HTTP
        ┌──────────────┐
        │ API Gateway  │
        └──────────────┘
```

---

## Alternativas consideradas

| Necesidad       | Elegimos         | Descartamos         | Por qué                |
| --------------- | ---------------- | ------------------- | ---------------------- |
| Framework       | Expo             | React Native CLI    | Más fácil para empezar |
| Navegación      | React Navigation | React Router Native | Estándar en RN         |
| Estado servidor | TanStack Query   | SWR                 | Más features           |
| Estado global   | Zustand          | Redux               | Menos boilerplate      |
| HTTP            | axios            | fetch               | Mejor API              |
| Detección       | MediaPipe        | TensorFlow Lite     | Más fácil de usar      |

---

**Última actualización:** Enero 2026
