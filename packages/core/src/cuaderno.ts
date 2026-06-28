// ============================================================
// Conocimiento base del Cuaderno de FakeNews Venezuela
// ============================================================

import type { Pattern } from "./types.js";

export const PATTERNS: Pattern[] = [
  {
    id: "p-1",
    name: "Videos e imágenes descontextualizados",
    description:
      "Material viejo o de otros países presentado como actual (tsunami Japón 2011, sismos de Filipinas o Lara 2025).",
    examples: [
      "Video tsunami La Guaira (realmente Japón 2011)",
      "Puente Yacural colapsado (mayo 2026 usado como junio)",
    ],
    detection: "Buscar fecha original del video/imagen y fuente geográfica.",
    severity: "alta",
    category: "Multimedia",
    indicators: [
      { icon: "image_search", text: "Búsqueda inversa de imagen y verificación de la fecha original." },
      { icon: "public", text: "Confirmar la ubicación geográfica real del material." },
    ],
    caseStudy: "Video tsunami La Guaira (realmente Japón 2011).",
  },
  {
    id: "p-2",
    name: "Contenido generado con IA",
    description:
      "Imágenes de edificios derrumbados o eventos falsos detectables con SynthID u otras herramientas.",
    examples: [
      "Edificio colapsado en Acarigua generado con IA durante terremotos junio 2026",
    ],
    detection:
      "Usar herramientas de detección de IA y verificar con fuentes oficiales (USGS, Protección Civil).",
    severity: "alta",
    category: "IA Generativa",
    indicators: [
      { icon: "smart_toy", text: "Detección de IA (SynthID u otras herramientas)." },
      { icon: "fact_check", text: "Verificar con fuentes oficiales (USGS, Protección Civil)." },
    ],
    caseStudy:
      "Edificio colapsado en Acarigua generado con IA durante los terremotos de junio 2026.",
  },
  {
    id: "p-3",
    name: "Usurpación de grupos de WhatsApp y canales periodísticos",
    description:
      "Clonación de grupos de medios reales para difundir desinformación.",
    examples: ["Grupos de El Diario, Venevisión suplantados"],
    detection: "Verificar administrador y origen del mensaje.",
    severity: "media",
    category: "De Autoridad",
    indicators: [
      { icon: "admin_panel_settings", text: "Verificar el administrador y el origen del mensaje." },
      { icon: "link", text: "Contrastar con los canales oficiales verificados del medio." },
    ],
    caseStudy: "Grupos de El Diario y Venevisión suplantados.",
  },
  {
    id: "p-4",
    name: "Falsos anuncios oficiales",
    description:
      "Alertas de tsunami, apagones nacionales o comunicados falsos de Corpoelec.",
    examples: [
      "Alerta tsunami La Guaira (desmentida por EE.UU.)",
      "Apagón 24h Corpoelec en TikTok",
    ],
    detection:
      "Confirmar siempre en cuentas oficiales y sitios .gob.ve o USGS.",
    severity: "alta",
    category: "De Autoridad",
    indicators: [
      { icon: "verified", text: "Confirmar en cuentas oficiales y sitios .gob.ve." },
      { icon: "public", text: "Cruzar con USGS u organismos internacionales." },
    ],
    caseStudy: "Alerta de tsunami en La Guaira, desmentida por EE.UU.",
  },
  {
    id: "p-5",
    name: "Operaciones de influencia en YouTube",
    description:
      "Canales narrativos con actores que presentan propaganda como noticias (14 canales falsos, +47M vistas).",
    examples: [
      "Canales que promueven imagen positiva de Delcy Rodríguez usando fragmentos reales",
    ],
    detection:
      "Revisar historial del canal y si usa narradores pagados (FG Medios SA).",
    severity: "media",
    category: "Estructural",
    indicators: [
      { icon: "history", text: "Revisar el historial y la antigüedad del canal." },
      { icon: "paid", text: "Identificar narradores pagados (p. ej. FG Medios SA)." },
    ],
    caseStudy:
      "Canales que promueven una imagen positiva de Delcy Rodríguez usando fragmentos reales.",
  },
  {
    id: "p-6",
    name: "Desinformación salarial y de Delcy Rodríguez",
    description:
      "13 contenidos falsos en 18 días: muerte, aumentos de $800-1000 (cuando salario real ~$7).",
    examples: [
      "Aumento salarial ficticio de $800-$1000/mes para Delcy Rodríguez",
    ],
    detection: "Cruzar con Ecoanalítica, BCV y fuentes independientes.",
    severity: "media",
    category: "Político",
    indicators: [
      { icon: "payments", text: "Cruzar las cifras con Ecoanalítica y el BCV." },
      { icon: "fact_check", text: "Contrastar con fuentes independientes." },
    ],
    caseStudy:
      "Aumento salarial ficticio de $800-$1000/mes atribuido a Delcy Rodríguez.",
  },
];
