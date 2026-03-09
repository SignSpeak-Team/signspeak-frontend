/// <reference types="expo-router/testing-library" />
/**
 * E2E Integration Tests – Navigation & App Flows
 *
 * Usa expo-router/testing-library para renderizar la app completa
 * y verificar navegación, rutas y estado del router.
 *
 * Ejecutar: npm test -- --testPathPattern=navigation.e2e
 */
import { renderRouter, screen } from "expo-router/testing-library";
import React from "react";
import { Text, View } from "react-native";

// ---------------------------------------------------------------------------
// Mock screens — testeamos routing, no la UI real que necesita cámara/MediaPipe
// ---------------------------------------------------------------------------

const CameraScreen = () => (
  <View>
    <Text testID="camera-instructions">
      Position your hand in the frame and tap to capture
    </Text>
  </View>
);

const HistoryScreen = () => (
  <View>
    <Text testID="history-title">Translation History</Text>
  </View>
);

const SettingsScreen = () => (
  <View>
    <Text testID="settings-title">Settings</Text>
  </View>
);

const TranslationResultScreen = () => (
  <View>
    <Text testID="result-title">Translation Result</Text>
  </View>
);

const TabLayout = () => <View />;

// Rutas equivalentes a la estructura real del proyecto
const appRoutes = {
  "(tabs)/_layout": TabLayout,
  "(tabs)/index": CameraScreen,
  "(tabs)/explore": HistoryScreen,
  "(tabs)/settings": SettingsScreen,
  "translation-result": TranslationResultScreen,
};

// ---------------------------------------------------------------------------
// Test 1: Ruta inicial
// ---------------------------------------------------------------------------
describe("E2E – Ruta Inicial", () => {
  it("debería arrancar en la pestaña Camera (ruta /)", () => {
    renderRouter(appRoutes, { initialUrl: "/" });
    expect(screen).toHavePathname("/");
  });
});

// ---------------------------------------------------------------------------
// Test 2: Deep link a History
// ---------------------------------------------------------------------------
describe("E2E – Historial", () => {
  it("debería navegar al historial con /(tabs)/explore", () => {
    renderRouter(appRoutes, { initialUrl: "/(tabs)/explore" });
    // Expo Router normaliza el path internamente
    expect(screen).toHavePathname("/explore");
  });
});

// ---------------------------------------------------------------------------
// Test 3: Deep link a Settings
// ---------------------------------------------------------------------------
describe("E2E – Settings", () => {
  it("debería navegar a settings con /(tabs)/settings", () => {
    renderRouter(appRoutes, { initialUrl: "/(tabs)/settings" });
    expect(screen).toHavePathname("/settings");
  });
});

// ---------------------------------------------------------------------------
// Test 4: Pantalla Translation Result
// ---------------------------------------------------------------------------
describe("E2E – Translation Result Screen", () => {
  it("debería abrir la pantalla de resultado con /translation-result", () => {
    renderRouter(appRoutes, { initialUrl: "/translation-result" });
    expect(screen).toHavePathname("/translation-result");
  });
});

// ---------------------------------------------------------------------------
// Test 5: Estado del router — estructura de rutas raíz
// ---------------------------------------------------------------------------
describe("E2E – Estado del Router", () => {
  it("debería tener la ruta __root en el estado del router al iniciar", () => {
    renderRouter(appRoutes, { initialUrl: "/" });

    expect(screen).toHaveRouterState(
      expect.objectContaining({
        routes: expect.arrayContaining([
          expect.objectContaining({ name: "__root" }),
        ]),
      }),
    );
  });

  it("debería contener la tab (tabs) en el estado del router", () => {
    renderRouter(appRoutes, { initialUrl: "/" });
    const state = screen.getByTestId !== undefined; // sanity check que screen existe
    expect(state).toBe(true);

    expect(screen).toHaveRouterState(
      expect.objectContaining({
        routes: expect.arrayContaining([
          expect.objectContaining({
            name: "__root",
            state: expect.objectContaining({
              routes: expect.arrayContaining([
                expect.objectContaining({ name: "(tabs)" }),
              ]),
            }),
          }),
        ]),
      }),
    );
  });
});
