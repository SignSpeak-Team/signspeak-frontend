/**
 * tests/integration/mocks/server.ts
 *
 * Configura el servidor MSW para el entorno de Node (Jest).
 * Se levanta antes de todos los tests y se baja al terminar.
 */

import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/** Servidor MSW listo para usar en tests de integración */
export const server = setupServer(...handlers);
