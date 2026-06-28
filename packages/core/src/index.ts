// ============================================================
// Helper para Tavily (API key se pasa como parámetro)
// ============================================================

export async function tavilySearch(query: string, apiKey: *** maxResults = 8) {
  if (!apiKey) {
    return {
      error:
        "TAVILY_API_KEY no proporcionada como parámetro. Para MCP (Node) pásala con process.env.TAVILY_API_KEY. Para Cloudflare Workers pásala desde c.env.",
      results: [],
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
        include_raw_content: false,
      }),
    });

    if (!response.ok) {
      return { error: `Error Tavily: ${response.status}`, results: [] };
    }

    const data = await response.json();
    return {
      results: data.results || [],
      query,
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
    matchedPatterns.push(
      "Falsos anuncios oficiales / videos descontextualizados",
    );
  }

  if (lowerClaim.includes("apagón") || lowerClaim.includes("corpoelec")) {
    matchedPatterns.push("Falsos anuncios oficiales");
  }

  if (
    lowerClaim.includes("edificio") ||
    lowerClaim.includes("colapsado") ||
    lowerClaim.includes("imagen")
  ) {
    matchedPatterns.push(
      "Contenido generado con IA / videos descontextualizados",
    );
  }

  return matchedPatterns;
}

export { PATTERNS } from "./cuaderno.js";
export { KEY_FACTS } from "./keyfacts.js";

// Función reutilizable para verificar claim
export async function verifyClaim(claim: string, context?: string, apiKey?: string) {
  const searchQuery = `${claim} ${context || ""} Venezuela`;
  const key = apiKey || "";
  const search = await tavilySearch(searchQuery, key, 6);

  const matchedPatterns = detectPatterns(claim);

  let analysis = "Análisis basado en patrones conocidos:\n";

  if (
    matchedPatterns.includes("Desinformación salarial y de Delcy Rodríguez")
  ) {
    analysis +=
      "- Este claim coincide con el patrón más común de desinformación sobre salarios de Delcy (13 falsos en 18 días).\n";
    analysis +=
      "- Realidad conocida: salario mínimo real ≈ $7/mes. Cualquier cifra alta es casi siempre falsa.\n";
  }

  if (
    matchedPatterns.some(
      (p) => p.includes("tsunami") || p.includes("anuncios oficiales"),
    )
  ) {
    analysis +=
      "- Patrón clásico de falsos anuncios de tsunami durante los terremotos de junio 2026 (usaron video de Japón 2011).\n";
  }

  let searchSummary = "";
  if (search.error) {
    searchSummary = `\n\n**Nota de búsqueda:** ${search.error}\nSe recomienda configurar TAVILY_API_KEY o usar junto al MCP tavily-mcp.`;
  } else if (search.results.length > 0) {
    searchSummary =
      "\n\n**Resultados de búsqueda Tavily (resumen):**\n" +
      search.results
        .slice(0, 4)
        .map(
          (r: any, i: number) =>
            `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.content?.substring(0, 180)}...`,
        )
        .join("\n");
  }

  const finalText = `# Verificación de Claim\n\n**Claim:** ${claim}\n\n${analysis}\n\n**Patrones coincidentes:** ${matchedPatterns.length > 0 ? matchedPatterns.join(", ") : "Ninguno directo detectado"}${searchSummary}\n\n**Recomendación:** Siempre cruzar con fuentes primarias (USGS, IOM, Ecoanalítica, Factchequeado, OVFN).`;

  return {
    claim,
    analysis,
    matchedPatterns,
    searchSummary: search.results || [],
    fullReport: finalText,
  };
}
