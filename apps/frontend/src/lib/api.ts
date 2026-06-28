/* ─── API Client ─────────────────────────────────────────────
 *
 *  Interfaz unificada para llamar al backend.
 *
 *  Mientras el backend no esté desplegado, se usan mocks.
 *  Cuando el backend esté listo, cambiar la export a:
 *    export const api = orpc
 *
 *  O usar variable de entorno:
 *    PUBLIC_MOCK_API=false → API real
 *    cualquier otro valor  → mocks
 * ────────────────────────────────────────────────────────── */

import { mockApi } from './mock-data'
import { orpc } from './orpc'

const useMock =
  typeof import.meta.env !== 'undefined'
    ? import.meta.env.PUBLIC_MOCK_API !== 'false'
    : true

export const api = useMock ? mockApi : orpc
export { useMock }
