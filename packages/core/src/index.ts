import "dotenv/config";

// ============================================================
// Conocimiento base del Cuaderno de FakeNews Venezuela
// ============================================================

export const PATTERNS = [
  {
    name: "Videos e imágenes descontextualizados",
    description: "Material viejo o de otros países presentado como actual (tsunami Japón 2011, sismos de Filipinas o Lara 2025).",
    examples: ["Video tsunami La Guaira (realmente Japón 2011)", "Puente Yacural colapsado (mayo 2026 usado como junio)"],
    detection: "Buscar fecha original del video/imagen y fuente geográfica."
  },
  {
    name: "Contenido generado con IA",
    description: "Imágenes de edificios derrumbados o eventos falsos detectables con SynthID u otras herramientas.",
    examples: ["Edificio colapsado en Acarigua generado con IA durante terremotos junio 2026"],
    detection: "Usar herramientas de detección de IA y verificar con fuentes oficiales (USGS, Protección Civil)."
  },
  {
    name: "Usurpación de grupos de WhatsApp y canales periodísticos",
    description: "Clonación de grupos de medios reales para difundir desinformación.",
    examples: ["Grupos de El Diario, Venevisión suplantados"],
    detection: "Verificar administrador y origen del mensaje."
  },
  {
    name: "Falsos anuncios oficiales",
    description: "Alertas de tsunami, apagones nacionales o comunicados falsos de Corpoelec.",
    examples: ["Alerta tsunami La Guaira (desmentida por EE.UU.)", "Apagón 24h Corpoelec en TikTok"],
    detection: "Confirmar siempre en cuentas oficiales y sitios .gob.ve o USGS."
  },
  {
    name: "Operaciones de influencia en YouTube",
    description: "Canales narrativos con actores que presentan propaganda como noticias (14 canales falsos, +47M vistas).",
    examples: ["Canales que promueven imagen positiva de Delcy Rodríguez usando fragmentos reales"],
    detection: "Revisar historial del canal y si usa narradores pagados (FG Medios SA)."
  },
  {
    name: "Desinformación salarial y de Delcy Rodríguez",
    description: "13 contenidos falsos en 18 días: muerte, aumentos de $800-1000 (cuando salario real ~$7).",
    examples: ["Aumento salarial ficticio de $800-$1000/mes para Delcy Rodríguez"],
    detection: "Cruzar con Ecoanalítica, BCV y fuentes independientes."
  }
];

export const KEY_FACTS = {
  political: "3 ene 2026: Captura de Maduro. Delcy Rodríguez presidenta encargada. 81-100 muertos en operación.",
  economy: "Salario mínimo ~$7/mes. Canasta básica $300-645. Devaluación ~640% en 12 meses.",
  earthquakes: "24 jun 2026: Terremotos 7.2 y 7.5. 188 fallecidos oficiales, 1520 heridos. $200M fondo reconstrucción.",
  migration: "6.9M venezolanos fuera. 7.9M necesitan ayuda humanitaria dentro del país.",
  disinformation: "13 fake contents sobre Delcy en 18 días. Videos falsos de tsunami y apagones."
};

// ============================================================
// Helper para Tavily (requiere TAVILY_API_KEY)
// ============================================================

export async function tavilySearch(query: string, maxResults = 8) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return {
      error: "TAVILY_API_KEY no configurada. Puedes usar el MCP tavily-mcp existente o exportar la variable.",
      results: []
    };
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${query} Venezuela site: reliable OR oficial OR USGS OR IOM OR Reuters OR BBC`,
        search_depth: "advanced",
        max_results: maxResults,
        include_raw_content: false
      })
    });

    if (!response.ok) {
      return { error: `Error Tavily: ${response.status}`, results: [] };
    }

    const data = await response.json();
    return {
      results: data.results || [],
      query
    };
  } catch (err: any) {
    return { error: err.message, results: [] };
  }
}

// Helper para detectar patrones simples
export function detectPatterns(claim: string): string[] {
  const lowerClaim = claim.toLowerCase();
  const matchedPatterns: string[] = [];

  if (lowerClaim.includes("salario") || lowerClaim.includes("aumento")) {
    matchedPatterns.push("Desinformación salarial y de Delcy Rodríguez");
  }

  if (lowerClaim.includes("tsunami") || lowerClaim.includes("alerta")) {
    matchedPatterns.push("Falsos anuncios oficiales / videos descontextualizados");
  }

  if (lowerClaim.includes("apagón") || lowerClaim.includes("corpoelec")) {
    matchedPatterns.push("Falsos anuncios oficiales");
  }

  if (lowerClaim.includes("edificio") || lowerClaim.includes("colapsado") || lowerClaim.includes("imagen")) {
    matchedPatterns.push("Contenido generado con IA / videos descontextualizados");
  }

  return matchedPatterns;
}

// Función reutilizable para verificar claim
export async function verifyClaim(claim: string, context?: string) {
  const searchQuery = `${claim} ${context || ""} Venezuela`;
  const search = await tavilySearch(searchQuery, 6);

  const matchedPatterns = detectPatterns(claim);

  let analysis = "Análisis basado en patrones conocidos:\n";

  if (matchedPatterns.includes("Desinformación salarial y de Delcy Rodríguez")) {
    analysis += "- Este claim coincide con el patrón más común de desinformación sobre salarios de Delcy (13 falsos en 18 días).\n";
    analysis += "- Realidad conocida: salario mínimo real ≈ $7/mes. Cualquier cifra alta es casi siempre falsa.\n";
  }

  if (matchedPatterns.some(p => p.includes("tsunami") || p.includes("anuncios oficiales"))) {
    analysis += "- Patrón clásico de falsos anuncios de tsunami durante los terremotos de junio 2026 (usaron video de Japón 2011).\n";
  }

  let searchSummary = "";
  if (search.error) {
    searchSummary = `\n\n**Nota de búsqueda:** ${search.error}\nSe recomienda configurar TAVILY_API_KEY o usar junto al MCP tavily-mcp.`;
  } else if (search.results.length > 0) {
    searchSummary = "\n\n**Resultados de búsqueda Tavily (resumen):**\n" + 
      search.results.slice(0, 4).map((r: any, i: number) => 
        `${i+1}. ${r.title}\n   ${r.url}\n   ${r.content?.substring(0, 180)}...`
      ).join("\n");
  }

  const finalText = `# Verificación de Claim\n\n**Claim:** ${claim}\n\n${analysis}\n\n**Patrones coincidentes:** ${matchedPatterns.length > 0 ? matchedPatterns.join(", ") : "Ninguno directo detectado"}${searchSummary}\n\n**Recomendación:** Siempre cruzar con fuentes primarias (USGS, IOM, Ecoanalítica, Factchequeado, OVFN).`;

  return {
    claim,
    analysis,
    matchedPatterns,
    searchSummary: search.results || [],
    fullReport: finalText
  };
}
