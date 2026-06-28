import type { RecentPatternPreview } from "./types.js";

// Vistas previas de patrones recientes para la home. Datos curados; la UI
// formatea `createdAt` como "Hace X horas".
export const RECENT_PATTERN_PREVIEWS: RecentPatternPreview[] = [
  {
    id: "rp-1",
    status: "alerta-falsa",
    title: "Supuesta réplica masiva en Caracas",
    summary:
      "Audio en WhatsApp afirma que un sismo de 8.0 ocurrirá en las próximas 2 horas. Los sismos no se pueden predecir.",
    createdAt: "2026-06-27T21:30:00.000Z",
    href: "/patrones",
  },
  {
    id: "rp-2",
    status: "contexto-necesario",
    title: "Video de edificio colapsado en Valencia",
    summary:
      "El video es real pero corresponde al terremoto de Turquía en 2023. No hay reportes de daños estructurales en Carabobo.",
    createdAt: "2026-06-27T18:30:00.000Z",
    href: "/patrones",
  },
  {
    id: "rp-3",
    status: "cadena-falsa",
    title: "Cierre total de autopistas nacionales",
    summary:
      "Información manipulada. El tránsito está restringido solo en puntos de control específicos por evaluación de puentes.",
    createdAt: "2026-06-27T15:30:00.000Z",
    href: "/patrones",
  },
];
