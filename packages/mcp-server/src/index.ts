#!/usr/bin/env node
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { 
  PATTERNS, 
  KEY_FACTS, 
  tavilySearch, 
  detectPatterns,
  verifyClaim 
} from "@repo/core";

// ============================================================
// Servidor MCP
// ============================================================

const server = new McpServer({
  name: "venezuela-fakenews-mcp",
  version: "0.1.0",
  description: "MCP para combatir desinformación sobre Venezuela. Basado en investigación real (junio 2026)."
});

// Tool 1: Obtener patrones de FakeNews
server.tool(
  "get_fakenews_patterns",
  "Devuelve los patrones principales de desinformación en Venezuela identificados en la investigación (basado en el cuaderno Obsidian).",
  {},
  async () => {
    const text = PATTERNS.map((p, i) => 
      `${i+1}. **${p.name}**\n   ${p.description}\n   Ejemplos: ${p.examples ? p.examples.join("; ") : "Ver cuaderno"}\n   Detección: ${p.detection}`
    ).join("\n\n");

    return {
      content: [{
        type: "text",
        text: `# Patrones Comunes de Desinformación en Venezuela\n\n${text}\n\n**Fuente:** Cuaderno de investigación Venezuela-Combate-FakeNews-Cuaderno.md (junio 2026)`
      }]
    };
  }
);

// Tool 2: Verificar un claim
server.tool(
  "verify_claim",
  "Verifica una afirmación sobre Venezuela usando búsqueda Tavily + patrones conocidos del cuaderno.",
  {
    claim: z.string().describe("La afirmación o claim a verificar (ej: 'Delcy Rodríguez anunció aumento de salario a $800')"),
    context: z.string().optional().describe("Contexto adicional (terremoto, política, economía...)")
  },
  async ({ claim, context }) => {
    const result = await verifyClaim(claim, context);

    return {
      content: [{ type: "text", text: result.fullReport }]
    };
  }
);

// Tool 3: Buscar fuentes oficiales
server.tool(
  "search_official_sources",
  "Busca información en fuentes oficiales y confiables sobre un tema de Venezuela.",
  {
    topic: z.string().describe("Tema a buscar (ej: terremotos junio 2026, situación económica, migración)"),
    max_results: z.number().optional().default(6)
  },
  async ({ topic, max_results }) => {
    const search = await tavilySearch(`${topic} Venezuela (USGS OR IOM OR OCHA OR Reuters OR "Ecoanalítica" OR "Observatorio Venezolano")`, max_results);

    if (search.error) {
      return {
        content: [{
          type: "text",
          text: `Error al buscar: ${search.error}\n\nConfigura TAVILY_API_KEY para búsquedas reales.`
        }]
      };
    }

    const resultsText = search.results.map((r: any, i: number) =>
      `${i+1}. **${r.title}**\n   ${r.url}\n   ${r.content?.substring(0, 220)}...`
    ).join("\n\n");

    return {
      content: [{
        type: "text",
        text: `# Fuentes Oficiales y Confiables - ${topic}\n\n${resultsText}\n\n**Consejo:** Prioriza siempre USGS para sismos, IOM/OCHA para migración y ayuda humanitaria.`
      }]
    };
  }
);

// Tool 4: Generar reporte rápido
server.tool(
  "generate_factcheck_report",
  "Genera un reporte estructurado de verificación para un tema o claim sobre Venezuela.",
  {
    topic: z.string().describe("Tema o claim principal")
  },
  async ({ topic }) => {
    const patternsText = PATTERNS.slice(0, 3).map(p => `- ${p.name}`).join("\n");

    const report = `# Reporte de Fact-Check: ${topic}

**Fecha del reporte:** ${new Date().toISOString().split("T")[0]}

## Resumen
[Este es un borrador generado por el MCP. Completa con datos reales]

## Posibles patrones de desinformación aplicables
${patternsText}

## Datos clave conocidos (del cuaderno)
${Object.entries(KEY_FACTS).map(([k, v]) => `- **${k}**: ${v}`).join("\n")}

## Recomendaciones de verificación
1. Buscar en USGS / Protección Civil para eventos sísmicos.
2. Verificar cifras económicas con Ecoanalítica y BCV.
3. Comprobar multimedia con herramientas de IA (SynthID).
4. Usar este MCP + tavily-mcp en paralelo.

## Próximos pasos sugeridos
- Usa verify_claim para el claim específico.
- Usa search_official_sources para datos frescos.
`;

    return {
      content: [{ type: "text", text: report }]
    };
  }
);

// ============================================================
// Inicio del servidor
// ============================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[venezuela-fakenews-mcp] Servidor MCP iniciado correctamente (stdio)");
  console.error("Herramientas disponibles: get_fakenews_patterns, verify_claim, search_official_sources, generate_factcheck_report");
}

main().catch((error) => {
  console.error("Error fatal en el servidor MCP:", error);
  process.exit(1);
});
