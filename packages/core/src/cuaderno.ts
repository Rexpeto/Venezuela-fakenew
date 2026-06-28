// ============================================================
// Conocimiento base del Cuaderno de FakeNews Venezuela
// ============================================================

export const PATTERNS = [
  {
    name: "Videos e imágenes descontextualizados",
    description:
      "Material viejo o de otros países presentado como actual (tsunami Japón 2011, sismos de Filipinas o Lara 2025).",
    examples: [
      "Video tsunami La Guaira (realmente Japón 2011)",
      "Puente Yacural colapsado (mayo 2026 usado como junio)",
    ],
    detection: "Buscar fecha original del video/imagen y fuente geográfica.",
  },
  {
    name: "Contenido generado con IA",
    description:
      "Imágenes de edificios derrumbados o eventos falsos detectables con SynthID u otras herramientas.",
    examples: [
      "Edificio colapsado en Acarigua generado con IA durante terremotos junio 2026",
    ],
    detection:
      "Usar herramientas de detección de IA y verificar con fuentes oficiales (USGS, Protección Civil).",
  },
  {
    name: "Usurpación de grupos de WhatsApp y canales periodísticos",
    description:
      "Clonación de grupos de medios reales para difundir desinformación.",
    examples: ["Grupos de El Diario, Venevisión suplantados"],
    detection: "Verificar administrador y origen del mensaje.",
  },
  {
    name: "Falsos anuncios oficiales",
    description:
      "Alertas de tsunami, apagones nacionales o comunicados falsos de Corpoelec.",
    examples: [
      "Alerta tsunami La Guaira (desmentida por EE.UU.)",
      "Apagón 24h Corpoelec en TikTok",
    ],
    detection:
      "Confirmar siempre en cuentas oficiales y sitios .gob.ve o USGS.",
  },
  {
    name: "Operaciones de influencia en YouTube",
    description:
      "Canales narrativos con actores que presentan propaganda como noticias (14 canales falsos, +47M vistas).",
    examples: [
      "Canales que promueven imagen positiva de Delcy Rodríguez usando fragmentos reales",
    ],
    detection:
      "Revisar historial del canal y si usa narradores pagados (FG Medios SA).",
  },
  {
    name: "Desinformación salarial y de Delcy Rodríguez",
    description:
      "13 contenidos falsos en 18 días: muerte, aumentos de $800-1000 (cuando salario real ~$7).",
    examples: [
      "Aumento salarial ficticio de $800-$1000/mes para Delcy Rodríguez",
    ],
    detection: "Cruzar con Ecoanalítica, BCV y fuentes independientes.",
  },
];
